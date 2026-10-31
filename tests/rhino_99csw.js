// Synthetic HTML, real Rhino/Jsoup; this does not emulate the whole MD3 application.
function assertEqual(actual, expected) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw Error('Expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
    }
}
function body(code) { return code.replace(/^<js>/, '').replace(/<\/js>$/, ''); }
var csw = JSON.parse(readFile('99csw.json', 'UTF-8'));
var baseUrl = 'https://www.99csw.com/book/1/';
var result = readFile('tests/fixtures/99csw/catalog.html', 'UTF-8');
assertEqual(typeof csw.ruleBookInfo.init, 'string');
var info = JSON.parse(eval(body(csw.ruleBookInfo.init)));
assertEqual([info.n,info.a,info.k,info.c,info.t], ['离线测试书籍','测试作者','测试类别','https://www.99csw.com/images/test.jpg',baseUrl]);
result = '<html><h2>备用书名</h2><img src="../cover.jpg"></html>';
info = JSON.parse(eval(body(csw.ruleBookInfo.init)));
assertEqual([info.n,info.a,info.k,info.c], ['备用书名','未知作者','小說','https://www.99csw.com/book/cover.jpg']);
var java = {log:function() {}}; // Any browser/ajax call fails: no such method exists.
for each (var rule in [csw.ruleSearch, csw.ruleExplore]) {
    result = readFile('tests/fixtures/99csw/list.html','UTF-8');
    var list = eval(body(rule.bookList));
    assertEqual(list.length, 1);
    assertEqual([list[0].n,list[0].a,list[0].k,list[0].u,list[0].c], ['离线测试书籍','测试作者','测试类别','https://www.99csw.com/book/1/','https://www.99csw.com/images/test.jpg']);
    result = '<html><body><ul class="list_box"></ul></body></html>';
    assertEqual(eval(body(rule.bookList)), []);
    result = readFile('tests/fixtures/99csw/challenge.html','UTF-8');
    var message = '';
    try { eval(body(rule.bookList)); } catch (error) { message = String(error); }
    assertEqual(message.indexOf('书源登录') >= 0, true);
}
result = readFile('tests/fixtures/99csw/chapter.html','UTF-8');
assertEqual(eval(body(csw.ruleContent.content)), '<p>第一段</p><p>第二段</p><p>第三段</p><p>第四段</p>');
result = result.replace(/<meta[^>]+>/, '');
assertEqual(eval(body(csw.ruleContent.content)), '<p>第三段</p><p>第一段</p><p>第二段</p><p>第四段</p>');
print('PASS: 99csw Rhino/Jsoup synthetic catalog, list, challenge, reorder, watermark and fallback');

var decoderCases=JSON.parse(readFile('tests/fixtures/99csw/upstream-decoder.json','UTF-8'));
for each (var decoderCase in decoderCases) {
    result=decoderCase.html;
    assertEqual(eval(body(csw.ruleContent.content)),decoderCase.expected);
}
result=readFile('tests/fixtures/99csw/challenge.html','UTF-8');
var detailsMessage='';
try {eval(body(csw.ruleBookInfo.init));} catch(e) {detailsMessage=String(e);}
assertEqual(detailsMessage.indexOf('书源登录')>=0,true);
assertEqual(JSON.stringify(csw).indexOf('startBrowserAwait'),-1);
print('PASS: 12 99csw reordered outputs match pinned upstream Python decoder');
