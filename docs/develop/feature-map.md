# OpenFic 功能与代码定位清单

> 用途：在修改或新增功能前，快速找到用户入口、前端实现、后端接口、业务服务、数据模型和测试。
>
> 基线：`codex/todo-improvements`（2026-09-05）。代码演进后，应同步更新本文。
>
> 状态说明：表中未特别标注的能力均为当前分支可用；`docs/superpowers/specs/` 与 `plans/` 是设计/实施记录，不能单独视为已实现。

## 1. 使用方法

收到需求时按以下顺序定位：

- [ ] 在“功能定位矩阵”中找到最接近的用户功能。
- [ ] 从页面或设置面板确认前端入口，不要只改组件表象。
- [ ] 检查前端 API 调用和后端 Router 的请求/响应字段是否需要一起调整。
- [ ] 涉及业务规则时修改 Service；Router 只负责参数、鉴权、响应和异常转换。
- [ ] 涉及持久化字段时同步检查 Model、Repo、Schema、Migration、导入导出和快照。
- [ ] 涉及 Agent 修改时额外检查实时事件、检查点、版本快照、审批和回滚语义。
- [ ] 更新中英文文案：`frontend/src/i18n/locales/zh-CN.json` 与 `frontend/src/i18n/locales/en.json`。
- [ ] 运行该功能对应的定向测试，再运行所属子项目的类型检查/构建。
- [ ] 新增独立用户功能时，在本文补一行定位记录。

常用搜索命令：

```powershell
# 按界面文案找入口
rg -n "文案或 i18n key" frontend/src

# 按 API 路径串起前后端
rg -n 'projects/.*/chapters|/chapters' frontend/src backend/app backend/tests

# 按数据实体找全链路
rg -n "Chapter|chapter_id" frontend/src backend/app backend/tests

# 找所有 HTTP 接口
rg -n "@router\.(get|post|put|patch|delete)" backend/app/api/routers
```

## 2. 总体架构

| 层 | 主要职责 | 核心入口 |
| --- | --- | --- |
| Web 前端 | 页面、编辑器、设置、状态管理、HTTP/Socket 客户端、PWA | `frontend/src/main.tsx`、`frontend/src/lib/api-client.ts` |
| 后端 | FastAPI、Socket.IO、业务服务、Agent 运行时、SQLite/LanceDB | `backend/app/main.py`、`backend/app/cli.py` |
| 桌面端 | Electron 壳、本地 Python/OpenFic 运行时、实例切换、升级、数据管理 | `desktop/src/main/main.ts`、`desktop/src/main/ipc.ts` |
| 打包部署 | Docker、pip wheel、Electron 安装包 | `Dockerfile`、`backend/hatch_build.py`、`desktop/electron-builder.yml` |

主要调用链：

```text
React 页面/组件
  -> React Query / Zustand / Hook
  -> frontend/src/lib/api-client.ts 或功能目录下 *-api.ts
  -> /api/v1 FastAPI Router
  -> storage/services 或领域 Service
  -> Repo
  -> SQLModel + SQLite

Agent 会话另有：HTTP 发起/控制 -> SessionRunner/LangGraph -> Socket.IO 事件 -> 前端会话 Hook/消息渲染
语义检索另有：章节数据 -> 后台索引任务 -> Embedding -> LanceDB -> Agent 检索工具
```

### 2.1 全局入口和横切能力

| 能力 | 定位文件 | 修改提示 |
| --- | --- | --- |
| 路由与启动 | `frontend/src/main.tsx` | 所有页面路由实际定义在这里；`frontend/src/routes/index.ts` 当前只是占位文件 |
| 应用外壳/侧栏 | `frontend/src/features/app-shell/components/app-layout.tsx`、`app-sidebar.tsx` | 新增一级页面通常同时修改路由、侧栏导航与移动端行为 |
| API 基址/认证失败 | `frontend/src/lib/runtime-config.ts`、`api-client.ts` | 默认 API 前缀是 `/api/v1`，桌面远程实例会改变后端地址 |
| 实时连接 | `frontend/src/lib/socket-client.ts`、`background-socket.ts`；`backend/app/socket/handlers.py`、`emitter.py` | Agent、子 Agent 和后台任务均依赖 Socket.IO 房间及事件重放 |
| 全局设置 | `frontend/src/features/settings/**`；`backend/app/api/routers/settings.py` | 设置项通常保存在通用 `settings` 表，字段映射集中在设置 API/类型文件 |
| 国际化 | `frontend/src/i18n/**`、`desktop/src/ui/locales/**` | Web 与桌面壳有两套词典；新增可见文案要检查两处 |
| PWA/缓存 | `frontend/src/pwa/register-sw.ts`、`frontend/scripts/generate-precachelist.mjs` | 改静态资源或离线策略时检查构建后的 precache |
| 错误遥测 | `frontend/src/lib/posthog.ts`、`backend/app/telemetry.py`、`desktop/src/main/telemetry.ts` | 不要把正文、API Key 等隐私内容加入遥测 |
| 认证 | `frontend/src/features/auth/pages/auth-page.tsx`；`backend/app/api/routers/auth.py` | 初始化先读取公开偏好与认证状态，未认证时不会进入主应用 |
| 数据库 | `backend/app/storage/database.py`、`storage/models/**`、`storage/migrations/versions/**` | SQLite 结构改动必须新增 Alembic migration，不要改已有发布 migration |

## 3. 功能定位矩阵

### 3.1 项目与创作资料

| 功能 | 用户入口/前端 | API/后端业务 | 数据/测试 | 修改时的联动点 |
| --- | --- | --- | --- | --- |
| 项目列表、搜索、创建、编辑、删除、封面裁剪 | `/`；`frontend/src/features/projects/pages/projects-page.tsx`、`components/project-*.tsx`、`cover-cropper.tsx`、`hooks/use-projects.ts`、`store/use-projects-store.ts` | `backend/app/api/routers/projects.py` -> `storage/services/project_service.py` -> `storage/repos/project_repo.py` | `storage/models/project.py`；`backend/tests/api/test_projects.py` | 项目删除会联动章节、世界书、角色、任务、索引、封面等从属数据；检查级联与文件清理 |
| 最近项目 | `app-shell/components/recent-projects-nav.tsx`、`frontend/src/lib/local-db.ts`、`recent-projects.ts` | 无服务端业务，使用浏览器 Dexie/IndexedDB | 前端本地库 | 修改项目 ID、标题或删除行为时同步清理最近记录 |
| 项目与章节文档导入 | 新项目：`projects/components/import-dialog.tsx`；已有项目：`writing/components/chapter-import-dialog.tsx`；共享文件/选项：`projects/components/import-file-list.tsx`、`import-document-options.tsx`；客户端：`projects/lib/import-api.ts` | 新项目：`api/routers/import_router.py` 的 `/import/documents/preview`、`/import/documents/confirm`；已有项目：`api/routers/chapters.py` 的 `/projects/{id}/chapter-imports/preview`、`/projects/{id}/chapter-imports`；共享解析：`core/document_import.py`、`core/epub_parser.py`；原子写入：`storage/services/project_chapter_import_service.py` | `api/schemas/import_schema.py`；`backend/tests/core/test_document_import.py`、`backend/tests/api/test_import.py` | 支持 TXT、Markdown、ZIP、EPUB；文件顺序、分卷/合卷和位置策略必须让预览与实际导入一致，格式变更同步四个端点、共享解析器和原子服务 |
| 卷管理 | 写作侧栏；`writing/components/volume-*.tsx`、`grouped-volume-list*.ts(x)`、`hooks/use-volumes.ts` | `api/routers/volumes.py` -> `storage/services/volume_service.py` -> `repos/volume_repo.py` | `models/volume.py`；`backend/tests/api/test_volumes.py` | 创建、改名、删除、排序、跨位置移动；删除卷需明确是否级联章节 |
| 章节列表与 CRUD | `/projects/:projectId`；`writing/components/chapter-sidebar.tsx`、`chapter-list-item.tsx`、`hooks/use-chapters.ts` | `api/routers/chapters.py` -> `storage/services/chapter_service.py` -> `repos/chapter_repo.py` | `models/chapter.py`；`backend/tests/api/test_chapters.py`、`storage/repos/test_chapter_repo.py` | 同时维护卷归属、全局顺序、字数、摘要陈旧状态、检索索引和写作统计 |
| 章节编辑、自动保存、草稿/标签页 | `writing/components/chapter-editor.tsx`、`editor-tabs.tsx`、`hooks/use-auto-save.ts`、`use-writing-working-copy.ts`、`store/use-tabs-store.ts` | 章节 PATCH；写作活动由 `storage/services/writing_activity_service.py` 记录 | `models/chapter.py`、`writing_activity_event.py`；`tests/api/test_chapters.py`、`test_dashboard_writing.py` | 编辑器是 Tiptap；改内容格式时检查 Markdown/HTML 转换、字数、草稿恢复和 Agent 写章工具 |
| 章节搜索、查找替换 | `chapter-search*.tsx`、`find-replace-panel.tsx`、`writing/lib/search-and-replace.ts` | `GET /projects/{id}/chapters/search`，后端 `chapters.py` | `tests/api/test_chapters.py` | 区分当前编辑器内替换与跨章节全文搜索 |
| 章节移动/排序 | `move-chapter-to-volume-dialog.tsx`、分组卷列表拖拽逻辑 | `POST /chapters/reorder`、`POST /chapters/{id}/move-to-volume` | `chapter_service.py`、`chapter_repo.py`、相关 API 测试 | 保证卷内顺序与全局顺序一致；移动后摘要和索引可能需要刷新 |
| 章节导出 | `writing/components/chapter-export-dialog.tsx`、`lib/chapter-export-selection.ts` | `api/routers/chapter_exports.py` -> `chapter_export/service.py` | `api/schemas/chapter_export.py`；`backend/tests/api/test_chapter_exports.py` | 创建后台任务、轮询状态、取消、下载四段链路；检查文件名、章节选择和临时文件清理 |
| 笔记树与分类 | 写作页“笔记”；`writing/components/note-sidebar.tsx`、`note-tree*.tsx`、`note-tree-order.ts`、`hooks/use-notes.ts` | `POST /projects/{id}/note-items/reorder` -> `note_service.reorder_item` | `models/note.py` 的共享 `order_index`；迁移 `1022`；`tests/api/test_notes.py` | 分类和笔记共享持久化顺序；提交完整同级序列，后端校验项目归属、层级和循环移动 |
| 笔记编辑、锁定、隐藏、搜索 | `note-editor.tsx`、`note-search-popover.tsx` | `PATCH /notes/{id}`、`/lock`、`/hidden`，`GET .../notes/search` | `models/note.py`；`test_notes.py` | 锁定影响用户与 Agent 写入；隐藏影响 Agent 上下文/mention，不只是 UI 可见性 |
| 笔记导入导出 | `note-import-dialog.tsx` | `api/routers/notes.py` -> `storage/services/note_transfer_service.py` | `api/schemas/note.py`；`test_notes.py`、`storage/test_note_service.py` | 支持 Markdown/ZIP 与跨项目选择复制；跨项目导入有冲突预览、重命名/覆盖/跳过，来源只读，目标事务提交 |
| 角色管理 | `/characters`；`features/characters/pages/characters-page.tsx`、`components/character-*.tsx`、`store/use-characters-store.ts` | `api/routers/characters.py` -> `storage/services/character_service.py` -> `repos/character_repo.py` | `models/character.py`；`backend/tests/api/test_characters.py` | 支持头像、收藏、批量收藏/删除、搜索；Agent 的角色工具和版本快照也需同步 |
| 世界书/设定条目 | `/world-info`；`features/world-info/pages/world-info-page.tsx`、`components/entry-*.tsx`、`store/use-world-info-store.ts` | `api/routers/world_info.py`、`world_info_entries.py` -> 对应 service/repo | `models/world_info.py`、`world_info_entry.py`；`tests/api/test_world_info*.py`、`storage/test_world_info_entry_service.py` | 支持排序、启停、批量操作、搜索；条目是 Agent 上下文与版本快照的一部分 |
| 世界书导入 | `world-info/components/import-world-info-dialog.tsx` | `/world-info/import/preview`、`/world-info/{id}/entries/import-stream` | `api/schemas/world_info.py`；`tests/api/test_world_info_entries.py` | 导入使用流式进度；检查 UID、顺序、重复项和中断后的状态 |

### 3.2 上下文、摘要与检索

| 功能 | 用户入口/前端 | API/后端业务 | 数据/测试 | 修改时的联动点 |
| --- | --- | --- | --- | --- |
| 章节摘要与区间摘要 | 写作页摘要面板；`writing/components/summary-panel*.tsx`、`hooks/use-summaries.ts`、`lib/summary-*.ts` | `api/routers/chapter_context.py` -> `memory/chapter/summary_service.py`、`memory/prompt_chain_runner.py` | `models/chapter_summary.py`；`tests/memory/test_chapter_summary_generator.py`、`test_summary_service_windows.py`、`tests/api/test_chapter_context.py` | 章节修改会使摘要陈旧；批量生成走后台任务和 Socket 进度 |
| 分层上下文构建 | 设置 > 上下文；`settings/components/context-settings.tsx`，Agent 使用时无独立页面 | `api/routers/chapter_context.py`；`agent_runtime/context/**` | `tests/agent_runtime/context/**`、`tests/memory/test_sequence.py` | latest/near/middle/far、token 预算、历史与规则/技能共同构成模型输入 |
| 上下文压缩/Compaction | Agent 对话中的压缩状态卡；`assistant/.../compaction-message.tsx` | `agent_runtime/context/compaction/**`、`POST /sessions/{id}/compaction` | 压缩持久化模型/Repo；`tests/agent_runtime/context/test_compaction*.py`、前端 `e2e/compaction.spec.ts` | 改压缩策略必须验证恢复会话、消息边界和 token 统计 |
| 语义索引 | 设置 > 索引；`settings/components/index-settings*.tsx`、`project-index-list.tsx`、`frontend/src/lib/index-status.ts` | `api/routers/retrieval_index.py` -> `retrieval/service.py`、`background/jobs/retrieval_chapter_index.py` | `models/retrieval_index.py`、`retrieval_chapter_index_state.py`；`tests/retrieval/**`、`tests/api/test_retrieval_index.py` | Embedding 模型、维度、分块参数变化通常要求重建索引；数据存于 LanceDB |
| Agent 检索章节 | 无独立页面，Agent 工具结果显示在对话 | `agent_runtime/tools/impls/chapter/search_chapters.py`、`retrieval/service.py` | `tests/agent_runtime/tools/test_search_chapters.py`、`tests/retrieval/test_service.py` | 检索结果还受工具权限、项目范围和索引就绪状态影响 |

### 3.3 AI 模型、提示词和 Agent 配置

| 功能 | 用户入口/前端 | API/后端业务 | 数据/测试 | 修改时的联动点 |
| --- | --- | --- | --- | --- |
| 模型提供商连接 | 设置 > 连接；`settings/components/connections-settings.tsx`、`connection-form-dialog.tsx`、`lib/model-api.ts` | `api/routers/model_providers.py` -> `models/services/model_provider_service.py` | `models/entities/model_provider.py`；`tests/api/test_model_providers.py`、`tests/models/test_model_provider_service.py` | API Key 加密、代理 URL、自定义 Header、连通性验证、远端模型列表均在此链路 |
| LLM/Embedding/Rerank 模型 | 设置 > 模型；`models-settings.tsx`、`model-form-dialog.tsx`、`model-selector-dialog.tsx` | `api/routers/models.py` -> `models/services/model_service.py` -> clients/strategies | `models/entities/model.py`；`tests/api/test_models.py`、`tests/models/test_model_registry.py`、`tests/providers/**` | 三类模型能力不同；删除/修改前检查默认 Agent、摘要、Embedding 索引与 Rerank 引用 |
| 模型适配器 | 无直接页面 | `backend/app/models/adapters/**`、`clients/model_factory.py`、`registry.py`、`builtin.py` | `tests/models/test_*adapter.py`、`test_builtin.py` | 新增兼容协议通常需要 adapter、注册、前端 provider 元数据和 catalog 图标 |
| 提示词链编辑与版本 | `/prompt-chains`；`features/prompt-chains/**` | `api/routers/prompt_chains.py` -> `storage/services/prompt_chain_service.py` -> `macro/compiler.py` | `models/prompt_chain_version.py`、`prompt_entry.py`；`tests/api/test_prompt_chains.py`、`tests/macro/**` | 支持搜索、保存新版本、历史、diff、reset、compile；不要直接覆盖已发布版本 |
| 宏语法 | 提示词编辑器内使用 | `backend/app/macro/lexer.py`、`parser.py`、`evaluator.py`、`compiler.py`、`registry.py` | `backend/tests/macro/**` | 新宏需要 lexer/parser/evaluator/registry 与错误提示共同更新 |
| Agent 定义 | 设置 > 智能体；`agent-definitions-settings.tsx`、`lib/agent-definitions-api.ts` | `api/routers/agent_definitions.py` -> `storage/services/agent_definition_service.py`；内置 YAML 在 `backend/app/prompts/builtin-agents/**` | `models/agent_definition.py`；`tests/api/test_agent_definitions.py`、`tests/agent_runtime/test_agent_definitions.py` | 定义包含品牌、模型、提示词、工具、技能和可委派性；运行中会话会锁定部分设置 |
| Agent 工具权限 | 设置 > Agent 工具；`agent-tools-settings.tsx` | `GET /tools`、`PUT /settings`；工具注册在 `agent_runtime/tools/registry.py` | 通用设置表；`tests/agent_runtime/tools/test_permission_metadata.py` | 新工具需注册元数据、权限默认值、审批预览和前端消息渲染 |
| Agent 规则 | 设置 > 规则；`rules-settings.tsx` | `api/routers/agent_rules.py` -> service/repo | `models/agent_rule.py`；`tests/api/test_agent_rules.py`、`tests/agent_runtime/context/parts/test_rules.py` | 规则有 scope 与顺序，进入系统上下文；改 scope 时同步 Schema 和前端选项 |
| Agent 记忆 | 当前有 API 客户端但无独立设置页面；`frontend/src/lib/agent-memory.types.ts`、`api-client.ts` | `api/routers/agent_memories.py` -> service/repo | `models/agent_memory.py`；相关 API/上下文测试 | 属于后端能力/预留 UI；增加页面前先确认记忆注入策略与隐私边界 |
| Skills 管理 | 设置 > Skills；`skills-settings.tsx`、`import-skill-dialog.tsx` | `api/routers/skills.py`、`skill_reference_docs.py` -> skill services；内置技能在 `backend/app/skills/*.yaml` | `models/skill.py`、`skill_reference_doc.py`；`tests/api/test_skills.py`、`test_skill_reference_docs.py`、`tests/agent_runtime/tools/test_skill_tools.py` | 支持启停、复制内置技能、导入、参考文档；改格式要同步 loader/import/API/UI |
| 联网搜索/网页抓取 | 设置 > 联网搜索；`web-search-settings.tsx`、`lib/web-search-api.ts`；对话工具卡片在 assistant 下 | `agent_runtime/tools/impls/web_search/**`、`web_fetch/**`、`api/routers/settings.py` | 通用设置表；`tests/agent_runtime/tools/test_web_search_tools.py`、`test_web_fetch_tools.py`、`tests/api/test_web_search_settings.py` | Provider 凭据、结果过滤、抓取安全、外链安全弹窗和工具权限都可能受影响 |

### 3.4 Agent 会话与协作写作

| 功能 | 用户入口/前端 | API/后端业务 | 数据/测试 | 修改时的联动点 |
| --- | --- | --- | --- | --- |
| Assistant 侧栏与会话状态 | 全局右侧栏；`assistant/components/assistant-sidebar.tsx`、`agent/agent-sidebar.tsx` | `api/routers/agent_runtime.py`、`agent_runtime/runner/session_runner.py` | `models/task.py`、`task_message.py`、运行时持久化；`tests/api/test_agent.py`、`tests/agent_runtime/test_session_runner.py` | 这是 Agent 前端总装配点；大文件修改前先定位对应 Hook/子组件，避免把逻辑继续堆进去 |
| 快捷新会话 | 空闲 Assistant 最近任务卡；`recent-tasks-card.tsx`、`assistant-sidebar.tsx` | 复用 `/settings` 与 `POST /agent/sessions`、`/message` | 通用设置表；`tests/api/test_settings.py`、`frontend/e2e/quick-start-session.spec.ts` | 全局仅一条预设，作为首条真实用户消息发送；不要并入规则或提示词链 |
| 会话消息导航 | Agent 消息区左侧导航轨；`assistant/components/message-navigator*.tsx`、`virtualized-agent-messages.tsx` | 无新增后端接口，复用已加载消息和虚拟列表定位 | 稳定消息 ID、虚拟列表测量状态 | 点击用户消息摘要跳到对应消息；修改消息过滤或虚拟化时同步检查导航索引与可见项 |
| 会话正文搜索 | Assistant“全部任务”搜索；`tasks/all-tasks-page.tsx` | `GET /projects/{id}/tasks?search=` -> `task_repo._matches_search`、`find_message_matches` | `AgentRunMessage`；`tests/api/test_tasks.py` | 同时匹配任务标题和用户/助手正文，返回命中消息 ID/摘要，打开任务后由虚拟列表跳到对应消息 |
| 发消息、流式响应、断线重连 | `assistant/hooks/use-agent-session*.ts`、`lib/agent-socket*.ts`、`streaming-*.ts` | `POST /sessions`、`/message`；`socket/handlers.py`；`runner/event_translator.py`、`streaming/replay_buffer.py` | task/message/checkpoint；`tests/socket/**`、`tests/agent_runtime/test_replay_buffer.py` | 同时验证首连、重连重放、重复事件去重、排队消息和取消竞态 |
| 消息渲染与工具卡片 | `assistant/components/agent/message-blocks/**`、`display/**` | 工具事件由 `event_translator.py` 翻译 | 消息 payload/metadata；工具相关测试 | 新消息类型要更新标准化、分块、显示注册表、实时合并和历史恢复映射 |
| Mention 与 Command | `agent-mention-suggestions.tsx`、`extensions/mention-*`、`command-*`、`lib/mention-text.ts` | `GET /projects/{id}/mentions`、`commands`；`agent_runtime/mentions.py` | 笔记/章节/角色/世界条目及命令服务；`tests/agent_runtime/test_mentions.py`、`tests/storage/test_command_service.py` | 新 mention 类型需同时更新搜索、编辑器节点、序列化和上下文解析 |
| 图片附件 | `assistant/lib/agent-image-attachments.ts`、`agent-input.tsx` | `POST /sessions/{id}/attachments`、静态附件目录 | 附件元数据；`tests/api/test_agent.py` | 检查文件类型、大小、清理、模型视觉能力和桌面代理路径 |
| 任务列表/重命名/收藏/删除 | `assistant/components/tasks/**`、`hooks/use-tasks.ts` | `api/routers/tasks.py` -> `storage/services/task_service.py` | `models/task.py`、`task_message.py`；`tests/api/test_tasks.py`、`storage/test_task_cleanup.py` | 运行中任务不可直接删除；删除需清理消息、审计、检查点、修订和附件 |
| 排队、取消、恢复 | `pending-message-card.tsx`、会话 Hook | `/pending-message/cancel`、`/cancel`、`/interrupt-resume` | revision/checkpoint/running state；前端 `e2e/queueing.spec.ts`、`cancel-flow.spec.ts`，后端 runtime 测试 | 高竞态区域；必须覆盖请求与取消同时发生、重启恢复和终态一致性 |
| 向用户提问 | `clarification-*.tsx`、`ask-user-tool-message.tsx` | `/question-answer`、工具 `interaction/ask_user.py` | checkpoint interrupt；前端 `e2e/question-panel-collapse.spec.ts`、后端 `test_ask_user.py` | 回答会恢复被中断图；前端折叠不能丢失待回答状态 |
| 工具审批 | `tool-approval-special-panel.tsx` | `/tool-approval`、工具基类/权限元数据 | checkpoint interrupt；`frontend/e2e/approval-resume.spec.ts`、`tests/agent_runtime/tools/test_context_tool_approval_previews.py` | 修改危险操作或权限级别时同步审批预览、恢复和拒绝路径 |
| 子 Agent 编排 | `active-subagent-list.tsx`、`message-blocks/tools/orchestration/**`、`hooks/use-subagent-session.ts` | `agent_runtime/graph/orchestrator/**`、`runner/subagent_runner.py`、`tools/impls/orchestration/**` | child runs/checkpoints/revisions；`tests/agent_runtime/test_orchestrator_graph.py`、`runner/test_subagent_runner.py`、工具编排测试 | 涉及父子会话、并发槽、通知、回收、取消和独立事件房间 |
| Agent 写章/笔记/角色/世界书 | 对应工具消息卡片及预览 | `agent_runtime/tools/impls/chapter/**`、`note/**`、`context/character.py`、`context/world_entry.py` | 实体模型 + revision snapshots；`tests/agent_runtime/tools/test_*_tools.py` 和 refresh hook 测试 | 工具写操作必须进入版本修订，刷新前端实体，并遵守锁定/权限/项目范围 |
| 变更预览 | `assistant/components/agent/agent-changes.tsx` | `GET /sessions/{id}/changes`、`agent_runtime/session_changes.py` | revision 及各类 snapshot | 新增可修改实体时要补 snapshot、变更投影、前端 diff 展示和回滚 |
| 回滚与分叉 | 消息操作按钮；`use-agent-session.ts`、`agent-messages.tsx` | `/rollback`、`/fork`；`agent_runtime/revisions.py`、`fork.py`、`runner/checkpointer.py` | revisions、snapshot、checkpoint；`tests/agent_runtime/test_agent_revision_rollback.py`、`test_agent_fork.py`、`test_checkpointer.py` | 数据库快照与 LangGraph checkpoint 必须一起回到一致状态 |
| 用量与审计 | 对话任务统计、仪表盘；`dashboard/**` | `api/routers/audit.py`、`dashboard.py`；`audit/**` | `llm_audit_log.py`、task token/cost；`tests/audit/**`、`tests/api/test_audit_router.py` | 价格、缓存 token、上下文 token 和隐私化 prompt 详情是不同字段 |

### 3.5 仪表盘、设置与桌面端

| 功能 | 用户入口/前端 | API/后端业务 | 数据/测试 | 修改时的联动点 |
| --- | --- | --- | --- | --- |
| 写作仪表盘 | `/dashboard` 写作标签；`dashboard/components/writing-dashboard-tab.tsx` | `GET /dashboard/writing` -> `storage/services/dashboard_service.py` | `writing_activity_event.py`；`tests/api/test_dashboard_writing.py` | 统计依赖章节保存产生的增量事件，不等同于当前总字数 |
| LLM 仪表盘与调用记录 | `/dashboard` LLM/记录标签；`llm-dashboard-tab.tsx`、`dashboard-records-tab.tsx` | `/dashboard/llm-api/*`、`api/routers/audit.py` | 审计日志；`test_dashboard_llm.py`、`test_audit_router.py` | 筛选维度、时区、价格和 prompt 详情清理需保持一致 |
| 通用/编辑器设置 | 设置 > 通用、编辑器；`general-settings.tsx`、`editor-settings.tsx` | `api/routers/settings.py` | `models/setting.py`；`tests/api/test_settings.py` | 语言、主题、字体在启动前也由 `/auth/preferences` 提供；编辑器行为部分存浏览器本地状态 |
| 高级设置 | 设置 > 高级；`advanced-settings.tsx` | `settings.py` 的审计详情存储/清理等接口 | 设置、审计日志；`test_settings.py` | 清理操作不可逆，新增时需确认对运行中任务的影响 |
| 后台任务 | 多处进度面板；`frontend/src/lib/background-socket.ts`、`background-snapshot-refresh.ts` | `api/routers/background.py`、`background/runtime/**`、`background/jobs/**` | 后台任务模型/Repo；`tests/background/**` | 摘要、索引、导出等共用运行时；新增任务要实现状态、事件、取消与恢复策略 |
| 桌面首次安装/本地后端 | 桌面 setup/boot 页；`desktop/src/ui/pages/setup/**`、`boot/**` | `desktop/src/main/runtime/**`、`local-instance.ts`、`process.ts` | 桌面配置文件；`desktop/tests/main/runtime-smoke.mjs` | 管理嵌入式 Python、uv、OpenFic 安装升级和后端进程 |
| 本地/远程实例 | 桌面 Header 与前端页；`desktop/src/shared/config.ts`、`main/local-instance.ts`、`main/proxy.ts` | Electron IPC，远端通过代理/分区会话连接 | DesktopConfig | 修改实例字段时同步 shared 类型、配置迁移、UI、IPC 和持久化 |
| 桌面数据迁移/备份/恢复 | `desktop/src/ui/pages/data-management/**` | `desktop/src/main/data-manager.ts`、`data-location.ts`、`backup-manifest.ts`、`runtime/archive.ts` | 文件系统数据目录；`desktop/tests/main/data-manager.test.mjs`、`archive.test.mjs` | 高风险操作；保持路径重叠检查、校验、回滚、进度与旧目录删除语义 |
| 桌面自动更新 | 桌面通知；`desktop/src/main/updater.ts`、`update-support.ts` | electron-updater/GitHub Releases | `electron-builder.yml`、`resources/app-update.yml` | 平台/架构包名必须与发布配置一致 |
| 窗口、缩放、主题联动 | `desktop/src/main/windows.ts`、`window-state.ts`、`preload/**`；Web `desktop-appearance-bridge.ts` | Electron IPC | 桌面配置 | Web 与桌面壳分别渲染，主题/语言/缩放需双向同步 |

## 4. 后端目录职责

| 目录 | 职责 |
| --- | --- |
| `backend/app/api/routers` | HTTP 路径、请求参数、响应模型、鉴权/状态码 |
| `backend/app/api/schemas` | Pydantic 请求与响应结构 |
| `backend/app/storage/services` | 项目、卷章、笔记、角色、世界书等业务规则 |
| `backend/app/storage/repos` | SQL 查询与持久化操作 |
| `backend/app/storage/models` | 核心 SQLModel 表 |
| `backend/app/models` | AI 模型/提供商实体、适配器、客户端与 catalog |
| `backend/app/agent_runtime` | LangGraph Agent、上下文、工具、会话、编排、持久化、回滚 |
| `backend/app/background` | 长任务监督、进度事件、取消和具体 Job |
| `backend/app/retrieval` | 分块、Embedding、LanceDB 索引与检索 |
| `backend/app/memory` | 章节摘要、区间摘要和提示词链运行 |
| `backend/app/macro` | 提示词宏词法、语法、求值与编译 |
| `backend/app/socket` | Socket.IO 连接、房间加入、事件发射与重放 |
| `backend/app/storage/migrations` | Alembic 数据库迁移 |

## 5. 新功能落点决策

### 5.1 新增普通 CRUD 功能

- [ ] `storage/models/<entity>.py`：持久化实体。
- [ ] `storage/migrations/versions/<revision>.py`：数据库升级/降级。
- [ ] `storage/repos/<entity>_repo.py`：查询。
- [ ] `storage/services/<entity>_service.py`：业务规则。
- [ ] `api/schemas/<entity>.py`：请求/响应。
- [ ] `api/routers/<entity>.py`：接口，并在 `backend/app/main.py` 注册。
- [ ] `frontend/src/lib/<entity>.types.ts` 或功能目录类型。
- [ ] 前端 API 函数、React Query Hook、页面/组件。
- [ ] 后端 service/API 测试，必要时前端 E2E。

### 5.2 新增 Agent 可写实体

除普通 CRUD 外，还要检查：

- [ ] `agent_runtime/tools/impls/**` 的读取、写入、预览、权限和锁。
- [ ] `agent_runtime/tools/registry.py` 的注册与工具元数据。
- [ ] `revision_*_snapshot.py`、revision repo/service 的快照。
- [ ] `agent_runtime/session_changes.py` 的变更投影。
- [ ] 回滚、分叉、子 Agent 边界和孤儿数据清理。
- [ ] 前端工具消息卡片、变更 diff、实体刷新 Hook。
- [ ] 工具测试、refresh hook 测试、revision rollback 测试。

### 5.3 新增设置项

- [ ] 判断设置属于服务端通用 `settings`、模型实体、桌面配置还是浏览器本地状态。
- [ ] 修改后端 settings schema/router/defaults 与前端 `settings.types.ts`、`settings-api.ts`。
- [ ] 在对应设置分类组件中增加 UI；新分类还需改 `settings-categories.tsx` 和 `settings-content.tsx`。
- [ ] 若启动前就要生效，同步 `/auth/preferences` 与 `frontend/src/main.tsx` 初始化。
- [ ] 若影响 Agent，检查会话设置锁和新会话快照语义。

### 5.4 新增模型提供商或协议

- [ ] Provider catalog/图标/前端展示元数据。
- [ ] Adapter、client factory、registry 和参数转换。
- [ ] 连接验证与模型列表获取。
- [ ] LLM/Embedding/Rerank 支持范围。
- [ ] API Key 加密与日志脱敏。
- [ ] Adapter、Provider Service 和 API 测试。

### 5.5 新增后台任务

- [ ] Job 定义、注册、状态项和 supervisor 执行入口。
- [ ] 可取消点、失败终态、重启后的处理策略。
- [ ] HTTP 快照接口与 Socket 事件。
- [ ] 前端初始快照、实时进度、断线刷新和清理。
- [ ] Job、supervisor、Socket bridge 测试。

## 6. 验证命令

按改动范围选择最小充分集合；不要用“构建通过”代替业务测试。

```powershell
# 后端：单功能测试示例
Set-Location backend
uv run pytest tests/api/test_chapters.py -q

# 后端：完整检查
just check

# Web 前端
Set-Location frontend
pnpm type-check
pnpm lint
pnpm build

# Web E2E（需要可用的测试环境）
pnpm test:e2e -- approval-resume.spec.ts

# 桌面端
Set-Location desktop
pnpm type-check
pnpm lint
pnpm build
node --test tests/main/*.test.mjs
node tests/main/runtime-smoke.mjs
```

推荐的跨层回归组合：

| 改动类型 | 最少回归 |
| --- | --- |
| 普通 API/字段 | 对应 `backend/tests/api/test_*.py` + 前端 type-check |
| 数据库字段/级联 | migration + service/repo/API 测试 + 数据清理测试 |
| 编辑器/卷章 | chapters/volumes API 测试 + 前端 type-check/build |
| Agent 工具 | 工具单测 + session runner + revision rollback + 前端 type-check |
| Agent 事件/恢复 | socket + replay buffer + 对应 Playwright E2E |
| 模型协议 | adapter/client/provider service/API 测试 |
| 桌面数据操作 | desktop data-manager/archive 测试 + type-check/build |

## 7. 已识别的定位注意事项

- `frontend/src/routes/index.ts` 的注释容易误导：当前真实路由在 `frontend/src/main.tsx`。
- `frontend/src/lib/api-client.ts` 很大，包含大量跨功能 API 与转换函数；查功能时应先搜 endpoint，再跳到对应函数。
- `assistant-sidebar.tsx` 与 `use-agent-session.ts` 是高复杂度总装配文件；能在已有子组件/状态模块中完成的修改，不要继续向总装配文件堆逻辑。
- AgentMemory 已有前后端 API 类型和 CRUD，但当前设置分类没有对应 UI；需求若提到“记忆管理”，先确认是补 UI 还是改变上下文注入。
- Web 设置、浏览器本地状态、桌面实例配置是三套不同持久化来源；修改设置前先确认归属。
- Agent 对章节、笔记、角色、世界书的写操作带版本快照；绕过 Agent 工具或 Service 直接写库会破坏 diff/rollback。
- 摘要、索引、导出共用后台任务基础设施；进度 UI 的问题不一定在具体业务 Job。
- 角色图片、项目封面、Agent 附件和导出文件是数据库之外的文件资产，删除/迁移/备份功能必须一起考虑。

## 8. 文档维护规则

- 新增一级页面、设置分类、核心实体、Agent 工具、后台 Job 或桌面 IPC 时更新本文。
- 删除功能时删掉对应行，不保留“历史功能”造成误导；历史交给 Git。
- 路径发生移动时优先更新矩阵，保证任何功能都能在两次跳转内到达主要实现。
- 每次大版本发布后更新顶部基线 commit，并抽查本文所有反引号路径仍存在。
