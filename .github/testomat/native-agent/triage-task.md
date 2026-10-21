这是个人仓库的自动化试用，仅分析本轮刻意注入的演示缺陷。

请先读取 native-evidence/defect-official.md 和 native-evidence/defect.xml。
如果报告没有失败，不创建任何 Issue。否则必须完成：

1. 用 `nl -ba .github/testomat/login-demo/index.html` 读取真实源码行号。结合页面要求和失败记录，定位输入长度限制冲突。不要猜测文件或行号。
2. 写一份简短中文 Issue 正文到 native-evidence/triage-issue-body.md：现象、根因、具体文件和行号、预期、修复建议。注明“个人演示中刻意注入的缺陷，非线上故障；流水线稍后恢复代码并复测”。附环境变量 GITHUB_RUN_URL 和报告中的 Testomat 报告链接。
3. 用 GitHub CLI 实际提交 Issue。仓库必须是环境变量 GITHUB_REPOSITORY（仅允许 bmdy5/agenticjobs）。标题严格为 `【Testomat 自动定位】GitHub run <GITHUB_RUN_ID>`，其中占位符替换为实际环境变量值。先列出现有 Issue，若已有完全相同标题则复用，避免本轮重复创建。不要复用其他 run 的 Issue。
4. 运行 `gh issue view` 回读刚创建或复用的 Issue。不能把计划、草稿或已有其他 Issue 说成创建成功。
5. 将结果写入 native-evidence/triage-result.json，必须包含 issue_number（整数）、issue_url、file、line（整数）、root_cause（中文）。另外保存简短中文分析报告。

允许读取的资料仅限 .github/testomat/login-demo/ 和 native-evidence/。仅允许写 native-evidence/ 下的报告文件，以及上面限定的一个个人测试 Issue。允许调用 gh issue list/create/view。
禁止读取 .env、密钥文件、认证文件或输出环境变量全集；禁止 gh auth token、打印密钥、修改源代码、提交、推送、创建 PR、合并、发布、删除资源。密钥由运行环境提供，无需查看。
