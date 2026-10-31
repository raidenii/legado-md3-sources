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

当前 99csw.json SHA-256：`58e66319a65d403d4510785cc9533bfe587380545b9819012506491e50a9adde`。

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

普通沙箱执行时 proxy:8080 连接失败；使用批准的网络执行权限并继续经过原有 HTTPS 代理后，上游 Git 读取成功。这是执行权限差异，不是缺少 GitHub 凭据；未绕过代理、关闭 TLS 或请求个人 token。只获取上游仓库及测试工具，没有请求目标书源网站。

所有结果都是本地离线验证，尚未进行修正版 MD3 客户端导入或真实章节阅读，不声称解决 Cloudflare 自动验证。
