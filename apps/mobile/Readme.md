Local test


Local Build -

⏺ Option 1: Development build (fastest for testing)
  cd apps/mobile
  npx expo run:android
  Requires Android Studio and emulator/device connected.

  Option 2: Local EAS build (creates APK like cloud)
  cd apps/mobile
  eas build --platform android --profile preview --local
  Requires Java 17 and Android SDK installed.

  Option 3: Manual Gradle build
  cd apps/mobile
  npx expo prebuild --platform android
  cd android
  ./gradlew assembleRelease
  # APK at: android/app/build/outputs/apk/release/app-release.apk

  Prerequisites for local builds:
  - Java 17: brew install openjdk@17
  - Android SDK: Install via Android Studio
  - Set environment variables:
  export JAVA_HOME=$(/usr/libexec/java_home -v 17)
  export ANDROID_HOME=$HOME/Library/Android/sdk