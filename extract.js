const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const res = path.resolve(dir, file);
    if (fs.statSync(res).isDirectory()) {
      getFiles(res, files);
    } else if (res.endsWith('.tsx')) {
      files.push(res);
    }
  }
  return files;
}

const files = getFiles(path.join(__dirname, 'src'));
const strings = new Set();
const regexJSXText = />([^<>{}]+)</g;
const regexPlaceholder = /placeholder="([^"]+)"/g;
const regexLabel = /label:\s*'([^']+)'/g;

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf-8');
  let match;
  while ((match = regexJSXText.exec(content)) !== null) {
    const s = match[1].trim();
    if (s.length > 2 && !s.match(/^[0-9\-\$\.]+$/)) strings.add(s);
  }
  while ((match = regexPlaceholder.exec(content)) !== null) {
    strings.add(match[1].trim());
  }
  while ((match = regexLabel.exec(content)) !== null) {
    strings.add(match[1].trim());
  }
});

fs.writeFileSync('strings.json', JSON.stringify(Array.from(strings), null, 2));
console.log('Done mapping ' + strings.size + ' strings');
