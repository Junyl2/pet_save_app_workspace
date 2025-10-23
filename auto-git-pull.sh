#!/bin/bash

# Auto Git Pull Script
# This script backs up the existing repository and clones a fresh copy

REPO_URL="https://$GITHUB_TOKEN@github.com/PackageWeb/pet_save_web"
REPO_NAME="pet_save_web"
DATE=$(date +%Y-%m-%d)

# 기본 디렉토리 이름 설정
NEW_REPO_NAME="${REPO_NAME}_${DATE}"

# 디렉토리 이름 중복 확인 및 숫자 붙이기
COUNT=1
while [ -d "$NEW_REPO_NAME" ]; do
    NEW_REPO_NAME="${REPO_NAME}_${DATE}_$COUNT"
    COUNT=$((COUNT + 1))
    if [ $COUNT -ge 1000 ]; then
        echo "❌ Error: Too many directories with the same name."
        exit 1
    fi
done

# 기존 디렉토리 백업
if [ -d "$REPO_NAME" ]; then
    mv "$REPO_NAME" "$NEW_REPO_NAME"
    echo "📁 기존 디렉토리 $REPO_NAME → $NEW_REPO_NAME 로 변경되었습니다."
fi

# 새로 클론
git clone "$REPO_URL"

echo "✅ Repository cloned successfully!"
echo "📂 New directory: $REPO_NAME"
echo "💾 Backup directory: $NEW_REPO_NAME"
