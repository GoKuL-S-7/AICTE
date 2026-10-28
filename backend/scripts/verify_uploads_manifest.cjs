// backend/scripts/verify_uploads_manifest.cjs
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TARGET_DIR = process.argv[2] 
  ? path.resolve(process.argv[2]) 
  : (process.env.PERSISTENT_STORAGE_DIR 
      ? path.resolve(process.env.PERSISTENT_STORAGE_DIR) 
      : path.resolve(__dirname, '..', 'uploads', 'evidence'));

const MANIFEST_PATH = path.resolve(__dirname, '..', 'backups', 'evidence_uploads_manifest.json');

function hashFile(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

async function verify() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`Error: Manifest file not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(TARGET_DIR)) {
    console.error(`Error: Evidence directory not found at ${TARGET_DIR}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  console.log(`Verifying ${manifest.totalFiles} files in "${TARGET_DIR}" against manifest...\n`);

  let matched = 0;
  let mismatched = 0;
  let missing = 0;

  for (const item of manifest.files) {
    const fullPath = path.join(TARGET_DIR, item.fileName);
    if (!fs.existsSync(fullPath)) {
      missing++;
      console.error(`  [MISSING] ${item.fileName}`);
      continue;
    }

    const stat = fs.statSync(fullPath);
    if (stat.size !== item.sizeBytes) {
      mismatched++;
      console.error(`  [SIZE MISMATCH] ${item.fileName} (expected: ${item.sizeBytes}, got: ${stat.size})`);
      continue;
    }

    const currentHash = hashFile(fullPath);
    if (currentHash !== item.sha256) {
      mismatched++;
      console.error(`  [HASH MISMATCH] ${item.fileName}`);
      continue;
    }

    matched++;
  }

  console.log('\n==================================================');
  console.log(`VERIFICATION SUMMARY:`);
  console.log(`  Matched & Verified: ${matched} / ${manifest.totalFiles}`);
  console.log(`  Mismatched:         ${mismatched}`);
  console.log(`  Missing:            ${missing}`);
  console.log('==================================================');

  if (mismatched === 0 && missing === 0) {
    console.log('✅ ALL EVIDENCE FILES 100% VERIFIED WITH SHA-256 INTEGRITY!');
  } else {
    console.error('❌ INTEGRITY CHECK FAILED.');
    process.exit(1);
  }
}

verify().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
