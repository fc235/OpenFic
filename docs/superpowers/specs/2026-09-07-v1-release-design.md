# OpenFic v1.0.0 发布设计

## 目标

将当前 `main` 发布为 `v1.0.0`，使 GitHub Release 中的桌面安装包携带与应用版本完全一致的 OpenFic 后端 wheel，避免安装时因 PyPI 缺少对应版本或取得旧包而启动失败。同时以最小改动更新 README 和发布信息。

## 范围

本次发布包含：

- 将后端、前端、桌面端、发布清单及相关锁文件中的项目版本统一为 `1.0.0`。
- 在 `CHANGELOG.md` 中增加 `1.0.0` 条目，概括已经合入 `main` 的新增功能和重要修复。
- 让桌面安装包包含构建出的 `openfic-1.0.0-*.whl`。
- 调整桌面运行时，使其优先从安装包资源目录安装该 wheel。
- 调整 GitHub Actions，使后端 wheel 成为桌面打包任务的输入，不再以发布到 PyPI 作为桌面打包前置条件。
- 推送 `main`、创建 `v1.0.0` 标签和 GitHub Release，并确认自动构建结果。

明确不包含：将全部 Python 依赖或便携式 Python 嵌入安装包、实现完全离线安装、发布 DOCX/PDF 导入、增加新的应用功能或开展无关重构。

## 版本和文档

版本号统一更新到以下现有版本来源：

- `.release-please-manifest.json`
- `backend/pyproject.toml` 与 `backend/uv.lock`
- `frontend/package.json` 及其锁文件
- `desktop/package.json` 及其锁文件

README 保持现有结构和篇幅，不增加大段说明。只在原有功能列表中简洁补充此次已经实现的功能：

- 共用隐藏指令与可选的新会话快捷入口。
- Agent 历史消息定位导航。
- 跨项目笔记导入与分类内拖动排序。
- 新建项目和现有项目的多文档导入，支持 TXT、Markdown、ZIP、EPUB，并支持合卷或分卷及排序。

仅同步确有必要的仓库、徽章、下载和容器镜像链接到 `fc235/OpenFic`。中英文 README 采用相同的精简更新原则。

## 桌面端后端安装

Electron 安装包通过 `extraResources` 将 CI 生成的 wheel 放入只读资源目录 `backend-dist`。运行时新增一个边界清晰的 wheel 定位逻辑：只接受文件名版本与 `app.getVersion()` 一致且唯一的 OpenFic wheel；缺失、重复或版本不符时记录明确日志。

安装本地运行环境时：

1. 保留现有便携式 Python、虚拟环境和 `uv` 安装流程。
2. 若发现匹配的内置 wheel，使用 `uv pip install --python <venv> <wheel-path>` 安装；若已安装版本相同但 CLI 损坏，则沿用强制重装语义。
3. 内置 wheel 安装失败时直接报告本地包安装错误，不悄悄改装其他版本。
4. 仅在开发环境或未携带 wheel 的源码构建中保留现有 `openfic==<version>` 的 PyPI 安装回退，维持开发流程兼容性。
5. 安装后继续使用现有元数据版本和 CLI 可用性检查。

该方案保证 OpenFic 自身代码与桌面版本一致，但依赖包和 `uv` 仍可能需要联网下载，因此不宣称为完全离线安装。

## 构建与发布流水线

标签触发的 `package.yml` 将原来的 PyPI 发布任务改为后端构建任务。该任务生成 wheel 并上传 `backend-dist` artifact；所有桌面平台任务下载同一 artifact，Electron Builder 再把它写入各平台安装包。桌面任务不再等待或要求 PyPI environment、trusted publishing 或 PyPI 密钥。

现有 Docker 多架构构建继续保留。桌面安装包完整性检查继续保留，并增加对打包资源中后端 wheel 的轻量验证；已有运行时 smoke test 调整为验证内置 wheel 路径和精确版本安装逻辑，而不是扩大测试矩阵。

`release.yml` 使用仓库可用的 GitHub token：配置了 `RELEASE_PLEASE_TOKEN` 时优先使用，否则使用 `github.token`，避免当前仓库因缺少自定义 secret 立即失败。实际 `v1.0.0` 发布由已认证的维护者流程创建标签和 Release，标签随后触发 `package.yml`，构建产物上传到同一 Release。

Electron Builder 中的 GitHub 发布目标同步为 `fc235/OpenFic`，以保证自动更新元数据和发布位置一致。

## 错误处理

- 构建时找不到后端 wheel，桌面打包必须失败，不能生成缺少后端的正式安装包。
- wheel 数量不唯一或版本与桌面端不一致，运行时给出可定位的错误和日志路径。
- 某个平台构建失败时，不把该平台标记为成功；保留已成功产物并在交付说明中明确失败项。
- 推送、标签或 Release 创建出现冲突时，先读取远端现状再处理，不覆盖已有标签或 Release。

## 验证标准

为控制测试量，只执行与发布风险直接相关的检查：

- 后端版本/打包检查及现有重点测试集。
- 前端类型检查和生产构建。
- 桌面端类型检查、运行时相关测试和打包配置检查。
- 本地构建 `openfic-1.0.0` wheel，并确认其元数据版本正确。
- 至少构建并检查当前 Windows x64 安装包，确认其中包含匹配 wheel；不在本地重复模拟全部 CI 平台。
- 推送后查看 GitHub Actions，确认 Release 产物或如实报告尚未完成/失败的任务。

## 完成条件

- 本地和远端 `main` 包含经验证的版本、README、CHANGELOG、运行时及工作流改动。
- Git 标签 `v1.0.0` 和对应 GitHub Release 存在。
- Release 至少具有说明，并由标签工作流追加成功构建的平台安装包。
- 不依赖将 `openfic==1.0.0` 预先发布到 PyPI，桌面端也不会安装成其他版本的 OpenFic 后端。
