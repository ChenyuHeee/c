# Changelog

## 2.1.0

### Changed

- Replaced the remote compilation service with a real Clang 22 toolchain running inside a browser Worker.
- C source is compiled and linked to wasm32-wasi and executed locally; source and stdin are never uploaded.
- Successful builds now retain structured Clang warnings as well as errors.
- Compiler assets are cached for genuine offline editing, learning, compilation, and execution after the first download.
- Worker termination, a 128 MB program memory limit, and idle timeouts make local execution safer and more predictable.
- Updated the interface, privacy guide, limitations, and deployment documentation for the local WASM architecture.

## 2.0.0

C Lab is a complete product redesign of the former Online C Compiler.

### Added

- New React + TypeScript architecture and responsive visual system.
- Real C compilation with GCC 13.2 / Clang 17.0 and C99 / C11 / C17 selection.
- Source-mapped compiler diagnostics and friendly local hints.
- Standard I/O, exit status, signals, timing, and batch test cases.
- Nine runnable examples and six exercises with public tests, hints, and solutions.
- Automatic local persistence, source import/export, and compressed share links.
- Offline application shell and a static GitHub Pages deployment workflow.

### Removed

- The Code Golf competition, rankings, encrypted submissions, serverless worker, and related pages.
- Placeholder WASM compiler code and obsolete maintenance scripts.
- Third-party frontend CDN dependencies and the single-file legacy implementation.
- Outdated project notes and documentation that did not describe the actual implementation.

### Fixed

- The legacy compiler ID could compile source as C++; compiler selection is now explicitly C-only.
- Work is saved after every edit rather than only before the page closes.
- Compilation failures are distinguished from non-zero runtime exits, including Wandbox responses with empty program-output fields.
