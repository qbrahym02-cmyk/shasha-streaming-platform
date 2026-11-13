#!/bin/bash
# بناء نسخة العرض الثابتة (DEMO) — تعمل على أي استضافة ثابتة مثل GitHub Pages
# الاستخدام: bash scripts/build-demo.sh [SITE_URL]
set -e
cd /home/z/my-project

SITE_URL=${1:-"https://qbrahym02-cmyk.github.io"}
API_BACKUP="/tmp/shasha-api-backup"

echo "[1/4] توليد بيانات العرض من قاعدة البيانات..."
bun scripts/gen-demo-data.ts

echo "[2/4] إزالة مسارات API مؤقتاً (غير متوافقة مع التصدير الثابت)..."
rm -rf "$API_BACKUP"
mv src/app/api "$API_BACKUP"
restore_api() { [ -d "$API_BACKUP" ] && mv "$API_BACKUP" src/app/api || true; }
trap restore_api EXIT

echo "[3/4] البناء الثابت..."
BUILD_DEMO=1 \
NEXT_PUBLIC_DEMO_MODE=1 \
NEXT_PUBLIC_SITE_URL="$SITE_URL" \
bunx next build

echo "[4/4] نسخ ملفات إضافية..."
# توجد في public أصلاً (manifest/sw/offline/assetlinks/الصور)
echo "=== تم! الناتج في out/ ==="
ls out/ | head -20
