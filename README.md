# Online C Compiler

[![Stars](https://img.shields.io/github/stars/ChenyuHeee/c?style=flat-square&logo=github)](https://github.com/ChenyuHeee/c/stargazers)
[![Contributors](https://img.shields.io/github/contributors/ChenyuHeee/c?style=flat-square)](https://github.com/ChenyuHeee/c/graphs/contributors)
[![English README](https://img.shields.io/badge/README-English-blue?style=flat-square)](README.en.md)

简洁、现代的在线 C 语言编译环境，直接在浏览器中即可编写、格式化与运行代码。项目通过 GitHub Pages 自动化部署，适合快速演示与教学。

## 在线体验
- 访问：https://chenyuheee.github.io/c
- 支持亮/暗主题、Monaco 编辑器高亮与代码格式化（Uncrustify WASM）。

## 功能亮点
- 零安装：纯前端运行，打开即用。
- 代码编辑：多主题、快捷键与高亮，支持文件名显示与保存。
- 代码格式化与高亮：内置 Uncrustify WASM 与 Highlight.js。
- 便捷交互：输入/输出侧栏、移动端适配、网络与版本状态提示。

## 本地运行
1. 克隆仓库：`git clone https://github.com/ChenyuHeee/c.git`
2. 进入项目：`cd c`
3. （可选）安装脚本依赖：`npm install`
4. 使用任意静态服务器在本地预览，例如：`npx serve .`，然后在浏览器打开提示的地址。

## 目录速览
- `index.html`：在线编译器主界面。
- `wasm/`：编译与格式化相关的 WebAssembly 资源。
- `scripts/`：排名计算、同步与发布相关的脚本。
- `submissions/`、`competition/`：比赛提交与数据存储。


> Looking for English? Read the [English README](README.en.md).
