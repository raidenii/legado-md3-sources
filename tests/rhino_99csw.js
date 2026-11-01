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
// Apply the CSS selector/attribute contract to real Jsoup, without converting HTML to JSON.
function detailField(rule, html) {
    var split=rule.lastIndexOf('@');
    var selector=rule.substring(5,split),attribute=rule.substring(split+1);
    var elements=org.jsoup.Jsoup.parse(html,baseUrl).select(selector);
    return String(attribute==='text'?elements.text():elements.attr('abs:'+attribute));
}
var original=result;
assertEqual(eval(body(csw.ruleBookInfo.init)), original);
assertEqual(detailField(csw.ruleBookInfo.name,result),'离线测试书籍');
assertEqual(detailField(csw.ruleBookInfo.author,result),'测试作者');
assertEqual(detailField(csw.ruleBookInfo.kind,result),'测试类别');
assertEqual(detailField(csw.ruleBookInfo.coverUrl,result),'https://www.99csw.com/images/test.jpg');
assertEqual(eval(body(csw.ruleBookInfo.tocUrl)),baseUrl);
for each (var layout in ['pc','mobile']) {
    baseUrl=(layout==='pc'?'https://www.99csw.com':'https://m.99csw.com')+'/book/5472/index.htm';
    result=readFile('tests/fixtures/99csw/catalog-5472-'+layout+'.html','UTF-8');
    var cached=eval(body(csw.ruleBookInfo.init));
    assertEqual(cached,result); // Same-page catalog still sees the original HTML.
    assertEqual(detailField(csw.ruleBookInfo.name,cached),'唐鲁孙系列·中国吃');
    assertEqual(detailField(csw.ruleBookInfo.author,cached),'唐鲁孙');
    assertEqual(detailField(csw.ruleBookInfo.coverUrl,cached),'https://www.99csw.com/book/cover.pic/cover_5472.jpg');
    result=cached;
    var chapters=eval(body(csw.ruleToc.chapterList));
    assertEqual(chapters.length,28);
    assertEqual(chapters[0].name,'馋人说馋（序一）');
    assertEqual(chapters[3].name,'吃在北平');
    assertEqual(chapters[27].name,'后记');
    for(var i=0;i<chapters.length;i++) assertEqual(chapters[i].url,'https://www.99csw.com/book/5472/'+(192826+i)+'.htm');
}
baseUrl='https://www.99csw.com/book/1/';
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

// Header uses MD3's WebView API, not an invented desktop/mobile UA or Cookie.
var savedJava=java;
var deviceUA='Mozilla/5.0 (Linux; Android 15; Test Device; wv) AppleWebKit/537.36 Version/4.0 Chrome/140.0.0.0 Mobile Safari/537.36';
java={getWebViewUA:function(){return new Packages.java.lang.String(deviceUA);}};
var sourceHeaders=JSON.parse(eval(body(csw.header)));
assertEqual(sourceHeaders['User-Agent'],deviceUA);
assertEqual(sourceHeaders['Referer'],'https://www.99csw.com/index.php');
assertEqual(typeof sourceHeaders.Cookie,'undefined');
assertEqual(csw.enabledCookieJar,true);
assertEqual(csw.loginUrl,'https://www.99csw.com/');
java=savedJava;
print('PASS: captured 5472 PC/mobile details and 28 ordered, unique canonical chapter links; shared-page HTML preserved');
