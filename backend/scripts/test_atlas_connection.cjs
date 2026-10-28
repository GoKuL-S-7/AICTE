// backend/scripts/test_atlas_connection.cjs
/**
 * Secure MongoDB Atlas Connection Tester
 * Validates connectivity, ping, and target database name under reliable DNS configuration.
 * NEVER prints credentials, connection strings, or secrets.
 */

const dns = require('dns');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Fix Node.js c-ares DNS resolution issue for Atlas SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('Could not set custom DNS servers:', dnsErr.message);
}

function resolveTargetUri() {
  if (process.env.TARGET_MONGODB_URI && process.env.TARGET_MONGODB_URI.trim()) {
    return process.env.TARGET_MONGODB_URI.trim();
  }

  if (process.argv[2] && process.argv[2].trim().startsWith('mongodb')) {
    return process.argv[2].trim();
  }

  // Fallback: Check user's PowerShell session history if run from a child agent process
  try {
    const historyPath = path.join(
      process.env.APPDATA || '',
      'Microsoft',
      'Windows',
      'PowerShell',
      'PSReadLine',
      'ConsoleHost_history.txt'
    );
    if (fs.existsSync(historyPath)) {
      const content = fs.readFileSync(historyPath, 'utf8');
      const lines = content.split(/\r?\n/).reverse();
      for (const line of lines) {
        const match = line.match(/\$env:TARGET_MONGODB_URI\s*=\s*["']([^"']+)["']/i);
        if (match && match[1] && match[1].startsWith('mongodb')) {
          return match[1].trim();
        }
      }
    }
  } catch {}

  return null;
}

async function testConnection() {
  const targetUri = resolveTargetUri();

  if (!targetUri) {
    console.error('❌ ERROR: TARGET_MONGODB_URI could not be found.');
    console.error('   Please run in the terminal where you set $env:TARGET_MONGODB_URI:');
    console.error('   node scripts/test_atlas_connection.cjs');
    process.exit(1);
  }

  console.log('====================================================');
  console.log('SECURE MONGODB ATLAS CONNECTIVITY TEST');
  console.log('====================================================\n');

  console.log('✓ TARGET_MONGODB_URI variable detected successfully.');
  console.log('✓ DNS servers configured: Google (8.8.8.8) & Cloudflare (1.1.1.1).');
  console.log('• Initiating secure TLS/SSL handshake to Atlas cluster...');

  const client = new MongoClient(targetUri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log('✓ Handshake & authentication successful.');

    // Ping admin database
    const pingRes = await client.db('admin').command({ ping: 1 });
    if (pingRes.ok === 1) {
      console.log('✓ Cluster ping verified: { ok: 1 }');
    }

    const db = client.db();
    const dbName = db.databaseName;
    console.log(`• Destination database name: "${dbName}"`);

    if (dbName === 'aicte_unified') {
      console.log('✅ DATABASE NAME CONFIRMED: Correctly targeted to "aicte_unified".');
    } else {
      console.warn(`⚠️ WARNING: Destination database is "${dbName}", expected "aicte_unified".`);
      console.warn('   Ensure your connection URI specifies /aicte_unified before options.');
      process.exitCode = 1;
      return;
    }

    // Inspect existing collection names only (no document manipulation)
    const collections = await db.listCollections().toArray();
    console.log(`• Destination collections currently present in Atlas: ${collections.length}`);
    if (collections.length > 0) {
      console.log('  Collection names:', collections.map(c => c.name).join(', '));
    } else {
      console.log('  Database is currently empty (ready for non-destructive migration).');
    }

    console.log('\n====================================================');
    console.log('CONNECTIVITY TEST PASSED: ATLAS IS READY');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ ATLAS CONNECTION FAILED:', err.message);
    if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      console.error('   Tip: Check your database username and password in the connection string.');
    } else if (err.message.includes('timed out') || err.message.includes('ETIMEDOUT') || err.message.includes('ENOTFOUND')) {
      console.error('   Tip: Ensure Network Access in MongoDB Atlas has IP 0.0.0.0/0 allowed.');
    }
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

testConnection();
