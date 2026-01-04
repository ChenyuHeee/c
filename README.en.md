# Online C Compiler

[![Stars](https://img.shields.io/github/stars/ChenyuHeee/c?style=flat-square&logo=github)](https://github.com/ChenyuHeee/c/stargazers)
[![Contributors](https://img.shields.io/github/contributors/ChenyuHeee/c?style=flat-square)](https://github.com/ChenyuHeee/c/graphs/contributors)
[![中文文档](https://img.shields.io/badge/README-中文-blueviolet?style=flat-square)](README.md)

A lightweight, browser-based C compiler with Monaco editor, theme switching, and Uncrustify WASM formatting. Deployed automatically via GitHub Pages.

## Live demo
- https://chenyuheee.github.io/c

## Highlights
- Zero-install: entirely front-end, ready to use in the browser.
- Editing: Monaco-based editor with themes, shortcuts, syntax highlighting, and file name display/save.
- Formatting & highlighting: built-in Uncrustify WASM and Highlight.js.
- UX niceties: I/O sidebar, mobile-friendly layout, network/version badges.

## Run locally
1. Clone: `git clone https://github.com/ChenyuHeee/c.git`
2. Enter project: `cd c`
3. (Optional) Install script deps: `npm install`
4. Serve with any static server, e.g. `npx serve .`, then open the shown URL in your browser.

## Directory at a glance
- `index.html`: main online compiler UI.
- `wasm/`: WebAssembly assets for compiling/formatting.
- `scripts/`: ranking, sync, and deployment helper scripts.
- `submissions/`, `competition/`: contest submissions and data.
