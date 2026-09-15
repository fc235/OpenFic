# OpenFic 分支说明

这是 [syrizelink/OpenFic](https://github.com/syrizelink/OpenFic) 的个人维护分支。

OpenFic 的基础功能、部署方式和使用说明请直接查看[上游 README](https://github.com/syrizelink/OpenFic#readme)。这里仅记录本分支与上游的不同之处。

[下载本分支版本](https://github.com/fc235/OpenFic/releases) · [查看上游版本](https://github.com/syrizelink/OpenFic/releases) · [English](./README_EN.md)

## 主要改动

### 桌面版

- Windows 安装包自带同版本后端，启动时会检查桌面端和后端版本是否一致。
- 关闭窗口时可以选择只关前端，或者连同本地后端一起退出。这个选择可以记住。
- 只关前端时，后台任务和局域网访问不会停止。再次打开软件会接回原来的后端。
- 设置中可以开启局域网访问，并查看、复制访问地址或使用二维码在手机上打开。
- 切换局域网访问状态时，会等正在运行的 Agent 任务结束后再重启后端。
- 发布文件、自动更新、问题反馈和 Docker 镜像均使用 `fc235/OpenFic`。

### 编辑器和操作

- 笔记和章节共用一套编辑器界面。笔记支持查找、替换和快捷键，并继续使用 Markdown 保存。
- 修复项目卡片偶尔点不开的问题，同时支持使用键盘打开项目。
- 在对话框的模型菜单中，单击切换当前模型，双击设为默认模型。
- 使用 DeepSeek 官方接口时，余额提示会根据北京时间显示峰时或谷时，并随机显示一条对应文案。

## 其他

许可证仍为 [Apache License 2.0](./LICENSE)。本分支的问题请提交到 [fc235/OpenFic Issues](https://github.com/fc235/OpenFic/issues)；上游项目的问题请在上游仓库反馈。
