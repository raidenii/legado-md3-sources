# Legado 书源维护约定

主要维护 manhuagui.json、dm5.json、kisslove.json、99csw.json。保留 wenku8.json 及其原有声明；不在无关任务中改动它。

- 修改前阅读 README.md 和 docs/source-audit.md，检查 git status；不要覆盖用户已有修改。
- 各 JSON 必须可独立导入，不依赖其他书源的 jsLib。
- 优先对照 Keiyoushi extensions-source 的对应 Kotlin 和 DTO；直接翻译成熟算法，仅适配 Legado/Rhino API。记录上游文件、不可变提交及许可证/归属要求；无法联网时明确记录未核验。
- 不擅自增加 sleep、限速、重试或用于绕过 Cloudflare 的 WebView/startBrowserAwait。不执行不可信网页 JavaScript；静态解包和 JSON 提取优先。区分执行本地可信配置与执行网络返回代码。
- 漫画柜元数据固定：bookSourceName=漫画柜、bookSourceComment=空字符串、bookSourceGroup=漫画。图片 CDN 为 https://i.hamreus.com；主站 10 次/10 秒；图片 CDN 独立限速尚未实现。
- 保留功能，避免无关字段、格式和时间戳变化；每个书源分别修改并使用清晰 commit message。
- 每次修改运行 `python3 -m unittest discover -s tests -v`。新增算法或修复须补充离线回归；优先使用脱敏 HTML/API fixtures。Node 仅检查语法及模拟逻辑，不证明 Rhino API、Legado 导入或网站当前可用。
- 真实访问低频、有明确目标；不批量抓取。README 更新具体文件版本、测试范围、实际 Legado 版本和结果；没有实测就写未实测。
- 不提交 Cookie、个人凭据、登录状态、敏感日志或未脱敏 fixture。公开协议常量不等于个人凭据，需按来源核验。
- 仓库尚未确认完整授权链；不要擅自添加覆盖所有文件的许可证，也不要删除原有归属声明。
- 云任务已在隔离环境中运行；使用现有 checkout，除非用户明确要求，不创建 Git worktree。

## 99csw 自动验证的明确授权

2026-11-01 用户明确要求搜索/发现/正文遇 CF 时自动触发 WebView，并在验证后刷新原文。99csw 可使用 MD3 的 `startBrowserAwait(url, title, true)`，也覆盖详情/目录的同一验证流程；此为上文默认不增加浏览器回退规则的明确例外。仅识别挑战响应时调用一次，正常空结果和正文提及 Cloudflare 不触发；取消或验证后仍失败就停止，不循环重试。仍使用真实 WebView UA 和 Cookie Jar，不声称支持无人干预自动过盾。其他书源不因此增加浏览器行为。
