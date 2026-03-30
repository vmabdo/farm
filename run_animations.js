const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      // Add entrance animations to page containers
      if (content.match(/<main/)) {
        content = content.replace(/<main className="([^"]+)"/, '<main className="$1 animate-in fade-in duration-500"');
      }

      // Add animations to modal dialogs wrapper (typically has 'w-full max-w-md' or 'max-w-lg' or 'max-w-2xl' and 'bg-white')
      // Let's replace 'shadow-xl w-full max-w-' with 'shadow-xl w-full animate-in fade-in zoom-in-95 duration-200 max-w-'
      content = content.replace(/shadow-xl\s+w-full\s+max-w-/g, 'shadow-2xl w-full animate-in fade-in zoom-in-95 duration-300 max-w-');
      content = content.replace(/shadow-lg\s+w-full\s+max-w-/g, 'shadow-2xl w-full animate-in fade-in zoom-in-95 duration-300 max-w-');
      content = content.replace(/shadow-md\s+w-full\s+max-w-/g, 'shadow-2xl w-full animate-in fade-in zoom-in-95 duration-300 max-w-');

      // More padding inside tables for data to 'breathe'
      content = content.replace(/px-6 py-4/g, 'px-8 py-5');
      content = content.replace(/px-6 py-3/g, 'px-8 py-4');
      content = content.replace(/px-5 py-4/g, 'px-6 py-5');
      content = content.replace(/px-5 py-3/g, 'px-6 py-4');

      // Replace rounded-lg with rounded-xl for consistent border radii on inputs and buttons
      content = content.replace(/rounded-lg/g, 'rounded-xl');

      // Replace shadow-sm on cards and sections to shadow-md + hover:shadow-lg
      content = content.replace(/shadow-sm\s+border\s+border-/g, 'shadow-md hover:shadow-lg transition-all duration-300 border border-');
      
      // A special fix for InvoicesClientView where it uses shadow-sm
      content = content.replace(/shadow-sm\s+overflow-hidden/g, 'shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

processDir(path.join(__dirname, 'src', 'components'));
processDir(path.join(__dirname, 'src', 'app'));

console.log('UI/UX Overhaul Applied Successfully!');
