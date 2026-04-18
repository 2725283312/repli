#!/bin/bash
# 推送项目到 GitHub 仓库
set -e

TOKEN="${1:-}"
REPO="${2:-https://github.com/2725283312/repli.git}"

if [ -z "$TOKEN" ]; then
  echo "Usage: $0 <github_token> [repo_url]"
  exit 1
fi

cd "$(dirname "$0")/.."

REMOTE_URL="https://2725283312:${TOKEN}@github.com/2725283312/repli.git"

git config user.email "replit-agent@replit.com" 2>/dev/null || true
git config user.name "Replit Agent" 2>/dev/null || true

git remote remove github 2>/dev/null || true
git remote add github "$REMOTE_URL"

git add -A
git status

echo "Pushing to GitHub..."
git push github HEAD:main --force
echo "Done!"
