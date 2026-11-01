# Legado MD3 书源

维护可测试、可追溯的漫画柜、动漫屋、KissLove、九九藏书网书源。根目录每份 JSON 是独立书源对象，可分别导入 Legado；本轮未进行客户端导入测试。

## 仓库基线与版本

接手基线为 `deab9bc`（initial commit）；原仓库只有五份 JSON，无 README、测试、构建配置、许可证文件或上游版本锁定。`lastUpdateTime=0` 不是可追溯的发布版本，其他时间戳也不证明实测状态。精确 SHA-256 和逐源审查见 [审查记录](docs/source-audit.md)。接手审查保留了全部书源；后续修正及上游锁定见 [上游核对记录](docs/upstream-review.md)。本地提交不代表已推送或发布。

| 文件 | lastUpdateTime（当前值） | 交接报告 | 本轮验证及差异 |
| --- | --- | --- | --- |
| manhuagui.json | 1793463368434 | 核心流程已在 MD3 实测 | 已按 Kotlin 内置 LZ、移除闲置等待 helper、修复目录日期选择器；Rhino/Jsoup 隐藏目录及图片规则离线通过，修正版未做 MD3 实测 |
| dm5.json | 0 | 无节流版本待 MD3 确认 | rate 为空且无 sleep；静态 Packer 合成回归通过；Rhino java 作用域仍需客户端复核 |
| kisslove.json | 0 | 核心流程已在 MD3 实测 | API、章节正序和图片转换合成回归通过；10/10000 限速的上游依据待核验 |
| 99csw.json | 1793553435717 | 真章节排序验证正常 | 保留详情/目录修正，UA 改用 java.getWebViewUA()；离线回归通过，设备 CF 循环待复测 |
| wenku8.json | 1793297391562 | 非本次四源维护范围 | 保留并纳入基础校验；自带许可及归属声明需另行核验 |

“交接报告”来自用户提供的历史状态，不是本轮复测结果。现有文件无法仅凭时间戳判定是否就是历史实测版本，不能据此标记为最新或旧版。

## 本地验证

使用 Python 3 和 Node.js，无第三方依赖、无需启动服务：

```sh
python3 -m unittest discover -s tests -v
```

测试覆盖全部 JSON 的重复键、独立对象结构、基本必需字段和 URL，以及漫画柜固定元数据。Node 编译 41 个脚本块，不执行它们；Legado `{{...}}` 模板在外层语法检查中被替换，模板内容、Rhino 兼容性和动态代码不因此得到验证。识别 `<js>`、`@js:`、jsLib、preUpdateJs 和漫画柜 loginUrl。

离线回归执行本地可信函数，使用合成 KissLove API fixture 和最小 Legado API mock，检查章节正序、默认标题、图片域名转换/过滤/转义；DM5 检查静态 Packer 提取及错误路径；99csw 检查重排索引和无效映射。未执行任何网站返回脚本，未请求网站。Rhino 扩展测试另覆盖漫画柜目录/R18/Packer 以及 99csw DOM 正文和水印（均为合成 HTML）。尚缺真实脱敏网站 HTML fixtures，以及所有修正版的客户端回归。

真实 Legado 测试应记录客户端版本、书源 SHA-256、日期、脱敏书籍/章节标识、搜索/发现/详情/目录/阅读结果。DM5 无节流版和后续任何书源修复必须另做实测；不得将 Node mock 结果称为 MD3 通过。

## 上游与许可

优先参考 [Keiyoushi extensions-source](https://github.com/keiyoushi/extensions-source)：Manhuagui.kt、Dm5.kt、KissLove.kt、对应 DTO 和 lib/unpacker/Unpacker.kt。99csw 参考 [tinganhsu/99csw_dl](https://github.com/tinganhsu/99csw_dl) 的 `ninetynine_dl/core/decoder.py`。具体路径、版本和许可核验状态见 [上游核对记录](docs/upstream-review.md)。99csw 与漫画柜已取得并核对固定提交；DM5、KissLove 和其他历史贡献的完整许可链仍待核验。不要提交个人 Cookie/凭据。

99csw 浏览器回退、漫画柜闲置等待 helper 和远程 LZ 依赖已修正。后续确认 KissLove 限速来源，并补齐真实 fixture 与 Legado 实测；每源单独提交并更新测试状态。

## 上游核对后的离线 Rhino 测试

```sh
bash tests/run_rhino.sh
```

需要 Java（本轮为 OpenJDK 21）；脚本从官方 Maven 获取固定 Rhino 1.7.15 和 Jsoup 1.18.3，并验证仓库中固定的 SHA-256。缓存默认在 `/workspace/legado-test-tools`，可用 `LEGADO_TEST_TOOLS` 指定其他目录。缓存完整时测试不联网。该测试使用真实 Rhino/Jsoup 和合成 HTML，不等于真实网站或 MD3 客户端测试。

已核验 99csw 上游 README 声明 GPL-3.0-or-later（上游未附完整 LICENSE）；随仓库保存 GPL-3.0 文本并记录归属与修改。具体版本、适配与尚未解决的授权链问题见上游核对记录。

漫画柜本轮使用 Keiyoushi 的 Apache-2.0 代码，完整许可文本保存在 `licenses/Apache-2.0.txt`。LZ Base64 解压直接翻译 Kotlin 到 Rhino JS 并内置在单份书源 jsLib；不再请求远程 lz-string。离线测试覆盖五组官方 lz-string 1.4.4 压缩向量（ASCII、中文/代理对、长重复字符串、隐藏目录及图片字典），以及静态 Packer、隐藏目录与单行本并存、最新章节日期、图片 CDN/Referer 和错误页面。主站 10 次/10 秒、R18 默认 Cookie 和固定元数据保持不变，图片 CDN 独立 4 次/秒限速仍未实现。

## 书源导入页面（GitHub Pages）

访问 [Legado 书源页面](https://raidenii.github.io/legado-md3-sources/)，可单独打开每份书源的 Raw JSON、复制链接，或点击「导入阅读」唤起已安装的客户端。页面与参考站一致使用 `yuedu://booksource/importonline?src=…`；浏览器未唤起客户端时，可复制 Raw URL 到「书源管理 → 网络导入」。导入行为仍需在实际 Android/Legado MD3 上确认。

页面源码为 `docs/index.html`，没有前端构建依赖或外部脚本。GitHub Pages 使用 **Deploy from a branch → master → /docs**，该分支更新后由 GitHub 自动部署。新增/移除根目录书源时，同步更新页面列表及数量；Raw URL 始终指向 master 的独立 JSON 文件。

99csw 保留详情/目录同页的原始 HTML；兼容 PC 的 `#book_info` 和手机站的 `.binfo`。目录从容器内遍历有效章节链接，去掉手机页重复项，并统一使用 PC 章节 URL。书号 5472 的 PC/手机页面结构都得到 28 个连续、唯一的章节链接。线上单篇《吃在北平》标题与目录匹配、解析得到 72 段文本；未确认整书正文语义/段落顺序，也未进行实际 MD3 导入和阅读复测。

针对 PC UA 版本后的 CF 循环反馈，99csw 请求头现使用 `java.getWebViewUA()` 返回的真实设备 WebView UA，不再固定桌面/手机版本。MD3 的登录 WebView 会复用此 UA；Cookie Jar 和登录 URL 不变，没有固定 Cookie、自动验证或重试。PC 内容地址与浏览器 UA 是两件事，目录仍输出 PC URL，同时兼容移动页面结构。更新后需重新打开该源登录窗口验证；离线测试无法证明设备上的 CF 已恢复。
