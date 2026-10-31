// Compile only: never run book-source scripts or remote JavaScript.
const fs = require('node:fs');
const vm = require('node:vm');
let count = 0;
function walk(value, path) {
  if (typeof value === 'string') {
    const blocks = [...value.matchAll(/<js>([\s\S]*?)<\/js>/gi)].map(m => m[1]);
    if (path.endsWith('.jsLib') || path.endsWith('.preUpdateJs')) blocks.push(value);
    if (value.includes('@js:')) blocks.push(value.slice(value.indexOf('@js:') + 4));
    // Manhuagui stores JavaScript directly in loginUrl, unlike URL-based login pages.
    if (path === 'manhuagui.json.loginUrl') blocks.push(value);
    for (let i = 0; i < blocks.length; i++) {
      // Legado expands these expressions before evaluating the outer script.
      // Validate the outer syntax only; template expansion and Rhino remain untested.
      const code = blocks[i].replace(/\{\{[\s\S]*?\}\}/g, '0');
      new vm.Script(code, {filename: `${path}#${i}`});
      count++;
    }
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) walk(child, `${path}.${key}`);
  }
}
for (const file of process.argv.slice(2)) walk(JSON.parse(fs.readFileSync(file, 'utf8')), file);
console.log(`PASS: ${count} JavaScript blocks compiled with Node (not Rhino; templates replaced)`);
