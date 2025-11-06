# Changelog

# [1.2.2] - 2025-11-06
### Changed
- 页面版本升级为 `1.2.2`，底部版本展示改为“By C. He from ZJU | v1.2.2”并可点击在新标签页打开 `CHANGELOG.md`。

### Removed
- 移除“保存”与“重置”按钮及相关逻辑（保留自动持久化与“另存为”）。
- 移除“优先使用 WASM”复选框与 WASM 分支逻辑（当前 WASM 不可用，简化执行流程为：Wandbox → 本地模拟）。
- 移除显式的未保存文字提示，仅通过文件名后星号 `*` 指示。

### Added
- 新增“复制”按钮，支持一键复制编辑器中所有代码到剪贴板（复制成功显示短暂状态反馈）。
- 轻主题样式修复：为 `.light-theme` 增加 `--panel` 以及 header / toolbar / sidebar 的浅色背景，避免暗色背景残留。

### Simplified
- `runCode` 简化为 Wandbox 优先，失败后回退本地模拟，不再尝试 WASM。

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