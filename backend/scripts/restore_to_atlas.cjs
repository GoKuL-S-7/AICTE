// backend/scripts/restore_to_atlas.cjs
const dns = require('dns');
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Fix Node.js c-ares DNS resolution for Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const TARGET_URI = process.env.TARGET_MONGODB_URI || process.env.MONGODB_URI;

// Helper to revive ObjectIds and Dates from serialized JSON
function reviveBson(doc) {
  if (!doc || typeof doc !== 'object') return doc;
  if (Array.isArray(doc)) return doc.map(reviveBson);

  const result = {};
  for (const [key, value] of Object.entries(doc)) {
    if (key === '_id' && typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value)) {
      result[key] = new ObjectId(value);
    } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      const parsedDate = new Date(value);
      result[key] = isNaN(parsedDate.getTime()) ? value : parsedDate;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = reviveBson(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

async function run() {
  if (!TARGET_URI) {
    console.error('Error: Please provide TARGET_MONGODB_URI environment variable.');
    console.error('Example: TARGET_MONGODB_URI="mongodb+srv://..." node scripts/restore_to_atlas.cjs [backup_folder]');
    process.exit(1);
  }

  const backupDirArg = process.argv[2];
  let backupDir = backupDirArg;

  if (!backupDir) {
    const backupsRoot = path.join(__dirname, '..', 'backups');
    if (fs.existsSync(backupsRoot)) {
      const dirs = fs.readdirSync(backupsRoot)
        .map(d => path.join(backupsRoot, d))
        .filter(d => fs.statSync(d).isDirectory())
        .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
      if (dirs.length > 0) {
        backupDir = dirs[0];
      }
    }
  }

  if (!backupDir || !fs.existsSync(backupDir)) {
    console.error(`Error: Backup directory not found: ${backupDir}`);
    console.error('Please run "node scripts/backup_and_audit_db.cjs" first to generate a backup.');
    process.exit(1);
  }

  console.log(`Using backup source directory: ${backupDir}`);
  console.log(`Connecting to target MongoDB...`);

  const client = new MongoClient(TARGET_URI);
  try {
    await client.connect();
    const db = client.db();
    console.log(`Connected to target database: ${db.databaseName}`);

    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));
    console.log(`Found ${files.length} collection dump files to migrate.`);

    for (const file of files) {
      const colName = path.basename(file, '.json');
      const filePath = path.join(backupDir, file);
      const rawData = fs.readFileSync(filePath, 'utf8');
      const rawDocs = JSON.parse(rawData);

      if (!Array.isArray(rawDocs) || rawDocs.length === 0) {
        console.log(`- "${colName}": 0 documents, skipping.`);
        continue;
      }

      const collection = db.collection(colName);
      let insertedCount = 0;
      let skippedCount = 0;

      for (const rawDoc of rawDocs) {
        const doc = reviveBson(rawDoc);
        try {
          const result = await collection.updateOne(
            { _id: doc._id },
            { $setOnInsert: doc },
            { upsert: true }
          );
          if (result.upsertedCount > 0) {
            insertedCount++;
          } else {
            skippedCount++;
          }
        } catch (err) {
          console.warn(`Warning inserting doc in ${colName}:`, err.message);
        }
      }

      console.log(`✓ "${colName}": ${insertedCount} migrated, ${skippedCount} already existed (total in backup: ${rawDocs.length})`);
    }

    console.log('\n==================================================');
    console.log('MIGRATION TO TARGET MONGODB COMPLETED SUCCESSFULLY!');
    console.log('==================================================\n');
  } finally {
    await client.close();
  }
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
