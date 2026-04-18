const fs = require('fs');
const path = require('path');

const postsFile = path.join(__dirname, '..', 'data', 'posts.json');
const posts = JSON.parse(fs.readFileSync(postsFile, 'utf-8'));

const filtered = posts.filter(p => p.site !== 'dealbada');

console.log(`제거 전: ${posts.length}건`);
console.log(`제거 후: ${filtered.length}건`);
console.log(`삭제된 dealbada 게시글: ${posts.length - filtered.length}건`);

fs.writeFileSync(postsFile, JSON.stringify(filtered, null, 2), 'utf-8');
console.log('✅ dealbada 데이터 제거 완료');
