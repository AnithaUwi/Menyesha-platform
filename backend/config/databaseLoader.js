const fs = require('fs');
const https = require('https');
const path = require('path');

const loadDatabase = () => {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, '..', 'menyesha.sqlite');
    
    // Check if database already exists
    if (fs.existsSync(dbPath)) {
      console.log('✅ Database file already exists');
      resolve();
      return;
    }
    
    console.log('📥 Downloading database from GitHub...');
    
    // Your GitHub raw file URL
    const dbUrl = 'https://raw.githubusercontent.com/AnithaUwi/Menyesha-platform/main/backend/menyesha.sqlite';
    
    const file = fs.createWriteStream(dbPath);
    
    https.get(dbUrl, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('✅ Database downloaded successfully from GitHub');
          resolve();
        });
      } else {
        console.log(`⚠️ Could not download database (HTTP ${response.statusCode}), creating new one...`);
        // Create empty database file - will be populated by syncDatabase
        fs.writeFileSync(dbPath, '');
        console.log('✅ New database file created');
        resolve();
      }
    }).on('error', (err) => {
      console.log('⚠️ Download failed, creating new database file...');
      // Create empty database file as fallback
      fs.writeFileSync(dbPath, '');
      console.log('✅ New database file created as fallback');
      resolve(); // Don't reject - let syncDatabase handle table creation
    });
  });
};

module.exports = loadDatabase;