import fs from 'fs';
let html = fs.readFileSync('dist/index.html', 'utf8');

// Replace the start of the script tag and wrap with IIFE
html = html.replace(/<script type="module" crossorigin>/g, '<script>\n(function(){\n');

// Replace the end of the script tag
html = html.replace(/<\/script>/g, '\n})();\n</script>');

fs.mkdirSync('publish', { recursive: true });
fs.writeFileSync('publish/Randy_Game.html', html);
