# 上游核对与修正

日期：2026-10-31。对应初始审查见 source-audit.md；该旧文档的差异与文件哈希描述的是接手基线，本文件记录后续修正。

## 九九藏书网

上游锁定 [tinganhsu/99csw_dl@f0a71d5b7803c6a982927a1bd7f89051572aee47](https://github.com/tinganhsu/99csw_dl/tree/f0a71d5b7803c6a982927a1bd7f89051572aee47)：

- [decoder.py](https://github.com/tinganhsu/99csw_dl/blob/f0a71d5b7803c6a982927a1bd7f89051572aee47/ninetynine_dl/core/decoder.py)：按 `[A-Z]+%` 分割密钥，idx<3 时 j+=1、否则 j+=2，缺少密钥时直接提取 p/div/section。现有核心算法一致，保持原有合法映射逻辑和水印清理。
- [parser.py](https://github.com/tinganhsu/99csw_dl/blob/f0a71d5b7803c6a982927a1bd7f89051572aee47/ninetynine_dl/core/parser.py)：按 .book_info h2、作者/类别链接及 .cover img 提取详情。原书源只有 n/a/c 等字段映射，没有产生这些字段的 init；现按上游补齐，输出 Legado 字段对象，使用响应 baseUrl 解析相对封面路径。未增加上游没有的简介抓取；简介、最新章节、字数字段暂为空。
- 上游未自动处理 Cloudflare；去除搜索/发现中的 startBrowserAwait，遇挑战明确提示用户通过现有书源登录及 Cookie Jar 完成验证，不自动打开浏览器，不新增重试或限速。
- 实际 Rhino 复现：Jsoup attr 返回的 Java 空字符串对象在 `if(!key)` 中不等价于 JS 空字符串，缺少 meta client 时进入空排列分支并返回“未获取到正文”。将该边界显式转为 String，恢复上游直接提取路径。

许可：上游 README 授权段声明 **GPL-3.0-or-later**，本次递归检查未发现 LICENSE/NOTICE 文件。保留归属，添加 licenses/GPL-3.0.txt（系统 GNU GPL v3 全文），并在移植脚本注释记录来源和修改。上游 README 还列出原始 Node 项目 zsakvo/99dl 及 Gemini AI 辅助重构；这一历史归属记录不等于对全部历史贡献的授权审计，不向其他书源扩展该许可。

验证：合成 HTML 覆盖详情/缺字段回退、搜索/发现、空列表、Cloudflare 提示、正文重排、缺密钥直提取、水印及脚本剔除。另实际运行锁定版 upstream decoder.py，使用固定随机种子 99 生成 3/4/8/16 节点各三种排列的预期输出，存入 tests/fixtures/99csw/upstream-decoder.json；Rhino 对照全部通过。生成时临时使用 BeautifulSoup 4.14.2；常规测试无需安装该包。测试没有运行任何 HTML script。

Legado/Rhino 适配保留的差异：已有索引去重/范围校验比上游严格，非法映射回退；保留 HTML 转义、换行及水印清理。测试对照验证合法排列，未声称非法输入行为与上游完全相同。

当前 99csw.json SHA-256：`58e66319a65d403d4510785cc9533bfe587380545b9819012506491e50a9adde`。

## 网络证据与范围

普通沙箱执行时 proxy:8080 连接失败；使用批准的网络执行权限并继续经过原有 HTTPS 代理后，上游 Git 读取成功。这是执行权限差异，不是缺少 GitHub 凭据；未绕过代理、关闭 TLS 或请求个人 token。只获取上游仓库及测试工具，没有请求目标书源网站。

所有结果都是本地离线验证，尚未进行修正版 MD3 客户端导入或真实章节阅读，不声称解决 Cloudflare 自动验证。
