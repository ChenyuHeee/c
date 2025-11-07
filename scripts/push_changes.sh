#!/usr/bin/env bash
set -euo pipefail

# push_changes.sh
# 用法：在项目根运行： ./scripts/push_changes.sh
# 该脚本会把我们刚修改的文件添加、提交并推送到 origin main。

# 确认在仓库根
if [ ! -d ".git" ]; then
  echo "当前目录不是 git 仓库根。请在仓库根目录运行此脚本。"
  exit 1
fi

# 检查远程
if ! git remote get-url origin >/dev/null 2>&1; then
  echo "未检测到 remote 'origin'，请先配置远程，例如：git remote add origin <url>"
  exit 1
fi

# 列出将要提交的文件
FILES=(.github/workflows/deploy-pages.yml index.html CHANGELOG.md scripts/version.js sw.js about.html)

echo "准备提交以下文件（若存在）："
for f in "${FILES[@]}"; do
  if [ -e "$f" ]; then
    echo "  - $f"
  fi
done

# 暂存这些文件（如果存在）
for f in "${FILES[@]}"; do
  if [ -e "$f" ]; then
    git add "$f"
  fi
done

# 如果没有改动，不提交
if [ -z "$(git status --porcelain)" ]; then
  echo "没有需要提交的改动。"
  exit 0
fi

MSG="chore: remove deprecated WASM artifacts and steps; simplify Pages deploy; bump version to v1.3.8"

echo "Committing with message: $MSG"
if git commit -m "$MSG"; then
  echo "Commit created. Pushing to origin main..."
  # 推送；如果 main 不存在于远程，会设置上游
  git push origin main || git push -u origin main
  echo "Push 完成。"
else
  echo "提交失败（可能没有暂存文件）。请手动检查 git status。"
  exit 1
fi
