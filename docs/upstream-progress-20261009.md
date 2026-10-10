# 上游整合进度：2026-10-09 检查点

2026-10-10 用户要求继续后，交付已完成：本轮适配和依赖已应用到 `G:/code/OpenFic`，整套后端 2106、浏览器 24、前端脚本 13、桌面相关 7 项新一轮验证通过。此文下方保留暂停时的历史检查点信息；交付步骤均已完成，最新结论见 `docs/upstream-integration-20261009.md`。

2026-10-09 用户要求：“我要睡觉了，你保存一下进度”。当时本轮代码只保存到隔离分支，暂停后续合并和交付。

## 位置与范围

- 隔离工作区：`C:/Users/fc/.codex/worktrees/upstream-fixes-20261009/OpenFic`。
- 进度分支：`codex/upstream-features-20261009`；本轮基线 `675012e`。
- 原工作区：`G:/code/OpenFic`，仍是 `codex/fixed-lan-port`，本轮尚未应用任何代码或依赖更新。上一轮 11 个修复及原有章节导航的未提交改动保留。
- Git fetch 本轮已成功，上游 main 为 `77181c066378bcaab00d459ed34f49ba3af9e4c2`。
- 本轮整合 12 项：`bf8e227 cc0d0ab 5fbbad0 88feeb3 3a5c97a a36c3e9 ffaf732 12d27da 94e342d fc657ca 9d85a5d dd83a17`。
- 按用户“除了后面三个”的表格语义，继续排除消息导航 `af02d4a`、系统通知 `d0e344b`、发布 `8fd5078` 和 README `77181c0`。本地导航和通知保持；版本仍为 `1.2.0`。Infistar 的 README 赞助内容也未引入。
- `bf8e227` 的上游导航 CSS 没有引入：其渐变遮罩依赖已排除的导航实现，本地 marker navigator 没有对应结构。

## 已完成

附件与文件读取工具、输入框引用面板、角色关系图、工具输出裁剪和压缩设置、默认模型推理强度、Codex OAuth、Infistar、Streamdown 2.7，以及长会话修改摘要／详情按需加载均已适配。保留了本地历史分页、follow-scroll、共享项目引用工具、章节高亮、shared drafts、异步 token 计数、IME／移动端 Enter 修复、桌面偏好、通知和 LAN 固定端口 18473。

迁移冲突已处理：本地已发布 `1022–1025` 不变；新增 `1026` 附件、`1027` 关系、`1028` 推理、`1029` OAuth、`1030` 查询索引。保留已有 session/seq 索引，不重复创建。真实临时 SQLite 验证了旧 `1025` 升级、降级和再次升级，并保留共享引用数据。

独立审查发现并修复了六处问题：

1. OAuth 回调写入也获得账户文件锁，在锁内重新读取注册／账户，避免旧 refresh 覆盖新凭据。
2. 两次同时重新授权同一未绑定注册时，复用最新 provider 绑定，避免生成重复账户。
3. HTML 等非图片附件以下载响应提供，并加 nosniff、sandbox CSP；304 缓存响应也保留防护，PNG/JPEG/WEBP 预览不变。
4. 角色创建被撤销时清除后建的手工关系；恢复关系前验证同项目两个端点仍存在。
5. Codex 将 LangChain 标准图片块转换为 Responses `input_image`。
6. 运行中追加 TXT/PDF／解析失败附件使用通用附件构造器，模型能收到引用和错误说明。

另修复上游详情懒加载将 revision ID 当成 session ID 的传参错误。以上有真实临时文件／SQLite／图执行／模拟 HTTP 的失败再通过证据。最终独立复核结论为规范通过、代码质量 review clean。

## 最新验证

- **整套后端：2106 passed in 174.76s**。日志：`tmp/round2/backend-all-final.log`。
- 前端脚本 13 项；浏览器 24 项（原有导航 6、草稿／IME 10、新功能 8）全部通过。
- 前端 `tsc -b`、type-aware oxlint、生产构建、precache 生成通过。构建仅有既存大 chunk 提示。
- 后端修改文件 Ruff 和 ty 通过；全量 app 的 ty 仍有既存 `lxml.etree` 类型缺失，上一轮原工作区也已复现。
- 桌面主进程和渲染类型检查通过；整套 Node 测试 43 通过、1 失败。唯一失败是原有 `archive.test.mjs` 的符号链接权限 EPERM，在原工作区同样复现，不是本轮回归。新增授权 URL 2 项、通知／端口／偏好 5 项通过。
- 所有差异检查通过。审查包：`tmp/round2/review-final.diff`；详细计划：`docs/superpowers/plans/2026-10-09-upstream-features.md`（该计划目录被仓库忽略）。

## 恢复后交付步骤（2026-10-10 已完成）

1. 更新／追加 `docs/upstream-integration-20261009.md` 的第二阶段记录，不把旧阶段“deferred”文字误认为当前剩余范围。
2. 为原工作区将被改动的文件做新的 ZIP 备份。对本轮涉及的路径，把原文件与基线 `675012e` 按规范化换行比较；若用户另有修改，先适配，不覆盖。
3. 从本轮基线到进度分支生成经过验证的补丁，先 `git apply --check`，再应用回原工作区。已排除的三个表格项继续不合入。不要替用户提交原有未提交改动、切换原分支或推送。
4. 更新原工作区依赖：后端 `uv sync --frozen`，前端 `pnpm install --frozen-lockfile`。隔离依赖已完整安装且缓存热，原环境尚未更新。
5. 比较应用后的代码与进度分支，验证迁移／附件／OAuth等关键回归、前端类型和构建，再交付。不要直接执行真实用户数据库迁移或真实账户授权。

## 环境提示

- Python：隔离 `backend/.venv/Scripts/python.exe`，依赖已经完整安装。
- uv：`C:/Users/fc/AppData/Roaming/Python/Python313/Scripts/uv.exe`。跨进程测试调用 `uv`，命令环境 PATH 要包含其目录；Windows 子进程换行比较已经兼容 CRLF。
- 前端隔离 `node_modules` 是独立目录，已安全移除此前指向原工作区的 junction。原 `G:/code/OpenFic/frontend/node_modules` 保留。
- 隔离 `desktop/node_modules` 仍是指向原桌面依赖的 junction，无新增桌面 npm 依赖。
- Playwright 使用系统 Chrome：设置 `OPENFIC_BROWSER_CHANNEL=chrome`，运行 `playwright.harness.config.ts`。测试自动启动并关闭 Vite，API全部模拟。
- 后续建议继续使用 verification-before-completion、receiving-code-review；实施结束前保持原工作区备份及完整性检查。
