#!/bin/bash
# بناء تطبيق أندرويد الأصلي v2.0.0 (Kotlin+Compose) — يعمل في الخلفية
# السجل: /tmp/apk-build.log
set -x
exec > /tmp/apk-build.log 2>&1
set -e

ROOT=/home/z/my-project
SDK=$ROOT/android-sdk
mkdir -p "$SDK/cmdline-tools"

echo "[$(date +%T)] [1/6] تحميل أدوات سطر الأوامر..."
if [ ! -d "$SDK/cmdline-tools/latest" ]; then
  curl -fsSL -o /tmp/cmdtools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -q /tmp/cmdtools.zip -d "$SDK/cmdline-tools"
  mv "$SDK/cmdline-tools/cmdline-tools" "$SDK/cmdline-tools/latest"
fi
export ANDROID_HOME=$SDK
SDKMAN=$SDK/cmdline-tools/latest/bin/sdkmanager

echo "[$(date +%T)] [2/6] قبول التراخيص..."
yes | "$SDKMAN" --licenses > /dev/null 2>&1 || true

echo "[$(date +%T)] [3/6] تثبيت platform-35 + build-tools..."
if [ ! -d "$SDK/platforms/android-35" ]; then
  yes | "$SDKMAN" "platforms;android-35" "build-tools;35.0.0" "platform-tools" > /dev/null
fi
ls "$SDK/platforms/" "$SDK/build-tools/"

echo "[$(date +%T)] [4/6] تحميل Gradle 8.12..."
GRADLE_DIR=$ROOT/gradle-dist
mkdir -p "$GRADLE_DIR"
if [ ! -x "$GRADLE_DIR/gradle-8.12/bin/gradle" ]; then
  curl -fsSL -o /tmp/gradle.zip https://services.gradle.org/distributions/gradle-8.12-bin.zip \
   || curl -fsSL -o /tmp/gradle.zip https://mirrors.cloud.tencent.com/gradle/gradle-8.12-bin.zip
  unzip -q /tmp/gradle.zip -d "$GRADLE_DIR"
fi
GRADLE=$GRADLE_DIR/gradle-8.12/bin/gradle

echo "[$(date +%T)] [5/6] مفتاح التوقيع..."
if [ ! -f "$ROOT/android-signing/shasha.keystore" ]; then
  mkdir -p "$ROOT/android-signing"
  keytool -genkeypair -keystore "$ROOT/android-signing/shasha.keystore" -alias shasha \
    -keyalg RSA -keysize 2048 -validity 10950 \
    -storepass 'Shasha2026!DZ' -keypass 'Shasha2026!DZ' \
    -dname "CN=SHASHA, OU=Mobile, O=Brahim, L=Algiers, C=DZ"
fi

echo "[$(date +%T)] [6/6] البناء assembleRelease..."
cd "$ROOT/android"
export PATH="$SDK/platform-tools:$PATH"
"$GRADLE" assembleRelease --no-daemon -q

echo "[$(date +%T)] نتيجة البناء:"
find "$ROOT/android/app/build/outputs" -name "*.apk" -exec ls -la {} \;
echo "APK_BUILD_DONE"
