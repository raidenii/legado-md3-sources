// This file is loaded after rhino_99csw.js in the same offline process.
var mhg=JSON.parse(readFile('manhuagui.json','UTF-8'));
eval(mhg.jsLib);
var samples=JSON.parse(readFile('tests/fixtures/manhuagui/lz.json','UTF-8'));
for each (var sample in samples) {
    assertEqual(LZString.decompressFromBase64(sample.base64),sample.plain);
}
var invalidMessage='';
try {LZString.decompressFromBase64('');} catch(e) {invalidMessage=String(e);}
assertEqual(invalidMessage.indexOf('Invalid LZString')>=0,true);
// Do not execute the wrapper: the upstream static Unpacker must only transform data.
var content=body(mhg.ruleContent.content);
var helperStart=content.indexOf('function SubstringExtractor');
var helperEnd=content.indexOf('// Keiyoushi obtains');
assertEqual(helperStart>=0 && helperEnd>helperStart,true);
eval(content.slice(helperStart,helperEnd));
assertEqual(parseRadix62('a'),10);
assertEqual(parseRadix62('A'),36);
assertEqual(parseRadix62('10'),62);
assertEqual(unpackKeiyoushi("function(){throw Error('never execute')}('0 1 2',62,3,'alpha||beta'.split('|'),0,{}))"),'alpha 1 beta');
var Get=function(key){return key==='url'?'https://www.manhuagui.com':false;};
var Put=function(data){return JSON.parse(data);};
var hidden=LZString.decompressFromBase64(samples[3].base64);
java={get:function(key){assertEqual(key,'VIEWSTATE');return hidden;}};
baseUrl='https://www.manhuagui.com/comic/1/';
result=readFile('tests/fixtures/manhuagui/catalog.html','UTF-8');
var chapters=eval(body(mhg.ruleToc.chapterList));
assertEqual(chapters.map(function(c){return c.link;}),['1.html','2.html','v1.html','v2.html'].map(function(s){return baseUrl+s;}));
assertEqual(chapters.map(function(c){return c.title;}),['单话1','单话2〔2026-10-30〕','单行本1','单行本2']);
// Full image rule: compressed dictionary, static unpacking, JSON parsing, CDN and Referer.
var compressedDictionary=samples[4].base64;
result='<script>window["packed"](function(){throw Error("must not run")}(\'{"0":["5.7","6.7"],"1":"/8/","2":{"3":123,"4":"9"}}\',62,10,"'+compressedDictionary+'"["x"]("y"),0,{}))</script>';
var imageHtml=eval(content);
assertEqual(imageHtml,'<img src="https://i.hamreus.com/images/one.jpg?e=123&m=token,{"headers":{"Referer":"https://www.manhuagui.com/"}}">\n<img src="https://i.hamreus.com/images/two.jpg?e=123&m=token,{"headers":{"Referer":"https://www.manhuagui.com/"}}">\n');
print('PASS: Manhuagui Rhino/Jsoup LZ, static Packer, R18/multiple-section TOC and CDN image rules');

assertEqual(JSON.stringify(mhg).indexOf('importScript'),-1);
assertEqual(/function (sleep|Checkwait)\(/.test(mhg.jsLib),false);
assertEqual([mhg.bookSourceName,mhg.bookSourceComment,mhg.bookSourceGroup,mhg.concurrentRate],['漫画柜','','漫画','10/10000']);
assertEqual(mhg.header.indexOf('isAdult=1')>=0,true);
result='<html><body>No packed image data</body></html>';
var packedMessage='';
try {eval(content);} catch(e) {packedMessage=String(e);}
assertEqual(packedMessage.indexOf('Failed to find image code')>=0,true);
print('PASS: Manhuagui metadata/rate/adult-cookie invariants, no remote import/wait helpers, invalid chapter error');
