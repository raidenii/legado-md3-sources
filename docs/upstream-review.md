# 上游核对与修正

日期：2026-10-31。对应初始审查见 source-audit.md；该旧文档的差异与文件哈希描述的是接手基线，本文件记录后续修正。

## 九九藏书网

上游锁定 [tinganhsu/99csw_dl@f0a71d5b7803c6a982927a1bd7f89051572aee47](https://github.com/tinganhsu/99csw_dl/tree/f0a71d5b7803c6a982927a1bd7f89051572aee47)：

- [decoder.py](https://github.com/tinganhsu/99csw_dl/blob/f0a71d5b7803c6a982927a1bd7f89051572aee47/ninetynine_dl/core/decoder.py)：按 `[A-Z]+%` 分割密钥，idx<3 时 j+=1、否则 j+=2，缺少密钥时直接提取 p/div/section。现有核心算法一致，保持原有合法映射逻辑和水印清理。
- [parser.py](https://github.com/tinganhsu/99csw_dl/blob/f0a71d5b7803c6a982927a1bd7f89051572aee47/ninetynine_dl/core/parser.py)：按 .book_info h2、作者/类别链接及 .cover img 提取详情。原书源只有 n/a/c 等字段映射，没有产生这些字段的 init；现按上游补齐，输出 Legado 字段对象，使用响应 baseUrl 解析相对封面路径。未增加上游没有的简介抓取；简介、最新章节、字数字段暂为空。
- 上游未自动处理 Cloudflare；去除搜索/发现中的 startBrowserAwait，遇挑战明确提示用户通过现有书源登录及 Cookie Jar 完成验证，不自动打开浏览器，不新增重试或限速。
- 实际 Rhino 复现：Jsoup attr 返回的 Java 空字符串对象在 `if(!key)` 中不等价于 JS 空字符串，缺少 meta client 时进入空排列分支并返回“未获取到正文”。将该边界显式转为 String，恢复上游直接提取路径。

许可：上游 README 授权段声明 **GPL-3.0-or-later**，本次递归检查未发现 LICENSE/NOTICE 文件。保留归属，添加 licenses/GPL-3.0.txt（系统 GNU GPL v3 全文），并在移植脚本注释记录来源和修改。上游 README 还列出原始 Node 项目 zsakvo/99dl 及 Gemini AI 辅助重构；这一历史归属记录不等于对全部历史贡献的授权审计，不向其他书源扩展该许可。

验证：合成 HTML 覆盖详情/缺字段回退、搜索/发现、空列表、Cloudflare 提示、正文重排、缺密钥直提取、水印及脚本剔除。另实际运行锁定版 upstream decoder.py，使用固定随机种子 99 生成 3/4/8/16 节点各三种排列的预期输出，存入 tests/fixtures/99csw/upstream-decoder.json；Rhino 对照全部通过。生成时临时使用 BeautifulSoup 4.14.2；常规测试无需安装该包。需要再生预期值时，可运行 `python3 tests/generate_upstream_99csw.py /path/to/99csw_dl`；生成器校验上游提交和 decoder 文件完整性后才执行。测试没有运行任何 HTML script。

Legado/Rhino 适配保留的差异：已有索引去重/范围校验比上游严格，非法映射回退；保留 HTML 转义、换行及水印清理。测试对照验证合法排列，未声称非法输入行为与上游完全相同。

当前 99csw.json SHA-256：`56adaee22b401f983ee6fbc97957e19e5d63f250fd1319d73473aa469d761e26`。

## 漫画柜

上游锁定 [keiyoushi/extensions-source@0d83f6be79e12b0a8b6c6f20a500c0e9456c222a](https://github.com/keiyoushi/extensions-source/tree/0d83f6be79e12b0a8b6c6f20a500c0e9456c222a)：

- [Manhuagui.kt](https://github.com/keiyoushi/extensions-source/blob/0d83f6be79e12b0a8b6c6f20a500c0e9456c222a/src/zh/manhuagui/src/eu/kanade/tachiyomi/extension/zh/manhuagui/Manhuagui.kt)：getPageList、parseChapterList、R18 Cookie 与限速默认值。
- [Unpacker.kt](https://github.com/keiyoushi/extensions-source/blob/0d83f6be79e12b0a8b6c6f20a500c0e9456c222a/lib/unpacker/src/keiyoushi/lib/unpacker/Unpacker.kt) 和同目录 SubstringExtractor.kt：当前静态解包核心与上游一致，不替换为 eval，不另造解包算法。
- [LZString.kt](https://github.com/keiyoushi/extensions-source/blob/0d83f6be79e12b0a8b6c6f20a500c0e9456c222a/lib/lzstring/src/keiyoushi/lib/lzstring/LZString.kt)：将 decompressFromBase64/decompress/DecompressionContext 的位读取、字典扩容及错误行为直接翻译到 jsLib，只有字符串/数组/错误类型使用 JS 等价实现；无需 Kotlin 的压缩功能，未移植它。
- [Dto.kt](https://github.com/keiyoushi/extensions-source/blob/0d83f6be79e12b0a8b6c6f20a500c0e9456c222a/src/zh/manhuagui/src/eu/kanade/tachiyomi/extension/zh/manhuagui/Dto.kt)：核对图片 path/files/sl 字段；现有正常图片数据的输出逻辑保持不变。

修正：

1. 删除没有调用点的 sleep/Checkwait 忙等待 helper；没有加入新 sleep/重试/限速。上游 fetchMangaUpdate 的异步 delay(1000L) 用于额外登录/投票辅助请求，不等同于本地 Checkwait，未将它加入阅读流程。
2. 原书源详情和正文通过 java.importScript 获取远程 lz-string；改为书源内置 Kotlin 等价解压，两处远程导入全部移除，维持独立导入。
3. 原目录在真实 Jsoup 中使用 `span.1`，这是 class 选择器而非 Legado 的索引语法，无法取到日期；改用上游精确的状态链接 a.blue 和最后一个 span.red。新增 fixture 原先复现日期丢失，修复后通过。

保持：漫画柜/空注释/漫画固定元数据、CDN i.hamreus.com、主站 10 次/10 秒、完整目录合并和最终正序。上游 R18 开关默认 false；依用户交接要求，本书源继续默认发送 isAdult=1，这是明确的产品适配差异。上游隐藏目录使用 replaceWith，此书源保留已有按 section id 合并实现，不盲目改写已交接实测行为。图片 CDN 独立 4 次/秒限速仍未在 Legado 中实现。

测试：真实 Rhino 1.7.15（ES6 模式）/Jsoup 1.18.3 下执行本地可信脚本，五组 LZ 压缩向量通过；向量由官方 npm lz-string@1.4.4 生成（包 shasum c0d8eaf36059f705796e1e344811cf4c498d3a26），仅作为离线参考样本，运行测试不需要 npm 包。另验证 radix62、空字典槽、绝不执行 Packer wrapper、压缩字典到图片 HTML 的完整规则、隐藏目录与单行本并存、最新日期、CDN/Referer、缺少图片代码的错误输出，以及固定元数据/主站速率/R18 Cookie。没有执行 fixture 内 script、抓取目标站或宣称真实客户端通过。

许可：上游根 LICENSE 为 Apache-2.0，已原样保存 `licenses/Apache-2.0.txt`；检查上游根目录及相关三个库/书源目录未发现 NOTICE。移植部分注释记录来源/固定提交及翻译修改；原有漫画柜共享库的历史作者/授权仍未由该上游核验覆盖，不向其或其他书源套用 Apache 许可。

当前 manhuagui.json SHA-256：`2697a779e7d4f69a301ceedf1f51d9988a5108455a6706bc74a58f2d5577687d`。

## 网络证据与范围

普通沙箱执行时 proxy:8080 连接失败；使用批准的网络执行权限并继续经过原有 HTTPS 代理后，上游 Git 读取成功。这是执行权限差异，不是缺少 GitHub 凭据；未绕过代理、关闭 TLS 或请求个人 token。前一次核对只获取上游仓库及测试工具，没有请求目标书源网站；本轮的少量真实页面读取见下方 2026-11-01 记录。

所有结果都是本地离线验证，尚未进行修正版 MD3 客户端导入或真实章节阅读，不声称解决 Cloudflare 自动验证。

## 2026-11-01：真实 PC/手机页面与同页流程修正

用户报告通过 CF 后搜索成功，但详情失败、目录为空，日志实际 URL 是 `https://m.99csw.com/book/5472/index.htm`。此前的合成 `.book_info` fixture 未覆盖真实 PC 站的 `#book_info`；不应把解析完成或有文本输出当成正确正文的证据。

本轮低频读取用户给定的 PC URL（PC/Mobile UA 各一次）、日志中的手机 URL 和一个正文章节 URL。PC 页标题《唐鲁孙系列·中国吃》，作者唐鲁孙，详情和目录同页；PC 详情是 div#book_info，作者在 h4，目录是 dl#dir。手机详情在 dd.binfo，目录是 dd#dir 内多层 dl；手机页末组与前组有四条重复链接。请求头原本是 Mobile UA，但本环境两种 UA 请求 www 都返回 PC 结构，因此不能认定仅 UA 就必然导致服务器重定向。

修正：

- 请求改用 PC UA；仍兼容用户已保存的手机书籍地址。
- init 仅检查验证页并返回原始 HTML，字段使用明确 @css 规则；去掉前版 JSON 字段映射。这避免详情转换覆盖后，同 URL 的目录解析失去 HTML。此为同页契约修正，未声称已从官方解析器或用户日志证实缓存一定被覆盖。
- 详情选择器覆盖 #book_info/.book_info/.binfo；补上实际页面已有简介，目录 URL 仍为 baseUrl。
- 对照上游 parser.py 已有的“目录容器内遍历所有链接”思路，遍历 #dir（或 .dir_box），仅保留当前书号的数字章节 URL，保留页面顺序、按 URL 去重，并将 m/read 的章节链接规范为 www 的 .htm。
- 正文解码规则、CF Cookie Jar/登录方式不变，无浏览器回退、额外等待、重试或限速。

fixtures/catalog-5472-pc.html 和 catalog-5472-mobile.html 来自上述公开页面，仅保留详情元数据和目录 DOM，删除作品简介长文、脚本、表单和账号/控制入口；不包含 Cookie 或完整章节正文。两份 fixture 均验证书名、作者、封面、同页 HTML 完整保留以及 28 个唯一、连续、顺序一致的 PC 章节 URL（192826–192853）；包括序言，不擅自将其删除。CSS 字段的 selector/attribute 契约由真实 Jsoup 验证，但不是完整 Android Legado 引擎。

从目录得到 /book/5472/192829.htm，实际 PC 页和 #content h2 均为《吃在北平》。在 Rhino 中执行现有静态正文解析得到 72 段、9980 字符。此检查仅确认一篇响应的身份和可提取性，不能据此确认整书内容、所有段落语义顺序或设备上的阅读行为。完整正文只留在 /tmp 检查，未提交。

原有 12 组上游重排对照及其他书源测试通过；当前仍需用户更新书源后在 MD3 中复测详情、完整目录与实际正文。

## 2026-11-01：CF 循环反馈后的 UA 修正

PC UA 修正版后用户反馈认证通过又回到认证。本轮没有设备 Cookie、网络身份或 WebView 指纹，因此不能证明具体 CF 原因，也不能宣称已修好认证。

核对 [HapeLee/legado-with-MD3@b21025d3769ec9c4028514914f3c555a1ba284b8](https://github.com/HapeLee/legado-with-MD3/tree/b21025d3769ec9c4028514914f3c555a1ba284b8)：

- app/src/main/java/io/legado/app/help/JsExtensions.kt：getWebViewUA() 返回 WebSettings.getDefaultUserAgent(appCtx)。
- app/src/main/java/io/legado/app/data/entities/BaseSource.kt：getHeaderMap 支持 <js> header，缺少 UA 时才使用全局设置；有登录 header 时可继续合并覆盖。
- app/src/main/java/io/legado/app/ui/login/SourceLoginSheets.kt：登录 WebView 的 userAgentString 取 state.headers 中的 User-Agent。
- app/src/main/java/io/legado/app/ui/login/SourceLoginViewModel.kt：登录流程从 WebView CookieManager 保存 Cookie 到 CookieStore。

因此不能简单归因于“书源与登录窗口一定使用了不同 UA”；已核对版本中两者都会采用书源头。更准确的问题是上一版把设备 WebView 也伪装为固定桌面 Chrome，可能与设备实际浏览器特征不符。现移除该人为变量：header 动态使用 String(java.getWebViewUA())，其余语言/Referer、Cookie Jar 和 www 登录 URL 保留。不向 Cookie 写入凭据，不清空用户 Cookie，不增加浏览器回退、延时或重试。

Rhino 测试用返回 Java String 的 getWebViewUA mock 验证输出 UA 与设备值一致，且无固定 Cookie；已有 PC/移动详情、28 章目录、正文和其他书源回归继续通过。这是 API 契约与解析验证，未执行 Android WebView/Cloudflare，用户当前安装版本是否与核对版本相同也未确认。PC URL 仍作为章节规范地址，移动页面兼容保留。

## 2026-11-01：用户授权的交互式 CF 验证恢复

用户确认真实 WebView UA 版能够过盾，并明确要求搜索/发现/正文撞 CF 时自动弹出验证窗口、正文验证后刷新。因此本版不再沿用前文“只能手动点登录”的策略，AGENTS 中记入该书源的明确授权例外。

本版 jsLib 内置 cswResponseHtml(legadoJava, response, url, stage, selector)，先检查预期数据容器和挑战标记，再至多调用一次 startBrowserAwait(url, title, true)，读取返回 body 后继续解析。调用点覆盖搜索/发现/详情/目录/正文，始终传当前 baseUrl（保留搜索词、分页或章节地址），不把验证地址替换成站点首页。空响应、取消或再遇挑战会停止，不递归弹窗、不额外 java.ajax 或重复请求。正常空列表以及含 Cloudflare 字样的真实正文不会触发。

客户端 API 依据仍为 HapeLee/legado-with-MD3@b21025d3769ec9c4028514914f3c555a1ba284b8：JsExtensions.kt 的三参 startBrowserAwait 把 refetchAfterSuccess 传给 SourceVerificationHelp.getVerificationResult；StrResponse.kt 提供 body() 方法。客户端负责验证窗口、Cookie 保存和验证后的重新获取；书源不执行网页的解包脚本、不添加 CF 识别算法、等待或重试。

Rhino 测试用返回 Java String 的 response.body() mock 覆盖搜索/发现/详情/目录/正文挑战，断言每次只开一次窗口、URL 是原 URL、refetchAfterSuccess=true，刷新内容被正确解析；另验证取消、空响应、重复挑战停止，正常空结果/含 CF 名称的文章不打开窗口。原有正文上游对照、真实目录结构和其他书源回归通过。这些是 API 契约模拟，不宣称已在 MD3 设备上实际弹窗/续读通过。
