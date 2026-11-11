# C Lab

[English](README.en.md) · [在线体验](https://chenyuheee.github.io/c/)

C Lab 是一个面向 C 初学者的学习工作台：编写、真实编译、测试，再从诊断回到源码。Clang 与程序都在浏览器内运行，没有账号、数据库、编译 API 或后端运维。

## 核心能力

- **浏览器内真实编译**：Clang 22 + WASI 标准库，支持 C99 / C11 / C17 和常用警告；不是 JavaScript 模拟器，也不调用远程编译服务。
- **独立 Worker**：编译、链接和程序执行都在 Web Worker 中完成，不阻塞编辑器；停止按钮会终止 Worker。
- **可定位的诊断**：结构化 Clang 诊断映射到源码行列，并配有本地规则生成的修复提示；成功编译的警告也会保留。
- **专业编辑体验**：CodeMirror 6、C 语法高亮、自动缩进、括号补全、搜索替换和深浅色主题。
- **标准输入与输出**：分别展示 stdout、stderr、退出码和耗时。
- **测试用例**：自定义输入与期望输出，批量在本地运行并比较结果。
- **示例与练习**：9 个可运行示例、6 道带公开测试的练习、渐进提示与参考答案。
- **本地优先**：每次修改后自动保存到当前浏览器；支持导入、导出和压缩分享链接。
- **完整离线体验**：编译器下载并缓存后，编辑、示例、练习和真实编译都可离线进行。

## 运行架构

C Lab 是 React + TypeScript + Vite 单页应用，部署产物完全是静态文件。

1. 首次点击“运行”时，浏览器按需下载约 **28 MB** 的 Clang、LLD、MemFS 和 WASI sysroot；不会预载到首屏。
2. Worker 内的 Clang 将 C 源码编译并链接为 `wasm32-wasi` 模块，再由浏览器本地实例化执行。
3. 编译器资源和应用外壳由 Service Worker 缓存，后续运行与离线使用不再依赖网络。
4. 源代码、标准输入和测试仅在当前页面与 Worker 之间传递，不会上传。设置和工作区保存在 `localStorage`。
5. 分享内容压缩在 URL hash 中，由接收方浏览器本地解压，不经过短链或存储服务。

> 首次下载编译器需要网络。运行时通常还需要几百 MB 内存，因此请使用支持 WebAssembly 的现代浏览器，并注意低内存移动设备的限制。

## 与原生 C 环境的边界

这是基于 **WASI** 的单文件学习环境，不是完整的本地 IDE 或原生 Linux 沙箱。`stdio`、`stdlib`、数组、指针、结构体和动态内存等学习内容可以真实运行，但操作系统相关能力受 WASI 限制。

- 不提供多文件项目构建、第三方本地 C 库、交互式调试器或云端同步。
- 网络、进程、设备文件及其他原生操作系统 API 不能按桌面 Linux 的方式使用。
- 单个程序使用 128 MB 内存上限；无进展的任务会在 30 秒后终止，也可以手动停止。

## 本地开发

需要 Node.js 22.12 或更新版本。

```bash
npm ci
npm run dev
```

开发服务器默认位于 `http://localhost:5173`。

```bash
npm run typecheck  # TypeScript 严格类型检查
npm run build      # 类型检查并生成 dist/
npm run preview    # 预览生产构建
```

编译器资源已经放在 `public/clang/`，构建时会原样复制到 `dist/clang/`。只有升级工具链时才需要重新生成：

```bash
npx clang-wasm-copy-assets public/clang
```

## 目录结构

```text
src/
  components/       # 编辑器、工作台、设置与分享对话框
  workers/          # Clang 编译、链接和 WASI 执行 Worker
  data/             # 内置示例、练习与公开测试
  lib/              # Worker 协议、诊断、本地存储与分享
  pages/            # 示例库、练习与使用指南
  App.tsx           # 全局工作区状态与运行流程
  styles.css        # 设计系统和响应式布局
public/
  clang/            # Clang 22、LLD、MemFS、WASI sysroot 与第三方声明
  manifest.webmanifest
  sw.js             # 应用与编译器离线缓存
.github/workflows/  # GitHub Pages 构建与部署
```

## 部署

仓库已配置 `.github/workflows/deploy-pages.yml`：推送到 `main` 后执行 `npm ci` 和 `npm run build`，再将 `dist/` 发布到 GitHub Pages。

在仓库的 **Settings → Pages → Build and deployment** 中选择 **GitHub Actions** 作为来源。Vite 和 Worker 资源使用相对路径，因此可部署在域名根目录或 `/c/` 这类子路径。托管方需要原样提供 `.wasm.gz` 和 `sysroot.tar.gz` 文件，不需要特殊后端或编译 API。

## 隐私与数据备份

本地自动保存不等于版本控制。清除浏览器站点数据会删除草稿和编译器缓存；重要代码请通过“下载”导出，或纳入自己的 Git 仓库。不要通过分享链接传递密码、密钥或个人敏感信息。

第三方运行资源的许可与归属见 `public/clang/THIRD-PARTY-NOTICES.md`。
