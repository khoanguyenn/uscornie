#!/bin/bash
# Chặn script nếu có lỗi xảy ra
set -e

echo "🔍 Đang chạy quét bảo mật tĩnh bằng Semgrep..."
semgrep scan \
  --config p/default \
  --config p/python \
  --config p/fastapi \
  --config p/typescript \
  --config p/react \
  --config p/dockerfile \
  --error \
  "$@"
