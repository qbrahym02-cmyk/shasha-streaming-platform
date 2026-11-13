#!/bin/bash
# بناء تطبيق أندرويد APK (TWA) — الاستخدام:
#   bash scripts/build-apk.sh https://your-domain.com
# المتطلبات (مرة واحدة):
#   npm install -g @bubblewrap/cli
#   printf 'Y\nY\n' | bubblewrap doctor   # يثبّت JDK 17 + Android SDK
#   pip install pexpect
set -e
cd "$(dirname "$0")/.."
ROOT=$(pwd)
APK_DIR="$ROOT/apk"
SITE_URL=${1:-"https://qbrahym02-cmyk.github.io"}
# نظّف الرابط
SITE_URL="${SITE_URL%/}"
HOST=$(echo "$SITE_URL" | sed -E 's|https?://||; s|/.*||')
mkdir -p "$APK_DIR"
cd "$APK_DIR"

# 1) مفتاح التوقيع (يُنشأ مرة واحدة ويُحفظ بأمان — لا ترفعه لـ GitHub أبداً)
if [ ! -f shasha.keystore ]; then
  if [ -f keystore.properties ]; then PASS=$(cat keystore.properties); else PASS=$(openssl rand -base64 14); echo "$PASS" > keystore.properties; fi
  echo "[APK] إنشاء مفتاح توقيع جديد..."
  keytool -genkeypair -v -keystore shasha.keystore -alias shasha -keyalg RSA -keysize 2048 \
    -validity 10950 -storepass "$PASS" -keypass "$PASS" \
    -dname "CN=SHASHA, OU=Mobile, O=Brahim, L=Algiers, C=DZ"
fi
PASS=$(cat keystore.properties)

# 2) البصمة و assetlinks
FINGERPRINT=$(keytool -list -v -keystore shasha.keystore -storepass "$PASS" 2>/dev/null | grep "SHA256:" | head -1 | tr -d ' \t' | sed 's/SHA256://')
cat > "$ROOT/public/.well-known/assetlinks.json" << EOF
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.shasha.app",
    "sha256_cert_fingerprints": ["$FINGERPRINT"]
  }
}]
EOF
echo "[APK] البصمة: $FINGERPRINT"
echo "[APK] حدّثت public/.well-known/assetlinks.json — يجب أن يُخدم من الموقع نفسه لعرض التطبيق ملء الشاشة"

# 3) twa-manifest.json
cat > twa-manifest.json << EOF
{
  "packageId": "com.shasha.app",
  "host": "$HOST",
  "name": "شاشة — أفلام ومسلسلات وأنمي",
  "launcherName": "شاشة",
  "display": "standalone",
  "themeColor": "#070b09",
  "themeColorDark": "#070b09",
  "navigationColor": "#070b09",
  "navigationColorDark": "#070b09",
  "navigationDividerColor": "#070b09",
  "navigationDividerColorDark": "#070b09",
  "backgroundColor": "#070b09",
  "enableNotifications": true,
  "startUrl": "/",
  "iconUrl": "$SITE_URL/icons/icon-512.png",
  "maskableIconUrl": "$SITE_URL/icons/maskable-512.png",
  "splashScreenFadeOutDuration": 300,
  "signingKey": { "path": "./shasha.keystore", "alias": "shasha" },
  "appVersionName": "1.0.0",
  "appVersionCode": 1,
  "shortcuts": [],
  "generatorApp": "bubblewrap-cli",
  "webManifestUrl": "$SITE_URL/manifest.json",
  "fallbackType": "customtabs",
  "features": {},
  "alphaDependencies": { "enabled": false },
  "enableSiteSettingsShortcut": true,
  "isChromeOSOnly": false,
  "isMetaQuest": false,
  "fullScopeUrl": "$SITE_URL/",
  "minSdkVersion": 24,
  "orientation": "default",
  "fingerprints": [{ "name": "FINGERPRINT", "value": "$FINGERPRINT" }],
  "additionalTrustedOrigins": [],
  "retainedBundles": [],
  "appVersion": "1.0.0"
}
EOF

# 4) البناء
echo "[APK] بدء البناء (Gradle)..."
if command -v python3 >/dev/null && python3 -c "import pexpect" 2>/dev/null; then
  PASS_VALUE="$PASS" python3 "$ROOT/scripts/bubblewrap_build.py"
else
  echo "[APK] شغّل يدوياً: cd apk && bubblewrap build  (كلمة مرور المفتاح في apk/keystore.properties)"
  exit 1
fi

echo ""
echo "============================================"
echo "✅ تم البناء:"
ls -la app-release-signed.apk app-release-bundle.aab 2>/dev/null
echo "   - app-release-signed.apk : تثبيت مباشر على الهاتف"
echo "   - app-release-bundle.aab : للنشر على Google Play"
echo "============================================"
