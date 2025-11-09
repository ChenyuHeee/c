# [1.3.10] - 2025-11-07
# [1.3.10] - 2025-11-07
### Changed
- GitHub 用户名从 `DanielHe666` 迁移为 `ChenyuHeee`：更新所有示例与链接（README、提交页、Serverless 示例、榜单数据）。
- 移除“一键提交”功能：禁用 `window.__CONFIG__.submitEndpoint` 与公钥配置，取消 Cloudflare Worker 提交路径。
- 提交流程回归简化模式：评测通过后前端生成 v3 加密 JSON（包含 `enc`/`encCode`/`key`），选手在 Fork 仓库路径 `submissions/week-<n>/<handle>/solution.c` 中粘贴该密文文件并发 PR。
- 排行榜代码列不再跳转 GitHub，而是指向站点内部 `competition/view.html` 页面，前端自动解析并解密显示源码。
 - Week 题面采用“两步提交”：AC 前仅显示“评测代码”，AC 后才显示“生成密文”用于粘贴到 fork 的 `solution.c`。
 - 新增自动复制与粘贴体验（v1.3.12）：
	 - 题面页（Week 1）在生成密文 JSON 后自动写入剪贴板，并在状态区提示是否成功；失败则仍提供手动复制区。
	 - “提交页”增加“自动粘贴密文”按钮：无 `#submission=` 哈希时可从剪贴板直接填充并解析 v3 slim JSON，展示校验元数据与路径预览。
	 - “提交页”指引文案更新，更加面向新手、列出 Fork + 新建文件 + 粘贴 + PR 的步骤编号。
	 - 提交页统一缓存与复用 DOM 引用，减少重复查询，提升可维护性。
	 - 版本号提升为 `v1.3.12` 以刷新缓存并标记此 UX 改进。
	- 提交页新增“教程”按钮（新标签页）直达 `submission_guide/index.md`，便于首次参赛快速上手。

	# [1.3.13] - 2025-11-09
	### Added
	- 新增 `submission_guide/index.html`：在站内渲染 `submission_guide/index.md` 的教程页面（深色主题、适配移动端）。
	- `competition/submit.html` 的“教程”按钮改为指向渲染后的 HTML（`submission_guide/index.html`），阅读体验更佳。

	### Changed
	- 提升版本为 `v1.3.13` 以刷新缓存。

	# [1.3.14] - 2025-11-09
	### Added
	- 教程页新增“步骤目录导航”侧边栏：
		- 自动识别 Markdown 中以“第…步”开头的段落，按步分节生成锚点。
		- 右侧目录支持平滑滚动与滚动高亮（Scroll Spy）。
		- 小屏设备下自动隐藏侧栏以保证阅读空间。

	### Changed
	- 版本号提升为 `v1.3.14` 以刷新缓存。

	# [1.3.15] - 2025-11-09
	### Changed
	- 赛事全站品牌从“每周挑战 Weekly”统一更新为 “C Code Golf”（包含入口页、教程、榜单、关于、测试文案等）。
	- 术语初步从 “Week” 过渡为 “Round”。
	- 提升版本号至 `v1.3.15` 触发缓存刷新。

	# [1.3.16] - 2025-11-09
	### Added
	- 动态积分系统（天梯榜 Ladder）：为每轮配置难度积分 D；第一名获得满分 D，其余选手积分= round(D × 最小字节数 / 自身字节数)。积分随历史与当前提交变化实时重新计算，无需存储在密文中。
	- 排行脚本输出扩展：`competition/data/week-<n>.json` 新增 `difficulty`（D）、`minBytes`（本轮最小字节数），`ranks[].points`（本轮所得积分）；`competition/data/total.json` 的聚合字段新增 `points`（总积分）与 `rounds`（参与轮数），按积分降序、轮数降序、最佳字节升序排序。

	### Changed
	- 全站“总榜/Overall”统一替换为“天梯榜 Ladder”；所有“Week”界面呈现为“Round”，提交页保留 `submissions/week-<n>/` 目录前缀（兼容历史），并在指引中说明 week- 仅作为路径前缀。
	- `competition/rank/index.html`：改造成天梯积分榜，新增“积分 Points”“参与轮数 Rounds”“最佳字节 Best Bytes”列与规则描述。
	- `competition/rank/week.html` 与具体轮次页 `competition/rank/1.html`：增加“积分 Points”列与本轮积分公式说明。
	- `competition/1.html`：规则段落补充天梯积分公式与动态更新说明。
	- `competition/submit.html`：标题与指引中强调 Round 概念，说明 week- 目录前缀的兼容性与合并后会重新计算积分。
	- `about.html` 赛事介绍条目更新为“每轮榜单/天梯榜”并说明积分公式。
	- 版本号提升为 `v1.3.16` 以刷新缓存。

	### Notes
	- 积分实时计算：无需迁移历史数据；只要原始提交（加密代码与元数据）在仓库中，脚本即可重新生成 ladder 排序结果。
	- 若后续需调整难度，只需在 `scripts/compute_ranks.mjs` 中修改 `ROUND_DIFFICULTY` 映射并重跑脚本。

### Added
- 新增 `competition/view.html`：可视化解密页面，支持 v3 密文 JSON 解码展示原始源码与基本元数据（handle, challenge, bytes, ts）。

### Removed
- 强加密一键提交（v4 + RSA-OAEP 包裹）在前端停用；若后续需要可重新配置公钥与 Worker 端点恢复。

### Notes
- 当前加密文件内容不再可直接编译（存储为 JSON 密文）；排行榜生成脚本已支持自动解密计算原始字节数。
- 若使用旧仓库 Fork，需要同步更新远端 origin 以获得最新 README 链接与说明。

# [1.3.7] - 2025-11-07
# [1.3.8] - 2025-11-07
### Removed
- 移除前端自建编译的 WASM 占位实现与相关集成：删除 `wasm/` 目录（`tcc_runner.js`, `wrapper.c`, `build_wasm.sh`, `README.md`）。
- 简化 Pages 部署工作流：去掉 Emscripten/emsdk 缓存与可选构建步骤，仅静态部署。

### Changed
- `index.html`：清除未使用的 WASM 加载与尝试逻辑（不再请求 `/wasm/tcc_runner.js`）。
- `about.html`：移除“WASM 运行器可用吗？”FAQ 项，避免误导。
- 统一版本提升为 `v1.3.8`；`scripts/version.js`、`sw.js` 与页面可见版本同步更新。

### Notes
- 保留第三方组件的 wasm（例如 `uncrustify-wasm` 格式化器），与已删除的“前端编译器占位”无关；运行路径仍为：Wandbox 优先，失败回退本地模拟，离线则提示不可运行。

---
 
 # [1.3.7] - 2025-11-07
# [1.3.7] - 2025-11-07
### Added
- v4 端到端强加密（可选）：前端在配置 `submitPublicKey` 后启用 AES‑GCM（256 位）加密整包（meta+code），随机对称密钥使用 RSA‑OAEP(SHA‑256) 公钥包裹；提交页对 v4 仅展示占位与加密字段，不再尝试解密；Worker 侧新增 `SUBMIT_PRIVATE_KEY` 支持解包与解密，生成 PR。
- 管理辅助：`scripts/decrypt_submission.mjs` 增强，新增 v4 解密（需要私钥），保留 v2/v3 解析。

### Changed
- `index.html`：`secureContestPayload` 根据配置自动选择 v4（AES‑GCM + 公钥包裹）或回退 v3（XOR）。评测通过后的一键提交与回退逻辑保持不变。
- `serverless/cloudflare-worker.js`：兼容 v2/v3/v4；v4 路径校验并限制代码大小（64KB）。
- `serverless/README.md`：补充 v4 配置说明（前端 `submitPublicKey`，服务端 `SUBMIT_PRIVATE_KEY`）。

### Notes
- v4 采用经认证的对称加密（GCM 标签）+ 公钥包裹；无需在前端持有任何私钥或共享密钥，前端无法伪造有效密文，服务端可验证与解密；若未配置公钥，系统自动回退至 v3 以维持兼容。

# [1.3.6] - 2025-11-07
### Changed
- 参赛提交改为“不可见加密”模式（v3）：前端在 AC 后对参赛者昵称、代码字节数、提交时间与“完整代码”一起加密（XOR+8B key），仅将密文与密钥（hex）提交；提交页不再展示明文代码，避免被篡改。

### Added
- 提交页：隐藏明文代码并提示加密保护；保留 Fork/Issue 按钮（Issue 仅包含密文，不再附带代码明文）。新增“修改昵称”入口会同步更新元数据密文与链接。
- 一键提交后端：`serverless/cloudflare-worker.js` 兼容 v3（解密 meta 与 encCode）并允许目录名保留空格（禁止斜杠，修剪与折叠空白）。
- 管理辅助：`scripts/decrypt_submission.mjs` 可离线解密 payload（v2/v3），输出 meta 与代码长度预览。

### Notes
- 保留对 v2 的兼容：若遇旧 payload 仍会展示明文代码并按旧逻辑处理。
- 轻量加密用于“防随手篡改”，非强对抗；生产可升级为 AES-GCM + 签名。

# Changelog

# [1.3.5] - 2025-11-07
### Fixed
- 移动端高度问题：使用 `100dvh` 与运行时 `--app-vh`（`window.innerHeight`）双策略替换固定 `100vh`，消除地址栏收缩后出现的黑色区域与仅半行编辑器问题。
- 参赛提交页明确流程：新增 Fork 按钮与 Issue 备用通道，避免误导非协作者可以直接在主仓库新建文件。
- 评测通过后未自动跳转提交页：由于浏览器弹窗拦截导致 `window.open` 失败，现改为点击时同步打开占位窗口并在评测通过后导航；若仍被拦截，则在弹窗内提供可点击链接与一键复制。

### Changed
- 首页版本显示精简：移除赛事独立版本号，统一采用项目版本（例如 `v1.3.7`）。
- 统一版本脚本更新：`scripts/version.js` 提供单一版本号；`sw.js` 缓存版本同步更新以刷新离线资源。

### Added
- Issue 提交降级处理：若代码长度导致 Issue URL 过长（>7000 编码字符），自动生成精简版仅包含加密元数据，提示手动粘贴代码。
- `about.html` 新增赛事说明条目（contest5）：解释非协作者需 Fork + PR，Issue 为备用方案。
- PR 自动合并：新增 `validate-submission.yml` 的自动合并步骤。验证通过且目标分支为 `main` 且未打上 `hold`/`no-auto-merge` 标签时，机器人将尝试以 squash 方式自动合并；若因受保护分支策略或审查要求无法自动合并，会在 PR 下方留言说明原因并保留 `ready` 标签以便人工处理。
 - 反匿名校验：工作流拒绝 `submissions/week-*/anon/` 形式的匿名路径，提示选手把 `<handle>` 改为个人标识，避免榜单出现 `anon`。
 - 一键提交（可选）：在 `scripts/version.js` 中配置 `window.__CONFIG__.submitEndpoint` 后，评测通过将直接向该地址 POST 提交数据（无需 GitHub 账号）；成功时返回 PR 链接并展示。新增 `serverless/cloudflare-worker.js` 示例与 `serverless/README.md` 部署说明。

### Notes
- 后续可进一步：在提交页增加 PR 模板引导、Issue 自动标签；增强加密（AES-GCM）、添加元数据哈希以防篡改。
- 移动端仍建议横屏或使用桌面端获得更好体验；若需彻底移动优化，可后续加入工具栏收缩与行高自适配。


# [1.3.4] - 2025-11-06
### Fixed
- 输出前导空格丢失：运行结果区域不再对完整输出调用 `trim()`，保留行首空格，仅收敛结尾多余换行；本地模拟输出同样保留原样，解决“开头是空格则不能正确输出空格”的问题。

### Added
- 顶部导航新增“赛事/Contest”入口，直达 `competition/index.html`。
- 分享弹窗新增“参赛”选项：
	- 输入题目编码（如 `week-1`）生成参赛提交数据。
	- 首次参赛弹出 `DataCollect.html` 采集参赛人信息，保存到本地后自动继续。
	- 打开 `competition/submit.html` 预填代码，并提供一键跳转到 GitHub 在 `submissions/week-<n>/<handle>/solution.c` 路径新建文件。
- 赛事系统（静态方案，适配 GitHub Pages）：
	- 页面：`competition/index.html`（入口），`competition/1.html`（题面），`competition/rank/1.html`（周榜），`competition/rank/index.html`（总榜），`competition/submit.html`（提交落地页）。
	- 数据：`competition/data/week-1.json`、`competition/data/total.json`（占位，CI 填充）。
	- 脚本：`scripts/compute_ranks.mjs`（计算字节数、按提交时间打破并列、生成 JSON），`scripts/compute_rank.js`（JS 包装器）。
	- 工作流：`.github/workflows/compute-rank.yml`（自动计算并提交榜单）。
	- 提交说明：`submissions/README.md` 与 `submissions/week-1/README.md`。
- 题面优化（Week 1）：新增“输入格式/输出格式”小节；示例改为两组并支持“展开/收起”动态折叠；“本地快速测试”改为按钮打开主编辑器新标签页。

### Changed
- 分享弹窗 UI 扩展，加入参赛编码输入与跳转逻辑；相关文案支持中英文切换。
- 头部“赛事/Contest”链接文本随语言切换。

### Notes
- 赛事 Changelog 独立记录于 `competition/CHANGELOG.md`（当前为 0.0.1）。
- 排名规则：字节数升序；同字节数按提交时间先后；总榜按全局最好成绩与参与期数聚合。

# [1.3.3] - 2025-11-06
### Fixed
- 修复“度量”按钮点击无反应：延迟查询弹窗元素并在点击时绑定，确保按钮可用。

### Added
- 中英文切换（功能选项）：新增语言按钮，可在中文/English 间切换工具栏、侧栏标签、网络徽章文字、测试用例与弹窗（分享/离线/度量）等功能性文案；版权与署名区域保持不变。

# [1.3.2] - 2025-11-06
### Added
- about 页面强化：新增“键盘快捷键”与“分享与协作”板块，描述运行模式（在线优先，离线不可执行）、快捷键集合、分享增强方案。
- 分享增强：提供分享弹窗，支持选择是否包含 stdin 与测试用例；生成 `#share=`（JSON Base64）链接，兼容旧 `#code=` 格式；解析时自动还原代码、输入与用例并进入测试模式。
- 代码度量面板：新增“度量”按钮弹窗统计近似指标（总行数、非空行、注释行、函数数量估算、圈复杂度、最大嵌套、平均函数行数、决策点计数），支持实时刷新与复制报告。

### Changed
- about 主题逻辑与主页面统一：读取并使用 `editorTheme`，兼容旧 `about_theme` 一次性迁移。
- 分享按钮行为调整：点击后弹窗选项而非直接复制链接。

### Notes
- 复杂度与函数识别基于启发式正则与大括号匹配，非严谨语法解析；适合快速粗略估算，不用于严格分析。
- 后续可扩展：精确 AST 分析（基于 wasm clang 前端）、多文件度量、增量复杂度趋势对比、重复代码检测。


# [1.3.1] - 2025-11-06
### Changed
- 离线运行策略调整：离线状态下不再触发本地“模拟运行”，点击“运行”或测试用例相关操作时弹出离线提示弹窗，防止模拟结果与真实编译差异造成误导。
- 网络徽章提示文字保留“离线模式”但运行按钮不再禁用，仅提示需联网后运行。
- 测试用例 UI 默认隐藏：初始仅显示标准输入/输出区域，点击“测试用例”或新增用例后进入测试模式；当只剩一个用例时自动退出测试模式并还原单一 I/O 界面。
- 命令面板支持 Esc 关闭，提示文本更新。

### Added
- 离线提示弹窗组件（遮罩 + 动画进入），集中说明当前不执行离线模拟以及需要联网的操作范围（运行与测试）。
- “启用测试用例”按钮：位于输入/输出区域底部，进入测试模式后隐藏。

### Removed
- 离线状态下的自动模拟执行（此前版本在断网时回退 simulateRun）。

### Notes
- 后续版本将评估是否以 wasm 编译器替换/补充离线策略，使离线可真实运行而非模拟；当前选择明确失败而不误导结果。
- 若本地已有历史测试用例，加载时自动进入测试模式。

# [1.3.0] - 2025-11-06
### Added
- 离线基础支持：新增 `sw.js`，预缓存首页、简介页、manifest 与图标，断网情况下仍可继续编辑、保存与查看帮助（运行回退本地模拟）。
- 网络状态徽章：顶部 header 新增在线/离线指示徽章，离线时提示“离线模式”。
- 代码分享功能：支持一键将当前代码压缩为 Base64 注入 URL hash（`#code=`），点击“分享”自动复制链接，对方打开可还原代码。
- 测试用例面板：侧栏新增测试用例区域，可添加/删除用例（名称、输入、期望输出）、单个运行与批量运行，显示通过/失败统计与差异。
- 快捷键：Ctrl/Cmd+Enter 运行、Ctrl/Cmd+S 另存为、Ctrl/Cmd+I 自动缩进、Ctrl/Cmd+/ 切换行注释、Ctrl/Cmd+Shift+P 打开命令面板。
- 命令面板：支持模糊过滤并执行常用命令（运行、格式化、保存、复制、分享、主题切换、打开文件、用例管理）。
- 关于页新增“更多优势”板块，强化纯前端/PWA、离线、性能、易用细节与分享能力的宣传。

### Changed
- 更新首页与工具栏版本号展示为 `v1.3.0`。

### Notes
- 离线运行暂为模拟模式，不包含真实编译；后续版本将尝试引入 wasm 编译路径与更多资源缓存策略。


# [1.2.7] - 2025-11-06
### Added
- PWA 图标增强：动态 manifest 现在包含 128/192/256/512 多尺寸，并为 256/512 标注 `maskable`，适配 Android 自适应裁切。
- 图标缓存：将运行时生成的 favicon 与图标列表缓存到 `localStorage`，避免重复生成与内存泄漏。

### Changed
- 工具栏版本更新为 `v1.2.7`。

# [1.2.6] - 2025-11-06
### Added
- 动态 favicon 与 PWA 图标：在 `index.html` 与 `about.html` 运行时使用 Canvas 生成与页头相同风格的“代码”图标（192/512），自动注入 favicon 与 manifest，免素材也能安装到主屏。

### Notes
- 静态 `manifest.webmanifest` 仍保留，但页面会在加载后用内存 manifest 覆盖以提供动态图标。

# [1.2.5] - 2025-11-06
### Added
- iPad 横竖屏自适应：在窗口尺寸变化时根据 `window.innerHeight < window.innerWidth` 切换 `body.landscape/portrait`，用于控制更宽布局。
- 手机端默认隐藏侧栏：小屏进入时侧栏默认折叠，并在编辑器头部加入“输入/输出”切换按钮以展开或隐藏侧栏。
- 动画统一变量：将进入动画的缓动/时长/阴影/scale 抽象为 `:root` 变量，统一应用于弹窗。
- PWA 支持：新增 `manifest.webmanifest`，`index.html` 引入 manifest 与 `theme-color`，移动端可添加到主屏幕。

### Changed
- 版本号更新为 `1.2.5`。

# [1.2.4] - 2025-11-06
### Added
- 移动端（手机 + iPad）适配：新增多段响应式断点（1180px/1024px/900px/640px）调整侧栏布局、按钮间距、字号与工具栏换行。
- 手机首次访问提示弹窗：检测手机首次进入（`localStorage.mobile_warned`），展示“建议使用PC端”说明后可关闭且不再出现。
- 奶茶弹窗进入动画：添加淡入 + 上移 + scale 动画（cubic-bezier 缓动）。

### Changed
- 版本号更新为 `1.2.4`。

# [1.2.3] - 2025-11-06
### Added
- 新增“请我喝奶茶”彩蛋：点击页面右下角“By C. He from ZJU”会弹出提示卡片并显示支付二维码图片（`img/WeChat.jpeg`）。

### Changed
- 页面版本展示更新为 `v1.2.3`（`index.html` 底部工具栏）。

# [1.2.2] - 2025-11-06
### Changed
- 页面版本升级为 `1.2.2`，底部版本展示改为“By C. He from ZJU | v1.2.2”并可点击在新标签页打开 `CHANGELOG.md`。

### Removed
- 移除“保存”与“重置”按钮及相关逻辑（保留自动持久化与“另存为”）。
- 移除“优先使用 WASM”复选框与 WASM 分支逻辑（当前 WASM 不可用，简化执行流程为：Wandbox → 本地模拟）。
- 移除显式的未保存文字提示，仅通过文件名后星号 `*` 指示。

### Added
- 新增“复制”按钮，支持一键复制编辑器中所有代码到剪贴板（复制成功显示短暂状态反馈）。便利了OJ使用场景，需要提交代码的情况。
- 轻主题样式修复：为 `.light-theme` 增加 `--panel` 以及 header / toolbar / sidebar 的浅色背景，避免暗色背景残留。

### Simplified
- `runCode` 简化为 Wandbox 优先，失败后回退本地模拟，不再尝试 WASM。（暂时的！！！我一定还会尝试WASM）

### Fixed
- 删除遗留的快捷键保存逻辑与保存状态 DOM 引用，避免无效事件绑定。

## [1.2.1] - 2025-11-06
### Added
- 底部工具栏恢复并完善：新增“运行/重置/保存/打开/自动缩进/撤销/重做/全屏”按钮与版本号展示。
- 按钮禁用视觉样式：`.btn[disabled]{opacity:.45;cursor:not-allowed;filter:grayscale(25%)}`，与撤销/重做自动禁用逻辑配合。

### Improved
- 纯 JS 自动缩进算法进一步增强：
	- 正确处理 for/if/while 等无大括号的单行体，支持多层嵌套并在语句结束分号处弹栈；
	- do...while 结构精确对齐：do 后的单行/代码块缩进正确，while(...); 行完成闭合；
	- else/else if 与前一控制流对齐，switch-case 中 case 内多行语句按需缩进并在 break/return/continue/goto/} 恢复。

### Fixed
- 修复上次变更导致的结构性错误（脚本片段意外注入 CSS/HTML 位置），恢复页面正常解析与加载。

### Changed
- 页面可见版本提升为 `1.2.1`（`index.html` 中显示）。

## [1.1.15] - 2025-11-06
### Added
- 工具栏新增“撤销”“重做”按钮（仅图标），支持 Monaco Editor 的撤销/重做。
- 自动缩进算法大幅增强：
	- 支持多层嵌套无大括号控制流（如连续 if/for/while/else 嵌套）。
	- 支持 do...while 结构，while 结尾与 do 对齐。
	- else if/else 缩进与前一控制流对齐。
	- switch-case 结构下，case 内多行语句自动缩进，遇 break/return/continue/goto/} 恢复。
	- 修复 for/if/while 等无大括号单句体缩进丢失问题。

### Fixed
- 修复自动缩进在 for/if/while 等无大括号单句体下缩进丢失的问题。

## [1.1.14] - 2025-11-06
### Added
- 工具栏新增“自动缩进”按钮，集成纯 JS 高级 C 代码缩进美化算法，支持大括号、case/default、预处理指令、字符串、注释等结构的智能缩进。

## [1.1.13] - 2025-11-04
### Fixed
- 修复 WASM loader 的检测与加载逻辑：改进 `wasm/tcc_runner.js`，尝试从常见路径（`/wasm/dist/tcc_runner.js`、`wasm/dist/tcc_runner.js` 等）加载构建产物，并在控制台输出更友好的错误与调试信息；当运行器加载成功时会暴露 `window.wasmRun(code, stdin)`，否则返回带有明确原因的 rejected Promise，页面会回退到 Wandbox 或本地模拟。

### Changed
- 将页面可见版本提升为 `1.1.13`（在 `index.html` 中显示）。

## [1.1.12+0.0.1] - 2025-11-04
### Added
- 添加 GitHub Actions workflow：`.github/workflows/build_and_deploy_wasm.yml`，在 push 到 `main` 或手动触发时：
	- 安装并激活 Emscripten（通过 `emscripten-core/emsdk` action）；
	- 运行 `public/projects/compiler/wasm/build_wasm.sh` 构建示例 wasm（产物输出到 `public/projects/compiler/wasm/dist/`）；
	- 使用 `peaceiris/actions-gh-pages` 将 `public/` 目录发布到 `gh-pages` 分支，自动部署到 GitHub Pages。

### Notes
- 版本号展示已更新为 `1.1.12+0.0.1`（`index.html`）；该 workflow 为示例级构建流程，实际将 tcc/clang 编译为 wasm 可能需要更长的 CI 运行时间与额外配置（可根据需要调整）。

## [1.1.12] - 2025-11-04
### Changed
- 提升页面的可见版本号为 `1.1.12`（`index.html` 中显示），用于标识小版本迭代。

### Notes
- 该更新仅为版本号展示的更新，不影响功能；如需记录功能级变更请在后续提交中补充详细条目。

## [1.1.11+0.0.0.1] - 2025-11-04
### Added
- 在 `public/projects/compiler/wasm/` 下添加了可构建的 WASM 示例与 loader：
	- `wrapper.c`：一个最小可编译的 C 示例，导出 `run_code` 与 `free_buffer`，用于演示 Emscripten 构建和 JS 互操作。
	- `build_wasm.sh`：构建脚本（依赖 emscripten），输出到 `public/projects/compiler/wasm/dist/`。
	- `tcc_runner.js`：运行时 loader，尝试加载 `dist/tcc_runner.js`（emcc 输出，MODULARIZE=1）并通过 `Module.cwrap` 包装 C API，最终暴露 `window.wasmRun(code, stdin)`。
	- README：说明如何构建、部署与注意事项。

### Notes
- 这是一个占位/示例实现：它能帮助在本地或 CI 中构建并测试浏览器加载流程，但并未包含完整的 C 编译器 wasm（tcc/clang），真实编译器需自行编译并替换构建产物。
- `index.html` 中的可见版本号已更新为 `1.1.11+0.0.0.1`。

## [1.1.9] - 2025-11-04
### Changed
- 侧栏不再通过缩窄编辑器宽度来避免遮挡（编辑器保持始终填满宽度）；改为缩短侧栏的上下边界以避免遮挡头部（已保存）和底部工具（另存为/主题）。侧栏的上下边界由脚本动态计算（基于 `header` 与 `.toolbar` 的位置），并在窗口调整、折叠/展开以及过渡结束时重新计算并触发布局。

### Notes
- 版本号 `index.html` 已更新为 `1.1.9`。

## [1.1.8] - 2025-11-04
### Fixed
- 保证编辑器在任何时刻都与侧栏状态同步：新增 `.editor-wrap.with-sidebar` 的宽度计算规则（使用 `calc(100% - var(--sidebar-width))`），并添加 `MutationObserver` 以监听侧栏的 class 变化（例如 `collapsed`），在变化发生时立即和在 transitionend 后触发 `editor.layout()`。这修复了刷新后编辑器未判断侧栏状态、以及折叠/展开时编辑器未正确收缩的问题。

### Notes
- 版本号 `index.html` 已更新为 `1.1.8`。

## [1.1.7] - 2025-11-04
### Fixed
- 将侧栏宽度抽象为 CSS 变量 `--sidebar-width`，并替换所有硬编码宽度；当侧栏折叠/展开时，立即触发 `editor.layout()` 并在过渡结束时再次触发，保证 Monaco 编辑器在每次切换都正确响应并填充可见区域。

### Notes
- 版本号 `index.html` 已更新为 `1.1.7`。

## [1.1.6] - 2025-11-04
### Fixed
- 侧栏展开时遮挡编辑区右上角保存状态与右下角按钮的问题：当侧栏展开（覆盖式定位）时，编辑器右侧会自动向左平移（使用 `.editor-wrap.with-sidebar` 添加 `margin-right`），折叠时恢复填充全宽。此修复避免了侧栏遮挡头部与工具栏控件。

### Notes
- 版本号 `index.html` 已更新为 `1.1.6`。

## [1.1.5] - 2025-11-04
### Fixed
- 修复因插入 `.frame` 后导致的首次布局问题：确保 `.frame` 与 `.editor-wrap` 拥有 `min-height:0` 与 `#editor` 的高度规则，使 Monaco 编辑器能够正确填充容器。
- 修复全屏按钮与工具栏交互可能失效的问题：为全屏按钮添加容错绑定（若初次绑定失败会在 `load` 时重绑定），并在页面 `load` / `resize` 时强制触发 `editor.layout()`，保证交互与渲染稳定。

### Notes
- 版本号 `index.html` 已更新为 `1.1.5`。

## [1.1.4] - 2025-11-04
### Fixed
- 修复全屏按钮无效的问题：页面结构中缺失 `.frame` 容器导致脚本无法找到目标元素；已在 `index.html` 中加入 `.frame` 包裹并在脚本中加入安全回退（优先 `.frame`，其次 `.app`，最后 `document.documentElement`）。

### Notes
- 版本号 `index.html` 已更新为 `1.1.4`。

## [1.0.4] - 2025-11-03
### Added
- 编辑器“未保存”状态指示：当编辑器内容发生变化时，文件名后会显示 `*` 并且状态显示为“未保存”；保存后会移除 `*` 并恢复“已保存”。

### Notes
- 版本号 `index.html` 已更新为 `1.0.4`。

## [1.0.3] - 2025-11-03
### Added
- 在编辑头部显示当前打开的文件名（当通过“打开本地文件”加载时更新）。
- 添加“另存为”按钮，允许将当前编辑器内容下载为本地文件（文件名为当前打开的文件名或 `main.c`）。

### Notes
- 版本号 `index.html` 已更新为 `1.0.3`。

## [1.0.2] - 2025-11-03
### Changed
- Bumped visible version to `1.0.2` in `index.html`。

### Fixed
- 修复侧边栏在折叠后再次展开时被编辑区遮挡的问题（将侧栏改为覆盖式定位，并调整 z-index 与布局回流逻辑）。

### Added
- 主题持久化（`localStorage` 中的 `editorTheme`，页面与 Monaco 编辑器在加载时读取并应用）。
- 工具栏新增“打开本地文件”功能，支持扩展名：`.c, .cpp, .h, .hpp, .txt`，并在加载后根据扩展切换 Monaco 的语言模式（C / C++ / plaintext）。
- 默认示例代码替换为简单输出 `By ZJU C. He` 的示例，便于快速验证页面功能。

[Unreleased]: https://example.com/your-repo