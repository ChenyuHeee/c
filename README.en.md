# C Lab

[中文](README.md) · [Live demo](https://chenyuheee.github.io/c/)

C Lab is a focused learning workbench for C beginners: write, compile for real, run tests, and jump from a diagnostic back to the source. Clang and the compiled program both run in the browser, with no account, database, compiler API, or backend maintenance.

## Features

- Real in-browser compilation with Clang 22 and the WASI C library, supporting C99, C11, and C17. No JavaScript simulation and no remote compiler service.
- A dedicated Web Worker for compilation, linking, and execution, keeping the editor responsive and allowing immediate termination.
- Structured Clang diagnostics mapped to source lines and columns, including warnings from successful builds, plus local hints for common mistakes.
- CodeMirror 6 with C highlighting, automatic indentation, bracket completion, search, and light/dark themes.
- Separate stdin, stdout, stderr, exit status, and elapsed-time displays.
- Custom test cases executed locally in batch with output comparison.
- Nine runnable examples and six exercises with public tests, progressive hints, and reference solutions.
- Automatic browser storage, file import/export, and compressed share links.
- Full offline editing, learning, and real compilation after the compiler has been cached.

## Architecture

C Lab is a React + TypeScript + Vite single-page application deployed as static files.

1. On the first run, the browser lazily downloads approximately **28 MB** of Clang, LLD, MemFS, and WASI sysroot assets. Nothing this large is loaded for the initial editor view.
2. Clang inside a Worker compiles and links source into a `wasm32-wasi` module, which is then instantiated and executed locally.
3. A service worker caches the application and compiler assets for subsequent and offline runs.
4. Source, stdin, and tests move only between the page and its Worker. They are never uploaded. Work and settings stay in `localStorage`.
5. Share data is compressed into the URL hash and decoded locally by the recipient's browser.

The initial compiler download requires a network connection. The resident toolchain can require several hundred MB of memory, so use a modern WebAssembly-capable browser and account for memory-constrained mobile devices.

## Boundaries

This is a single-file **WASI** learning environment, not a full local IDE or native Linux sandbox. Standard I/O, arrays, pointers, structs, and dynamic memory run for real, while operating-system capabilities are bounded by WASI.

- No multi-file project builds, external native C libraries, interactive debugger, or cloud sync.
- Networking, processes, device files, and other native OS APIs do not behave like desktop Linux.
- Programs have a 128 MB memory limit. Tasks without progress stop after 30 seconds and can also be cancelled manually.

## Development

Node.js 22.12 or newer is required.

```bash
npm ci
npm run dev
```

```bash
npm run typecheck
npm run build
npm run preview
```

The production build is written to `dist/`. Compiler assets are committed under `public/clang/` and copied into the build. Regenerate them only when upgrading the toolchain:

```bash
npx clang-wasm-copy-assets public/clang
```

## Deployment

The included GitHub Actions workflow installs dependencies, builds the app, and publishes `dist/` to GitHub Pages on pushes to `main`.

Select **GitHub Actions** under **Settings → Pages → Build and deployment**. Relative application and Worker asset URLs support both domain-root and `/c/` subpath hosting. The host must serve `.wasm.gz` and `sysroot.tar.gz` as static files; no backend or compiler API is required.

## Privacy and backups

Automatic local save is not version control. Clearing site data removes the workspace and compiler cache. Export important source files or keep them in your own Git repository, and never include secrets or sensitive personal information in share links.

Third-party runtime attribution is included in `public/clang/THIRD-PARTY-NOTICES.md`.
