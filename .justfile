alias ag := add-plugin-from-github
alias a := add-plugin
alias ra := run-android
alias sm := start-metro
alias cn := clear-nm
alias cpn := clear-plugin-nm
alias c := compile
alias oi := open-ios

apk output_folder:
    #!/usr/bin/env sh
    export ENTRY_FILE="index.native.js"
    cd android
    # ./gradlew assembleRelease
    echo "APK generated: android/app/build/outputs/apk/release/app-release.apk"
    cp app/build/outputs/apk/release/app-release.apk {{output_folder}}

compile: hooks
    npx tsc

hooks:
    chmod +x .githooks/pre-push
    git config core.hooksPath .githooks

run-android: hooks compile 
    npx react-native run-android

start-metro: hooks compile
    npx react-native start

add-plugin version: hooks
    yarn remove hypertrack-sdk-react-native
    yarn add hypertrack-sdk-react-native@{{version}}

add-plugin-from-github branch: hooks
    yarn remove hypertrack-sdk-react-native
    yarn add hypertrack-sdk-react-native@https://github.com/hypertrack/sdk-react-native#{{branch}}

clear-nm: hooks
    rm -rf node_modules
    rm yarn.lock

clear-plugin-nm:
    rm -rf node_modules/hypertrack-sdk-react-native

open-ios:
    open ios/QuickstartReactNative.xcworkspace
