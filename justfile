alias ag := add-plugin-from-github
alias a := add-plugin
alias ra := run-android
alias sm := start-metro
alias cn := clear-nm
alias cpn := clear-plugin-nm
alias c := compile
alias oi := open-ios
alias epn := extract-plugin-nm
alias al := add-plugin-local

SDK_PLUGIN_LOCAL_PATH := "../sdk-react-native/sdk"
LOCATION_SERVICES_GOOGLE_PLUGIN_LOCAL_PATH := "../sdk-react-native/plugin_android_location_services_google"
LOCATION_SERVICES_GOOGLE_19_0_1_PLUGIN_LOCAL_PATH := "../sdk-react-native/plugin_android_location_services_google_19_0_1"
PUSH_SERVICE_FIREBASE_PLUGIN_LOCAL_PATH := "../sdk-react-native/plugin_android_push_service_firebase"


extract-plugin-nm:
    rm -rf {{SDK_PLUGIN_LOCAL_PATH}}/node_modules
    mkdir {{SDK_PLUGIN_LOCAL_PATH}}/node_modules
    cp -r node_modules/hypertrack-sdk-react-native/node_modules {{SDK_PLUGIN_LOCAL_PATH}}/node_modules

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

add-plugin-local: hooks
    #!/usr/bin/env sh
    yarn add hypertrack-sdk-react-native
    just extract-plugin-nm
    if grep -q '"hypertrack-sdk-react-native"' package.json; then
        yarn remove hypertrack-sdk-react-native
    fi
    if grep -q '"hypertrack-sdk-react-native-plugin-android-location-services-google"' package.json; then
        yarn remove hypertrack-sdk-react-native-plugin-android-location-services-google
    fi
    if grep -q '"hypertrack-sdk-react-native-plugin-android-push-service-firebase"' package.json; then
        yarn remove hypertrack-sdk-react-native-plugin-android-push-service-firebase
    fi
    yarn add hypertrack-sdk-react-native@file:{{SDK_PLUGIN_LOCAL_PATH}}
    yarn add hypertrack-sdk-react-native-plugin-android-location-services-google@file:{{LOCATION_SERVICES_GOOGLE_PLUGIN_LOCAL_PATH}}
    yarn add hypertrack-sdk-react-native-plugin-android-push-service-firebase@file:{{PUSH_SERVICE_FIREBASE_PLUGIN_LOCAL_PATH}}

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
