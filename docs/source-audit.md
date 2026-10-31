# 接手审查记录

日期：2026-10-31。基线：deab9bc，接手时工作区干净。全部五份根目录 JSON 已逐一读取；没有现成测试、fixtures、CI、依赖清单、README、AGENTS 或许可证文件。四个目标书源均已存在，另有 wenku8.json。本轮没有修改任何书源。

## 文件身份

| 文件 | SHA-256 |
| --- | --- |
| 99csw.json | 4ec263de721387bad8a1ac3c836732e76ce6ca9c7d7a3e31cc0d7691bb774ec1 |
| dm5.json | 66cd8a22eb8f4b5751362f8cffbe816a5321aafbe387ae43ccf809c209647723 |
| kisslove.json | ea09f30fc6a99600a5d6a15f624ec6a5e49507118cc5d8acc7ae00c8503120cd |
| manhuagui.json | e9a08c032362c3293f7d4a0c8952910008961e19bd031b56dce22c217d3dc9b1 |
| wenku8.json | a86ff071cf75493fec02eb466ddbe5a7299e3eaf8179fb0233e1834ebabcb4c7 |

## 漫画柜

- 固定元数据符合要求；主站 concurrentRate=10/10000；正文 CDN 固定 https://i.hamreus.com。
- ruleToc 遍历章节 section、合并隐藏 VIEWSTATE、去重并反转输出；代码意图覆盖单行本/单话，未用真实 DOM 或 MD3 复测，不能断言所有分组顺序正确。
- 正文内含 SubstringExtractor、parseRadix62、unpackKeiyoushi；静态替换和 JSON.parse，不直接 eval 网页 Packer。其他字段 eval(String(source.loginUrl)) 执行的是书源本地配置，不能与网页 eval 混为一谈。
- jsLib 保留 sleep/Checkwait 忙等待 helper；检查所见 Checkwait 未在其他字段调用，仍应核验上游依据及是否删除。正文通过 java.importScript 拉取 gcore.jsdelivr.net 的 lz-string@1.4.4，无本地副本/完整性固定；未执行或联网加载。
- 隐藏 R18 目录处理存在，但“R18 默认开启”尚无完整行为证据。图片 CDN 独立 4 次/秒限速缺失，与交接所述限制一致。

## DM5

- concurrentRate 字段为空字符串，无 sleep/startBrowserAwait；与交接无节流状态基本一致，尚无历史发布文件可逐字比较。
- dm5ListToLegado、dm5GetPage 显式接受 legadoJava，调用点传 java，避免 helper 内隐式 java 绑定；这只是静态证据，不证明 Rhino 实际作用域通过。
- 有搜索/发现/详情/目录/签名接口图片解析。Packer 使用静态提取，不执行响应代码。逐页接口请求存在；未新增延迟、重试或限速。
- 合成 Packer 回归通过，真实 HTML、签名接口及 MD3 待确认。

## KissLove

- API 列表、详情和章节实现存在；无登录流程。章节按 Number(chapter) 升序排序，图片过滤与旧域名映射存在。
- 合成 fixture 验证章节 1、2.5、10、标题回退、图片域名转换/过滤/转义；未测试 Java MessageDigest/Rhino、在线 API 或实际图片读取。
- concurrentRate=10/10000；需核对 KissLove.kt 是否有同等上游限制，未核验前不应称其符合“无额外限速”原则。
- KL_CLIENT_ID 是嵌入签名流程的常量，当前没有其为个人凭据的证据；须结合上游核验，不能据此要求用户提供密钥。

## 九九藏书网

- 正文标注移植 decoder.py；base64Ascii/decodeOrder 含 idx<3 时 j+=1、否则 j+=2，校验索引并保留直接提取 fallback；水印清理存在。
- 合成测试覆盖索引 [2,0,1,6] 到 [2,0,1,3] 和不合法输入，未验证真实页面 DOM、正文保真或真实章节排序。
- enabledCookieJar=true，loginUrl 为主页；正文遇挑战返回登录提示。
- **明确差异**：ruleSearch.bookList 和 ruleExplore.bookList 都在挑战页面调用 java.startBrowserAwait；因此本文件不能描述为“不使用 WebView/浏览器回退”。本轮保留原文件，后续应单独移除回退并补挑战 HTML 回归及客户端确认。
- ruleBookInfo 仅含字段映射，无 init；是否能从详情 HTML 得到对应 n/a/c 等字段缺少证据，需要真实 fixture/客户端复核。

## 上游追溯与许可证待办

以下为待核验定位，不是已锁定的源码版本：

| 上游 | 对应文件候选路径 | 当前证据 |
| --- | --- | --- |
| keiyoushi/extensions-source | src/zh/manhuagui/src/eu/kanade/tachiyomi/extension/zh/manhuagui/Manhuagui.kt | 用户交接及本地注释；路径、提交、许可未在线核验 |
| 同上 | src/zh/dm5/src/eu/kanade/tachiyomi/extension/zh/dm5/Dm5.kt | 用户交接；路径、提交、许可未在线核验 |
| 同上 | src/en/kisslove/src/eu/kanade/tachiyomi/extension/en/kisslove/KissLove.kt 及 DTO | 用户交接；语言目录、DTO 文件名、提交、许可待确认 |
| 同上 | lib/unpacker/src/keiyoushi/lib/unpacker/Unpacker.kt | 本地注释；精确路径、提交、许可待确认 |
| tinganhsu/99csw_dl | ninetynine_dl/core/decoder.py | 本地正文注释；提交、许可未在线核验 |

Git 只读访问 origin 与 Keiyoushi 都因 proxy:8080 无法连接失败，未绕过代理或关闭 TLS。没有获取上游 LICENSE/NOTICE，不能断言具体许可或授权链完成。恢复网络后应记录不可变 commit、精确源码链接、许可证条款及必要归属；同时调查漫画柜原共享库的来源、lz-string 版权要求。wenku8 自带关于 MPL 2.0 及额外转载条件的长声明，原样保留，未确认其转载授权；不向其套用其他项目许可证。

## 结论

四个目标文件存在，但没有足够历史证据判定它们与交接实测文件逐字一致。99csw 浏览器回退是已确认差异；其余需上游比对、真实 fixture 或 MD3 才能关闭的项已分别列出。基线静态和合成测试通过不代表这些差异已修复。
