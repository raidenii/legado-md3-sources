# Legado MD3 书源

维护可测试、可追溯的漫画柜、动漫屋、KissLove、九九藏书网书源。根目录每份 JSON 是独立书源对象，可分别导入 Legado；本轮未进行客户端导入测试。

## 仓库基线与版本

接手基线为 `deab9bc`（initial commit）；原仓库只有五份 JSON，无 README、测试、构建配置、许可证文件或上游版本锁定。`lastUpdateTime=0` 不是可追溯的发布版本，其他时间戳也不证明实测状态。精确 SHA-256 和逐源审查见 [审查记录](docs/source-audit.md)。接手审查保留了全部书源；后续修正及上游锁定见 [上游核对记录](docs/upstream-review.md)。本地提交不代表已推送或发布。

| 文件 | lastUpdateTime（原值） | 交接报告 | 本轮验证及差异 |
| --- | --- | --- | --- |
| manhuagui.json | 1793296565681 | 核心流程已在 MD3 实测 | JSON/Node 语法通过；元数据/CDN/主站限速符合；仍有 sleep helper 和远程 lz-string，完整目录/R18 待 fixture 与客户端复核 |
| dm5.json | 0 | 无节流版本待 MD3 确认 | rate 为空且无 sleep；静态 Packer 合成回归通过；Rhino java 作用域仍需客户端复核 |
| kisslove.json | 0 | 核心流程已在 MD3 实测 | API、章节正序和图片转换合成回归通过；10/10000 限速的上游依据待核验 |
| 99csw.json | 1793463307822 | 真章节排序验证正常 | 已移除浏览器回退、补齐详情解析、修复 Rhino 空密钥 fallback；Rhino/Jsoup 合成 HTML 与 12 组上游 decoder 对照通过，修正版未做 MD3 实测 |
| wenku8.json | 1793297391562 | 非本次四源维护范围 | 保留并纳入基础校验；自带许可及归属声明需另行核验 |

“交接报告”来自用户提供的历史状态，不是本轮复测结果。现有文件无法仅凭时间戳判定是否就是历史实测版本，不能据此标记为最新或旧版。

## 本地验证

使用 Python 3 和 Node.js，无第三方依赖、无需启动服务：

```sh
python3 -m unittest discover -s tests -v
```

测试覆盖全部 JSON 的重复键、独立对象结构、基本必需字段和 URL，以及漫画柜固定元数据。Node 编译 37 个脚本块，不执行它们；Legado `{{...}}` 模板在外层语法检查中被替换，模板内容、Rhino 兼容性和动态代码不因此得到验证。识别 `<js>`、`@js:`、jsLib、preUpdateJs 和漫画柜 loginUrl。

离线回归执行本地可信函数，使用合成 KissLove API fixture 和最小 Legado API mock，检查章节正序、默认标题、图片域名转换/过滤/转义；DM5 检查静态 Packer 提取及错误路径；99csw 检查重排索引和无效映射。未执行任何网站返回脚本，未请求网站。尚缺真实脱敏 HTML、漫画柜目录/R18/Packer、完整 99csw DOM 正文与水印 fixtures，以及所有来源的客户端回归。

真实 Legado 测试应记录客户端版本、书源 SHA-256、日期、脱敏书籍/章节标识、搜索/发现/详情/目录/阅读结果。DM5 无节流版和后续任何书源修复必须另做实测；不得将 Node mock 结果称为 MD3 通过。

## 上游与许可

优先参考 [Keiyoushi extensions-source](https://github.com/keiyoushi/extensions-source)：Manhuagui.kt、Dm5.kt、KissLove.kt、对应 DTO 和 lib/unpacker/Unpacker.kt。99csw 参考 [tinganhsu/99csw_dl](https://github.com/tinganhsu/99csw_dl) 的 `ninetynine_dl/core/decoder.py`。具体路径、版本和许可核验状态见审查记录。本轮 Git 请求因注入代理端点不可达失败，不能声称已比对上游或确认许可证。不要提交个人 Cookie/凭据。

后续优先分别修正 99csw 浏览器回退、核对漫画柜遗留 helper 和外部依赖、确认 KissLove 限速来源，再补齐真实 fixture 与 Legado 实测；每源单独提交并更新测试状态。

## 上游核对后的离线 Rhino 测试

```sh
bash tests/run_rhino.sh
```

需要 Java（本轮为 OpenJDK 21）；脚本从官方 Maven 获取固定 Rhino 1.7.15 和 Jsoup 1.18.3，并验证仓库中固定的 SHA-256。缓存默认在 `/workspace/legado-test-tools`，可用 `LEGADO_TEST_TOOLS` 指定其他目录。缓存完整时测试不联网。该测试使用真实 Rhino/Jsoup 和合成 HTML，不等于真实网站或 MD3 客户端测试。

已核验 99csw 上游 README 声明 GPL-3.0-or-later（上游未附完整 LICENSE）；随仓库保存 GPL-3.0 文本并记录归属与修改。具体版本、适配与尚未解决的授权链问题见上游核对记录。
