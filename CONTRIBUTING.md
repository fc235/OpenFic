# OpenFic 开发说明

## 环境

- Python 3.12+
- Node.js 与 pnpm
- Windows 后端启动请使用应用 CLI；它会选择与 ZMQ 兼容的事件循环。

## 本地启动

```powershell
Set-Location backend
python -m app.cli serve
```

```powershell
Set-Location frontend
pnpm install
pnpm dev
```

如需隔离开发数据，启动后端前设置专用目录：

```powershell
$env:OPENFIC_DATA_DIR = "G:\path\to\openfic-dev-data"
python -m app.cli serve
```

不要在 Windows 上直接用 `python -m uvicorn app.main:app` 代替上述命令；该方式会绕过项目已有的事件循环兼容设置。

## 验证

优先运行受影响功能的定向测试，再执行所属子项目的静态检查：

```powershell
Set-Location backend
python -m pytest tests/api/test_notes.py -q
python -m ruff check app tests/api/test_notes.py
```

```powershell
Set-Location frontend
pnpm type-check
pnpm lint
pnpm build
```

功能与代码入口见 `docs/develop/feature-map.md`。数据库结构变化必须新增 Alembic migration；不要修改已经发布的迁移文件。
