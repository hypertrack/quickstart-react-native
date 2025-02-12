alias a := add-plugin
alias al := add-plugin-local
alias ap := add-plugin
alias c := clean
alias cm := compile
alias cn := clear-nm
alias epn := extract-plugin-nm
alias ogp := open-github-prs
alias oi := open-ios
alias pi := pod-install
alias ra := run-android
alias s := setup
alias sf := store-files-for-update
alias sm := start-metro
alias us := update-sdk
alias v := version
alias va := version-android

REPOSITORY_NAME := "quickstart-react-native"
SDK_NAME := "HyperTrack SDK React Native"

# Source: https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
# \ are escaped
SEMVER_REGEX := "(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?"

ACTIVITY_SERVICE_GOOGLE_PLUGIN_LOCAL_PATH := "../sdk-react-native/plugin_android_activity_service_google"
LOCATION_SERVICES_GOOGLE_PLUGIN_LOCAL_PATH := "../sdk-react-native/plugin_android_location_services_google"
LOCATION_SERVICES_GOOGLE_19_0_1_PLUGIN_LOCAL_PATH := "../sdk-react-native/plugin_android_location_services_google_19_0_1"
PUSH_SERVICE_FIREBASE_PLUGIN_LOCAL_PATH := "../sdk-react-native/plugin_android_push_service_firebase"
SDK_PLUGIN_LOCAL_PATH := "../sdk-react-native/sdk"

add-plugin version: hooks
    #!/usr/bin/env sh
    set -euo pipefail

    if grep -q '"hypertrack-sdk-react-native"' package.json; then
        yarn remove hypertrack-sdk-react-native
    fi
    if grep -q '"hypertrack-sdk-react-native-plugin-android-activity-service-google"' package.json; then
        yarn remove hypertrack-sdk-react-native-plugin-android-activity-service-google
    fi
    if grep -q '"hypertrack-sdk-react-native-plugin-android-location-services-google"' package.json; then
        yarn remove hypertrack-sdk-react-native-plugin-android-location-services-google
    fi
    if grep -q '"hypertrack-sdk-react-native-plugin-android-push-service-firebase"' package.json; then
        yarn remove hypertrack-sdk-react-native-plugin-android-push-service-firebase
    fi

    MAJOR_VERSION=$(echo {{version}} | grep -o '^[0-9]\+')
    if [ $MAJOR_VERSION -ge 12 ]; then
        yarn add hypertrack-sdk-react-native-plugin-android-activity-service-google@{{version}}
        yarn add hypertrack-sdk-react-native-plugin-android-location-services-google@{{version}}
        yarn add hypertrack-sdk-react-native-plugin-android-push-service-firebase@{{version}}
    fi
    yarn add hypertrack-sdk-react-native@{{version}}

    just pod-install

add-plugin-local: hooks
    #!/usr/bin/env sh
    set -euo pipefail

    yarn add hypertrack-sdk-react-native
    just extract-plugin-nm
    if grep -q '"hypertrack-sdk-react-native"' package.json; then
        yarn remove hypertrack-sdk-react-native
    fi
    if grep -q '"hypertrack-sdk-react-native-plugin-android-activity-service-google"' package.json; then
        yarn remove hypertrack-sdk-react-native-plugin-android-activity-service-google
    fi
    if grep -q '"hypertrack-sdk-react-native-plugin-android-location-services-google"' package.json; then
        yarn remove hypertrack-sdk-react-native-plugin-android-location-services-google
    fi
    if grep -q '"hypertrack-sdk-react-native-plugin-android-push-service-firebase"' package.json; then
        yarn remove hypertrack-sdk-react-native-plugin-android-push-service-firebase
    fi
    
    yarn add hypertrack-sdk-react-native@file:{{SDK_PLUGIN_LOCAL_PATH}}
    yarn add hypertrack-sdk-react-native-plugin-android-activity-service-google@file:{{ACTIVITY_SERVICE_GOOGLE_PLUGIN_LOCAL_PATH}}
    yarn add hypertrack-sdk-react-native-plugin-android-location-services-google@file:{{LOCATION_SERVICES_GOOGLE_PLUGIN_LOCAL_PATH}}
    yarn add hypertrack-sdk-react-native-plugin-android-push-service-firebase@file:{{PUSH_SERVICE_FIREBASE_PLUGIN_LOCAL_PATH}}

    just pod-install

clean:
    just clear-nm

clear-nm: hooks
    rm -rf node_modules
    rm yarn.lock

compile: hooks
    npx tsc

extract-plugin-nm:
    rm -rf {{SDK_PLUGIN_LOCAL_PATH}}/node_modules
    mkdir {{SDK_PLUGIN_LOCAL_PATH}}/node_modules
    cp -r node_modules/hypertrack-sdk-react-native/node_modules {{SDK_PLUGIN_LOCAL_PATH}}/node_modules

hooks:
    chmod +x .githooks/pre-push
    git config core.hooksPath .githooks

open-github-prs:
    open "https://github.com/hypertrack/{{REPOSITORY_NAME}}/pulls"

open-ios:
    open ios/QuickstartReactNative.xcworkspace

pod-install:
    #!/usr/bin/env sh
    cd ios
    rm -f Podfile.lock
    pwd
    NO_FLIPPER=1 pod install --repo-update
    cd ..

run-android: hooks compile
    npx react-native run-android

setup: hooks
    yarn
    just pi

start-metro: hooks compile
    npx react-native start

store-files-for-update: _get_rn_files
    #!/usr/bin/env sh
    set -euo pipefail

    mkdir -p update_storage
    cp android/app/src/main/AndroidManifest.xml update_storage/AndroidManifest.xml
    cp ios/QuickstartReactNative/Info.plist update_storage/Info.plist
    cp src/App.tsx update_storage/App.tsx
    cp .eslintrc.js update_storage/.eslintrc.js
    cp .prettierrc.js update_storage/prettierrc.js
    cp .yarnrc.yml update_storage/yarnrc.yml
    cp app.json update_storage/app.json

update-sdk version: hooks
    git checkout -b update-sdk-{{version}}
    just add-plugin {{version}}
    git commit -am "Update {{SDK_NAME}} to {{version}}"
    just open-github-prs

version:
    @cat package.json | grep hypertrack-sdk-react-native | head -n 1 | grep -o -E '{{SEMVER_REGEX}}'

version-android:
    #!/usr/bin/env sh
    set -euo pipefail
    cd android
    ./gradlew app:dependencies | grep "com.hypertrack:sdk-android" | head -n 1 | grep -o -E '{{SEMVER_REGEX}}'
    cd ..

_get_rn_files:
    #!/usr/bin/env sh
    set -euo pipefail

    TARGET_DIR="$PWD"

    # not related to RN 
    EXCEPTIONS=(
        ".git"
        ".githooks"
        ".idea"
        "CONTRIBUTING.md"
        "justfile"
        "LICENSE"
        "README.md"
        "text.txt"
        "rn_files.txt"
    )

    # Construct the exclusion filter safely
    EXCLUDE_ARGS=()
    for item in "${EXCEPTIONS[@]}"; do
        EXCLUDE_ARGS+=(! -name "$item")
    done

    find "$TARGET_DIR" -mindepth 1 -maxdepth 1 "${EXCLUDE_ARGS[@]}" -print > rn_files.txt

