// Synthetic fixtures; exercise local trusted source functions with minimal API mocks.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const kl = read('kisslove.json'), fixture = read('tests/fixtures/kisslove.json');
const ctx = vm.createContext({result: JSON.stringify(fixture), java: {
  setContent(s) { this.content = JSON.parse(s); },
  getElements(selector) { assert.equal(selector, '@json:$[*]'); return this.content; }
}});
vm.runInContext(kl.jsLib, ctx, {timeout: 1000});
const toc = kl.ruleToc.chapterList.replace(/^<js>|<\/js>$/g, '');
const chapters = vm.runInContext(toc, ctx, {timeout: 1000});
assert.deepEqual(Array.from(chapters, c => c.name), ['Opening', 'Chapter 2.5', 'Chapter 10']);
assert.deepEqual(Array.from(chapters, c => c.url), [1, 2, 3].map(id => 'https://klz9.com/api/chapter/' + id));
ctx.images = fixture;
const images = vm.runInContext('klImages(images)', ctx, {timeout: 1000});
assert.equal(images, '<img src="https://j2.jfimv2.xyz/a.jpg">\n<img src="https://example.org/b.png?a=1&amp;b=2">');
const dm = vm.createContext({});
vm.runInContext(read('dm5.json').jsLib, dm, {timeout: 1000});
// Only unpack static data; the untrusted Packer wrapper must never execute.
const packed = "eval(function(p,a,c,k,e,d){throw Error('must not execute')}('0 1=\"https://img/\";0 2=[\"a.jpg\"];1+2[3]+\"?token=ok\";',4,4,'var|pix|pvalue|i'.split('|'),0,{}))";
dm.packed = packed;
assert.equal(vm.runInContext('dm5ImageFromScript(packed)', dm, {timeout: 1000}), 'https://img/a.jpg?token=ok');
assert.throws(() => vm.runInContext('dm5ImageFromScript("invalid")', dm, {timeout: 1000}), /Packer arguments/);
console.log('PASS: synthetic KissLove chapter order/images and DM5 static Packer/error regressions');

const cswCode = read('99csw.json').ruleContent.content;
const decoderStart = cswCode.indexOf(' function base64Ascii(');
const decoderEnd = cswCode.indexOf(' var html=', decoderStart);
assert.ok(decoderStart >= 0 && decoderEnd > decoderStart);
const csw = vm.createContext({});
vm.runInContext(cswCode.slice(decoderStart, decoderEnd), csw, {timeout: 1000});
csw.key = Buffer.from('2A%0A%1A%6').toString('base64');
assert.deepEqual(Array.from(vm.runInContext('decodeOrder(key,4)', csw, {timeout: 1000})), [2,0,1,3]);
assert.equal(vm.runInContext('decodeOrder(key,3)', csw, {timeout: 1000}), null);
assert.equal(vm.runInContext('decodeOrder("MEEw",4)', csw, {timeout: 1000}), null);
console.log('PASS: synthetic 99csw reorder mapping and invalid-input fallback');
