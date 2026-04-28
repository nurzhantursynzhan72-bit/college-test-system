const path = require('path');
const fs = require('fs');
const CLIENT_DIST_DIR = path.join(__dirname, '../server/../client/dist');
console.log('CLIENT_DIST_DIR:', CLIENT_DIST_DIR);
console.log('Exists:', fs.existsSync(CLIENT_DIST_DIR));
if (fs.existsSync(CLIENT_DIST_DIR)) {
  console.log('Contents:', fs.readdirSync(CLIENT_DIST_DIR));
  const indexPath = path.join(CLIENT_DIST_DIR, 'index.html');
  console.log('index.html exists:', fs.existsSync(indexPath));
}
