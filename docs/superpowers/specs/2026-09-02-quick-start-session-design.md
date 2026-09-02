# 全局快捷新会话设计规格

## 目标

允许用户在设置中保存一段全局共用的会话启动提示词。启用后，Agent 侧栏空闲状态显示“使用预设开始”按钮；点击按钮会把该提示词作为第一条真实用户消息发送，创建任务并进入新会话。

## 非目标

- 不建立多模板、模板分类、排序或导入导出系统。
- 不替代现有的手动输入创建会话流程。
- 不把启动提示词注入每一轮模型上下文。
- 不修改 Agent 规则或 Agent 提示词链的语义。
- 不为提示词提供加密；它与其他普通设置一样保存在本地数据库中。

## 方案选择

采用独立的“快捷新会话”全局设置，不复用 Agent 规则或提示词链。

原因：

- Agent 规则会在每次上下文构建时作为 system 消息注入，适合持续约束，不适合一次性启动任务。
- 提示词链属于具体 Agent 的静态上下文，也会在模型调用时反复构建，无法自然表达全局、一次性的用户请求。
- 当前 `useAgentSession.startSession(userRequest)` 已完整实现“以一条用户消息创建会话”，新增快捷入口可以复用现有链路。

## 用户体验

### 设置

在“设置 > 通用”增加“快捷新会话”区域：

- “启用快捷新会话”开关。
- 多行“启动提示词”文本框。
- 简短说明：启用后可在 Agent 侧栏一键使用该提示词创建新会话。

行为：

- 默认关闭，提示词默认空字符串。
- 提示词仅包含空白字符时视为空。
- 提示词为空时不能启用；保存无效组合时前端阻止提交，后端也拒绝请求。
- 关闭开关不清除已保存的提示词，方便之后重新启用。
- 设置保存沿用现有即时保存和失败回滚行为。

### Agent 侧栏

- 仅当没有打开主任务、没有查看子 Agent、设置已启用且提示词非空时显示按钮。
- 按钮放在空闲状态的最近任务区域，与最近任务列表同时存在。
- 按钮文案为“使用预设开始”；英文为“Start with preset”。
- 原有输入框始终保留，启用快捷功能后仍可手动输入任意内容创建会话。
- 关闭设置后不渲染按钮，侧栏行为和当前版本一致。
- 点击后立即进入现有会话启动状态，第一条用户消息在聊天记录中可见。
- 启动过程中禁用按钮，避免重复点击创建多个任务。

## 数据模型与 API

复用现有通用 `settings` 键值表，不新增业务表或 Alembic migration。

新增两个设置字段：

| API 字段 | 前端字段 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `quick_start_enabled` | `quickStartEnabled` | boolean | `false` |
| `quick_start_prompt` | `quickStartPrompt` | string | `""` |

后端要求：

- `SettingsResponse` 始终返回两个字段。
- `SettingsUpdateRequest` 允许分别更新两个字段。
- 当请求得到的最终状态为 `quick_start_enabled=true` 且提示词 trim 后为空时，返回可展示的 422 校验错误。
- 更新其他设置时必须结合数据库中的旧值计算最终状态，不能因请求只携带部分字段而错误拒绝。
- 提示词按用户原文保存；仅使用 trim 结果判断是否为空，不自动破坏正文首尾格式。

前端要求：

- `settings-api.ts` 负责 snake_case 与 camelCase 转换。
- `Settings` 查询缓存是设置面板与 Assistant 侧栏的共同数据源。
- 设置保存成功后更新同一个 `['settings']` Query 缓存，使按钮立即显示或隐藏，无需刷新页面。

## 会话启动数据流

```text
用户点击“使用预设开始”
  -> 检查设置启用且提示词非空
  -> 进入与手动发送相同的摘要完整性检查
  -> 使用显式 prompt 调用会话发送函数
  -> useAgentSession.startSession(prompt)
  -> POST /agent/sessions 创建 Task/Session
  -> 加入 Socket.IO 会话房间
  -> POST /agent/sessions/{id}/message 发送首条用户消息
  -> 显示乐观用户消息并进入会话窗口
```

不得通过以下方式实现：先调用 `setInputValue(prompt)`，再立即触发现有 `onSend()`。React 状态更新不是同步的，这种写法可能发送旧输入值。

应在 Assistant 侧栏抽出一个接收显式文本的启动动作，例如 `sendInitialMessage(message)`，让手动发送和快捷按钮共享：

- 当前模型、Agent 和 reasoning effort。
- 无模型提示。
- 摘要缺失确认框。
- 任务标题预览。
- 启动中状态和防重复提交。
- `startSession(message)` 的错误处理。

手动输入仍负责附件；快捷启动不附带图片附件，也不清除输入框中尚未发送的草稿。

## 任务标题

快捷启动沿用当前新任务标题规则：使用首条提示词原文 trim 后的前 50 个字符作为即时标题，超出时追加省略号。已有后台标题生成、手动重命名和任务列表行为保持不变。

## 错误与边界处理

- 未选择模型：复用现有“未选择模型”提示，不创建任务。
- 摘要不完整：显示现有摘要警告；确认后才使用预设启动，取消则不创建任务。
- 双击：第一次点击进入启动状态后按钮立即禁用，后续点击无效。
- 创建 Session 失败：复用现有启动失败 toast 和 transcript 错误状态，不进行第二次隐式重试。
- 设置读取失败：不显示快捷按钮，保留手动输入流程。
- 设置被其他页面关闭：Query 缓存更新后按钮立即消失。
- 提示词包含换行或 Markdown：按原文作为普通用户消息发送。
- 输入框已有草稿：点击快捷按钮不覆盖或清空草稿；返回空闲状态后草稿仍在。

## 修改范围

### 后端

- 修改 `backend/app/api/schemas/setting.py`：新增响应和更新字段。
- 修改 `backend/app/api/routers/settings.py`：新增设置键、默认值、读取转换、部分更新逻辑，并在合并旧值后执行跨字段校验。
- 修改 `backend/tests/api/test_settings.py`：覆盖默认值、读写、部分更新与非法启用。

### 前端

- 修改 `frontend/src/features/settings/lib/settings.types.ts`：新增 API 和 UI 字段。
- 修改 `frontend/src/features/settings/lib/settings-api.ts`：新增字段转换。
- 修改 `frontend/src/features/settings/components/settings-content.tsx`：保存请求携带新增字段。
- 修改 `frontend/src/features/settings/components/general-settings.tsx`：新增设置区域和前端校验。
- 修改 `frontend/src/features/assistant/components/assistant-sidebar.tsx`：读取设置并提供显式快捷启动动作。
- 修改 `frontend/src/features/assistant/components/tasks/recent-tasks-card.tsx`：按条件渲染快捷按钮。
- 修改 `frontend/src/i18n/locales/zh-CN.json` 与 `frontend/src/i18n/locales/en.json`：增加设置、按钮和校验文案。
- 新增 `frontend/e2e/quick-start-session.spec.ts`：验证设置与会话启动交互。

不修改 `backend/app/agent_runtime/context/parts/rules.py`、Agent PromptChain、数据库实体和 migration。

## 测试与验收

### 后端自动测试

- 未配置时返回 `quick_start_enabled=false` 和空提示词。
- 保存非空提示词并启用后，GET 设置可完整读回。
- 先保存提示词、后单独启用的部分更新成功。
- 启用且最终提示词为空时返回 422，原设置不被部分写入。
- 关闭功能时保留提示词。
- 只更新无关设置时不会改变快捷启动设置。

### 前端 E2E

- 默认关闭时最近任务区域没有快捷按钮。
- 设置中填写提示词并启用后，按钮无需刷新立即出现。
- 点击按钮创建一个任务、显示正确首条用户消息并进入运行状态。
- 快速双击不会创建两个任务。
- 启用时手动输入创建会话仍可用。
- 关闭后按钮立即消失，已保存提示词仍显示在设置中。
- 输入框有草稿时点击快捷按钮，草稿不被覆盖或清除。

### 验证命令

```powershell
Set-Location backend
uv run pytest tests/api/test_settings.py -q
uv run ruff check app tests
uv run ty check app

Set-Location ../frontend
pnpm type-check
pnpm lint
pnpm build
pnpm test:e2e -- quick-start-session.spec.ts
```

## 验收标准

- 默认安装及关闭开关时没有可见行为变化。
- 用户可保存一份全局启动提示词并控制是否启用。
- 启用后只增加一个快捷按钮，不移除或改变手动输入入口。
- 每次点击只创建一个新会话，并仅发送一次预设提示词。
- 预设以真实用户消息出现在新会话历史中，后续轮次不会重复注入。
- 快捷启动与手动启动共享模型选择、Agent 选择、摘要警告、Socket 和错误处理链路。
