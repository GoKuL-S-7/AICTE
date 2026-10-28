// backend/scripts/bundle_uploads.cjs
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads', 'evidence');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'backups');

function hashFile(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

async function bundle() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.error(`Error: Uploads evidence directory does not exist: ${UPLOADS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(UPLOADS_DIR).filter(f => fs.statSync(path.join(UPLOADS_DIR, f)).isFile());
  console.log(`Found ${files.length} uploaded evidence documents.`);

  const manifest = {
    timestamp: Date.now(),
    date: new Date().toISOString(),
    totalFiles: files.length,
    totalBytes: 0,
    files: []
  };

  for (const file of files) {
    const fullPath = path.join(UPLOADS_DIR, file);
    const stat = fs.statSync(fullPath);
    const sha256 = hashFile(fullPath);
    manifest.totalBytes += stat.size;
    manifest.files.push({
      fileName: file,
      sizeBytes: stat.size,
      sha256,
      modifiedAt: stat.mtime.toISOString()
    });
  }

  const manifestPath = path.join(OUTPUT_DIR, `evidence_uploads_manifest.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('\n==================================================');
  console.log('EVIDENCE DOCUMENTS AUDIT & BUNDLE COMPLETE');
  console.log(`Total Files: ${manifest.totalFiles}`);
  console.log(`Total Size: ${(manifest.totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Manifest created at: ${manifestPath}`);
  console.log('==================================================\n');
}

bundle().catch(err => {
  console.error('Bundle failed:', err);
  process.exit(1);
});
