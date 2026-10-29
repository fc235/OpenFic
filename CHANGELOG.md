# Changelog

## [1.5.0](https://github.com/fc235/OpenFic/compare/v1.4.2...v1.5.0) (2026-10-29)


### ✨ 新功能

* add live manuscript references and Windows x64 packaging ([3c9e28a](https://github.com/fc235/OpenFic/commit/3c9e28a7809851fd44030598b4ba01248ea63078))
* add reusable agent skills and shared project references ([8586360](https://github.com/fc235/OpenFic/commit/8586360c664019162cf6660ff7ae95890de46f65))
* **agent:** 增加 Agent 附件处理与文件读取工具 ([#406](https://github.com/fc235/OpenFic/issues/406)) ([cc0d0ab](https://github.com/fc235/OpenFic/commit/cc0d0ab01abe8fe24c1799641035ffa453fa3294))
* **agent:** 支持世界书条目与回滚 ([#59](https://github.com/fc235/OpenFic/issues/59)) ([b02549d](https://github.com/fc235/OpenFic/commit/b02549d8ab8dc050478f98d8e95601c95ade3295))
* **agent:** 支持主 Agent 自定义标识（颜色与图标） ([#282](https://github.com/fc235/OpenFic/issues/282)) ([b802c4d](https://github.com/fc235/OpenFic/commit/b802c4d2543938a6fc61fc92c03754d3e9f8ae55))
* **agent:** 支持用户消息图片附件输入 ([#229](https://github.com/fc235/OpenFic/issues/229)) ([2c12697](https://github.com/fc235/OpenFic/commit/2c126978b101dc3c76b43556e7017084f27f97f2))
* **agent:** 支持规则全局与项目作用域 ([#269](https://github.com/fc235/OpenFic/issues/269)) ([0fb578a](https://github.com/fc235/OpenFic/commit/0fb578aa9c7ace66436f71331029dc82a76b316f))
* **agent:** 支持运行时裁剪旧工具输出 ([#414](https://github.com/fc235/OpenFic/issues/414)) ([3a5c97a](https://github.com/fc235/OpenFic/commit/3a5c97ad3ab80c65c3a2a0570e6809c68c70ce1c))
* **agent:** 新增 Agent 会话事件的系统通知功能 ([#417](https://github.com/fc235/OpenFic/issues/417)) ([d0e344b](https://github.com/fc235/OpenFic/commit/d0e344bff90d2af02ae3229dcc0bc03df4e4a5d5))
* **agent:** 新增会话/轮次级别的变更汇总面板 ([#366](https://github.com/fc235/OpenFic/issues/366)) ([e4344c3](https://github.com/fc235/OpenFic/commit/e4344c39fff0f4b51a727f29435cf5c3eb17e751))
* **agent:** 新增联网搜索和网页读取能力 ([#354](https://github.com/fc235/OpenFic/issues/354)) ([d6bbca7](https://github.com/fc235/OpenFic/commit/d6bbca7eb848ff2a7632602550488138a26776c5))
* **agent:** 添加角色工具与回滚支持 ([#70](https://github.com/fc235/OpenFic/issues/70)) ([4d2bbf0](https://github.com/fc235/OpenFic/commit/4d2bbf06bef79b9fd97f2be414c6a5b779c5c865))
* **android:** turn reading pages with volume keys ([224e848](https://github.com/fc235/OpenFic/commit/224e8487540b227d7b59c233e8308fcfa41030d0))
* **asr:** 支持基于本地模型与云服务商的语音转写 ([#455](https://github.com/fc235/OpenFic/issues/455)) ([7a14cca](https://github.com/fc235/OpenFic/commit/7a14ccaee7c7d002259d8e8f0c30ff6cfe80b8e6))
* **assistant:** add quick-start session action ([5d21c6e](https://github.com/fc235/OpenFic/commit/5d21c6e4d99c2b7759b8d5e944356f73231ff8ae))
* **assistant:** add user message navigator rail ([9b853c3](https://github.com/fc235/OpenFic/commit/9b853c3501d1d62197acd03aab6a96df63b96fb7))
* **assistant:** navigate virtualized user messages ([e690d95](https://github.com/fc235/OpenFic/commit/e690d958285dcdf2512179edd48f5546203eec06))
* **backend:** 为编辑工具引入模糊匹配与归一化机制 ([#165](https://github.com/fc235/OpenFic/issues/165)) ([5805078](https://github.com/fc235/OpenFic/commit/580507862debbe66d7ea221fc6deb339da71c211))
* **backend:** 支持 PostgreSQL 数据库后端 ([#452](https://github.com/fc235/OpenFic/issues/452)) ([8ce5cb8](https://github.com/fc235/OpenFic/commit/8ce5cb8c1dbbd8947c314460f795dfcd629bf9eb))
* **characters:** 添加角色管理功能 ([#64](https://github.com/fc235/OpenFic/issues/64)) ([1d1626a](https://github.com/fc235/OpenFic/commit/1d1626a316c5bcd0471f54807ae29a1ee81df918))
* **character:** 添加角色关系图谱 ([#413](https://github.com/fc235/OpenFic/issues/413)) ([88feeb3](https://github.com/fc235/OpenFic/commit/88feeb30c28b132a216a8825b336889e7152992d))
* **desktop:** notify when an agent session completes ([9c28b50](https://github.com/fc235/OpenFic/commit/9c28b5001ba25960929203172d31553ff07fcc0c))
* **desktop:** 支持应用内自动更新 ([#99](https://github.com/fc235/OpenFic/issues/99)) ([bcd6eb9](https://github.com/fc235/OpenFic/commit/bcd6eb94fe846c4237b89ffdad87d620ec7706b0))
* **desktop:** 支持数据备份、迁移、还原与自定义数据目录 ([#275](https://github.com/fc235/OpenFic/issues/275)) ([23a1fac](https://github.com/fc235/OpenFic/commit/23a1fac7e14d9184ebf2e583a8d451ef068cb80a))
* **desktop:** 添加壳层国际化支持 ([#223](https://github.com/fc235/OpenFic/issues/223)) ([90f26c1](https://github.com/fc235/OpenFic/commit/90f26c16a764c941124a3e70c8b2693b32a5f1d9))
* **desktop:** 添加桌面端应用 ([#29](https://github.com/fc235/OpenFic/issues/29)) ([77c7789](https://github.com/fc235/OpenFic/commit/77c7789e322b3a7ee029c4837272bf8a7c10df28))
* **fonts:** 引入 fontsource 字体支持 ([#294](https://github.com/fc235/OpenFic/issues/294)) ([c135ee3](https://github.com/fc235/OpenFic/commit/c135ee338975bf3330f179e3eba360ad12727a22))
* **frontend:** 增加自定义主题设置 ([#398](https://github.com/fc235/OpenFic/issues/398)) ([5cd2241](https://github.com/fc235/OpenFic/commit/5cd2241a14d4df586af5eea754a83b6de17baa12))
* **frontend:** 添加 PWA 支持实现可安装应用 ([#56](https://github.com/fc235/OpenFic/issues/56)) ([bd623fb](https://github.com/fc235/OpenFic/commit/bd623fb73c87733a58e3d521cf9f066bcc0ccde7))
* **frontend:** 添加全局状态栏 ([#71](https://github.com/fc235/OpenFic/issues/71)) ([d584d56](https://github.com/fc235/OpenFic/commit/d584d560a6e05747655a4538593da48eaee87fbe))
* **frontend:** 补齐前端国际化文案并对齐英文翻译 ([#21](https://github.com/fc235/OpenFic/issues/21)) ([59d4249](https://github.com/fc235/OpenFic/commit/59d4249bfdfdb2b5867a789a7951e5812de8a011))
* **import:** add atomic multi-document endpoints ([762733c](https://github.com/fc235/OpenFic/commit/762733cf9272281b5086ab12e797ce3368354c9d))
* **import:** add ordered document controls ([7daa90b](https://github.com/fc235/OpenFic/commit/7daa90b976c1a12635efe8287b6615bc1e81b6a6))
* **import:** parse ordered documents and epub ([948d2e5](https://github.com/fc235/OpenFic/commit/948d2e5f451d26ebdde754f259c5d861a9c94c72))
* **import:** support ordered project documents ([b772de2](https://github.com/fc235/OpenFic/commit/b772de2d017f465dff10090949cde4cfbc1b0e8e))
* **import:** 支持 TXT 分卷导入 ([#197](https://github.com/fc235/OpenFic/issues/197)) ([4c781ce](https://github.com/fc235/OpenFic/commit/4c781ce36a2baa4b5b1f8d2e82e51b72b659f28f))
* **installer:** make desktop shortcut creation opt-in ([715c1fd](https://github.com/fc235/OpenFic/commit/715c1fdb0a3a07cc2ae1346ffeb802f5f0e6e0f4))
* integrate upstream attachments, character graphs and model features ([81c3933](https://github.com/fc235/OpenFic/commit/81c39335f41d38a11b30472ff3c8b5ae8231c939))
* **mobile:** 新增 Android 远程连接客户端 ([#460](https://github.com/fc235/OpenFic/issues/460)) ([37e95a9](https://github.com/fc235/OpenFic/commit/37e95a93ed0800eeccad0561e2906d8f16ba5527))
* **notes:** import and reorder project notes ([fe4fcc8](https://github.com/fc235/OpenFic/commit/fe4fcc88878f6e84a3286afd36b10cc2ba1b754e))
* **settings:** add quick-start session preset ([47a21ef](https://github.com/fc235/OpenFic/commit/47a21ef0274a53a311764ad40a6a8b1866f32332))
* **settings:** 支持自定义基础字号与编辑器字号 ([#300](https://github.com/fc235/OpenFic/issues/300)) ([ac6da38](https://github.com/fc235/OpenFic/commit/ac6da382907886940fb17121d4a2b5bf6742cbcc))
* **telemetry:** 接入 PostHog 远程错误遥测 ([#305](https://github.com/fc235/OpenFic/issues/305)) ([08d47ae](https://github.com/fc235/OpenFic/commit/08d47aef1bd421993c3b2a952b69a2b468cbd8eb))
* **tunnels:** 支持设置基于提供商的隧道以启用远程连接 ([#453](https://github.com/fc235/OpenFic/issues/453)) ([1035d1e](https://github.com/fc235/OpenFic/commit/1035d1e4a5b9a152350f71e6fcebe6e4d107b2ff))
* **writing:** add reading mode with keyboard and automatic paging ([fea4485](https://github.com/fc235/OpenFic/commit/fea4485f4f2821131a80d206820fef8b72cbcdf4))
* **writing:** import documents into new volumes ([20bd4e7](https://github.com/fc235/OpenFic/commit/20bd4e7033aea205b5cd6fa4afbab56561378421))
* **writing:** 支持章节导出 ([#195](https://github.com/fc235/OpenFic/issues/195)) ([44171e8](https://github.com/fc235/OpenFic/commit/44171e86010c858540b2a23e78e11d01e1ef5532))
* 完善项目 README 文档 ([ca919a2](https://github.com/fc235/OpenFic/commit/ca919a2f376937da1cd7aa8179a735bf45c8896c))


### 🐛 问题修复

* **agent_runtime:** 修复 LLM 调用无超时保护且盲目重试导致会话卡死的问题 ([#261](https://github.com/fc235/OpenFic/issues/261)) ([46535a0](https://github.com/fc235/OpenFic/commit/46535a0dbd652aad50369657d8e297aad3f4b48f))
* **agent:** 优化会话运行状态提示 ([#122](https://github.com/fc235/OpenFic/issues/122)) ([04c6e2e](https://github.com/fc235/OpenFic/commit/04c6e2e6639c21594a90c9d5d9a5fe607c7a9dcc))
* **agent:** 优化用户消息展开动画 ([#120](https://github.com/fc235/OpenFic/issues/120)) ([00d9cc8](https://github.com/fc235/OpenFic/commit/00d9cc89a12984462f5a8eb80d0b3d372aa22446))
* **agent:** 修复 Agent 会话消息区域的布局问题 ([#444](https://github.com/fc235/OpenFic/issues/444)) ([937d5d6](https://github.com/fc235/OpenFic/commit/937d5d6ccfda17b2873c4c40ff035cb9154d0fb1))
* **agent:** 修复 ask_user 问题面板内容无法滚动的问题 ([#249](https://github.com/fc235/OpenFic/issues/249)) ([2921d0a](https://github.com/fc235/OpenFic/commit/2921d0aa743aaf418d07277bed9f59af67508f57))
* **agent:** 修复 subagent 会话无法触发自动压缩的问题 ([#436](https://github.com/fc235/OpenFic/issues/436)) ([fc657ca](https://github.com/fc235/OpenFic/commit/fc657cad9f42711f146f1f14dda3e2228bdd224d))
* **agent:** 修复 subagent 回滚状态恢复 ([#60](https://github.com/fc235/OpenFic/issues/60)) ([b5fa608](https://github.com/fc235/OpenFic/commit/b5fa60852a1031f9626e0fff201b719da77cb4c0))
* **agent:** 修复中文输入法组合态 Enter 键误识别为发送的问题 ([#423](https://github.com/fc235/OpenFic/issues/423)) ([07122df](https://github.com/fc235/OpenFic/commit/07122df44d27a0cc34075753dcf9b59e6d2b6cf6))
* **agent:** 修复中断暂停状态的会话无法恢复的问题 ([#267](https://github.com/fc235/OpenFic/issues/267)) ([6029bc3](https://github.com/fc235/OpenFic/commit/6029bc37a53cff4054ed08f7dcca626b29398453))
* **agent:** 修复会话切换模型不生效 ([#91](https://github.com/fc235/OpenFic/issues/91)) ([26ef7f3](https://github.com/fc235/OpenFic/commit/26ef7f3beb202eb182b56ed483c144852be6d9c6))
* **agent:** 修复会话生命周期竞态导致取消和恢复异常的问题 ([#307](https://github.com/fc235/OpenFic/issues/307)) ([c1430df](https://github.com/fc235/OpenFic/commit/c1430df5a6a6181942f7327206bf51e3c5ba5bc2))
* **agent:** 修复会话结束后设置仍锁定的问题 ([#137](https://github.com/fc235/OpenFic/issues/137)) ([103c392](https://github.com/fc235/OpenFic/commit/103c392043f2eb246a974e431e40d0e15058a391))
* **agent:** 修复会话重连后流式事件丢失 ([#94](https://github.com/fc235/OpenFic/issues/94)) ([018749c](https://github.com/fc235/OpenFic/commit/018749caeea11f98d5f8405f17f7868949b3dbba))
* **agent:** 修复写入工具并发覆盖问题 ([#401](https://github.com/fc235/OpenFic/issues/401)) ([a979652](https://github.com/fc235/OpenFic/commit/a979652595b6c2f3740b4222be31b4fc82030094))
* **agent:** 修复回滚时卷章节数不同步的问题 ([#117](https://github.com/fc235/OpenFic/issues/117)) ([0e9bf90](https://github.com/fc235/OpenFic/commit/0e9bf908fb4f323f8737bcd7866ac54c4130e669))
* **agent:** 修复子智能体派发配置 ([#111](https://github.com/fc235/OpenFic/issues/111)) ([8906741](https://github.com/fc235/OpenFic/commit/89067410aee4246a7a912e61bfba46f50aeef946))
* **agent:** 修复工具刷新失效问题 ([#185](https://github.com/fc235/OpenFic/issues/185)) ([905aae2](https://github.com/fc235/OpenFic/commit/905aae2574d2dd2dc15ffd771d0aa00f0cdc0c3e))
* **agent:** 修复工具调用未并行执行的问题 ([#266](https://github.com/fc235/OpenFic/issues/266)) ([aefcd90](https://github.com/fc235/OpenFic/commit/aefcd90f1004f2bf8af887ff785d8532eb982492))
* **agent:** 修复并行工具调用时唯一约束冲突的问题 ([#271](https://github.com/fc235/OpenFic/issues/271)) ([5dbe377](https://github.com/fc235/OpenFic/commit/5dbe3772a78ac56be85ae19ae23881185c20e4b4))
* **agent:** 修复异常消息导致的僵尸会话 ([#123](https://github.com/fc235/OpenFic/issues/123)) ([84b95fe](https://github.com/fc235/OpenFic/commit/84b95fec91a65679d4f7a729515c4012b011af06))
* **agent:** 修复批量工具审批数量限制 ([#347](https://github.com/fc235/OpenFic/issues/347)) ([832fc5c](https://github.com/fc235/OpenFic/commit/832fc5cf59ee6940b6a5f553cec5a972e9cd7f35))
* **agent:** 修复旧会话配置无法恢复的问题 ([#202](https://github.com/fc235/OpenFic/issues/202)) ([ac9a59b](https://github.com/fc235/OpenFic/commit/ac9a59bea251a6bed4fb4ffcde005e74ee665151))
* **agent:** 修复模型以 JSON 字符串格式传递工具对象参数时解析失败的问题 ([#450](https://github.com/fc235/OpenFic/issues/450)) ([cc98518](https://github.com/fc235/OpenFic/commit/cc985187950f125702ab2c5bf1163ae7caf2e5f3))
* **agent:** 修复流式传输在特定情况下导致工具名重复拼接的问题 ([#456](https://github.com/fc235/OpenFic/issues/456)) ([a8b138c](https://github.com/fc235/OpenFic/commit/a8b138ccd61ca5098192146f4fa34bf22092ec4b))
* **agent:** 修复流式消息底部跟随失效的问题 ([#119](https://github.com/fc235/OpenFic/issues/119)) ([d79d3ed](https://github.com/fc235/OpenFic/commit/d79d3edc1e6e967dd20752645bc52c0e95fe6bb8))
* **agent:** 修复移动端输入法回车换行误识别为发送的问题 ([#438](https://github.com/fc235/OpenFic/issues/438)) ([0bf5dfc](https://github.com/fc235/OpenFic/commit/0bf5dfcb98a6b1f4aa5edc3968e1f90d8393843a))
* **agent:** 修复编辑工具转义空白匹配失败的问题 ([#214](https://github.com/fc235/OpenFic/issues/214)) ([649b87b](https://github.com/fc235/OpenFic/commit/649b87b801458bfd3b1c44e84215a299b8eaa174))
* **agent:** 修复编辑总结块在轮次结束前提前显示的问题 ([#434](https://github.com/fc235/OpenFic/issues/434)) ([c47570a](https://github.com/fc235/OpenFic/commit/c47570ac7feae795fbcddd7ec89c4585c23fe5c0))
* **agent:** 修复跨页面切换导致的侧边栏状态丢失问题 ([#178](https://github.com/fc235/OpenFic/issues/178)) ([22b9a37](https://github.com/fc235/OpenFic/commit/22b9a37c018ab64828cc7fdb97cbc1fa2b923d7e))
* **agent:** 修复重启后会话设置持续锁定的问题 ([#216](https://github.com/fc235/OpenFic/issues/216)) ([33555ff](https://github.com/fc235/OpenFic/commit/33555ff2c4d3a369938fd95e22fe64f276320a64))
* **agent:** 完善子智能体工具状态展示 ([#118](https://github.com/fc235/OpenFic/issues/118)) ([a908536](https://github.com/fc235/OpenFic/commit/a9085361cc32b46cc689c51a8d400c03ba0a1592))
* **agent:** 工具数量超限不再中断会话并返回错误结果 ([#293](https://github.com/fc235/OpenFic/issues/293)) ([b35a744](https://github.com/fc235/OpenFic/commit/b35a744e702e30a02b488f9948c433602ae3ff2a))
* **agent:** 按模型协议路由 OpenCode Zen/Go 请求 ([#427](https://github.com/fc235/OpenFic/issues/427)) ([03549b5](https://github.com/fc235/OpenFic/commit/03549b5eba2a173be06e11ea9a55301e95d05491))
* **agent:** 清理不可达的会话检查点 ([#184](https://github.com/fc235/OpenFic/issues/184)) ([8908120](https://github.com/fc235/OpenFic/commit/890812052a3542dd5a1e799753206d67f108cf54))
* **agent:** 移除子计划依赖并改用笔记大纲 ([#15](https://github.com/fc235/OpenFic/issues/15)) ([da97a8b](https://github.com/fc235/OpenFic/commit/da97a8be36256a814677a20d540f853713f496f5))
* **agent:** 统一工具错误处理 ([#346](https://github.com/fc235/OpenFic/issues/346)) ([76a2038](https://github.com/fc235/OpenFic/commit/76a203868832932f29b175910c869596b1f56774))
* **agent:** 规范化 write_plan 结果并修复被压缩时计划丢失的问题 ([#358](https://github.com/fc235/OpenFic/issues/358)) ([a6e419a](https://github.com/fc235/OpenFic/commit/a6e419ace227fb4ae69c7055b2ded09ffbe32c93))
* **agent:** 记录连接异常原因并避免 TLS 证书错误触发重试 ([#410](https://github.com/fc235/OpenFic/issues/410)) ([27a565f](https://github.com/fc235/OpenFic/commit/27a565fac0daf700956b66c012c33b7639495bdc))
* **agent:** 适配 OpenCode Go 提供商模型请求头 ([#418](https://github.com/fc235/OpenFic/issues/418)) ([2e15207](https://github.com/fc235/OpenFic/commit/2e15207f75ca7080fe0108e06da5f1ba7fab578e))
* **agent:** 避免中断会话普通消息状态冲突 ([#177](https://github.com/fc235/OpenFic/issues/177)) ([787669b](https://github.com/fc235/OpenFic/commit/787669b51dc6a6a1e6b34184a6acf3e38504d854))
* **agent:** 防止会话检查点泄露模型密钥 ([#92](https://github.com/fc235/OpenFic/issues/92)) ([0342427](https://github.com/fc235/OpenFic/commit/034242754890db39d2296f3b489c2c2317eb37e7))
* **agent:** 阻止 ask_user 传入空问题导致中断 ([#342](https://github.com/fc235/OpenFic/issues/342)) ([246c909](https://github.com/fc235/OpenFic/commit/246c909caf2c56958f2959ffb5c3095ab9d0ecbf))
* **agent:** 限制智能体列表高度并支持滚动 ([#268](https://github.com/fc235/OpenFic/issues/268)) ([fa44696](https://github.com/fc235/OpenFic/commit/fa44696ea94d7b65c16e6d07f7a88642e3e8a7b2))
* **assistant:** display save skill tool messages ([e19987f](https://github.com/fc235/OpenFic/commit/e19987f66e0513a0fb7b78428d14f9a16619b353))
* **assistant:** track the visible user message ([3a58b00](https://github.com/fc235/OpenFic/commit/3a58b00553a70f554d77d45adf2b34b4ba7d3bf7))
* **assistant:** 使用稳定的 diff section type ([#50](https://github.com/fc235/OpenFic/issues/50)) ([27decdc](https://github.com/fc235/OpenFic/commit/27decdcdf4bfe1fb6404d73a552fa1cc53958876))
* **backend:** 修复 Anthropic 兼容提供商错误回退到 OpenAI 协议的问题 ([#408](https://github.com/fc235/OpenFic/issues/408)) ([2ba74af](https://github.com/fc235/OpenFic/commit/2ba74af69ccd36af9644c5b8282ac8537be8a050))
* **backend:** 修复 Docker 部署版本信息读取 ([#367](https://github.com/fc235/OpenFic/issues/367)) ([d475639](https://github.com/fc235/OpenFic/commit/d47563946cd823044851dfe2817a78d35f61c9ef))
* **backend:** 修复 LLM 长响应被超时中断的问题 ([#277](https://github.com/fc235/OpenFic/issues/277)) ([3259325](https://github.com/fc235/OpenFic/commit/32593253ba58143731dba5eb8f359b82234353c1))
* **backend:** 修复 Ollama Cloud 地址覆盖导致的模型调用失败问题 ([#146](https://github.com/fc235/OpenFic/issues/146)) ([b5d116d](https://github.com/fc235/OpenFic/commit/b5d116d065dfa9db24ee8635a8d97b6cb8e2e9cd))
* **backend:** 修复 tiktoken 词表缓存反复重写阻塞事件循环的问题 ([#376](https://github.com/fc235/OpenFic/issues/376)) ([5a7c73b](https://github.com/fc235/OpenFic/commit/5a7c73b639b6e68bcc41f34e3704450a7d7dc7d5))
* **backend:** 修复 Windows 后台任务队列阻塞的问题 ([#147](https://github.com/fc235/OpenFic/issues/147)) ([cf1ffa1](https://github.com/fc235/OpenFic/commit/cf1ffa1e0c7b47e1c38c7a7019bcb8e91f38791f))
* **backend:** 修复Windows上后台任务事件无法实时同步的问题 ([#148](https://github.com/fc235/OpenFic/issues/148)) ([f4e83e1](https://github.com/fc235/OpenFic/commit/f4e83e1c2e8affb07029750c64d2d6bd0f1779b3))
* **backend:** 修复会话标题生成异常 ([#108](https://github.com/fc235/OpenFic/issues/108)) ([429ee53](https://github.com/fc235/OpenFic/commit/429ee53f10f6f9cd3723b758259c833b4d708316))
* **backend:** 修复兼容接口无法读取推理内容的问题 ([#382](https://github.com/fc235/OpenFic/issues/382)) ([63418de](https://github.com/fc235/OpenFic/commit/63418de575d189e61ab3bc770748983ddf28075d))
* **backend:** 修复开发服务器运行时配置异常 ([#152](https://github.com/fc235/OpenFic/issues/152)) ([e5e93ec](https://github.com/fc235/OpenFic/commit/e5e93ec324ca28ae0e6e06e698c59e97367da7b8))
* **backend:** 修复测试夹具重复初始化导致后端测试耗时过长的问题 ([#241](https://github.com/fc235/OpenFic/issues/241)) ([a355e7f](https://github.com/fc235/OpenFic/commit/a355e7f16a5afc14da98cc238fc4a021a9e73973))
* **backend:** 修复离线环境下的分词表加载失败的问题 ([#187](https://github.com/fc235/OpenFic/issues/187)) ([169d40b](https://github.com/fc235/OpenFic/commit/169d40b7410ef238f18cb669936e17473b7696cd))
* **backend:** 修复部分提供商流式 token 用量缺失的问题 ([#158](https://github.com/fc235/OpenFic/issues/158)) ([16376e9](https://github.com/fc235/OpenFic/commit/16376e9baa618cc91ce74217f5a354e74ec01d9f))
* **backend:** 修复章节导出产物在有效期内被清理的问题 ([#385](https://github.com/fc235/OpenFic/issues/385)) ([5d020cc](https://github.com/fc235/OpenFic/commit/5d020ccd212bdb2dbf9ee36658657a9d0edb05a4))
* **backend:** 修正兼容接口模型发现 URL ([#343](https://github.com/fc235/OpenFic/issues/343)) ([ea2b76d](https://github.com/fc235/OpenFic/commit/ea2b76dc2fc60ef70722c711f1da45788e8b6803))
* **backend:** 去重会话标题后台任务 ([#82](https://github.com/fc235/OpenFic/issues/82)) ([afd9650](https://github.com/fc235/OpenFic/commit/afd96506fff12d006383bedaae83c8273349a8c6))
* **backend:** 完善后端分发构建与启动入口 ([86b3d77](https://github.com/fc235/OpenFic/commit/86b3d77baff1a5cc5d57e1617fc6e619eb1090d0))
* **backend:** 完善后端构建与分发流程 ([#27](https://github.com/fc235/OpenFic/issues/27)) ([86b3d77](https://github.com/fc235/OpenFic/commit/86b3d77baff1a5cc5d57e1617fc6e619eb1090d0))
* **backend:** 完善后端构建与分发流程 ([#27](https://github.com/fc235/OpenFic/issues/27)) ([86b3d77](https://github.com/fc235/OpenFic/commit/86b3d77baff1a5cc5d57e1617fc6e619eb1090d0))
* **background:** 修复孤儿后台任务无法自动清理的问题 ([#83](https://github.com/fc235/OpenFic/issues/83)) ([643531d](https://github.com/fc235/OpenFic/commit/643531d73f86a860832305651bdc03a829ba136b))
* **build:** 修复 wheel 重复收录导致的构建失败 ([#125](https://github.com/fc235/OpenFic/issues/125)) ([3c4e2d0](https://github.com/fc235/OpenFic/commit/3c4e2d0c45896499fd0182617ccc24c45c9db2f3))
* **build:** 修正 electron-builder 配置并启用 changelog 作者显示 ([#13](https://github.com/fc235/OpenFic/issues/13)) ([82532ee](https://github.com/fc235/OpenFic/commit/82532ee37eb92e6965056b0e56c41c9a37fbbc8b))
* **ci:** allow release jobs to read artifacts ([3e46ff2](https://github.com/fc235/OpenFic/commit/3e46ff2bfdaab63ccbf6531803f90988636ad8e4))
* **ci:** allow release package recovery ([74da45b](https://github.com/fc235/OpenFic/commit/74da45b85bd2e4406ca1d9adb8dcc85bbc07bcce))
* **ci:** 修复 Docker 推送 403 与版本号同步缺失 ([ed002f5](https://github.com/fc235/OpenFic/commit/ed002f5e276402f5302675fa4ff6688c2acdc6a4))
* **ci:** 修复 release PR 合并命令参数解析 ([cf42194](https://github.com/fc235/OpenFic/commit/cf421944b77747de1b4c78b8925621d85e74f461))
* **ci:** 修复 release-please 未更新后端版本号及镜像版本 ([#17](https://github.com/fc235/OpenFic/issues/17)) ([de2bbdc](https://github.com/fc235/OpenFic/commit/de2bbdc611cfb2615bc5be1987d4a82066dcd6e9))
* **ci:** 修复桌面发布流程 ([#33](https://github.com/fc235/OpenFic/issues/33)) ([9f100fc](https://github.com/fc235/OpenFic/commit/9f100fc8c4ab75f09f5fd5262cfbe7ca66e62353))
* **ci:** 修正 release-please manifest 配置结构 ([3bf931b](https://github.com/fc235/OpenFic/commit/3bf931bdc53f244f01faf8115dca453e3232dd18))
* **ci:** 合并 release PR 前增加 checkout ([e1bf61a](https://github.com/fc235/OpenFic/commit/e1bf61a01fc477a73076d77b433fd42113bf1c2f))
* **ci:** 同步 uv.lock 并修正后端包名 ([#19](https://github.com/fc235/OpenFic/issues/19)) ([344bd82](https://github.com/fc235/OpenFic/commit/344bd82c5ac43ad85203f8d09ad340e5e4d46e18))
* **ci:** 移除 PR 自查清单强制校验 ([#180](https://github.com/fc235/OpenFic/issues/180)) ([54df8c1](https://github.com/fc235/OpenFic/commit/54df8c1635f8ff1d7ba37f2289649ab0758af9bd))
* **ci:** 等待 release PR 可合并后再自动合并 ([#23](https://github.com/fc235/OpenFic/issues/23)) ([d868fc6](https://github.com/fc235/OpenFic/commit/d868fc6647d0f5cd8097f3e19c55a4f1c8546233))
* **ci:** 调整发布打包流程 ([#31](https://github.com/fc235/OpenFic/issues/31)) ([f83451a](https://github.com/fc235/OpenFic/commit/f83451a76225daa2c4d1669e93ef9f7f5309f52b))
* **ci:** 跳过发布 PR 检查 ([#174](https://github.com/fc235/OpenFic/issues/174)) ([2286422](https://github.com/fc235/OpenFic/commit/22864220d8f9732255587c3c921e0b21132a5d2d))
* **dashboard:** 修复调用记录时间未转换时区的问题 ([#204](https://github.com/fc235/OpenFic/issues/204)) ([da977a8](https://github.com/fc235/OpenFic/commit/da977a8311b8effbed9506f204bb97eb2d8af6d7))
* **db:** 修复 checkpoints.db 体积膨胀导致无法启动的问题 ([#303](https://github.com/fc235/OpenFic/issues/303)) ([8c7cc10](https://github.com/fc235/OpenFic/commit/8c7cc1000ee2566845439be409eb4157c49e48cd))
* **deps:** remove invalid socketio extra ([1a77b78](https://github.com/fc235/OpenFic/commit/1a77b784bdf7a51015921156ef672a1e760e2465))
* **desktop:** bundle exact backend package ([0cdb54a](https://github.com/fc235/OpenFic/commit/0cdb54a3d120d5d691c5a294ef9249c89133d629))
* **desktop:** enforce bundled backend release requirements ([9779eca](https://github.com/fc235/OpenFic/commit/9779ecae51125d6696fa594b040cc29d17b8a1f5))
* **desktop:** use fixed port 18473 for LAN access ([f7713e6](https://github.com/fc235/OpenFic/commit/f7713e60964b7b3bf610daa1dd469bbbdd67b001))
* **desktop:** uv 安装 TLS 证书错误时自动重试 ([#292](https://github.com/fc235/OpenFic/issues/292)) ([79bad9b](https://github.com/fc235/OpenFic/commit/79bad9b56e3a149aa0e66b3ba842ba8a9abe4736))
* **desktop:** 为桌面端运行环境添加国内下载源 ([#126](https://github.com/fc235/OpenFic/issues/126)) ([5ba142e](https://github.com/fc235/OpenFic/commit/5ba142e50d5fef9f6f425d56cc5612264fe09d14))
* **desktop:** 优化运行时连接流程 ([#199](https://github.com/fc235/OpenFic/issues/199)) ([83c78ad](https://github.com/fc235/OpenFic/commit/83c78ad119f3cc0c083fb15312af19673d3b4340))
* **desktop:** 修复 Linux 系统下 webview preload 无法加载的问题 ([#341](https://github.com/fc235/OpenFic/issues/341)) ([8ecbf62](https://github.com/fc235/OpenFic/commit/8ecbf620ac4e099ea8e0a89877de81d4953d29ce))
* **desktop:** 修复 macOS 运行时与安装包校验异常 ([#215](https://github.com/fc235/OpenFic/issues/215)) ([8ebac44](https://github.com/fc235/OpenFic/commit/8ebac44ab083b00b2de394f740badcc45c8773a0))
* **desktop:** 修复 PyPI 镜像 wheel 文件 403 导致桌面更新失败的问题 ([#315](https://github.com/fc235/OpenFic/issues/315)) ([fd99c8b](https://github.com/fc235/OpenFic/commit/fd99c8b157be8251c3b3e4a21bfe4899b56c2fbe))
* **desktop:** 修复 Socket 首次连接失败导致启动中断的问题 ([#248](https://github.com/fc235/OpenFic/issues/248)) ([7b84765](https://github.com/fc235/OpenFic/commit/7b847652037b165f3f7129e59c3564ce617a290c))
* **desktop:** 修复 Windows 构建样式解析 ([#37](https://github.com/fc235/OpenFic/issues/37)) ([e837bb1](https://github.com/fc235/OpenFic/commit/e837bb14ea17d2a3ef46b0de6d6a72590f3778a9))
* **desktop:** 修复卸载时缺失运行环境目录报错 ([#384](https://github.com/fc235/OpenFic/issues/384)) ([349f154](https://github.com/fc235/OpenFic/commit/349f154a55aaef9a9ec6a2a0ae12ada253236645))
* **desktop:** 修复启动时窗口延迟显示的问题 ([#246](https://github.com/fc235/OpenFic/issues/246)) ([6d0e05f](https://github.com/fc235/OpenFic/commit/6d0e05f97753a3bcdd329be6f9a311b07714b4b6))
* **desktop:** 修复因仪表盘日期时区错误与日志读取的性能问题导致的无响应 ([#466](https://github.com/fc235/OpenFic/issues/466)) ([41397ef](https://github.com/fc235/OpenFic/commit/41397efa2ee575c98d48a99ddf3e036ed115495c))
* **desktop:** 修复更新元数据缺失导致检查报错的问题 ([#239](https://github.com/fc235/OpenFic/issues/239)) ([3b77aab](https://github.com/fc235/OpenFic/commit/3b77aabe38134b34f46331d687fd0ca7ba4e8217))
* **desktop:** 修复更新日志渲染 ([#102](https://github.com/fc235/OpenFic/issues/102)) ([2b75f25](https://github.com/fc235/OpenFic/commit/2b75f25b1d08ecccbc4e9b7bee1e727b21fe24bf))
* **desktop:** 修复本地后端 Socket 代理连接失败的问题 ([#209](https://github.com/fc235/OpenFic/issues/209)) ([7ffbd78](https://github.com/fc235/OpenFic/commit/7ffbd78ea937e45a93d4faa571ef1434050f9f98))
* **desktop:** 修复本地后端启动 ([#43](https://github.com/fc235/OpenFic/issues/43)) ([12440f7](https://github.com/fc235/OpenFic/commit/12440f715495a2755c81a7be794426ca2cb7027b))
* **desktop:** 修复本地运行时安装 ([#41](https://github.com/fc235/OpenFic/issues/41)) ([f77988b](https://github.com/fc235/OpenFic/commit/f77988ba27449fb0708bfcce6395027f4e067ea3))
* **desktop:** 修复桌面端主题与字体无法跟随前端同步的问题 ([#157](https://github.com/fc235/OpenFic/issues/157)) ([a2f8ebf](https://github.com/fc235/OpenFic/commit/a2f8ebf495a67fa68d30c181fcdcdc6bd4afe70f))
* **desktop:** 修复系统缺失 tar 导致运行环境安装失败的问题 ([#188](https://github.com/fc235/OpenFic/issues/188)) ([9685c19](https://github.com/fc235/OpenFic/commit/9685c19d4058a3083a29d54dc00455110ab768de))
* **desktop:** 完善本地实例目录检查与更新清理 ([#364](https://github.com/fc235/OpenFic/issues/364)) ([b5c2e0b](https://github.com/fc235/OpenFic/commit/b5c2e0bbc38e08b7d525997a47797165d40648e4))
* **desktop:** 完善运行环境调试信息处理 ([#196](https://github.com/fc235/OpenFic/issues/196)) ([39f3e55](https://github.com/fc235/OpenFic/commit/39f3e55653e30d2cba7dece7425839a4ebae4d75))
* **desktop:** 限制 setup 错误内容高度 ([#314](https://github.com/fc235/OpenFic/issues/314)) ([adaefb9](https://github.com/fc235/OpenFic/commit/adaefb9b1b489597929654886807487a64cb7821))
* **editor:** 修复移动端正文点击重复呼出键盘的问题 ([#226](https://github.com/fc235/OpenFic/issues/226)) ([79d03fa](https://github.com/fc235/OpenFic/commit/79d03fa3c9f32dc8183e7b2ce234d747c12bef5d))
* **frontend:** 修复 Agent 会话自动滚动难以解锁的问题 ([#447](https://github.com/fc235/OpenFic/issues/447)) ([1af851f](https://github.com/fc235/OpenFic/commit/1af851ffab446216c3b00dbd2f581e4c1d3628ed))
* **frontend:** 修复 Agent 侧边栏模型图标显示 ([#54](https://github.com/fc235/OpenFic/issues/54)) ([9eeaaff](https://github.com/fc235/OpenFic/commit/9eeaaff74c83a8d492eeb8fd3aa096017a89804c))
* **frontend:** 修复 Agent 消息完成重新挂载的问题 ([#61](https://github.com/fc235/OpenFic/issues/61)) ([10e2e53](https://github.com/fc235/OpenFic/commit/10e2e53811853d2b26c1bcdec5dd1152a02f1223))
* **frontend:** 修复 Agent 消息流式展示顺序 ([#63](https://github.com/fc235/OpenFic/issues/63)) ([9b4ee74](https://github.com/fc235/OpenFic/commit/9b4ee74f4e0f0481cba5f5c021ca0b61aa06c0f9))
* **frontend:** 修复 streamdown 流式渲染的最大更新深度崩溃问题 ([#272](https://github.com/fc235/OpenFic/issues/272)) ([ab4b9f5](https://github.com/fc235/OpenFic/commit/ab4b9f55c0e108998252747b0f54be6a5b62d2b4))
* **frontend:** 修复世界书开关状态错乱的问题 ([#138](https://github.com/fc235/OpenFic/issues/138)) ([7d5eb27](https://github.com/fc235/OpenFic/commit/7d5eb27da67edb5fdb3cc0aed4649a10892c08ae))
* **frontend:** 修复仪表盘图表日期范围与标签重叠的问题 ([#264](https://github.com/fc235/OpenFic/issues/264)) ([e3996ba](https://github.com/fc235/OpenFic/commit/e3996ba34703bb7e92b86b7e03f3feb6e98fe3c8))
* **frontend:** 修复侧栏切换主题后不保留设置的问题 ([#379](https://github.com/fc235/OpenFic/issues/379)) ([8f90d91](https://github.com/fc235/OpenFic/commit/8f90d91dbc855154edff2585a36f39ee353e54d0))
* **frontend:** 修复卡初始化的问题并增强连接失败诊断信息 ([#287](https://github.com/fc235/OpenFic/issues/287)) ([04acb43](https://github.com/fc235/OpenFic/commit/04acb43764c2b1261a2de7b4ee2a27acfed4e03b))
* **frontend:** 修复发送新消息后上一条 Assistant 轮次 toolbar 消失的问题 ([#273](https://github.com/fc235/OpenFic/issues/273)) ([ae8eda2](https://github.com/fc235/OpenFic/commit/ae8eda2d162e6e65057f20ecc1582055548789f7))
* **frontend:** 修复同行内粘贴文本被拆分换行的问题 ([#258](https://github.com/fc235/OpenFic/issues/258)) ([45c3d6a](https://github.com/fc235/OpenFic/commit/45c3d6a19950dfd9f57c4d9bd3164f428453bba5))
* **frontend:** 修复工具栏滑动误触发移动端侧栏手势的问题 ([#395](https://github.com/fc235/OpenFic/issues/395)) ([284cf6b](https://github.com/fc235/OpenFic/commit/284cf6bf0c5c98f6ed36ae38db9f7f5225d62b87))
* **frontend:** 修复已删除项目仍可打开的问题 ([#129](https://github.com/fc235/OpenFic/issues/129)) ([0542e8f](https://github.com/fc235/OpenFic/commit/0542e8faeab65ae34292ac6d329a61e7772a4e68))
* **frontend:** 修复提示词编辑内容丢失和本地修改提示缺失的问题 ([#140](https://github.com/fc235/OpenFic/issues/140)) ([954d552](https://github.com/fc235/OpenFic/commit/954d5529c5941ac3172cf5a3b6b1d1cb636431db))
* **frontend:** 修复搜索输入和 Toast 未使用项目字体的问题 ([#392](https://github.com/fc235/OpenFic/issues/392)) ([6d8ab17](https://github.com/fc235/OpenFic/commit/6d8ab175ad9f7ec5c27eb21e9c31da927d953788))
* **frontend:** 修复未知代码块语言导致内容不显示的问题 ([#394](https://github.com/fc235/OpenFic/issues/394)) ([87d1292](https://github.com/fc235/OpenFic/commit/87d12921d6b0074e4b1f1d449c5ad17dd4dbe74b))
* **frontend:** 修复桌面端后端资源地址解析异常 ([#136](https://github.com/fc235/OpenFic/issues/136)) ([09c570f](https://github.com/fc235/OpenFic/commit/09c570f4ac0b96b88427eed48de76da80ef9e525))
* **frontend:** 修复模型名称变化导致 LLM 统计图表重复键的问题 ([#402](https://github.com/fc235/OpenFic/issues/402)) ([a22269c](https://github.com/fc235/OpenFic/commit/a22269c09e69bc0856db64bd212ac3bf8ac05a1a))
* **frontend:** 修复移动端左侧边栏切换动画卡顿的问题 ([#390](https://github.com/fc235/OpenFic/issues/390)) ([55b2513](https://github.com/fc235/OpenFic/commit/55b2513c893922443587e082abc756fd18832a9f))
* **frontend:** 修复移动端编辑器菜单点击无效导致复制粘贴不可用的问题 ([#260](https://github.com/fc235/OpenFic/issues/260)) ([ba4ba07](https://github.com/fc235/OpenFic/commit/ba4ba07c0e00723e400ec476d714abc476492174))
* **frontend:** 修复编辑器保存时光标移位和草稿丢失的问题 ([#433](https://github.com/fc235/OpenFic/issues/433)) ([3bdf573](https://github.com/fc235/OpenFic/commit/3bdf5733eaf7dbbc22b89bcbc8b2b30f6dcdf7bc))
* **frontend:** 修复编辑器剪贴板换行处理 ([#189](https://github.com/fc235/OpenFic/issues/189)) ([95daf32](https://github.com/fc235/OpenFic/commit/95daf32c59fc4931dd52dec07f7737e76661b676))
* **frontend:** 修复规则编辑区布局 ([#85](https://github.com/fc235/OpenFic/issues/85)) ([025efad](https://github.com/fc235/OpenFic/commit/025efad2f6ddf624b7d37242bfd180f8fa1ad4e2))
* **frontend:** 修复输入法组合输入的标点转换冲突 ([#333](https://github.com/fc235/OpenFic/issues/333)) ([70e63e8](https://github.com/fc235/OpenFic/commit/70e63e81bf022e82a806d065cfe0ee78fcf495ff))
* **frontend:** 修复部分异常的编辑器行为影响移动端体验的问题 ([#407](https://github.com/fc235/OpenFic/issues/407)) ([73c50c0](https://github.com/fc235/OpenFic/commit/73c50c091b1a6946e730551a88fbced1b66ac366))
* **frontend:** 取消提供商任务类型筛选 ([#143](https://github.com/fc235/OpenFic/issues/143)) ([f582c8e](https://github.com/fc235/OpenFic/commit/f582c8ef1b4bd98e3e3ee4f461fb4e0341f7ed23))
* **frontend:** 完善移动端适配 ([#25](https://github.com/fc235/OpenFic/issues/25)) ([a971904](https://github.com/fc235/OpenFic/commit/a971904f00466b53203aa87fb146330aad5e710a))
* **frontend:** 对齐 Agent 工具消息注册 ([#55](https://github.com/fc235/OpenFic/issues/55)) ([b7942f5](https://github.com/fc235/OpenFic/commit/b7942f5cab56836dbeb3f837e4e6ad5deff373b3))
* **frontend:** 收起下拉框时不再误关闭设置面板 ([#297](https://github.com/fc235/OpenFic/issues/297)) ([c4e0b47](https://github.com/fc235/OpenFic/commit/c4e0b479a5642c7804dbdf68d448b913605284a1))
* **frontend:** 新建角色后自动切换标签 ([#191](https://github.com/fc235/OpenFic/issues/191)) ([8f35b51](https://github.com/fc235/OpenFic/commit/8f35b51b38670982764b7615d64106d9944329ee))
* **frontend:** 调整 Agent 工具消息展示 ([#62](https://github.com/fc235/OpenFic/issues/62)) ([f6ccfbb](https://github.com/fc235/OpenFic/commit/f6ccfbb2d853ac009a13def1b96d5cad1043cffa))
* **frontend:** 防止写作编辑内容丢失 ([#116](https://github.com/fc235/OpenFic/issues/116)) ([06698db](https://github.com/fc235/OpenFic/commit/06698dbb1a400b3cebadc7f237527dc53aa0e0e5))
* **import:** address ordered document review ([5aaaa18](https://github.com/fc235/OpenFic/commit/5aaaa188bab1ca9d6e9da91f2f7d6f5818360089))
* **import:** complete post-import integration ([a797596](https://github.com/fc235/OpenFic/commit/a7975965f01a934084ad6f141f764f3f006632e8))
* **import:** default merged volume title ([19b1c68](https://github.com/fc235/OpenFic/commit/19b1c68fe6da47b60354474c463c97ef0def99f1))
* **import:** harden document parsing validation ([8f77a4e](https://github.com/fc235/OpenFic/commit/8f77a4e4db2b153d7b8e7eba6d31198f652614dc))
* **import:** harden epub parsing ([366390e](https://github.com/fc235/OpenFic/commit/366390e1958aa679b1e536190844165dd8f6f139))
* **import:** preserve percent-encoded epub members ([0062b22](https://github.com/fc235/OpenFic/commit/0062b227855303430f39fe0cb27a956c9cc1a45a))
* **import:** refresh cached project stats ([2467524](https://github.com/fc235/OpenFic/commit/2467524711f36f31f9c4e8acd92a195ea517d623))
* **import:** split oversized chapters automatically ([2b2f65e](https://github.com/fc235/OpenFic/commit/2b2f65e89d161213c9869f3fe635c062f789a060))
* **import:** support namespaced epub xhtml ([f136784](https://github.com/fc235/OpenFic/commit/f136784041374bd97d3829d2b201bcf27654ffc1))
* improve saving startup and cache reliability ([d80a736](https://github.com/fc235/OpenFic/commit/d80a736cae5a25cf479be577b6f0dde62b69014b))
* **index:** 修复分块配置保存使用旧输入值的问题 ([#250](https://github.com/fc235/OpenFic/issues/250)) ([ed75ce4](https://github.com/fc235/OpenFic/commit/ed75ce46a9be88a6044277d74abf5fe11123bf16))
* **index:** 修复索引取消清理与轮询导致的性能问题 ([#86](https://github.com/fc235/OpenFic/issues/86)) ([73fa08e](https://github.com/fc235/OpenFic/commit/73fa08e0f2c7e8049058e085837a45feb5cfeb28))
* **mobile:** 修复移动端布局适配问题 ([#96](https://github.com/fc235/OpenFic/issues/96)) ([f396b34](https://github.com/fc235/OpenFic/commit/f396b34066577be9a9a3e5bbef4ace3192b7b1f4))
* **openrouter:** 修复 OpenRouter SDK 超时单位混淆导致请求卡住的问题 ([#319](https://github.com/fc235/OpenFic/issues/319)) ([422b951](https://github.com/fc235/OpenFic/commit/422b951204e25538e6df752573f5e2f3b4fc327a))
* preserve editor drafts and optimize shared material loading ([3aebe78](https://github.com/fc235/OpenFic/commit/3aebe78cdec282f731dd3dda24094383200097f0))
* **projects:** remove closed settings overlay before navigation ([5ba37c3](https://github.com/fc235/OpenFic/commit/5ba37c3771f86e1c7d1f6c5412554aa8c572f44e))
* **projects:** 修复项目列表加载不完全导致分页、搜索和排序失效的问题 ([#284](https://github.com/fc235/OpenFic/issues/284)) ([82af99e](https://github.com/fc235/OpenFic/commit/82af99e687ff0d57842a70489d39146eb5191059))
* **providers:** 修复目录中部分提供商端点 URL 缺失的问题 ([#230](https://github.com/fc235/OpenFic/issues/230)) ([0006c90](https://github.com/fc235/OpenFic/commit/0006c906b8c878c07859d3e2b7afda02f4b2e2a1))
* **providers:** 避免图标请求阻塞连接操作 ([#183](https://github.com/fc235/OpenFic/issues/183)) ([70d9419](https://github.com/fc235/OpenFic/commit/70d9419832496b519ad629abf062fde3063d7b70))
* **provider:** 修复提供商连接验证时的误导性逻辑并细化错误显示 ([#445](https://github.com/fc235/OpenFic/issues/445)) ([2f2a90d](https://github.com/fc235/OpenFic/commit/2f2a90d15f1a5e796d2c57578e504c5627d7712e))
* **reading:** handle fractional scroll boundaries and restore keyboard focus ([4fe10dc](https://github.com/fc235/OpenFic/commit/4fe10dc6f00086eebbf27a4d84d4bc292144730e))
* **release:** use fork repository for updates and feedback ([63c79e3](https://github.com/fc235/OpenFic/commit/63c79e3890e22511e2bdad1f070dad03046c2b73))
* **release:** 统一跨平台产物命名 ([#100](https://github.com/fc235/OpenFic/issues/100)) ([56def22](https://github.com/fc235/OpenFic/commit/56def22bf42fa660b0b1459929c7f928f1e02c09))
* **settings:** consolidate general sections ([bb9cc4a](https://github.com/fc235/OpenFic/commit/bb9cc4a4d07241f2d576159280caa34d28c0b725))
* **settings:** 锁定运行期间的智能体配置 ([#93](https://github.com/fc235/OpenFic/issues/93)) ([6afd4b0](https://github.com/fc235/OpenFic/commit/6afd4b0e9fa8c106917e8d3ec07f32255c30f7e4))
* **storage:** 修复章节排序更新冲突 ([#141](https://github.com/fc235/OpenFic/issues/141)) ([dade8e8](https://github.com/fc235/OpenFic/commit/dade8e899dbddf6ae8ab8eae190aa1a3e81be034))
* **storage:** 清理数据库关联运行时数据 ([#238](https://github.com/fc235/OpenFic/issues/238)) ([b8d2ca5](https://github.com/fc235/OpenFic/commit/b8d2ca5d58d64ecaf2acee919a0638104b0dce72))
* **summary:** 修复跨卷删除章节导致区间摘要丢失的问题 ([#225](https://github.com/fc235/OpenFic/issues/225)) ([9ecaa07](https://github.com/fc235/OpenFic/commit/9ecaa07fb38e9eb845135aabe0336d21adc0966c))
* **test:** 移除引用已迁移路径与偶发卡死的失效测试 ([eb638df](https://github.com/fc235/OpenFic/commit/eb638df74a1754c65351ec924098edabd7c15ebe))
* **writing:** refine document import preview ([0854a92](https://github.com/fc235/OpenFic/commit/0854a9271810573d4b76c451d660eb6a867d5efe))


### ⚡ 性能优化

* **agent:** 优化长上下文下 Agent 会话的首屏加载资源大小与速度 ([#439](https://github.com/fc235/OpenFic/issues/439)) ([dd83a17](https://github.com/fc235/OpenFic/commit/dd83a176fda52cd25e029837d5a37e1695394cfa))
* **agent:** 按游标分页加载 Agent 会话历史消息 ([#441](https://github.com/fc235/OpenFic/issues/441)) ([69c180a](https://github.com/fc235/OpenFic/commit/69c180ac20d918ddd50e5e034e563a804133fb9d))
* **backend:** 优化检索索引状态与模型提供商列表接口性能 ([#291](https://github.com/fc235/OpenFic/issues/291)) ([c77b264](https://github.com/fc235/OpenFic/commit/c77b264eafc2c15e78793bd01d5cc32f6d7e4437))
* **backend:** 优化章节工具查询性能 ([#356](https://github.com/fc235/OpenFic/issues/356)) ([c0a42a3](https://github.com/fc235/OpenFic/commit/c0a42a39925b9dbd8d54c6f748e2d983b90ede21))
* **chapter:** 优化大规模章节排序性能 ([#393](https://github.com/fc235/OpenFic/issues/393)) ([c9ef20f](https://github.com/fc235/OpenFic/commit/c9ef20f887ca0b26745f0bc39d07acb34a3f4e18))
* **desktop:** 缩减桌面安装包体积 ([#313](https://github.com/fc235/OpenFic/issues/313)) ([0ecbc54](https://github.com/fc235/OpenFic/commit/0ecbc5440c7bf24585886f4743dfb037109460ee))
* **frontend:** 虚拟化 Agent 消息列表并合并流式增量渲染 ([#257](https://github.com/fc235/OpenFic/issues/257)) ([87aa448](https://github.com/fc235/OpenFic/commit/87aa448add26bce1dfb9dc925a6db72473d63ebd))
* reduce startup and add conversation search ([0caef63](https://github.com/fc235/OpenFic/commit/0caef63e7d4c445530ebccf59d4f32f8a1a36e07))
* **storage:** 优化 dashboard 查询性能 ([#355](https://github.com/fc235/OpenFic/issues/355)) ([87bdfb2](https://github.com/fc235/OpenFic/commit/87bdfb2a934a7bd86be18b6db8903f22cb443e20))
* **storage:** 优化dashboard相关查询接口请求大小和速度 ([#443](https://github.com/fc235/OpenFic/issues/443)) ([62283a3](https://github.com/fc235/OpenFic/commit/62283a3804b56a0f6a271d63a54c0bb6cadebd81))
* **test:** 加速后端测试执行 ([#331](https://github.com/fc235/OpenFic/issues/331)) ([338df55](https://github.com/fc235/OpenFic/commit/338df55405f3342e7585bcfdd5d793bb4b40790d))
* **world-info:** 虚拟化世界书条目列表并优化拖拽排序 ([#254](https://github.com/fc235/OpenFic/issues/254)) ([ad94f34](https://github.com/fc235/OpenFic/commit/ad94f340c043999d5f8d6dc25580c559cec7edb0))


### ♻️ 代码重构

* **agent:** 重构 Agent 工具上下文与中断恢复链路 ([#110](https://github.com/fc235/OpenFic/issues/110)) ([5ab5a2b](https://github.com/fc235/OpenFic/commit/5ab5a2bc722267ff0e7af7e13e5b1f1c4bc2de78))
* **agent:** 重构 mention XML 流转链路 ([#78](https://github.com/fc235/OpenFic/issues/78)) ([28e7b16](https://github.com/fc235/OpenFic/commit/28e7b16aeb6c9d8288cd2d27210f075883a5d0ac))
* **agent:** 重构 Skill 功能 ([#77](https://github.com/fc235/OpenFic/issues/77)) ([97e1f5e](https://github.com/fc235/OpenFic/commit/97e1f5e20083de7b2f1ca22073bbbd42314abe9c))
* **backend:** 统一后台运行日志输出 ([86b3d77](https://github.com/fc235/OpenFic/commit/86b3d77baff1a5cc5d57e1617fc6e619eb1090d0))
* **dashboard:** 调用记录详情存储优化并记录工具引用 ([#107](https://github.com/fc235/OpenFic/issues/107)) ([c25b2c1](https://github.com/fc235/OpenFic/commit/c25b2c16673e860e8e0df3d614cec5169f3a2ff7))
* **frontend:** 将仪表盘图表库替换为 Nivo ([#72](https://github.com/fc235/OpenFic/issues/72)) ([3cbd4b7](https://github.com/fc235/OpenFic/commit/3cbd4b7389e39bf80d26d7ac8a24a85ae1a39a05))
* **index:** 重构索引面板与进度展示 ([#80](https://github.com/fc235/OpenFic/issues/80)) ([eff0886](https://github.com/fc235/OpenFic/commit/eff0886281ac277ccc49e03ab6cba8c3ec0c2eb3))
* **model:** 统一高级参数配置 ([#109](https://github.com/fc235/OpenFic/issues/109)) ([f672970](https://github.com/fc235/OpenFic/commit/f672970f13567721b2ce6d731419e0ee1214a2e4))
* **prompt-chains:** 重构提示词管理页面 ([#95](https://github.com/fc235/OpenFic/issues/95)) ([73db522](https://github.com/fc235/OpenFic/commit/73db52232f506edb9bda8e76156382aef4508310))
* **summary:** 重构摘要生成面板与交互体验 ([#84](https://github.com/fc235/OpenFic/issues/84)) ([8e16a19](https://github.com/fc235/OpenFic/commit/8e16a19204ff9718fcf7a25b38719a80c9c2cf52))


### 📚 文档

* **contributing:** 完善 CONTRIBUTING.md ([#389](https://github.com/fc235/OpenFic/issues/389)) ([6fad139](https://github.com/fc235/OpenFic/commit/6fad139d8111d71ab48e88d08aecc5e71b257c65))
* correct document import test sequence ([b9459fc](https://github.com/fc235/OpenFic/commit/b9459fc34761f3995adc35ce2716047e56266f02))
* correct release verification path ([2887dd8](https://github.com/fc235/OpenFic/commit/2887dd86256caad210011e8208c113fa986d0617))
* define v1.0.0 release design ([608174b](https://github.com/fc235/OpenFic/commit/608174b45cd94771935cd6351fb0d5de7e304af4))
* describe differences from upstream ([929dfa8](https://github.com/fc235/OpenFic/commit/929dfa8c761dfa774aa37360ee0b00280c578739))
* design agent message navigator ([33d54a0](https://github.com/fc235/OpenFic/commit/33d54a0fb0700cd1421b944d6fb23f593ff11408))
* design cross-project note import and ordering ([176d303](https://github.com/fc235/OpenFic/commit/176d303cab4ff8dc03343656321a2ba1dd39ce6f))
* design multi-document chapter import ([a4fd918](https://github.com/fc235/OpenFic/commit/a4fd9185ffc28c6d6e9be9bc2e8154e00ec1f11a))
* design quick-start session preset ([fdd7305](https://github.com/fc235/OpenFic/commit/fdd73052c49fff936f4f83281792298e8dda9c4f))
* keep desktop downloads in quick start ([4f91a56](https://github.com/fc235/OpenFic/commit/4f91a56fe01423fc7c39fc7be1baf5ac5efd784d))
* plan agent message navigator ([cb27371](https://github.com/fc235/OpenFic/commit/cb27371219a12a9f48971c0f2f72686a3da80db3))
* plan cross-project note import and ordering ([7b32ebe](https://github.com/fc235/OpenFic/commit/7b32ebe494f73f659df8a0e279c81cc8962139c1))
* plan multi-document chapter import ([65a3b9b](https://github.com/fc235/OpenFic/commit/65a3b9bbc407e288899c37b7104b83c4d8a1b31c))
* plan v1.0.0 release ([daa3a6d](https://github.com/fc235/OpenFic/commit/daa3a6de557f86d266d0a22e8f5700aeaa90d2ca))
* **readme:** 同步项目文档内容 ([#124](https://github.com/fc235/OpenFic/issues/124)) ([736779c](https://github.com/fc235/OpenFic/commit/736779cebea82f1c69e699d887a6a76c9cda2ef8))
* **readme:** 更新项目介绍与发布提示 ([86b3d77](https://github.com/fc235/OpenFic/commit/86b3d77baff1a5cc5d57e1617fc6e619eb1090d0))
* refine document import formats ([2767b02](https://github.com/fc235/OpenFic/commit/2767b026c9625b35a7b4c5a6b6c93abdc4c3118f))
* trim message navigator test scope ([0614b93](https://github.com/fc235/OpenFic/commit/0614b93085bfe6fbfe92fd08eb4247fd51026846))
* trim note feature test scope ([e165980](https://github.com/fc235/OpenFic/commit/e165980b7889dabd0df4a8570ad1d3dccca1b443))
* 更新 README ([#440](https://github.com/fc235/OpenFic/issues/440)) ([77181c0](https://github.com/fc235/OpenFic/commit/77181c066378bcaab00d459ed34f49ba3af9e4c2))
* 更新 README 章节结构 ([#155](https://github.com/fc235/OpenFic/issues/155)) ([154fab7](https://github.com/fc235/OpenFic/commit/154fab748fd17b448cba173821234b7bc0acf70c))
* 更新README ([#79](https://github.com/fc235/OpenFic/issues/79)) ([869b98c](https://github.com/fc235/OpenFic/commit/869b98c248dd442c96165a47883b2ff011d697df))
* 更新项目文档 ([#320](https://github.com/fc235/OpenFic/issues/320)) ([54f18e1](https://github.com/fc235/OpenFic/commit/54f18e1b1aa0bad44d178f68cd01fdeab0149e60))


### ✅ 测试

* **assistant:** clean up quick-start fixtures ([5eb4cce](https://github.com/fc235/OpenFic/commit/5eb4cce8da12a46a0e6de5db4f7652e20ca32262))
* **desktop:** 新增基于源码后端的本地开发模式 ([#304](https://github.com/fc235/OpenFic/issues/304)) ([84d63f1](https://github.com/fc235/OpenFic/commit/84d63f1aa6905896596818427f3f3275bcebc40e))
* **frontend:** 新增 Agent 会话生命周期 E2E 测试 ([#308](https://github.com/fc235/OpenFic/issues/308)) ([9478baf](https://github.com/fc235/OpenFic/commit/9478baf2f46317bd859deb21042c0bb02ce55441))
* **import:** consolidate parser coverage ([f515d4a](https://github.com/fc235/OpenFic/commit/f515d4a65146be09e8c65690312a7d4e16166d89))
* include shared manuscript tool in permission expectations ([a141f3b](https://github.com/fc235/OpenFic/commit/a141f3b4f2ac09855bf8a5d9b8edc5661b33b836))


### 🔧 杂项

* **agent:** 优化 Agent 工具描述 ([#372](https://github.com/fc235/OpenFic/issues/372)) ([4361650](https://github.com/fc235/OpenFic/commit/436165018f73d7ab77c15f3865810b5aa08f1385))
* **agent:** 允许Agent会话记住输入历史和未发送草稿 ([#316](https://github.com/fc235/OpenFic/issues/316)) ([7c0b8f2](https://github.com/fc235/OpenFic/commit/7c0b8f27dbb52f895492a24ca1c799e8cd7a9823))
* **agent:** 允许在设置各类模型默认值时设置推理强度 ([#416](https://github.com/fc235/OpenFic/issues/416)) ([ffaf732](https://github.com/fc235/OpenFic/commit/ffaf732a52d8be821fa78181585d0776241549c2))
* **agent:** 增加 Agent 会话消息导航 ([#404](https://github.com/fc235/OpenFic/issues/404)) ([af02d4a](https://github.com/fc235/OpenFic/commit/af02d4ac86d60eb8b29232fd9b97a3f1051515af))
* **agent:** 增加 Agent 输入框引用面板 ([#409](https://github.com/fc235/OpenFic/issues/409)) ([5fbbad0](https://github.com/fc235/OpenFic/commit/5fbbad0c01599d6d75c59705a1fa395a8a32cdae))
* **agent:** 增加上下文压缩与裁剪设置 ([#415](https://github.com/fc235/OpenFic/issues/415)) ([a36c3e9](https://github.com/fc235/OpenFic/commit/a36c3e93f8ca77d1a919a212427a3f4a62d84911))
* **agent:** 支持 DeepSeek 联网搜索 ([#454](https://github.com/fc235/OpenFic/issues/454)) ([e0db008](https://github.com/fc235/OpenFic/commit/e0db008d9c1b4a33289185933aed052e67d264f9))
* **agent:** 支持 Skill Command 引用 ([#329](https://github.com/fc235/OpenFic/issues/329)) ([82ed254](https://github.com/fc235/OpenFic/commit/82ed254d4c9ea622d55b114f688b7526afeba067))
* **agent:** 支持会话中断或被取消时按原状态继续 ([#446](https://github.com/fc235/OpenFic/issues/446)) ([1821fd0](https://github.com/fc235/OpenFic/commit/1821fd0328b970473c483836ab02bc49b2cd077f))
* **agent:** 新增列出子智能体列表工具 ([#359](https://github.com/fc235/OpenFic/issues/359)) ([945aebb](https://github.com/fc235/OpenFic/commit/945aebb7fc5a1a9ee301379082d18ca3ff7150b1))
* **agent:** 本地化适配工具权限展示文案 ([#112](https://github.com/fc235/OpenFic/issues/112)) ([362c129](https://github.com/fc235/OpenFic/commit/362c12903beee21373e9db124f6fafb5b08dfb41))
* **agent:** 添加会话计时器 ([#262](https://github.com/fc235/OpenFic/issues/262)) ([70e9652](https://github.com/fc235/OpenFic/commit/70e96528066389d7cb30329be6bbcd2d455f34e3))
* **agent:** 补充角色页 Agent 侧边栏 ([#176](https://github.com/fc235/OpenFic/issues/176)) ([ad4988e](https://github.com/fc235/OpenFic/commit/ad4988e85adedcc96911fca85338eff48daad488))
* **agent:** 调整内置智能体定义 ([#115](https://github.com/fc235/OpenFic/issues/115)) ([3dcdbb8](https://github.com/fc235/OpenFic/commit/3dcdbb82255e79a10059b69f8c3a41d966a8ed5e))
* **agent:** 调整内置智能体提示词 ([#121](https://github.com/fc235/OpenFic/issues/121)) ([211c7b0](https://github.com/fc235/OpenFic/commit/211c7b04f687bac675c6700ebe503fb598b4e73a))
* **agent:** 限制子智能体委派与提问能力 ([#90](https://github.com/fc235/OpenFic/issues/90)) ([9999283](https://github.com/fc235/OpenFic/commit/999928376012548bfca968aab270f38e7bcd3a83))
* **api:** 世界书改为项目强绑定 ([#73](https://github.com/fc235/OpenFic/issues/73)) ([393add6](https://github.com/fc235/OpenFic/commit/393add677c755ddd60bf1019ebd6110b75b462b3))
* **api:** 支持自定义提供商请求头 ([#352](https://github.com/fc235/OpenFic/issues/352)) ([4117498](https://github.com/fc235/OpenFic/commit/41174980b6b8477dca977f86a724f26023dafcf3))
* **auth:** 增加可选的应用密码认证 ([#339](https://github.com/fc235/OpenFic/issues/339)) ([d5f305e](https://github.com/fc235/OpenFic/commit/d5f305e8694c5b8cf51cd08d4fe0daa933e86a07))
* **backend:** 为 OpenAI Compatible 提供商添加思考强度支持 ([#192](https://github.com/fc235/OpenFic/issues/192)) ([195615f](https://github.com/fc235/OpenFic/commit/195615f4e22f0c33442e96d072a726de7363599d))
* **backend:** 添加 justfile 后端命令封装 ([#69](https://github.com/fc235/OpenFic/issues/69)) ([d66b128](https://github.com/fc235/OpenFic/commit/d66b1282ef7a4934a11827e793b894937f0cfc86))
* **backend:** 调整摘要上下文结构 ([#106](https://github.com/fc235/OpenFic/issues/106)) ([6b2cf6d](https://github.com/fc235/OpenFic/commit/6b2cf6d8376e61daee7902a796dcda73342ade28))
* **backend:** 迁移类型检查到 ty ([#68](https://github.com/fc235/OpenFic/issues/68)) ([d404696](https://github.com/fc235/OpenFic/commit/d40469688379706a176958cf6407d747a8c6b85c))
* **backend:** 适配 Models.dev 目录中的模型级路由配置 ([#467](https://github.com/fc235/OpenFic/issues/467)) ([34d7bf6](https://github.com/fc235/OpenFic/commit/34d7bf6ed57bd043e03a145ea25ee54d29b9928b))
* **branding:** 更新品牌图标与应用标识 ([#321](https://github.com/fc235/OpenFic/issues/321)) ([e73b900](https://github.com/fc235/OpenFic/commit/e73b900ccb8bd2486a7f1920cacc598cf6bf141a))
* **build:** 迁移前端与桌面端构建至 Vite+ ([#97](https://github.com/fc235/OpenFic/issues/97)) ([c77fd90](https://github.com/fc235/OpenFic/commit/c77fd907ce9a0a55eac24e3fc49094c03c188a25))
* checkpoint beta3 local changes before upstream merge ([e09e5ba](https://github.com/fc235/OpenFic/commit/e09e5ba2135b33b3d1032b58c25ffae2aa2c7568))
* **config:** 完善联网搜索设置选项 ([#383](https://github.com/fc235/OpenFic/issues/383)) ([3d22ece](https://github.com/fc235/OpenFic/commit/3d22ece133a5b024e3bb501f3f04cb5e8a5adca1))
* **desktop:** 支持实例删除 ([#324](https://github.com/fc235/OpenFic/issues/324)) ([128b057](https://github.com/fc235/OpenFic/commit/128b0576b1e94e93bde7ff9a51c9ce727f4751e1))
* **desktop:** 添加桌面端前进后退导航 ([#323](https://github.com/fc235/OpenFic/issues/323)) ([70b4af7](https://github.com/fc235/OpenFic/commit/70b4af7ced68bf43c086def2ddd37a8a36fda2f2))
* **desktop:** 添加桌面端菜单栏 ([#221](https://github.com/fc235/OpenFic/issues/221)) ([0d9bbe8](https://github.com/fc235/OpenFic/commit/0d9bbe8dc9f5cfb186cf2a196b40b4d577c113b1))
* **desktop:** 添加窗口状态记忆能力 ([#159](https://github.com/fc235/OpenFic/issues/159)) ([eb0e1a4](https://github.com/fc235/OpenFic/commit/eb0e1a4816bcd6d9b0682a8c96190eb52e3fc3a6))
* **editor:** 优化编辑器体验 ([#219](https://github.com/fc235/OpenFic/issues/219)) ([f3554d4](https://github.com/fc235/OpenFic/commit/f3554d47ea549dffebda9ad4f2289dc904cdfa6f))
* **editor:** 支持章节编辑器可选的行号显示 ([#357](https://github.com/fc235/OpenFic/issues/357)) ([3991edf](https://github.com/fc235/OpenFic/commit/3991edf15320913776959d7575eff736a2080650))
* **editor:** 新增单条正文内容长度限制 ([#193](https://github.com/fc235/OpenFic/issues/193)) ([cb87f42](https://github.com/fc235/OpenFic/commit/cb87f42a8803584e664519696ddce6aca6883def))
* **editor:** 新增成对符号自动补齐设置 ([#317](https://github.com/fc235/OpenFic/issues/317)) ([d5322ca](https://github.com/fc235/OpenFic/commit/d5322ca5435ead0ff3d6624e55d6af436b05129e))
* **editor:** 新增段落自动缩进设置 ([#311](https://github.com/fc235/OpenFic/issues/311)) ([4024a67](https://github.com/fc235/OpenFic/commit/4024a67de7afc02048420ab374143c75997928ea))
* **editor:** 新增自动转换半角符号设置 ([#312](https://github.com/fc235/OpenFic/issues/312)) ([30fb71e](https://github.com/fc235/OpenFic/commit/30fb71e2ee050cc384c1635193db489f35582568))
* **frontend:** 为编辑器工具栏添加移动端适配 ([#388](https://github.com/fc235/OpenFic/issues/388)) ([b965128](https://github.com/fc235/OpenFic/commit/b9651283bb8d8dc46514d4960d3f3db9773a2520))
* **frontend:** 优化移动端交互与用户体验 ([#442](https://github.com/fc235/OpenFic/issues/442)) ([4dd3a8a](https://github.com/fc235/OpenFic/commit/4dd3a8a634c309780e5320f8b3287c70b79b2b26))
* **frontend:** 升级 Streamdown 至 2.7.0 并移除兼容补丁 ([#435](https://github.com/fc235/OpenFic/issues/435)) ([94e342d](https://github.com/fc235/OpenFic/commit/94e342dd5210da2d8325e56e6a1cfe70fd5d7f92))
* **frontend:** 完善 Markdown 编辑器工具栏 ([#373](https://github.com/fc235/OpenFic/issues/373)) ([8d4bc4e](https://github.com/fc235/OpenFic/commit/8d4bc4e7fc1c2cccd71cbb24a4ed392456180d0d))
* **frontend:** 完善章节编辑器工具栏 ([#374](https://github.com/fc235/OpenFic/issues/374)) ([809a071](https://github.com/fc235/OpenFic/commit/809a071e34ed651e5177f31ac1b8a461a589edab))
* **frontend:** 支持提问面板折叠 ([#322](https://github.com/fc235/OpenFic/issues/322)) ([1b0b253](https://github.com/fc235/OpenFic/commit/1b0b253e0415a2e6847a787a7f3cdcd6b80dff0d))
* **frontend:** 添加 Oxfmt 格式化支持 ([#67](https://github.com/fc235/OpenFic/issues/67)) ([40e2efd](https://github.com/fc235/OpenFic/commit/40e2efd7890749378e76958d85a9da0819789fdf))
* **frontend:** 添加最近打开项目入口 ([#104](https://github.com/fc235/OpenFic/issues/104)) ([16d6f4b](https://github.com/fc235/OpenFic/commit/16d6f4bb5b45edee3e1876c95e0783aea15a2f91))
* **frontend:** 添加移动端左侧边栏滑动手势 ([#391](https://github.com/fc235/OpenFic/issues/391)) ([39f9557](https://github.com/fc235/OpenFic/commit/39f9557cd386f2bac959386cc7fc8b75597a7d21))
* **frontend:** 添加系统默认字体选项 ([#128](https://github.com/fc235/OpenFic/issues/128)) ([3980ee2](https://github.com/fc235/OpenFic/commit/3980ee2af3d85c66016b0d2ada45c7058596ef8c))
* **frontend:** 统一设置面板加载行为 ([#52](https://github.com/fc235/OpenFic/issues/52)) ([798e8ad](https://github.com/fc235/OpenFic/commit/798e8add8df5d24c93bbf0d1118049f6b4412ea4))
* **frontend:** 补齐前端界面 i18n 文案接入 ([#51](https://github.com/fc235/OpenFic/issues/51)) ([7932bf7](https://github.com/fc235/OpenFic/commit/7932bf7e4f3175746677f1be990164ca64e3bc24))
* **frontend:** 调整设置面板模型禁用态 ([#53](https://github.com/fc235/OpenFic/issues/53)) ([86449ec](https://github.com/fc235/OpenFic/commit/86449ece001aa8dbf210d322d19522ed81d8f620))
* **frontend:** 调整设置面板自动保存 ([#46](https://github.com/fc235/OpenFic/issues/46)) ([a94d0eb](https://github.com/fc235/OpenFic/commit/a94d0ebf7683e2b864c5ba3539ede0f38bce66e9))
* **frontend:** 迁移前端检查到 Oxlint ([#66](https://github.com/fc235/OpenFic/issues/66)) ([7c10648](https://github.com/fc235/OpenFic/commit/7c10648bcd31ab6f71248e8af5aa4d0f7414ac51))
* **frontend:** 适配角色与世界书移动端顶栏 ([#74](https://github.com/fc235/OpenFic/issues/74)) ([1824117](https://github.com/fc235/OpenFic/commit/1824117893de708fe7c802379021885236e2ea2b))
* ignore local worktrees ([756a1d6](https://github.com/fc235/OpenFic/commit/756a1d6fac5a1d7a3d4abfc6ab8daa7cbc613992))
* **import:** 增强项目文件导入流程 ([#363](https://github.com/fc235/OpenFic/issues/363)) ([9288a24](https://github.com/fc235/OpenFic/commit/9288a24245d8952f2231b47281c1810dc6b0887a))
* **main:** release 0.10.0 ([#270](https://github.com/fc235/OpenFic/issues/270)) ([3bc330f](https://github.com/fc235/OpenFic/commit/3bc330f4a786dc6ebb02421cdf62fb2d876cedee))
* **main:** release 0.10.1 ([#310](https://github.com/fc235/OpenFic/issues/310)) ([bbe1923](https://github.com/fc235/OpenFic/commit/bbe1923b3bbf35d66bd3aa4f73e396ec1412df27))
* **main:** release 0.10.2 ([#330](https://github.com/fc235/OpenFic/issues/330)) ([2215840](https://github.com/fc235/OpenFic/commit/2215840f66aa0fd555fb804456dbd40949342f5e))
* **main:** release 0.11.0 ([#350](https://github.com/fc235/OpenFic/issues/350)) ([dcccb83](https://github.com/fc235/OpenFic/commit/dcccb8390007564fe55189ed40653b9f24ccd798))
* **main:** release 0.11.1 ([#371](https://github.com/fc235/OpenFic/issues/371)) ([fd62cb4](https://github.com/fc235/OpenFic/commit/fd62cb4942f8f6a080a8421de1ea121ef9fee7fb))
* **main:** release 0.12.0 ([#396](https://github.com/fc235/OpenFic/issues/396)) ([8fd5078](https://github.com/fc235/OpenFic/commit/8fd5078e443b0d779ea02c16b87a6fd095844c53))
* **main:** release 0.12.1 ([#430](https://github.com/fc235/OpenFic/issues/430)) ([4de9dd4](https://github.com/fc235/OpenFic/commit/4de9dd4c472e4cd7238c74156fff7dd36face22c))
* **main:** release 0.2.0 ([#6](https://github.com/fc235/OpenFic/issues/6)) ([005ef9e](https://github.com/fc235/OpenFic/commit/005ef9eed1f8a4b2a23964a2aeed7855d4dfc3f1))
* **main:** release 0.2.1 ([#10](https://github.com/fc235/OpenFic/issues/10)) ([1e530a0](https://github.com/fc235/OpenFic/commit/1e530a0c08d9b117965d1991d4883b997b3eb0d4))
* **main:** release 0.2.2 ([#12](https://github.com/fc235/OpenFic/issues/12)) ([00df636](https://github.com/fc235/OpenFic/commit/00df63652a7b964e81ebcf0bed775f14bf21aece))
* **main:** release 0.2.3 ([#14](https://github.com/fc235/OpenFic/issues/14)) ([af06d65](https://github.com/fc235/OpenFic/commit/af06d65e5c3d6da6e8a272fea9a715b284ba370e))
* **main:** release 0.2.4 ([#16](https://github.com/fc235/OpenFic/issues/16)) ([1b6dec7](https://github.com/fc235/OpenFic/commit/1b6dec7987c099ae942474984479d546b4cbe3b5))
* **main:** release 0.2.5 ([#18](https://github.com/fc235/OpenFic/issues/18)) ([1183b9f](https://github.com/fc235/OpenFic/commit/1183b9feca00b4fc1e83562a5a8fba4b1db22da1))
* **main:** release 0.2.6 ([#20](https://github.com/fc235/OpenFic/issues/20)) ([0fe9586](https://github.com/fc235/OpenFic/commit/0fe9586f363614a1e3ae401b0c6218ed9556beea))
* **main:** release 0.3.0 ([#22](https://github.com/fc235/OpenFic/issues/22)) ([388bc0a](https://github.com/fc235/OpenFic/commit/388bc0a4185d342a891b0d2ffaa59dff2e3ad356))
* **main:** release 0.3.1 ([#24](https://github.com/fc235/OpenFic/issues/24)) ([3b82f84](https://github.com/fc235/OpenFic/commit/3b82f84b5370c1bcb6692a6ffa0e2698e65435b9))
* **main:** release 0.3.2 ([#26](https://github.com/fc235/OpenFic/issues/26)) ([4eef46b](https://github.com/fc235/OpenFic/commit/4eef46b952291e61751a648b6355716a22792da4))
* **main:** release 0.3.3 ([#28](https://github.com/fc235/OpenFic/issues/28)) ([7e70e38](https://github.com/fc235/OpenFic/commit/7e70e383e17691b415f2030affa8f0ae8095191f))
* **main:** release 0.4.0 ([#30](https://github.com/fc235/OpenFic/issues/30)) ([65c22af](https://github.com/fc235/OpenFic/commit/65c22af61369cf3485f46787164a19bcd9d697a6))
* **main:** release 0.4.1 ([#32](https://github.com/fc235/OpenFic/issues/32)) ([f0e588c](https://github.com/fc235/OpenFic/commit/f0e588ca456b8bd3bfc6dad82ce8656b67a1bf0e))
* **main:** release 0.4.2 ([#34](https://github.com/fc235/OpenFic/issues/34)) ([e2a0441](https://github.com/fc235/OpenFic/commit/e2a044154f20e14e6a6db5e4a359028ce5a01faf))
* **main:** release 0.4.3 ([#36](https://github.com/fc235/OpenFic/issues/36)) ([b9faa2a](https://github.com/fc235/OpenFic/commit/b9faa2abe5cf61a54081d7496a6ece723e0388fc))
* **main:** release 0.4.4 ([#38](https://github.com/fc235/OpenFic/issues/38)) ([9b53e9c](https://github.com/fc235/OpenFic/commit/9b53e9c214ad5888b48f8377de1f5f7c08539fd5))
* **main:** release 0.4.5 ([#40](https://github.com/fc235/OpenFic/issues/40)) ([04e43f2](https://github.com/fc235/OpenFic/commit/04e43f29c78bff2e1cecbd2a2f6c6f16e112ce3c))
* **main:** release 0.4.6 ([#42](https://github.com/fc235/OpenFic/issues/42)) ([c6ed162](https://github.com/fc235/OpenFic/commit/c6ed16219542bf6ecbb78cf10b5cb7e63a4dd298))
* **main:** release 0.4.7 ([#44](https://github.com/fc235/OpenFic/issues/44)) ([2767509](https://github.com/fc235/OpenFic/commit/2767509ab19f42946000e7c31ae5a4a3d8f6cb68))
* **main:** release 0.4.8 ([#47](https://github.com/fc235/OpenFic/issues/47)) ([0609000](https://github.com/fc235/OpenFic/commit/06090009bb6b7bf4f0c97161823bbc01fbb709f9))
* **main:** release 0.4.9 ([#49](https://github.com/fc235/OpenFic/issues/49)) ([175d6ab](https://github.com/fc235/OpenFic/commit/175d6aba716ddf4c14b9e0c40147539fa29e5c2a))
* **main:** release 0.5.0 ([#57](https://github.com/fc235/OpenFic/issues/57)) ([a2bf0ef](https://github.com/fc235/OpenFic/commit/a2bf0efebdaeff20e02bdb054d630fd6512a5715))
* **main:** release 0.6.0 ([#65](https://github.com/fc235/OpenFic/issues/65)) ([d04fc7a](https://github.com/fc235/OpenFic/commit/d04fc7a8a0e3eeaae160f1ed2298387d2d36e5ce))
* **main:** release 0.6.1 ([#75](https://github.com/fc235/OpenFic/issues/75)) ([5c9a268](https://github.com/fc235/OpenFic/commit/5c9a2684a5f568bcf80001186df3e653ed6f3a49))
* **main:** release 0.6.2 ([#88](https://github.com/fc235/OpenFic/issues/88)) ([4bbddc9](https://github.com/fc235/OpenFic/commit/4bbddc98b953a4f8d71ef0354e17113afbe1bbfa))
* **main:** release 0.7.0 ([#98](https://github.com/fc235/OpenFic/issues/98)) ([87cf421](https://github.com/fc235/OpenFic/commit/87cf4215c1e3430361e40805186bc9121a4f9f31))
* **main:** release 0.7.1 ([#101](https://github.com/fc235/OpenFic/issues/101)) ([18223f2](https://github.com/fc235/OpenFic/commit/18223f2033c2f71fffab62027aef5641df0e1d96))
* **main:** release 0.7.2 ([#103](https://github.com/fc235/OpenFic/issues/103)) ([8b406e3](https://github.com/fc235/OpenFic/commit/8b406e37fe5586df35b3e02edfcd10228520339b))
* **main:** release 0.7.3 ([#105](https://github.com/fc235/OpenFic/issues/105)) ([7ea4437](https://github.com/fc235/OpenFic/commit/7ea443747f8e63cc4bb70c0a9b1c29dd6fa2904d))
* **main:** release 0.7.4 ([#114](https://github.com/fc235/OpenFic/issues/114)) ([6f48df3](https://github.com/fc235/OpenFic/commit/6f48df3667a92af5095e76b7702e06265a819ddd))
* **main:** release 0.7.5 ([#127](https://github.com/fc235/OpenFic/issues/127)) ([2ef5b6d](https://github.com/fc235/OpenFic/commit/2ef5b6dd153924abac3e983681ac2354219c7048))
* **main:** release 0.7.6 ([#149](https://github.com/fc235/OpenFic/issues/149)) ([2c34499](https://github.com/fc235/OpenFic/commit/2c34499fd130a6531cb3fd686944b908ba77bbf8))
* **main:** release 0.8.0 ([#173](https://github.com/fc235/OpenFic/issues/173)) ([35f7648](https://github.com/fc235/OpenFic/commit/35f764880cac30993fd7efd21cb8790398982d7f))
* **main:** release 0.8.1 ([#203](https://github.com/fc235/OpenFic/issues/203)) ([c457d05](https://github.com/fc235/OpenFic/commit/c457d05ce7971d2fab03d723d3fed8afb886c65a))
* **main:** release 0.9.0 ([#222](https://github.com/fc235/OpenFic/issues/222)) ([8f52518](https://github.com/fc235/OpenFic/commit/8f52518887a08dad2cb9c9fb29ab1b46d849aca6))
* **main:** release 0.9.1 ([#240](https://github.com/fc235/OpenFic/issues/240)) ([60d7ec9](https://github.com/fc235/OpenFic/commit/60d7ec9d88d1102ad5e14ad7182785625ae2287d))
* **main:** release 0.9.2 ([#256](https://github.com/fc235/OpenFic/issues/256)) ([f0b726f](https://github.com/fc235/OpenFic/commit/f0b726fc437c35c6d914a4f4a753f438e011ff21))
* **models:** 优化提供商与模型设置面板体验 ([#362](https://github.com/fc235/OpenFic/issues/362)) ([1ef8c09](https://github.com/fc235/OpenFic/commit/1ef8c091d3ca30f08bd90892515e46dd8368aa7b))
* **models:** 优化模型选择器并移除Provider图标上传 ([#87](https://github.com/fc235/OpenFic/issues/87)) ([436f761](https://github.com/fc235/OpenFic/commit/436f761611ee57c67bcf0cdad72284b85a9fafaf))
* **model:** 添加 OpenAI Compatible (Responses) 提供商 ([#349](https://github.com/fc235/OpenFic/issues/349)) ([9a14ae2](https://github.com/fc235/OpenFic/commit/9a14ae2513422cdeda6417b3386cdf025fc0c175))
* **notes:** 添加笔记导入导出功能 ([#370](https://github.com/fc235/OpenFic/issues/370)) ([2eae5db](https://github.com/fc235/OpenFic/commit/2eae5dbe08dee4f2c2eae801a18ec41e7e576ff1))
* **openrouter:** 添加应用归因 ([#332](https://github.com/fc235/OpenFic/issues/332)) ([a883a36](https://github.com/fc235/OpenFic/commit/a883a369707af3fe688616e4d118f754cb3f2dbb))
* **providers:** 优化内置提供商选取、刷新与调用 ([#89](https://github.com/fc235/OpenFic/issues/89)) ([0fe4188](https://github.com/fc235/OpenFic/commit/0fe418852730254789473fdcd96993136f7dabc2))
* **provider:** 支持 OpenAI Codex 提供商 (使用 ChatGPT Plan 额度) ([#429](https://github.com/fc235/OpenFic/issues/429)) ([12d27da](https://github.com/fc235/OpenFic/commit/12d27da82a5144aa1ff904424fae8ab32d611451))
* **provider:** 新增 Anthropic Compatible 提供商 ([#208](https://github.com/fc235/OpenFic/issues/208)) ([2000f79](https://github.com/fc235/OpenFic/commit/2000f79d522bd4140994bc3ce1c59799f85baa30))
* **provider:** 添加 Gemini Compatible 提供商 ([#360](https://github.com/fc235/OpenFic/issues/360)) ([b6b2915](https://github.com/fc235/OpenFic/commit/b6b29157897ab989dc0e36d779d9c2a4b1204cf0))
* **provider:** 添加 Requesty 提供商 ([#420](https://github.com/fc235/OpenFic/issues/420)) ([d578743](https://github.com/fc235/OpenFic/commit/d578743fda02024f42c191bfdf73388e3f78469a))
* release 1.0.3 ([0fe395c](https://github.com/fc235/OpenFic/commit/0fe395cc19bacfe015d98f06f4b446644fae6fe8))
* release 1.1.0 ([b862087](https://github.com/fc235/OpenFic/commit/b8620874c580d13dd4b97ef81751244392263187))
* release 1.1.1 ([0b31478](https://github.com/fc235/OpenFic/commit/0b31478785b335a3502f5bf83f8e7ee47f913d25))
* release 1.1.2 ([105af96](https://github.com/fc235/OpenFic/commit/105af968f8ea3515984fd9c20123f8bb48d28d15))
* release 1.2.0 ([2495729](https://github.com/fc235/OpenFic/commit/2495729d466ca26abc8bd23572a86b7399f1e370))
* release 1.3.0 ([91169ab](https://github.com/fc235/OpenFic/commit/91169ab96ffeefce6614cabed7d90eb6cb1aaba8))
* release 1.4.0 ([4bb1dd2](https://github.com/fc235/OpenFic/commit/4bb1dd24dc1accefc9bf0f86cfdb6246ea39900d))
* release 1.4.1 ([e6054d6](https://github.com/fc235/OpenFic/commit/e6054d6c3d76a81a7c0bc3662aeb401b95b065a4))
* release 1.4.2 ([4738e05](https://github.com/fc235/OpenFic/commit/4738e059e678c004fc3270dfaff64f5a33e5219f))
* **release:** 1.0.1 ([423898b](https://github.com/fc235/OpenFic/commit/423898b0676ec2579f84d9c9319be3e6a28e46f3))
* **release:** prepare v1.0.0 ([f330833](https://github.com/fc235/OpenFic/commit/f330833ad20b144370ea8f4aa452884c9dfdbaa3))
* **skills:** 优化技能配置体验 ([#218](https://github.com/fc235/OpenFic/issues/218)) ([d7976c5](https://github.com/fc235/OpenFic/commit/d7976c583bdd3bf6d3a67c9efc3231b941d4c167))
* **skill:** 添加内置写作技能 ([#113](https://github.com/fc235/OpenFic/issues/113)) ([664d126](https://github.com/fc235/OpenFic/commit/664d12632b63b8c363bc3ead66a1197a8ff56826))
* **status-bar:** 添加索引进度展示 ([#81](https://github.com/fc235/OpenFic/issues/81)) ([84f94c7](https://github.com/fc235/OpenFic/commit/84f94c725854e42d1e3a80cff82c707ebe30b643))
* **summary:** 增加摘要设置 ([#400](https://github.com/fc235/OpenFic/issues/400)) ([afb0264](https://github.com/fc235/OpenFic/commit/afb02649081140fb70e80dca2fe7b1fc108f95b4))
* **vscode:** 添加 VS Code 开发任务配置 ([#309](https://github.com/fc235/OpenFic/issues/309)) ([94503b9](https://github.com/fc235/OpenFic/commit/94503b921f42ab8a61b98365889929d4979477b6))
* 优化角色和世界书列表体验 ([#212](https://github.com/fc235/OpenFic/issues/212)) ([191ed05](https://github.com/fc235/OpenFic/commit/191ed05888ced345ca4a0b78f58dfacc8b832ab4))
* 允许在回复 ask_user 工具时选择忽略 ([#334](https://github.com/fc235/OpenFic/issues/334)) ([be518ed](https://github.com/fc235/OpenFic/commit/be518ed9a4490cf65caf94c65998be84594ae95d))
* 初始化仓库 ([f7064e5](https://github.com/fc235/OpenFic/commit/f7064e5029b83a8215ea890b19e281e64381c7a7))
* 完善模型费用统计与元数据配置 ([#335](https://github.com/fc235/OpenFic/issues/335)) ([546ef3a](https://github.com/fc235/OpenFic/commit/546ef3af15beaefb08a333172373407f48057857))
* 添加 Infistar 提供商 ([#437](https://github.com/fc235/OpenFic/issues/437)) ([9d85a5d](https://github.com/fc235/OpenFic/commit/9d85a5d7523467b48d0000d4636a28652de6dd22))
* 添加压缩系统提示词选项 ([#263](https://github.com/fc235/OpenFic/issues/263)) ([5dbc83d](https://github.com/fc235/OpenFic/commit/5dbc83d2ef45ef341cd71b295664194a1934642d))
* 添加结构化 Issue 模板 ([#156](https://github.com/fc235/OpenFic/issues/156)) ([9e3b8ad](https://github.com/fc235/OpenFic/commit/9e3b8ad04912331507efa742d9963b7f1ed72883))
* 调整 Agent 会话命名与任务列表交互 ([#58](https://github.com/fc235/OpenFic/issues/58)) ([741d2e3](https://github.com/fc235/OpenFic/commit/741d2e369a37c11d28f3831fd5eb5d777b09ab46))
* 调整部分不合规范的UI样式细节 ([#405](https://github.com/fc235/OpenFic/issues/405)) ([bf8e227](https://github.com/fc235/OpenFic/commit/bf8e22758dd8c79202573b762697b63adf5ec677))

## [1.4.2](https://github.com/fc235/OpenFic/compare/v1.4.1...v1.4.2) (2026-10-29)

### 项目导入

- 导入时自动将超出行数或字符数限制的章节拆分为最少数量的章节，保留正文顺序。
- 未超限章节保持原样，预览和确认导入使用一致的拆分结果。

## [1.4.1](https://github.com/fc235/OpenFic/compare/v1.4.0...v1.4.1) (2026-10-29)

### 电脑端阅读翻页修复

- 修复 Windows 显示缩放或页面缩放下反复点击下一页仍停在原处、页码判断错误和章末无法继续的问题。
- 修复通过顶部按钮关闭阅读设置后方向键翻页没有反应的问题，关闭设置后恢复阅读区域焦点。
- 保留既有按屏翻页、章节衔接、自动翻页和 Android 音量键行为。

### 验证

- 新增真实 Chromium 125%、150%、175% 缩放回归，覆盖连续翻页、整章读完和上一章/下一章往返。
- 26 项阅读浏览器测试、26 项前端脚本测试、TypeScript、类型感知 lint 和生产构建通过。

## [1.4.0](https://github.com/fc235/OpenFic/compare/v1.3.0...v1.4.0) (2026-10-25)

### 阅读与移动端

- 新增章节阅读模式：方向键按屏翻页、章末衔接下一章、自定义按键、可设置间隔的自动翻页。
- 保留未保存章节草稿与原编辑位置；设置、后台、失焦或手动翻页时暂停自动播放。
- 新增 Android 远程连接客户端；阅读模式支持音量＋上一页、音量－下一页，长按不连续翻页。
- 退出阅读、打开设置、加载章节或退到后台时恢复系统音量控制。

### 上游功能与修复

- 会话历史按游标分页加载；支持中断/取消后继续；优化移动端交互、自动滚动和消息布局。
- 新增语音转写、本地与云端语音配置、远程连接隧道、PostgreSQL 后端。
- 新增 Requesty 提供商、DeepSeek 联网搜索与 Models.dev 模型级路由。
- 优化仪表盘查询与时区处理、桌面日志读取；修复工具参数解析和流式工具名重复问题。
- 保留本地消息/章节导航、项目引用、OAuth 修复、固定局域网端口 18473 和桌面通知。

### 升级与验证

- 数据库迁移扩展至 1033，适配已安装分支的迁移历史；升级/降级往返验证保留现有资料。
- 修复 Windows PostgreSQL 与异步事件循环兼容性，验证 SQLite/PostgreSQL 实际启动及读写。
- 后端全量 2485 项通过；阅读模式浏览器 22 项、前端脚本 25 项、Android 原生单元测试 16 项通过。
- Android 已完成原生编译与签名检查；尚未验证手机物理音量键。Android 音量键翻页需安装新客户端。

## [1.3.0](https://github.com/fc235/OpenFic/compare/v1.2.0...v1.3.0) (2026-10-10)

### 新功能

- Agent 支持文件附件、附件卡片和文件读取工具，并增加输入框引用面板。
- 新增角色关系图谱，支持关系编辑、图谱布局与版本回滚。
- 增加工具输出裁剪、上下文压缩设置，以及各类默认模型的推理强度设置。
- 新增 OpenAI Codex 提供商的 OAuth 授权入口，支持账户注册、重新授权与取消；增加 Infistar 提供商。
- 章节工具结果和差异行可跳转到正文并高亮对应段落，保留未保存草稿，支持移动端。

### 修复与性能

- 修复并发写入覆盖、模型统计重复键、Anthropic 兼容协议选择、导出文件提前清理和输入法 Enter 误发送。
- 改进编辑器保存、光标稳定性和失败草稿保留；修复 Agent 总结块提前显示。
- 修改摘要与详情按需加载，优化长会话查询；修复子代理自动压缩与恢复。
- 修复 OAuth 重新授权与刷新竞态、重复账户绑定、角色撤销后的孤儿关系，以及图片和运行中追加文件的处理。
- 非图片附件以受限下载响应提供，保留图片预览；升级 Streamdown 至 2.7。

### 桌面与升级

- 保留本地消息导航、会话通知、桌面偏好和局域网固定端口 18473。
- 启动时会应用新增数据库迁移（1026–1030）；首次启动会同步新增文件解析依赖。
- 发布 Windows x86_64 安装包、ZIP 和自动更新文件。

验证：2106 项后端、24 项浏览器、13 项脚本及桌面相关回归通过。

## [1.2.0](https://github.com/fc235/OpenFic/compare/v1.0.3...v1.2.0) (2026-09-17)

本版本汇总 1.1.0 以来的变化，包含此前 beta 版本及已撤下的 1.1.2、1.1.3 的改进，避免删除旧发布后遗漏更新说明。

### 编辑器与界面

* 笔记和章节共用编辑器界面，支持查找、替换、快捷键、草稿恢复与格式保留。
* 模型菜单支持单击切换当前模型、双击设置全局默认模型，并保留默认模型标记。
* DeepSeek 余额面板显示北京时间峰谷价格时段，并随机展示对应提示。
* 支持自定义主题，可分别配置浅色和深色预设、颜色并导入导出主题。
* 将编辑器、上下文和高级设置合并到通用设置，保留旧入口的兼容跳转。
* 修复项目卡片悬停位移导致偶发点击无效，增加键盘访问支持；修复移动端编辑器工具栏滑动误触发侧栏手势。
* 移除模型设置中的手动价格参数及“快捷新会话”功能。

### 参考正文与 AI 工具

* 正文工具栏增加“参考正文”入口，支持绑定多个项目、按卷章查看完整正文和解除引用。
* AI 仅在用户明确要求参考或模仿写法时，按需读取来源项目的最新章节；来源只读，不复制为本地笔记，不递归读取其他引用。
* 聊天工具状态和权限设置增加“读取参考正文”，返回内容保留来源项目、卷和章节信息。
* 修复引用列表首次加载失败后，临时勾选可能覆盖已有绑定的问题；修复关闭项目设置后跳转仍残留遮罩的问题。
* 补齐“保存技能”工具消息的注册、中文与英文标题、技能名称展示及回归测试，正确标记为写入操作而非探索操作。

### 摘要设置

* 支持控制章节与长期摘要的自动生成、最小章节字数、批处理数量和目标长度。
* 修改长期摘要间隔时要求确认失效的范围摘要，避免继续使用过时的摘要内容。
* 修正章节上下文与摘要生成流程对新配置的处理，补充设置持久化、确认机制与工具权限回归测试。

### 桌面端与发布

* 支持完全退出或仅退出前端，可记住关闭方式；后端可继续服务局域网设备。
* 设置页增加局域网访问开关、可访问地址、复制与二维码，并在任务空闲后安全重启服务。
* 局域网访问固定使用端口 18473；重启期间阻止新的 Agent 任务进入，避免任务在后端切换时被中断。
* 完善 beta 与正式版覆盖安装、内置 Python 后端版本匹配和更新器窗口重连。
* 发布 Windows x64 安装包、ZIP 和自动更新文件；不发布其他平台或 Docker 镜像。

## [1.1.3](https://github.com/fc235/OpenFic/compare/v1.1.2...v1.1.3) (2026-09-17)

### 新功能与改进

* 增加摘要设置，支持控制章节与长期摘要的自动生成、最小章节字数、批处理数量和目标长度。
* 修改长期摘要间隔时要求确认失效的范围摘要，避免继续使用过时的摘要内容。
* 将编辑器、上下文和高级设置合并到通用设置，保留旧入口的兼容跳转。

### 修复与测试

* 修正章节上下文与摘要生成流程对新配置的处理，并补充设置持久化、确认机制与工具权限回归测试。
* 桌面端局域网访问使用固定端口，简化同一网络内的连接配置。

## [1.1.1](https://github.com/fc235/OpenFic/compare/v1.1.0...v1.1.1) (2026-09-16)

### 新功能

* 正文工具栏增加“参考正文”入口，支持绑定多个项目、按卷章查看完整正文和解除引用。
* AI 仅在用户明确要求参考或模仿写法时，按需读取来源项目的最新章节；来源只读，不复制为本地笔记，不递归读取其他引用。
* 聊天工具状态和权限设置增加“读取参考正文”，返回内容保留来源项目、卷和章节信息。

### 修复与发布调整

* 修复引用列表首次加载失败后，临时勾选可能覆盖已有绑定的问题。
* 修复关闭项目设置后跳转仍残留遮罩的问题。
* 桌面打包和发布流程聚焦 Windows x64，提供安装包、ZIP 和自动更新文件；本版本不发布其他平台或 Docker 镜像。

## [1.1.0](https://github.com/fc235/OpenFic/compare/v1.0.3...v1.1.0) (2026-09-15)

### 新功能与界面改进

* 笔记和章节共用编辑器界面，支持查找、替换、快捷键、草稿恢复与格式保留。
* 模型菜单支持单击切换当前模型、双击设置全局默认模型，并保留默认模型标记。
* DeepSeek 余额面板显示北京时间峰谷价格时段，并随机展示对应提示。
* 桌面端支持完全退出或仅退出前端，可记住关闭方式；后端可继续服务局域网设备。
* 设置页增加局域网访问开关、可访问地址、复制与二维码，并在任务空闲后安全重启服务。
* 合入上游自定义主题，可分别配置浅色和深色预设、颜色并导入导出主题。

### 修复与性能优化

* 修复项目卡片悬停位移导致偶发点击无效，并增加键盘访问支持。
* 移除模型设置中的手动价格参数及“快捷新会话”功能。
* 局域网重启期间阻止新的 Agent 任务进入，避免任务在后端切换时被中断。
* 修复移动端编辑器工具栏滑动误触发侧栏手势。
* 完善 beta 与正式版覆盖安装、内置 Python 后端版本匹配和更新器窗口重连。

## [1.0.3](https://github.com/fc235/OpenFic/compare/v1.0.2...v1.0.3) (2026-09-11)

### 新功能与界面改进

* 使用 DeepSeek 官方 API 时显示账户余额，定时及生成结束后刷新；其他模型隐藏余额。
* 保留实际 Token 用量，移除会话栏本地费用估算，并交换输入、输出图标。
* 角色和世界书共享资料界面统一主题样式，适配窄窗口。

### 修复与性能优化

* 修复角色和世界书保存期间继续编辑可能漏存的问题，切换角色时提交待保存内容。
* 编辑器 Token 计算移至后台线程，合并连续输入，减少主线程计算。
* 共享资料正文展开时按需加载，来源项目校验使用批量查询。
* 补齐技能参考文档参数说明与新增工具权限测试。

## [1.0.2](https://github.com/fc235/OpenFic/compare/v1.0.1...v1.0.2) (2026-09-10)

### 新功能

* Agent 可将写作方法保存为技能，附带参考文档并绑定指定智能体；新绑定供后续执行使用。
* 角色和世界书支持跨项目显式引用，来源只读、本地资料独立保留，取消引用不删除来源。
* 角色和世界书页面突出显示所属项目、共享来源和被引用数量。
* 会话成功完成时发送 Windows 系统通知，点击可恢复应用窗口。

### 改进与修复

* Windows 安装时可自行勾选创建桌面快捷方式，默认不勾选。
* 合入上游章节排序性能优化、移动端侧栏动画与滑动手势改进。
* 修复未知代码块语言内容不显示，以及搜索输入和提示消息的字体问题。
* 增加技能写入、执行期间技能隔离、共享资料权限与数据库迁移回归验证。

## [1.0.1](https://github.com/fc235/OpenFic/compare/v1.0.0...v1.0.1) (2026-09-09)

### 性能优化

* 桌面专用后端包移除重复的前端资源，减少分发体积。
* 历史消息按页加载，增加数据库索引，避免更新任务时读取完整历史。
* 保持历史加载时的滚动位置，支持失败重试并防止跨会话数据混入。

### 问题修复与改进

* 统一自动更新、项目主页、问题反馈和 Agent 反馈地址至本仓库。

* 合并上游的 tiktoken 缓存、兼容接口推理内容读取和桌面卸载修复。
* 更新编辑器工具栏移动端适配与联网搜索设置。
* 补充打包、分页接口、数据库迁移及浏览器回归测试。

## [1.0.0](https://github.com/fc235/OpenFic/compare/v0.11.0...v1.0.0) (2026-09-07)

### ✨ 新功能

* 支持共用隐藏指令与可选的新会话快捷入口
* 支持 Agent 历史消息快速定位
* 支持跨项目笔记导入及分类内拖动排序
* 支持 TXT、Markdown、ZIP、EPUB 多文档导入、排序、合卷与分卷

### 🐛 问题修复

* 桌面安装包内置同版本后端，避免安装到错误的 OpenFic 包
* 完善文档导入后的项目统计刷新与 EPUB 路径兼容性

## [0.11.0](https://github.com/syrizelink/OpenFic/compare/v0.10.2...v0.11.0) (2026-08-30)


### ✨ 新功能

* **agent:** 新增会话/轮次级别的变更汇总面板 ([#366](https://github.com/syrizelink/OpenFic/issues/366)) ([e4344c3](https://github.com/syrizelink/OpenFic/commit/e4344c39fff0f4b51a727f29435cf5c3eb17e751))
* **agent:** 新增联网搜索和网页读取能力 ([#354](https://github.com/syrizelink/OpenFic/issues/354)) ([d6bbca7](https://github.com/syrizelink/OpenFic/commit/d6bbca7eb848ff2a7632602550488138a26776c5))


### 🐛 问题修复

* **agent:** 规范化 write_plan 结果并修复被压缩时计划丢失的问题 ([#358](https://github.com/syrizelink/OpenFic/issues/358)) ([a6e419a](https://github.com/syrizelink/OpenFic/commit/a6e419ace227fb4ae69c7055b2ded09ffbe32c93))
* **backend:** 修复 Docker 部署版本信息读取 ([#367](https://github.com/syrizelink/OpenFic/issues/367)) ([d475639](https://github.com/syrizelink/OpenFic/commit/d47563946cd823044851dfe2817a78d35f61c9ef))
* **desktop:** 完善本地实例目录检查与更新清理 ([#364](https://github.com/syrizelink/OpenFic/issues/364)) ([b5c2e0b](https://github.com/syrizelink/OpenFic/commit/b5c2e0bbc38e08b7d525997a47797165d40648e4))


### ⚡ 性能优化

* **backend:** 优化章节工具查询性能 ([#356](https://github.com/syrizelink/OpenFic/issues/356)) ([c0a42a3](https://github.com/syrizelink/OpenFic/commit/c0a42a39925b9dbd8d54c6f748e2d983b90ede21))
* **storage:** 优化 dashboard 查询性能 ([#355](https://github.com/syrizelink/OpenFic/issues/355)) ([87bdfb2](https://github.com/syrizelink/OpenFic/commit/87bdfb2a934a7bd86be18b6db8903f22cb443e20))


### 🔧 杂项

* **agent:** 新增列出子智能体列表工具 ([#359](https://github.com/syrizelink/OpenFic/issues/359)) ([945aebb](https://github.com/syrizelink/OpenFic/commit/945aebb7fc5a1a9ee301379082d18ca3ff7150b1))
* **api:** 支持自定义提供商请求头 ([#352](https://github.com/syrizelink/OpenFic/issues/352)) ([4117498](https://github.com/syrizelink/OpenFic/commit/41174980b6b8477dca977f86a724f26023dafcf3))
* **editor:** 支持章节编辑器可选的行号显示 ([#357](https://github.com/syrizelink/OpenFic/issues/357)) ([3991edf](https://github.com/syrizelink/OpenFic/commit/3991edf15320913776959d7575eff736a2080650))
* **import:** 增强项目文件导入流程 ([#363](https://github.com/syrizelink/OpenFic/issues/363)) ([9288a24](https://github.com/syrizelink/OpenFic/commit/9288a24245d8952f2231b47281c1810dc6b0887a))
* **models:** 优化提供商与模型设置面板体验 ([#362](https://github.com/syrizelink/OpenFic/issues/362)) ([1ef8c09](https://github.com/syrizelink/OpenFic/commit/1ef8c091d3ca30f08bd90892515e46dd8368aa7b))
* **model:** 添加 OpenAI Compatible (Responses) 提供商 ([#349](https://github.com/syrizelink/OpenFic/issues/349)) ([9a14ae2](https://github.com/syrizelink/OpenFic/commit/9a14ae2513422cdeda6417b3386cdf025fc0c175))
* **provider:** 添加 Gemini Compatible 提供商 ([#360](https://github.com/syrizelink/OpenFic/issues/360)) ([b6b2915](https://github.com/syrizelink/OpenFic/commit/b6b29157897ab989dc0e36d779d9c2a4b1204cf0))

## [0.10.2](https://github.com/syrizelink/OpenFic/compare/v0.10.1...v0.10.2) (2026-08-25)


### 🐛 问题修复

* **agent:** 修复批量工具审批数量限制 ([#347](https://github.com/syrizelink/OpenFic/issues/347)) ([832fc5c](https://github.com/syrizelink/OpenFic/commit/832fc5cf59ee6940b6a5f553cec5a972e9cd7f35))
* **agent:** 统一工具错误处理 ([#346](https://github.com/syrizelink/OpenFic/issues/346)) ([76a2038](https://github.com/syrizelink/OpenFic/commit/76a203868832932f29b175910c869596b1f56774))
* **agent:** 阻止 ask_user 传入空问题导致中断 ([#342](https://github.com/syrizelink/OpenFic/issues/342)) ([246c909](https://github.com/syrizelink/OpenFic/commit/246c909caf2c56958f2959ffb5c3095ab9d0ecbf))
* **backend:** 修正兼容接口模型发现 URL ([#343](https://github.com/syrizelink/OpenFic/issues/343)) ([ea2b76d](https://github.com/syrizelink/OpenFic/commit/ea2b76dc2fc60ef70722c711f1da45788e8b6803))
* **desktop:** 修复 Linux 系统下 webview preload 无法加载的问题 ([#341](https://github.com/syrizelink/OpenFic/issues/341)) ([8ecbf62](https://github.com/syrizelink/OpenFic/commit/8ecbf620ac4e099ea8e0a89877de81d4953d29ce))
* **frontend:** 修复输入法组合输入的标点转换冲突 ([#333](https://github.com/syrizelink/OpenFic/issues/333)) ([70e63e8](https://github.com/syrizelink/OpenFic/commit/70e63e81bf022e82a806d065cfe0ee78fcf495ff))


### ⚡ 性能优化

* **test:** 加速后端测试执行 ([#331](https://github.com/syrizelink/OpenFic/issues/331)) ([338df55](https://github.com/syrizelink/OpenFic/commit/338df55405f3342e7585bcfdd5d793bb4b40790d))


### 🔧 杂项

* **agent:** 支持 Skill Command 引用 ([#329](https://github.com/syrizelink/OpenFic/issues/329)) ([82ed254](https://github.com/syrizelink/OpenFic/commit/82ed254d4c9ea622d55b114f688b7526afeba067))
* **auth:** 增加可选的应用密码认证 ([#339](https://github.com/syrizelink/OpenFic/issues/339)) ([d5f305e](https://github.com/syrizelink/OpenFic/commit/d5f305e8694c5b8cf51cd08d4fe0daa933e86a07))
* **openrouter:** 添加应用归因 ([#332](https://github.com/syrizelink/OpenFic/issues/332)) ([a883a36](https://github.com/syrizelink/OpenFic/commit/a883a369707af3fe688616e4d118f754cb3f2dbb))
* 允许在回复 ask_user 工具时选择忽略 ([#334](https://github.com/syrizelink/OpenFic/issues/334)) ([be518ed](https://github.com/syrizelink/OpenFic/commit/be518ed9a4490cf65caf94c65998be84594ae95d))
* 完善模型费用统计与元数据配置 ([#335](https://github.com/syrizelink/OpenFic/issues/335)) ([546ef3a](https://github.com/syrizelink/OpenFic/commit/546ef3af15beaefb08a333172373407f48057857))

## [0.10.1](https://github.com/syrizelink/OpenFic/compare/v0.10.0...v0.10.1) (2026-08-20)


### 🐛 问题修复

* **desktop:** 修复 PyPI 镜像 wheel 文件 403 导致桌面更新失败的问题 ([#315](https://github.com/syrizelink/OpenFic/issues/315)) ([fd99c8b](https://github.com/syrizelink/OpenFic/commit/fd99c8b157be8251c3b3e4a21bfe4899b56c2fbe))
* **desktop:** 限制 setup 错误内容高度 ([#314](https://github.com/syrizelink/OpenFic/issues/314)) ([adaefb9](https://github.com/syrizelink/OpenFic/commit/adaefb9b1b489597929654886807487a64cb7821))
* **openrouter:** 修复 OpenRouter SDK 超时单位混淆导致请求卡住的问题 ([#319](https://github.com/syrizelink/OpenFic/issues/319)) ([422b951](https://github.com/syrizelink/OpenFic/commit/422b951204e25538e6df752573f5e2f3b4fc327a))


### ⚡ 性能优化

* **desktop:** 缩减桌面安装包体积 ([#313](https://github.com/syrizelink/OpenFic/issues/313)) ([0ecbc54](https://github.com/syrizelink/OpenFic/commit/0ecbc5440c7bf24585886f4743dfb037109460ee))


### 📚 文档

* 更新项目文档 ([#320](https://github.com/syrizelink/OpenFic/issues/320)) ([54f18e1](https://github.com/syrizelink/OpenFic/commit/54f18e1b1aa0bad44d178f68cd01fdeab0149e60))


### 🔧 杂项

* **agent:** 允许Agent会话记住输入历史和未发送草稿 ([#316](https://github.com/syrizelink/OpenFic/issues/316)) ([7c0b8f2](https://github.com/syrizelink/OpenFic/commit/7c0b8f27dbb52f895492a24ca1c799e8cd7a9823))
* **branding:** 更新品牌图标与应用标识 ([#321](https://github.com/syrizelink/OpenFic/issues/321)) ([e73b900](https://github.com/syrizelink/OpenFic/commit/e73b900ccb8bd2486a7f1920cacc598cf6bf141a))
* **desktop:** 支持实例删除 ([#324](https://github.com/syrizelink/OpenFic/issues/324)) ([128b057](https://github.com/syrizelink/OpenFic/commit/128b0576b1e94e93bde7ff9a51c9ce727f4751e1))
* **desktop:** 添加桌面端前进后退导航 ([#323](https://github.com/syrizelink/OpenFic/issues/323)) ([70b4af7](https://github.com/syrizelink/OpenFic/commit/70b4af7ced68bf43c086def2ddd37a8a36fda2f2))
* **editor:** 新增成对符号自动补齐设置 ([#317](https://github.com/syrizelink/OpenFic/issues/317)) ([d5322ca](https://github.com/syrizelink/OpenFic/commit/d5322ca5435ead0ff3d6624e55d6af436b05129e))
* **editor:** 新增段落自动缩进设置 ([#311](https://github.com/syrizelink/OpenFic/issues/311)) ([4024a67](https://github.com/syrizelink/OpenFic/commit/4024a67de7afc02048420ab374143c75997928ea))
* **editor:** 新增自动转换半角符号设置 ([#312](https://github.com/syrizelink/OpenFic/issues/312)) ([30fb71e](https://github.com/syrizelink/OpenFic/commit/30fb71e2ee050cc384c1635193db489f35582568))
* **frontend:** 支持提问面板折叠 ([#322](https://github.com/syrizelink/OpenFic/issues/322)) ([1b0b253](https://github.com/syrizelink/OpenFic/commit/1b0b253e0415a2e6847a787a7f3cdcd6b80dff0d))
* **vscode:** 添加 VS Code 开发任务配置 ([#309](https://github.com/syrizelink/OpenFic/issues/309)) ([94503b9](https://github.com/syrizelink/OpenFic/commit/94503b921f42ab8a61b98365889929d4979477b6))

## [0.10.0](https://github.com/syrizelink/OpenFic/compare/v0.9.2...v0.10.0) (2026-08-16)


### ✨ 新功能

* **agent:** 支持主 Agent 自定义标识（颜色与图标） ([#282](https://github.com/syrizelink/OpenFic/issues/282)) ([b802c4d](https://github.com/syrizelink/OpenFic/commit/b802c4d2543938a6fc61fc92c03754d3e9f8ae55))
* **agent:** 支持规则全局与项目作用域 ([#269](https://github.com/syrizelink/OpenFic/issues/269)) ([0fb578a](https://github.com/syrizelink/OpenFic/commit/0fb578aa9c7ace66436f71331029dc82a76b316f))
* **desktop:** 支持数据备份、迁移、还原与自定义数据目录 ([#275](https://github.com/syrizelink/OpenFic/issues/275)) ([23a1fac](https://github.com/syrizelink/OpenFic/commit/23a1fac7e14d9184ebf2e583a8d451ef068cb80a))
* **fonts:** 引入 fontsource 字体支持 ([#294](https://github.com/syrizelink/OpenFic/issues/294)) ([c135ee3](https://github.com/syrizelink/OpenFic/commit/c135ee338975bf3330f179e3eba360ad12727a22))
* **settings:** 支持自定义基础字号与编辑器字号 ([#300](https://github.com/syrizelink/OpenFic/issues/300)) ([ac6da38](https://github.com/syrizelink/OpenFic/commit/ac6da382907886940fb17121d4a2b5bf6742cbcc))
* **telemetry:** 接入 PostHog 远程错误遥测 ([#305](https://github.com/syrizelink/OpenFic/issues/305)) ([08d47ae](https://github.com/syrizelink/OpenFic/commit/08d47aef1bd421993c3b2a952b69a2b468cbd8eb))


### 🐛 问题修复

* **agent:** 修复会话生命周期竞态导致取消和恢复异常的问题 ([#307](https://github.com/syrizelink/OpenFic/issues/307)) ([c1430df](https://github.com/syrizelink/OpenFic/commit/c1430df5a6a6181942f7327206bf51e3c5ba5bc2))
* **agent:** 修复并行工具调用时唯一约束冲突的问题 ([#271](https://github.com/syrizelink/OpenFic/issues/271)) ([5dbe377](https://github.com/syrizelink/OpenFic/commit/5dbe3772a78ac56be85ae19ae23881185c20e4b4))
* **agent:** 工具数量超限不再中断会话并返回错误结果 ([#293](https://github.com/syrizelink/OpenFic/issues/293)) ([b35a744](https://github.com/syrizelink/OpenFic/commit/b35a744e702e30a02b488f9948c433602ae3ff2a))
* **backend:** 修复 LLM 长响应被超时中断的问题 ([#277](https://github.com/syrizelink/OpenFic/issues/277)) ([3259325](https://github.com/syrizelink/OpenFic/commit/32593253ba58143731dba5eb8f359b82234353c1))
* **db:** 修复 checkpoints.db 体积膨胀导致无法启动的问题 ([#303](https://github.com/syrizelink/OpenFic/issues/303)) ([8c7cc10](https://github.com/syrizelink/OpenFic/commit/8c7cc1000ee2566845439be409eb4157c49e48cd))
* **desktop:** uv 安装 TLS 证书错误时自动重试 ([#292](https://github.com/syrizelink/OpenFic/issues/292)) ([79bad9b](https://github.com/syrizelink/OpenFic/commit/79bad9b56e3a149aa0e66b3ba842ba8a9abe4736))
* **frontend:** 修复 streamdown 流式渲染的最大更新深度崩溃问题 ([#272](https://github.com/syrizelink/OpenFic/issues/272)) ([ab4b9f5](https://github.com/syrizelink/OpenFic/commit/ab4b9f55c0e108998252747b0f54be6a5b62d2b4))
* **frontend:** 修复卡初始化的问题并增强连接失败诊断信息 ([#287](https://github.com/syrizelink/OpenFic/issues/287)) ([04acb43](https://github.com/syrizelink/OpenFic/commit/04acb43764c2b1261a2de7b4ee2a27acfed4e03b))
* **frontend:** 修复发送新消息后上一条 Assistant 轮次 toolbar 消失的问题 ([#273](https://github.com/syrizelink/OpenFic/issues/273)) ([ae8eda2](https://github.com/syrizelink/OpenFic/commit/ae8eda2d162e6e65057f20ecc1582055548789f7))
* **frontend:** 收起下拉框时不再误关闭设置面板 ([#297](https://github.com/syrizelink/OpenFic/issues/297)) ([c4e0b47](https://github.com/syrizelink/OpenFic/commit/c4e0b479a5642c7804dbdf68d448b913605284a1))
* **projects:** 修复项目列表加载不完全导致分页、搜索和排序失效的问题 ([#284](https://github.com/syrizelink/OpenFic/issues/284)) ([82af99e](https://github.com/syrizelink/OpenFic/commit/82af99e687ff0d57842a70489d39146eb5191059))


### ⚡ 性能优化

* **backend:** 优化检索索引状态与模型提供商列表接口性能 ([#291](https://github.com/syrizelink/OpenFic/issues/291)) ([c77b264](https://github.com/syrizelink/OpenFic/commit/c77b264eafc2c15e78793bd01d5cc32f6d7e4437))


### ✅ 测试

* **desktop:** 新增基于源码后端的本地开发模式 ([#304](https://github.com/syrizelink/OpenFic/issues/304)) ([84d63f1](https://github.com/syrizelink/OpenFic/commit/84d63f1aa6905896596818427f3f3275bcebc40e))
* **frontend:** 新增 Agent 会话生命周期 E2E 测试 ([#308](https://github.com/syrizelink/OpenFic/issues/308)) ([9478baf](https://github.com/syrizelink/OpenFic/commit/9478baf2f46317bd859deb21042c0bb02ce55441))

## [0.9.2](https://github.com/syrizelink/OpenFic/compare/v0.9.1...v0.9.2) (2026-08-08)


### 🐛 问题修复

* **agent_runtime:** 修复 LLM 调用无超时保护且盲目重试导致会话卡死的问题 ([#261](https://github.com/syrizelink/OpenFic/issues/261)) ([46535a0](https://github.com/syrizelink/OpenFic/commit/46535a0dbd652aad50369657d8e297aad3f4b48f))
* **agent:** 修复中断暂停状态的会话无法恢复的问题 ([#267](https://github.com/syrizelink/OpenFic/issues/267)) ([6029bc3](https://github.com/syrizelink/OpenFic/commit/6029bc37a53cff4054ed08f7dcca626b29398453))
* **agent:** 修复工具调用未并行执行的问题 ([#266](https://github.com/syrizelink/OpenFic/issues/266)) ([aefcd90](https://github.com/syrizelink/OpenFic/commit/aefcd90f1004f2bf8af887ff785d8532eb982492))
* **agent:** 限制智能体列表高度并支持滚动 ([#268](https://github.com/syrizelink/OpenFic/issues/268)) ([fa44696](https://github.com/syrizelink/OpenFic/commit/fa44696ea94d7b65c16e6d07f7a88642e3e8a7b2))
* **frontend:** 修复仪表盘图表日期范围与标签重叠的问题 ([#264](https://github.com/syrizelink/OpenFic/issues/264)) ([e3996ba](https://github.com/syrizelink/OpenFic/commit/e3996ba34703bb7e92b86b7e03f3feb6e98fe3c8))
* **frontend:** 修复同行内粘贴文本被拆分换行的问题 ([#258](https://github.com/syrizelink/OpenFic/issues/258)) ([45c3d6a](https://github.com/syrizelink/OpenFic/commit/45c3d6a19950dfd9f57c4d9bd3164f428453bba5))
* **frontend:** 修复移动端编辑器菜单点击无效导致复制粘贴不可用的问题 ([#260](https://github.com/syrizelink/OpenFic/issues/260)) ([ba4ba07](https://github.com/syrizelink/OpenFic/commit/ba4ba07c0e00723e400ec476d714abc476492174))


### ⚡ 性能优化

* **frontend:** 虚拟化 Agent 消息列表并合并流式增量渲染 ([#257](https://github.com/syrizelink/OpenFic/issues/257)) ([87aa448](https://github.com/syrizelink/OpenFic/commit/87aa448add26bce1dfb9dc925a6db72473d63ebd))
* **world-info:** 虚拟化世界书条目列表并优化拖拽排序 ([#254](https://github.com/syrizelink/OpenFic/issues/254)) ([ad94f34](https://github.com/syrizelink/OpenFic/commit/ad94f340c043999d5f8d6dc25580c559cec7edb0))


### 🔧 杂项

* **agent:** 添加会话计时器 ([#262](https://github.com/syrizelink/OpenFic/issues/262)) ([70e9652](https://github.com/syrizelink/OpenFic/commit/70e96528066389d7cb30329be6bbcd2d455f34e3))
* 添加压缩系统提示词选项 ([#263](https://github.com/syrizelink/OpenFic/issues/263)) ([5dbc83d](https://github.com/syrizelink/OpenFic/commit/5dbc83d2ef45ef341cd71b295664194a1934642d))

## [0.9.1](https://github.com/syrizelink/OpenFic/compare/v0.9.0...v0.9.1) (2026-08-05)


### 🐛 问题修复

* **agent:** 修复 ask_user 问题面板内容无法滚动的问题 ([#249](https://github.com/syrizelink/OpenFic/issues/249)) ([2921d0a](https://github.com/syrizelink/OpenFic/commit/2921d0aa743aaf418d07277bed9f59af67508f57))
* **backend:** 修复测试夹具重复初始化导致后端测试耗时过长的问题 ([#241](https://github.com/syrizelink/OpenFic/issues/241)) ([a355e7f](https://github.com/syrizelink/OpenFic/commit/a355e7f16a5afc14da98cc238fc4a021a9e73973))
* **desktop:** 修复 Socket 首次连接失败导致启动中断的问题 ([#248](https://github.com/syrizelink/OpenFic/issues/248)) ([7b84765](https://github.com/syrizelink/OpenFic/commit/7b847652037b165f3f7129e59c3564ce617a290c))
* **desktop:** 修复启动时窗口延迟显示的问题 ([#246](https://github.com/syrizelink/OpenFic/issues/246)) ([6d0e05f](https://github.com/syrizelink/OpenFic/commit/6d0e05f97753a3bcdd329be6f9a311b07714b4b6))
* **desktop:** 修复更新元数据缺失导致检查报错的问题 ([#239](https://github.com/syrizelink/OpenFic/issues/239)) ([3b77aab](https://github.com/syrizelink/OpenFic/commit/3b77aabe38134b34f46331d687fd0ca7ba4e8217))
* **index:** 修复分块配置保存使用旧输入值的问题 ([#250](https://github.com/syrizelink/OpenFic/issues/250)) ([ed75ce4](https://github.com/syrizelink/OpenFic/commit/ed75ce46a9be88a6044277d74abf5fe11123bf16))


### 👷 CI/CD

* **desktop:** 修复多架构构建导致发布包损坏的问题 ([#247](https://github.com/syrizelink/OpenFic/issues/247)) ([7ffe8cd](https://github.com/syrizelink/OpenFic/commit/7ffe8cd1a254e2c2b892bb806d6c83e75edd156f))

## [0.9.0](https://github.com/syrizelink/OpenFic/compare/v0.8.1...v0.9.0) (2026-08-04)


### ✨ 新功能

* **agent:** 支持用户消息图片附件输入 ([#229](https://github.com/syrizelink/OpenFic/issues/229)) ([2c12697](https://github.com/syrizelink/OpenFic/commit/2c126978b101dc3c76b43556e7017084f27f97f2))
* **desktop:** 添加壳层国际化支持 ([#223](https://github.com/syrizelink/OpenFic/issues/223)) ([90f26c1](https://github.com/syrizelink/OpenFic/commit/90f26c16a764c941124a3e70c8b2693b32a5f1d9))


### 🐛 问题修复

* **editor:** 修复移动端正文点击重复呼出键盘的问题 ([#226](https://github.com/syrizelink/OpenFic/issues/226)) ([79d03fa](https://github.com/syrizelink/OpenFic/commit/79d03fa3c9f32dc8183e7b2ce234d747c12bef5d))
* **providers:** 修复目录中部分提供商端点 URL 缺失的问题 ([#230](https://github.com/syrizelink/OpenFic/issues/230)) ([0006c90](https://github.com/syrizelink/OpenFic/commit/0006c906b8c878c07859d3e2b7afda02f4b2e2a1))
* **storage:** 清理数据库关联运行时数据 ([#238](https://github.com/syrizelink/OpenFic/issues/238)) ([b8d2ca5](https://github.com/syrizelink/OpenFic/commit/b8d2ca5d58d64ecaf2acee919a0638104b0dce72))
* **summary:** 修复跨卷删除章节导致区间摘要丢失的问题 ([#225](https://github.com/syrizelink/OpenFic/issues/225)) ([9ecaa07](https://github.com/syrizelink/OpenFic/commit/9ecaa07fb38e9eb845135aabe0336d21adc0966c))


### 🔧 杂项

* **desktop:** 添加桌面端菜单栏 ([#221](https://github.com/syrizelink/OpenFic/issues/221)) ([0d9bbe8](https://github.com/syrizelink/OpenFic/commit/0d9bbe8dc9f5cfb186cf2a196b40b4d577c113b1))

## [0.8.1](https://github.com/syrizelink/OpenFic/compare/v0.8.0...v0.8.1) (2026-07-31)


### 🐛 问题修复

* **agent:** 修复旧会话配置无法恢复的问题 ([#202](https://github.com/syrizelink/OpenFic/issues/202)) ([ac9a59b](https://github.com/syrizelink/OpenFic/commit/ac9a59bea251a6bed4fb4ffcde005e74ee665151))
* **agent:** 修复编辑工具转义空白匹配失败的问题 ([#214](https://github.com/syrizelink/OpenFic/issues/214)) ([649b87b](https://github.com/syrizelink/OpenFic/commit/649b87b801458bfd3b1c44e84215a299b8eaa174))
* **agent:** 修复重启后会话设置持续锁定的问题 ([#216](https://github.com/syrizelink/OpenFic/issues/216)) ([33555ff](https://github.com/syrizelink/OpenFic/commit/33555ff2c4d3a369938fd95e22fe64f276320a64))
* **dashboard:** 修复调用记录时间未转换时区的问题 ([#204](https://github.com/syrizelink/OpenFic/issues/204)) ([da977a8](https://github.com/syrizelink/OpenFic/commit/da977a8311b8effbed9506f204bb97eb2d8af6d7))
* **desktop:** 修复 macOS 运行时与安装包校验异常 ([#215](https://github.com/syrizelink/OpenFic/issues/215)) ([8ebac44](https://github.com/syrizelink/OpenFic/commit/8ebac44ab083b00b2de394f740badcc45c8773a0))
* **desktop:** 修复本地后端 Socket 代理连接失败的问题 ([#209](https://github.com/syrizelink/OpenFic/issues/209)) ([7ffbd78](https://github.com/syrizelink/OpenFic/commit/7ffbd78ea937e45a93d4faa571ef1434050f9f98))
* **frontend:** 新建角色后自动切换标签 ([#191](https://github.com/syrizelink/OpenFic/issues/191)) ([8f35b51](https://github.com/syrizelink/OpenFic/commit/8f35b51b38670982764b7615d64106d9944329ee))


### 🔧 杂项

* **editor:** 优化编辑器体验 ([#219](https://github.com/syrizelink/OpenFic/issues/219)) ([f3554d4](https://github.com/syrizelink/OpenFic/commit/f3554d47ea549dffebda9ad4f2289dc904cdfa6f))
* **provider:** 新增 Anthropic Compatible 提供商 ([#208](https://github.com/syrizelink/OpenFic/issues/208)) ([2000f79](https://github.com/syrizelink/OpenFic/commit/2000f79d522bd4140994bc3ce1c59799f85baa30))
* **skills:** 优化技能配置体验 ([#218](https://github.com/syrizelink/OpenFic/issues/218)) ([d7976c5](https://github.com/syrizelink/OpenFic/commit/d7976c583bdd3bf6d3a67c9efc3231b941d4c167))
* 优化角色和世界书列表体验 ([#212](https://github.com/syrizelink/OpenFic/issues/212)) ([191ed05](https://github.com/syrizelink/OpenFic/commit/191ed05888ced345ca4a0b78f58dfacc8b832ab4))

## [0.8.0](https://github.com/syrizelink/OpenFic/compare/v0.7.6...v0.8.0) (2026-07-29)


### ✨ 新功能

* **backend:** 为编辑工具引入模糊匹配与归一化机制 ([#165](https://github.com/syrizelink/OpenFic/issues/165)) ([5805078](https://github.com/syrizelink/OpenFic/commit/580507862debbe66d7ea221fc6deb339da71c211))
* **import:** 支持 TXT 分卷导入 ([#197](https://github.com/syrizelink/OpenFic/issues/197)) ([4c781ce](https://github.com/syrizelink/OpenFic/commit/4c781ce36a2baa4b5b1f8d2e82e51b72b659f28f))
* **writing:** 支持章节导出 ([#195](https://github.com/syrizelink/OpenFic/issues/195)) ([44171e8](https://github.com/syrizelink/OpenFic/commit/44171e86010c858540b2a23e78e11d01e1ef5532))


### 🐛 问题修复

* **agent:** 修复工具刷新失效问题 ([#185](https://github.com/syrizelink/OpenFic/issues/185)) ([905aae2](https://github.com/syrizelink/OpenFic/commit/905aae2574d2dd2dc15ffd771d0aa00f0cdc0c3e))
* **agent:** 修复跨页面切换导致的侧边栏状态丢失问题 ([#178](https://github.com/syrizelink/OpenFic/issues/178)) ([22b9a37](https://github.com/syrizelink/OpenFic/commit/22b9a37c018ab64828cc7fdb97cbc1fa2b923d7e))
* **agent:** 清理不可达的会话检查点 ([#184](https://github.com/syrizelink/OpenFic/issues/184)) ([8908120](https://github.com/syrizelink/OpenFic/commit/890812052a3542dd5a1e799753206d67f108cf54))
* **agent:** 避免中断会话普通消息状态冲突 ([#177](https://github.com/syrizelink/OpenFic/issues/177)) ([787669b](https://github.com/syrizelink/OpenFic/commit/787669b51dc6a6a1e6b34184a6acf3e38504d854))
* **backend:** 修复离线环境下的分词表加载失败的问题 ([#187](https://github.com/syrizelink/OpenFic/issues/187)) ([169d40b](https://github.com/syrizelink/OpenFic/commit/169d40b7410ef238f18cb669936e17473b7696cd))
* **ci:** 移除 PR 自查清单强制校验 ([#180](https://github.com/syrizelink/OpenFic/issues/180)) ([54df8c1](https://github.com/syrizelink/OpenFic/commit/54df8c1635f8ff1d7ba37f2289649ab0758af9bd))
* **ci:** 跳过发布 PR 检查 ([#174](https://github.com/syrizelink/OpenFic/issues/174)) ([2286422](https://github.com/syrizelink/OpenFic/commit/22864220d8f9732255587c3c921e0b21132a5d2d))
* **desktop:** 优化运行时连接流程 ([#199](https://github.com/syrizelink/OpenFic/issues/199)) ([83c78ad](https://github.com/syrizelink/OpenFic/commit/83c78ad119f3cc0c083fb15312af19673d3b4340))
* **desktop:** 修复系统缺失 tar 导致运行环境安装失败的问题 ([#188](https://github.com/syrizelink/OpenFic/issues/188)) ([9685c19](https://github.com/syrizelink/OpenFic/commit/9685c19d4058a3083a29d54dc00455110ab768de))
* **desktop:** 完善运行环境调试信息处理 ([#196](https://github.com/syrizelink/OpenFic/issues/196)) ([39f3e55](https://github.com/syrizelink/OpenFic/commit/39f3e55653e30d2cba7dece7425839a4ebae4d75))
* **frontend:** 修复编辑器剪贴板换行处理 ([#189](https://github.com/syrizelink/OpenFic/issues/189)) ([95daf32](https://github.com/syrizelink/OpenFic/commit/95daf32c59fc4931dd52dec07f7737e76661b676))
* **providers:** 避免图标请求阻塞连接操作 ([#183](https://github.com/syrizelink/OpenFic/issues/183)) ([70d9419](https://github.com/syrizelink/OpenFic/commit/70d9419832496b519ad629abf062fde3063d7b70))


### 🔧 杂项

* **agent:** 补充角色页 Agent 侧边栏 ([#176](https://github.com/syrizelink/OpenFic/issues/176)) ([ad4988e](https://github.com/syrizelink/OpenFic/commit/ad4988e85adedcc96911fca85338eff48daad488))
* **backend:** 为 OpenAI Compatible 提供商添加思考强度支持 ([#192](https://github.com/syrizelink/OpenFic/issues/192)) ([195615f](https://github.com/syrizelink/OpenFic/commit/195615f4e22f0c33442e96d072a726de7363599d))
* **editor:** 新增单条正文内容长度限制 ([#193](https://github.com/syrizelink/OpenFic/issues/193)) ([cb87f42](https://github.com/syrizelink/OpenFic/commit/cb87f42a8803584e664519696ddce6aca6883def))


### 👷 CI/CD

* 添加 PR 检查工作流 ([#172](https://github.com/syrizelink/OpenFic/issues/172)) ([17ce3f7](https://github.com/syrizelink/OpenFic/commit/17ce3f752348dd0c965ae9b6c360b48cedd7e22d))

## [0.7.6](https://github.com/syrizelink/OpenFic/compare/v0.7.5...v0.7.6) (2026-07-26)


### 🐛 问题修复

* **backend:** 修复Windows上后台任务事件无法实时同步的问题 ([#148](https://github.com/syrizelink/OpenFic/issues/148)) ([f4e83e1](https://github.com/syrizelink/OpenFic/commit/f4e83e1c2e8affb07029750c64d2d6bd0f1779b3))
* **backend:** 修复开发服务器运行时配置异常 ([#152](https://github.com/syrizelink/OpenFic/issues/152)) ([e5e93ec](https://github.com/syrizelink/OpenFic/commit/e5e93ec324ca28ae0e6e06e698c59e97367da7b8))
* **backend:** 修复部分提供商流式 token 用量缺失的问题 ([#158](https://github.com/syrizelink/OpenFic/issues/158)) ([16376e9](https://github.com/syrizelink/OpenFic/commit/16376e9baa618cc91ce74217f5a354e74ec01d9f))
* **desktop:** 修复桌面端主题与字体无法跟随前端同步的问题 ([#157](https://github.com/syrizelink/OpenFic/issues/157)) ([a2f8ebf](https://github.com/syrizelink/OpenFic/commit/a2f8ebf495a67fa68d30c181fcdcdc6bd4afe70f))


### 📚 文档

* 更新 README 章节结构 ([#155](https://github.com/syrizelink/OpenFic/issues/155)) ([154fab7](https://github.com/syrizelink/OpenFic/commit/154fab748fd17b448cba173821234b7bc0acf70c))


### 🔧 杂项

* **desktop:** 添加窗口状态记忆能力 ([#159](https://github.com/syrizelink/OpenFic/issues/159)) ([eb0e1a4](https://github.com/syrizelink/OpenFic/commit/eb0e1a4816bcd6d9b0682a8c96190eb52e3fc3a6))
* 添加结构化 Issue 模板 ([#156](https://github.com/syrizelink/OpenFic/issues/156)) ([9e3b8ad](https://github.com/syrizelink/OpenFic/commit/9e3b8ad04912331507efa742d9963b7f1ed72883))

## [0.7.5](https://github.com/syrizelink/OpenFic/compare/v0.7.4...v0.7.5) (2026-07-26)


### 🐛 问题修复

* **agent:** 修复会话结束后设置仍锁定的问题 ([#137](https://github.com/syrizelink/OpenFic/issues/137)) ([103c392](https://github.com/syrizelink/OpenFic/commit/103c392043f2eb246a974e431e40d0e15058a391))
* **backend:** 修复 Ollama Cloud 地址覆盖导致的模型调用失败问题 ([#146](https://github.com/syrizelink/OpenFic/issues/146)) ([b5d116d](https://github.com/syrizelink/OpenFic/commit/b5d116d065dfa9db24ee8635a8d97b6cb8e2e9cd))
* **backend:** 修复 Windows 后台任务队列阻塞的问题 ([#147](https://github.com/syrizelink/OpenFic/issues/147)) ([cf1ffa1](https://github.com/syrizelink/OpenFic/commit/cf1ffa1e0c7b47e1c38c7a7019bcb8e91f38791f))
* **desktop:** 为桌面端运行环境添加国内下载源 ([#126](https://github.com/syrizelink/OpenFic/issues/126)) ([5ba142e](https://github.com/syrizelink/OpenFic/commit/5ba142e50d5fef9f6f425d56cc5612264fe09d14))
* **frontend:** 修复世界书开关状态错乱的问题 ([#138](https://github.com/syrizelink/OpenFic/issues/138)) ([7d5eb27](https://github.com/syrizelink/OpenFic/commit/7d5eb27da67edb5fdb3cc0aed4649a10892c08ae))
* **frontend:** 修复已删除项目仍可打开的问题 ([#129](https://github.com/syrizelink/OpenFic/issues/129)) ([0542e8f](https://github.com/syrizelink/OpenFic/commit/0542e8faeab65ae34292ac6d329a61e7772a4e68))
* **frontend:** 修复提示词编辑内容丢失和本地修改提示缺失的问题 ([#140](https://github.com/syrizelink/OpenFic/issues/140)) ([954d552](https://github.com/syrizelink/OpenFic/commit/954d5529c5941ac3172cf5a3b6b1d1cb636431db))
* **frontend:** 修复桌面端后端资源地址解析异常 ([#136](https://github.com/syrizelink/OpenFic/issues/136)) ([09c570f](https://github.com/syrizelink/OpenFic/commit/09c570f4ac0b96b88427eed48de76da80ef9e525))
* **frontend:** 取消提供商任务类型筛选 ([#143](https://github.com/syrizelink/OpenFic/issues/143)) ([f582c8e](https://github.com/syrizelink/OpenFic/commit/f582c8ef1b4bd98e3e3ee4f461fb4e0341f7ed23))
* **storage:** 修复章节排序更新冲突 ([#141](https://github.com/syrizelink/OpenFic/issues/141)) ([dade8e8](https://github.com/syrizelink/OpenFic/commit/dade8e899dbddf6ae8ab8eae190aa1a3e81be034))


### 🔧 杂项

* **frontend:** 添加系统默认字体选项 ([#128](https://github.com/syrizelink/OpenFic/issues/128)) ([3980ee2](https://github.com/syrizelink/OpenFic/commit/3980ee2af3d85c66016b0d2ada45c7058596ef8c))

## [0.7.4](https://github.com/syrizelink/OpenFic/compare/v0.7.3...v0.7.4) (2026-07-25)


### 🐛 问题修复

* **agent:** 优化会话运行状态提示 ([#122](https://github.com/syrizelink/OpenFic/issues/122)) ([04c6e2e](https://github.com/syrizelink/OpenFic/commit/04c6e2e6639c21594a90c9d5d9a5fe607c7a9dcc))
* **agent:** 优化用户消息展开动画 ([#120](https://github.com/syrizelink/OpenFic/issues/120)) ([00d9cc8](https://github.com/syrizelink/OpenFic/commit/00d9cc89a12984462f5a8eb80d0b3d372aa22446))
* **agent:** 修复回滚时卷章节数不同步的问题 ([#117](https://github.com/syrizelink/OpenFic/issues/117)) ([0e9bf90](https://github.com/syrizelink/OpenFic/commit/0e9bf908fb4f323f8737bcd7866ac54c4130e669))
* **agent:** 修复异常消息导致的僵尸会话 ([#123](https://github.com/syrizelink/OpenFic/issues/123)) ([84b95fe](https://github.com/syrizelink/OpenFic/commit/84b95fec91a65679d4f7a729515c4012b011af06))
* **agent:** 修复流式消息底部跟随失效的问题 ([#119](https://github.com/syrizelink/OpenFic/issues/119)) ([d79d3ed](https://github.com/syrizelink/OpenFic/commit/d79d3edc1e6e967dd20752645bc52c0e95fe6bb8))
* **agent:** 完善子智能体工具状态展示 ([#118](https://github.com/syrizelink/OpenFic/issues/118)) ([a908536](https://github.com/syrizelink/OpenFic/commit/a9085361cc32b46cc689c51a8d400c03ba0a1592))
* **frontend:** 防止写作编辑内容丢失 ([#116](https://github.com/syrizelink/OpenFic/issues/116)) ([06698db](https://github.com/syrizelink/OpenFic/commit/06698dbb1a400b3cebadc7f237527dc53aa0e0e5))


### 📚 文档

* **readme:** 同步项目文档内容 ([#124](https://github.com/syrizelink/OpenFic/issues/124)) ([736779c](https://github.com/syrizelink/OpenFic/commit/736779cebea82f1c69e699d887a6a76c9cda2ef8))


### 🔧 杂项

* **agent:** 调整内置智能体定义 ([#115](https://github.com/syrizelink/OpenFic/issues/115)) ([3dcdbb8](https://github.com/syrizelink/OpenFic/commit/3dcdbb82255e79a10059b69f8c3a41d966a8ed5e))
* **agent:** 调整内置智能体提示词 ([#121](https://github.com/syrizelink/OpenFic/issues/121)) ([211c7b0](https://github.com/syrizelink/OpenFic/commit/211c7b04f687bac675c6700ebe503fb598b4e73a))
* **skill:** 添加内置写作技能 ([#113](https://github.com/syrizelink/OpenFic/issues/113)) ([664d126](https://github.com/syrizelink/OpenFic/commit/664d12632b63b8c363bc3ead66a1197a8ff56826))

## [0.7.3](https://github.com/syrizelink/OpenFic/compare/v0.7.2...v0.7.3) (2026-07-19)


### 🐛 问题修复

* **agent:** 修复子智能体派发配置 ([#111](https://github.com/syrizelink/OpenFic/issues/111)) ([8906741](https://github.com/syrizelink/OpenFic/commit/89067410aee4246a7a912e61bfba46f50aeef946))
* **backend:** 修复会话标题生成异常 ([#108](https://github.com/syrizelink/OpenFic/issues/108)) ([429ee53](https://github.com/syrizelink/OpenFic/commit/429ee53f10f6f9cd3723b758259c833b4d708316))


### ♻️ 代码重构

* **agent:** 重构 Agent 工具上下文与中断恢复链路 ([#110](https://github.com/syrizelink/OpenFic/issues/110)) ([5ab5a2b](https://github.com/syrizelink/OpenFic/commit/5ab5a2bc722267ff0e7af7e13e5b1f1c4bc2de78))
* **dashboard:** 调用记录详情存储优化并记录工具引用 ([#107](https://github.com/syrizelink/OpenFic/issues/107)) ([c25b2c1](https://github.com/syrizelink/OpenFic/commit/c25b2c16673e860e8e0df3d614cec5169f3a2ff7))
* **model:** 统一高级参数配置 ([#109](https://github.com/syrizelink/OpenFic/issues/109)) ([f672970](https://github.com/syrizelink/OpenFic/commit/f672970f13567721b2ce6d731419e0ee1214a2e4))


### 🔧 杂项

* **agent:** 本地化适配工具权限展示文案 ([#112](https://github.com/syrizelink/OpenFic/issues/112)) ([362c129](https://github.com/syrizelink/OpenFic/commit/362c12903beee21373e9db124f6fafb5b08dfb41))
* **backend:** 调整摘要上下文结构 ([#106](https://github.com/syrizelink/OpenFic/issues/106)) ([6b2cf6d](https://github.com/syrizelink/OpenFic/commit/6b2cf6d8376e61daee7902a796dcda73342ade28))
* **frontend:** 添加最近打开项目入口 ([#104](https://github.com/syrizelink/OpenFic/issues/104)) ([16d6f4b](https://github.com/syrizelink/OpenFic/commit/16d6f4bb5b45edee3e1876c95e0783aea15a2f91))

## [0.7.2](https://github.com/syrizelink/OpenFic/compare/v0.7.1...v0.7.2) (2026-07-15)


### 🐛 问题修复

* **desktop:** 修复更新日志渲染 ([#102](https://github.com/syrizelink/OpenFic/issues/102)) ([2b75f25](https://github.com/syrizelink/OpenFic/commit/2b75f25b1d08ecccbc4e9b7bee1e727b21fe24bf))

## [0.7.1](https://github.com/syrizelink/OpenFic/compare/v0.7.0...v0.7.1) (2026-07-14)


### 🐛 问题修复

* **release:** 统一跨平台产物命名 ([#100](https://github.com/syrizelink/OpenFic/issues/100)) ([56def22](https://github.com/syrizelink/OpenFic/commit/56def22bf42fa660b0b1459929c7f928f1e02c09))

## [0.7.0](https://github.com/syrizelink/OpenFic/compare/v0.6.2...v0.7.0) (2026-07-14)


### ✨ 新功能

* **desktop:** 支持应用内自动更新 ([#99](https://github.com/syrizelink/OpenFic/issues/99)) ([bcd6eb9](https://github.com/syrizelink/OpenFic/commit/bcd6eb94fe846c4237b89ffdad87d620ec7706b0))


### 🔧 杂项

* **build:** 迁移前端与桌面端构建至 Vite+ ([#97](https://github.com/syrizelink/OpenFic/issues/97)) ([c77fd90](https://github.com/syrizelink/OpenFic/commit/c77fd907ce9a0a55eac24e3fc49094c03c188a25))

## [0.6.2](https://github.com/syrizelink/OpenFic/compare/v0.6.1...v0.6.2) (2026-07-13)


### 🐛 问题修复

* **agent:** 修复会话切换模型不生效 ([#91](https://github.com/syrizelink/OpenFic/issues/91)) ([26ef7f3](https://github.com/syrizelink/OpenFic/commit/26ef7f3beb202eb182b56ed483c144852be6d9c6))
* **agent:** 修复会话重连后流式事件丢失 ([#94](https://github.com/syrizelink/OpenFic/issues/94)) ([018749c](https://github.com/syrizelink/OpenFic/commit/018749caeea11f98d5f8405f17f7868949b3dbba))
* **agent:** 防止会话检查点泄露模型密钥 ([#92](https://github.com/syrizelink/OpenFic/issues/92)) ([0342427](https://github.com/syrizelink/OpenFic/commit/034242754890db39d2296f3b489c2c2317eb37e7))
* **mobile:** 修复移动端布局适配问题 ([#96](https://github.com/syrizelink/OpenFic/issues/96)) ([f396b34](https://github.com/syrizelink/OpenFic/commit/f396b34066577be9a9a3e5bbef4ace3192b7b1f4))
* **settings:** 锁定运行期间的智能体配置 ([#93](https://github.com/syrizelink/OpenFic/issues/93)) ([6afd4b0](https://github.com/syrizelink/OpenFic/commit/6afd4b0e9fa8c106917e8d3ec07f32255c30f7e4))


### ♻️ 代码重构

* **prompt-chains:** 重构提示词管理页面 ([#95](https://github.com/syrizelink/OpenFic/issues/95)) ([73db522](https://github.com/syrizelink/OpenFic/commit/73db52232f506edb9bda8e76156382aef4508310))


### 🔧 杂项

* **agent:** 限制子智能体委派与提问能力 ([#90](https://github.com/syrizelink/OpenFic/issues/90)) ([9999283](https://github.com/syrizelink/OpenFic/commit/999928376012548bfca968aab270f38e7bcd3a83))
* **models:** 优化模型选择器并移除Provider图标上传 ([#87](https://github.com/syrizelink/OpenFic/issues/87)) ([436f761](https://github.com/syrizelink/OpenFic/commit/436f761611ee57c67bcf0cdad72284b85a9fafaf))
* **providers:** 优化内置提供商选取、刷新与调用 ([#89](https://github.com/syrizelink/OpenFic/issues/89)) ([0fe4188](https://github.com/syrizelink/OpenFic/commit/0fe418852730254789473fdcd96993136f7dabc2))

## [0.6.1](https://github.com/syrizelink/OpenFic/compare/v0.6.0...v0.6.1) (2026-07-11)


### 🐛 问题修复

* **backend:** 去重会话标题后台任务 ([#82](https://github.com/syrizelink/OpenFic/issues/82)) ([afd9650](https://github.com/syrizelink/OpenFic/commit/afd96506fff12d006383bedaae83c8273349a8c6))
* **background:** 修复孤儿后台任务无法自动清理的问题 ([#83](https://github.com/syrizelink/OpenFic/issues/83)) ([643531d](https://github.com/syrizelink/OpenFic/commit/643531d73f86a860832305651bdc03a829ba136b))
* **frontend:** 修复规则编辑区布局 ([#85](https://github.com/syrizelink/OpenFic/issues/85)) ([025efad](https://github.com/syrizelink/OpenFic/commit/025efad2f6ddf624b7d37242bfd180f8fa1ad4e2))
* **index:** 修复索引取消清理与轮询导致的性能问题 ([#86](https://github.com/syrizelink/OpenFic/issues/86)) ([73fa08e](https://github.com/syrizelink/OpenFic/commit/73fa08e0f2c7e8049058e085837a45feb5cfeb28))


### ♻️ 代码重构

* **agent:** 重构 mention XML 流转链路 ([#78](https://github.com/syrizelink/OpenFic/issues/78)) ([28e7b16](https://github.com/syrizelink/OpenFic/commit/28e7b16aeb6c9d8288cd2d27210f075883a5d0ac))
* **agent:** 重构 Skill 功能 ([#77](https://github.com/syrizelink/OpenFic/issues/77)) ([97e1f5e](https://github.com/syrizelink/OpenFic/commit/97e1f5e20083de7b2f1ca22073bbbd42314abe9c))
* **index:** 重构索引面板与进度展示 ([#80](https://github.com/syrizelink/OpenFic/issues/80)) ([eff0886](https://github.com/syrizelink/OpenFic/commit/eff0886281ac277ccc49e03ab6cba8c3ec0c2eb3))
* **summary:** 重构摘要生成面板与交互体验 ([#84](https://github.com/syrizelink/OpenFic/issues/84)) ([8e16a19](https://github.com/syrizelink/OpenFic/commit/8e16a19204ff9718fcf7a25b38719a80c9c2cf52))


### 📚 文档

* 更新README ([#79](https://github.com/syrizelink/OpenFic/issues/79)) ([869b98c](https://github.com/syrizelink/OpenFic/commit/869b98c248dd442c96165a47883b2ff011d697df))


### 🔧 杂项

* **frontend:** 适配角色与世界书移动端顶栏 ([#74](https://github.com/syrizelink/OpenFic/issues/74)) ([1824117](https://github.com/syrizelink/OpenFic/commit/1824117893de708fe7c802379021885236e2ea2b))
* **status-bar:** 添加索引进度展示 ([#81](https://github.com/syrizelink/OpenFic/issues/81)) ([84f94c7](https://github.com/syrizelink/OpenFic/commit/84f94c725854e42d1e3a80cff82c707ebe30b643))

## [0.6.0](https://github.com/syrizelink/OpenFic/compare/v0.5.0...v0.6.0) (2026-07-07)


### ✨ 新功能

* **agent:** 添加角色工具与回滚支持 ([#70](https://github.com/syrizelink/OpenFic/issues/70)) ([4d2bbf0](https://github.com/syrizelink/OpenFic/commit/4d2bbf06bef79b9fd97f2be414c6a5b779c5c865))
* **characters:** 添加角色管理功能 ([#64](https://github.com/syrizelink/OpenFic/issues/64)) ([1d1626a](https://github.com/syrizelink/OpenFic/commit/1d1626a316c5bcd0471f54807ae29a1ee81df918))
* **frontend:** 添加全局状态栏 ([#71](https://github.com/syrizelink/OpenFic/issues/71)) ([d584d56](https://github.com/syrizelink/OpenFic/commit/d584d560a6e05747655a4538593da48eaee87fbe))


### ♻️ 代码重构

* **frontend:** 将仪表盘图表库替换为 Nivo ([#72](https://github.com/syrizelink/OpenFic/issues/72)) ([3cbd4b7](https://github.com/syrizelink/OpenFic/commit/3cbd4b7389e39bf80d26d7ac8a24a85ae1a39a05))


### 🔧 杂项

* **api:** 世界书改为项目强绑定 ([#73](https://github.com/syrizelink/OpenFic/issues/73)) ([393add6](https://github.com/syrizelink/OpenFic/commit/393add677c755ddd60bf1019ebd6110b75b462b3))
* **backend:** 添加 justfile 后端命令封装 ([#69](https://github.com/syrizelink/OpenFic/issues/69)) ([d66b128](https://github.com/syrizelink/OpenFic/commit/d66b1282ef7a4934a11827e793b894937f0cfc86))
* **backend:** 迁移类型检查到 ty ([#68](https://github.com/syrizelink/OpenFic/issues/68)) ([d404696](https://github.com/syrizelink/OpenFic/commit/d40469688379706a176958cf6407d747a8c6b85c))
* **frontend:** 添加 Oxfmt 格式化支持 ([#67](https://github.com/syrizelink/OpenFic/issues/67)) ([40e2efd](https://github.com/syrizelink/OpenFic/commit/40e2efd7890749378e76958d85a9da0819789fdf))
* **frontend:** 迁移前端检查到 Oxlint ([#66](https://github.com/syrizelink/OpenFic/issues/66)) ([7c10648](https://github.com/syrizelink/OpenFic/commit/7c10648bcd31ab6f71248e8af5aa4d0f7414ac51))

## [0.5.0](https://github.com/syrizelink/OpenFic/compare/v0.4.9...v0.5.0) (2026-07-04)


### ✨ 新功能

* **agent:** 支持世界书条目与回滚 ([#59](https://github.com/syrizelink/OpenFic/issues/59)) ([b02549d](https://github.com/syrizelink/OpenFic/commit/b02549d8ab8dc050478f98d8e95601c95ade3295))
* **frontend:** 添加 PWA 支持实现可安装应用 ([#56](https://github.com/syrizelink/OpenFic/issues/56)) ([bd623fb](https://github.com/syrizelink/OpenFic/commit/bd623fb73c87733a58e3d521cf9f066bcc0ccde7))


### 🐛 问题修复

* **agent:** 修复 subagent 回滚状态恢复 ([#60](https://github.com/syrizelink/OpenFic/issues/60)) ([b5fa608](https://github.com/syrizelink/OpenFic/commit/b5fa60852a1031f9626e0fff201b719da77cb4c0))
* **frontend:** 修复 Agent 消息完成重新挂载的问题 ([#61](https://github.com/syrizelink/OpenFic/issues/61)) ([10e2e53](https://github.com/syrizelink/OpenFic/commit/10e2e53811853d2b26c1bcdec5dd1152a02f1223))
* **frontend:** 修复 Agent 消息流式展示顺序 ([#63](https://github.com/syrizelink/OpenFic/issues/63)) ([9b4ee74](https://github.com/syrizelink/OpenFic/commit/9b4ee74f4e0f0481cba5f5c021ca0b61aa06c0f9))
* **frontend:** 调整 Agent 工具消息展示 ([#62](https://github.com/syrizelink/OpenFic/issues/62)) ([f6ccfbb](https://github.com/syrizelink/OpenFic/commit/f6ccfbb2d853ac009a13def1b96d5cad1043cffa))


### 🔧 杂项

* 调整 Agent 会话命名与任务列表交互 ([#58](https://github.com/syrizelink/OpenFic/issues/58)) ([741d2e3](https://github.com/syrizelink/OpenFic/commit/741d2e369a37c11d28f3831fd5eb5d777b09ab46))

## [0.4.9](https://github.com/syrizelink/OpenFic/compare/v0.4.8...v0.4.9) (2026-07-02)


### 🐛 问题修复

* **assistant:** 使用稳定的 diff section type ([#50](https://github.com/syrizelink/OpenFic/issues/50)) ([27decdc](https://github.com/syrizelink/OpenFic/commit/27decdcdf4bfe1fb6404d73a552fa1cc53958876))
* **frontend:** 修复 Agent 侧边栏模型图标显示 ([#54](https://github.com/syrizelink/OpenFic/issues/54)) ([9eeaaff](https://github.com/syrizelink/OpenFic/commit/9eeaaff74c83a8d492eeb8fd3aa096017a89804c))
* **frontend:** 对齐 Agent 工具消息注册 ([#55](https://github.com/syrizelink/OpenFic/issues/55)) ([b7942f5](https://github.com/syrizelink/OpenFic/commit/b7942f5cab56836dbeb3f837e4e6ad5deff373b3))


### 🔧 杂项

* **frontend:** 统一设置面板加载行为 ([#52](https://github.com/syrizelink/OpenFic/issues/52)) ([798e8ad](https://github.com/syrizelink/OpenFic/commit/798e8add8df5d24c93bbf0d1118049f6b4412ea4))
* **frontend:** 补齐前端界面 i18n 文案接入 ([#51](https://github.com/syrizelink/OpenFic/issues/51)) ([7932bf7](https://github.com/syrizelink/OpenFic/commit/7932bf7e4f3175746677f1be990164ca64e3bc24))
* **frontend:** 调整设置面板模型禁用态 ([#53](https://github.com/syrizelink/OpenFic/issues/53)) ([86449ec](https://github.com/syrizelink/OpenFic/commit/86449ece001aa8dbf210d322d19522ed81d8f620))


### 👷 CI/CD

* **release:** 修复每次 PR 都触发发版 ([#48](https://github.com/syrizelink/OpenFic/issues/48)) ([5668036](https://github.com/syrizelink/OpenFic/commit/5668036edb098c386ec8369867f21e21c9b0bd60))

## [0.4.8](https://github.com/syrizelink/OpenFic/compare/v0.4.7...v0.4.8) (2026-07-01)


### 🔧 杂项

* **frontend:** 调整设置面板自动保存 ([#46](https://github.com/syrizelink/OpenFic/issues/46)) ([a94d0eb](https://github.com/syrizelink/OpenFic/commit/a94d0ebf7683e2b864c5ba3539ede0f38bce66e9))

## [0.4.7](https://github.com/syrizelink/OpenFic/compare/v0.4.6...v0.4.7) (2026-07-01)


### 🐛 问题修复

* **desktop:** 修复本地后端启动 ([#43](https://github.com/syrizelink/OpenFic/issues/43)) ([12440f7](https://github.com/syrizelink/OpenFic/commit/12440f715495a2755c81a7be794426ca2cb7027b))

## [0.4.6](https://github.com/syrizelink/OpenFic/compare/v0.4.5...v0.4.6) (2026-07-01)


### 🐛 问题修复

* **desktop:** 修复本地运行时安装 ([#41](https://github.com/syrizelink/OpenFic/issues/41)) ([f77988b](https://github.com/syrizelink/OpenFic/commit/f77988ba27449fb0708bfcce6395027f4e067ea3))

## [0.4.5](https://github.com/syrizelink/OpenFic/compare/v0.4.4...v0.4.5) (2026-07-01)


### 👷 CI/CD

* **package:** 优化发布缓存复用 ([#39](https://github.com/syrizelink/OpenFic/issues/39)) ([68f9542](https://github.com/syrizelink/OpenFic/commit/68f954246c1e1f9307313cda7c8e8f6082be2f8b))

## [0.4.4](https://github.com/syrizelink/OpenFic/compare/v0.4.3...v0.4.4) (2026-07-01)


### 🐛 问题修复

* **desktop:** 修复 Windows 构建样式解析 ([#37](https://github.com/syrizelink/OpenFic/issues/37)) ([e837bb1](https://github.com/syrizelink/OpenFic/commit/e837bb14ea17d2a3ef46b0de6d6a72590f3778a9))

## [0.4.3](https://github.com/syrizelink/OpenFic/compare/v0.4.2...v0.4.3) (2026-07-01)


### 👷 CI/CD

* **release:** 等待 release PR 可合并 ([#35](https://github.com/syrizelink/OpenFic/issues/35)) ([6105251](https://github.com/syrizelink/OpenFic/commit/6105251aa84f173ca9eb998dd229e05e5f243ac2))

## [0.4.2](https://github.com/syrizelink/OpenFic/compare/v0.4.1...v0.4.2) (2026-07-01)


### 🐛 问题修复

* **ci:** 修复桌面发布流程 ([#33](https://github.com/syrizelink/OpenFic/issues/33)) ([9f100fc](https://github.com/syrizelink/OpenFic/commit/9f100fc8c4ab75f09f5fd5262cfbe7ca66e62353))

## [0.4.1](https://github.com/syrizelink/OpenFic/compare/v0.4.0...v0.4.1) (2026-07-01)


### 🐛 问题修复

* **ci:** 调整发布打包流程 ([#31](https://github.com/syrizelink/OpenFic/issues/31)) ([f83451a](https://github.com/syrizelink/OpenFic/commit/f83451a76225daa2c4d1669e93ef9f7f5309f52b))

## [0.4.0](https://github.com/syrizelink/OpenFic/compare/v0.3.3...v0.4.0) (2026-07-01)


### ✨ 新功能

* **desktop:** 添加桌面端应用 ([#29](https://github.com/syrizelink/OpenFic/issues/29)) ([77c7789](https://github.com/syrizelink/OpenFic/commit/77c7789e322b3a7ee029c4837272bf8a7c10df28))

## [0.3.3](https://github.com/syrizelink/OpenFic/compare/v0.3.2...v0.3.3) (2026-06-30)


### 🐛 问题修复

* **backend:** 完善后端分发构建与启动入口 ([86b3d77](https://github.com/syrizelink/OpenFic/commit/86b3d77baff1a5cc5d57e1617fc6e619eb1090d0))
* **backend:** 完善后端构建与分发流程 ([#27](https://github.com/syrizelink/OpenFic/issues/27)) ([86b3d77](https://github.com/syrizelink/OpenFic/commit/86b3d77baff1a5cc5d57e1617fc6e619eb1090d0))
* **backend:** 完善后端构建与分发流程 ([#27](https://github.com/syrizelink/OpenFic/issues/27)) ([86b3d77](https://github.com/syrizelink/OpenFic/commit/86b3d77baff1a5cc5d57e1617fc6e619eb1090d0))


### ♻️ 代码重构

* **backend:** 统一后台运行日志输出 ([86b3d77](https://github.com/syrizelink/OpenFic/commit/86b3d77baff1a5cc5d57e1617fc6e619eb1090d0))


### 📚 文档

* **readme:** 更新项目介绍与发布提示 ([86b3d77](https://github.com/syrizelink/OpenFic/commit/86b3d77baff1a5cc5d57e1617fc6e619eb1090d0))

## [0.3.2](https://github.com/syrizelink/OpenFic/compare/v0.3.1...v0.3.2) (2026-06-29)


### 🐛 问题修复

* **frontend:** 完善移动端适配 ([#25](https://github.com/syrizelink/OpenFic/issues/25)) ([a971904](https://github.com/syrizelink/OpenFic/commit/a971904f00466b53203aa87fb146330aad5e710a))

## [0.3.1](https://github.com/syrizelink/OpenFic/compare/v0.3.0...v0.3.1) (2026-06-29)


### 🐛 问题修复

* **ci:** 等待 release PR 可合并后再自动合并 ([#23](https://github.com/syrizelink/OpenFic/issues/23)) ([d868fc6](https://github.com/syrizelink/OpenFic/commit/d868fc6647d0f5cd8097f3e19c55a4f1c8546233))

## [0.3.0](https://github.com/syrizelink/OpenFic/compare/v0.2.6...v0.3.0) (2026-06-29)


### ✨ 新功能

* **frontend:** 补齐前端国际化文案并对齐英文翻译 ([#21](https://github.com/syrizelink/OpenFic/issues/21)) ([59d4249](https://github.com/syrizelink/OpenFic/commit/59d4249bfdfdb2b5867a789a7951e5812de8a011))

## [0.2.6](https://github.com/syrizelink/OpenFic/compare/v0.2.5...v0.2.6) (2026-06-29)


### 🐛 问题修复

* **ci:** 同步 uv.lock 并修正后端包名 ([#19](https://github.com/syrizelink/OpenFic/issues/19)) ([344bd82](https://github.com/syrizelink/OpenFic/commit/344bd82c5ac43ad85203f8d09ad340e5e4d46e18))

## [0.2.5](https://github.com/syrizelink/OpenFic/compare/v0.2.4...v0.2.5) (2026-06-29)


### 🐛 问题修复

* **ci:** 修复 release-please 未更新后端版本号及镜像版本 ([#17](https://github.com/syrizelink/OpenFic/issues/17)) ([de2bbdc](https://github.com/syrizelink/OpenFic/commit/de2bbdc611cfb2615bc5be1987d4a82066dcd6e9))

## [0.2.4](https://github.com/syrizelink/OpenFic/compare/v0.2.3...v0.2.4) (2026-06-29)


### 🐛 问题修复

* **agent:** 移除子计划依赖并改用笔记大纲 ([#15](https://github.com/syrizelink/OpenFic/issues/15)) ([da97a8b](https://github.com/syrizelink/OpenFic/commit/da97a8be36256a814677a20d540f853713f496f5))

## [0.2.3](https://github.com/syrizelink/OpenFic/compare/v0.2.2...v0.2.3) (2026-06-28)


### 🐛 问题修复

* **build:** 修正 electron-builder 配置并启用 changelog 作者显示 ([#13](https://github.com/syrizelink/OpenFic/issues/13)) ([82532ee](https://github.com/syrizelink/OpenFic/commit/82532ee37eb92e6965056b0e56c41c9a37fbbc8b))

## [0.2.2](https://github.com/syrizelink/OpenFic/compare/v0.2.1...v0.2.2) (2026-06-28)


### 🐛 问题修复

* **ci:** 修复 Docker 推送 403 与版本号同步缺失 ([ed002f5](https://github.com/syrizelink/OpenFic/commit/ed002f5e276402f5302675fa4ff6688c2acdc6a4))

## [0.2.1](https://github.com/syrizelink/OpenFic/compare/v0.2.0...v0.2.1) (2026-06-28)


### 🐛 问题修复

* **test:** 移除引用已迁移路径与偶发卡死的失效测试 ([eb638df](https://github.com/syrizelink/OpenFic/commit/eb638df74a1754c65351ec924098edabd7c15ebe))

## [0.2.0](https://github.com/syrizelink/OpenFic/compare/v0.1.0...v0.2.0) (2026-06-28)


### ✨ 新功能

* 完善项目 README 文档 ([ca919a2](https://github.com/syrizelink/OpenFic/commit/ca919a2f376937da1cd7aa8179a735bf45c8896c))


### 🐛 问题修复

* **ci:** 修复 release PR 合并命令参数解析 ([cf42194](https://github.com/syrizelink/OpenFic/commit/cf421944b77747de1b4c78b8925621d85e74f461))
* **ci:** 修正 release-please manifest 配置结构 ([3bf931b](https://github.com/syrizelink/OpenFic/commit/3bf931bdc53f244f01faf8115dca453e3232dd18))
* **ci:** 合并 release PR 前增加 checkout ([e1bf61a](https://github.com/syrizelink/OpenFic/commit/e1bf61a01fc477a73076d77b433fd42113bf1c2f))
