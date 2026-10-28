// backend/scripts/migrate_mongo_direct.cjs
/**
 * Direct Database-to-Database Migration Utility
 * Migrates all collections and documents from Source MongoDB to Target MongoDB Atlas
 * Preserves exact BSON types (ObjectId, Date, etc.), references, and password hashes.
 * Non-destructive: Uses $setOnInsert upserts to never overwrite existing target documents.
 * Conflict-aware: Detects and reports any content discrepancies between source and target for matching _ids.
 */

const dns = require('dns');
const { MongoClient, ObjectId } = require('mongodb');

// Fix Node.js c-ares DNS resolution for Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const SOURCE_URI = process.env.SOURCE_MONGODB_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aicte_unified';
const TARGET_URI = process.env.TARGET_MONGODB_URI;

function areDocsEqual(d1, d2) {
  try {
    return JSON.stringify(d1) === JSON.stringify(d2);
  } catch {
    return false;
  }
}

async function migrate() {
  if (!TARGET_URI) {
    console.error('ERROR: Missing TARGET_MONGODB_URI environment variable.');
    console.error('Usage: $env:TARGET_MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/aicte_unified"; node scripts/migrate_mongo_direct.cjs');
    process.exit(1);
  }

  console.log('====================================================');
  console.log('AICTE UNIFIED PORTAL: DIRECT DATABASE MIGRATION');
  console.log('====================================================\n');

  console.log('Connecting to Source MongoDB...');
  const sourceClient = new MongoClient(SOURCE_URI);
  await sourceClient.connect();
  const sourceDb = sourceClient.db();
  console.log(`✓ Connected to Source: "${sourceDb.databaseName}"\n`);

  console.log('Connecting to Target MongoDB (Atlas)...');
  const targetClient = new MongoClient(TARGET_URI);
  await targetClient.connect();
  const targetDb = targetClient.db();
  console.log(`✓ Connected to Target: "${targetDb.databaseName}"\n`);

  if (!targetDb.databaseName || targetDb.databaseName === 'test') {
    console.warn(`WARNING: Target database is currently "${targetDb.databaseName}".`);
    console.warn('Recommended database name is "aicte_unified".');
  }

  const collections = await sourceDb.listCollections().toArray();
  const allCollections = collections.map(c => c.name).filter(name => !name.startsWith('system.'));

  console.log(`Found ${allCollections.length} collections in source database to migrate.\n`);

  const auditReport = [];
  const conflictingDocs = [];
  const failedIndexes = [];

  for (const colName of allCollections) {
    const sourceCol = sourceDb.collection(colName);
    const targetCol = targetDb.collection(colName);

    const sourceCount = await sourceCol.countDocuments();
    if (sourceCount === 0) {
      console.log(`• Collection "${colName}": 0 documents (empty). Skipping.`);
      auditReport.push({
        collection: colName,
        sourceCount: 0,
        targetCount: await targetCol.countDocuments(),
        inserted: 0,
        identical: 0,
        conflicts: 0,
        errors: 0,
        status: 'EMPTY_VERIFIED'
      });
      continue;
    }

    console.log(`• Migrating "${colName}" (${sourceCount} documents)...`);
    const cursor = sourceCol.find({});

    let inserted = 0;
    let identical = 0;
    let conflicts = 0;
    let errors = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      try {
        const res = await targetCol.updateOne(
          { _id: doc._id },
          { $setOnInsert: doc },
          { upsert: true }
        );

        if (res.upsertedCount > 0) {
          inserted++;
        } else {
          // Document with this _id already exists in target. Compare contents.
          const existingTargetDoc = await targetCol.findOne({ _id: doc._id });
          if (areDocsEqual(doc, existingTargetDoc)) {
            identical++;
          } else {
            conflicts++;
            conflictingDocs.push({
              collection: colName,
              id: doc._id,
              sourcePreview: JSON.stringify(doc).slice(0, 100),
              targetPreview: JSON.stringify(existingTargetDoc).slice(0, 100)
            });
            console.warn(`  [!] Conflict detected on _id ${doc._id} in "${colName}". Preserved existing target document.`);
          }
        }
      } catch (err) {
        errors++;
        console.error(`  [!] Error copying document ${doc._id} in "${colName}":`, err.message);
      }
    }

    const finalTargetCount = await targetCol.countDocuments();
    console.log(`  ✓ Done "${colName}": ${inserted} inserted, ${identical} identical existing, ${conflicts} conflicts. Target total: ${finalTargetCount}`);

    // Replicate indexes (skipping default _id_ index)
    try {
      const indexes = await sourceCol.indexes();
      for (const idx of indexes) {
        if (idx.name === '_id_') continue;
        const keys = idx.key;
        const options = { name: idx.name };
        if (idx.unique) options.unique = true;
        if (idx.sparse) options.sparse = true;
        if (idx.expireAfterSeconds !== undefined) options.expireAfterSeconds = idx.expireAfterSeconds;
        if (idx.partialFilterExpression) options.partialFilterExpression = idx.partialFilterExpression;
        if (idx.collation) options.collation = idx.collation;

        try {
          await targetCol.createIndex(keys, options);
        } catch (subIdxErr) {
          failedIndexes.push({
            collection: colName,
            index: idx.name,
            reason: subIdxErr.message
          });
          console.warn(`  [Warning] Index "${idx.name}" on "${colName}" could not be created: ${subIdxErr.message}`);
        }
      }
    } catch (idxErr) {
      console.warn(`  [Notice] Index retrieval for "${colName}":`, idxErr.message);
    }

    auditReport.push({
      collection: colName,
      sourceCount,
      targetCount: finalTargetCount,
      inserted,
      identical,
      conflicts,
      errors,
      status: (finalTargetCount >= sourceCount && errors === 0 && conflicts === 0) ? 'VERIFIED' : 'ATTENTION'
    });
  }

  console.log('\n====================================================');
  console.log('MIGRATION AUDIT & COMPARISON SUMMARY');
  console.log('====================================================');
  console.table(auditReport);

  if (conflictingDocs.length > 0) {
    console.error('\n⚠️ CONFLICTS DETECTED:');
    console.table(conflictingDocs);
  }

  if (failedIndexes.length > 0) {
    console.error('\n⚠️ INDEX WARNINGS:');
    console.table(failedIndexes);
  }

  const discrepancies = auditReport.filter(r => r.status === 'ATTENTION' || r.errors > 0 || r.conflicts > 0);
  if (discrepancies.length > 0) {
    console.error('\n⚠️ WARNING: Discrepancies detected in collections:', discrepancies.map(d => d.collection).join(', '));
  } else {
    console.log('\n✅ ALL COLLECTIONS MIGRATED AND 100% VERIFIED WITHOUT DATA LOSS!');
  }

  await sourceClient.close();
  await targetClient.close();
}

migrate().catch(err => {
  console.error('\nFATAL: Migration failed with error:', err);
  process.exit(1);
});
