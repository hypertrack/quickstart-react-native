alias a := add-plugin
alias al := add-plugin-local
alias ap := add-plugin
alias c := clean
alias ca := create-rn-app
alias cm := compile
alias cn := clear-nm
alias epn := extract-plugin-nm
alias ogp := open-github-prs
alias oi := open-ios
alias pi := pod-install
alias ra := run-android
alias rf := restore-files-for-update
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

create-rn-app version="0.77.0": store-files-for-update
    #!/usr/bin/env sh
    set -euo pipefail

    # check if react-native-cli and @react-native-community/cli are installed and delete if they are
    if [ -x "$(npm list -g react-native-cli)" ]; then
        echo "To avoid conflicts, uninstall react-native-cli globally with \n 'npm uninstall -g react-native-cli'"
        exit 1
    fi
    if [ -x "$(npm list -g @react-native-community/cli)" ]; then
        echo "To avoid conflicts, uninstall @react-native-community/cli globally with \n 'npm uninstall -g @react-native-community/cli'"
        exit 1
    fi

    if [[ "{{version}}" > "0.71.0" ]]; then
        npx @react-native-community/cli@latest init QuickstartReactNative --version {{version}} --pm yarn
    else
        npx @react-native-community/cli@latest init QuickstartReactNative --version {{version}} --pm yarn --template react-native-template-typescript
    fi

    cp -r QuickstartReactNative/* .
    rm -rf QuickstartReactNative

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

restore-files-for-update:
    #!/usr/bin/env sh
    set -euo pipefail

    cp -f update_storage/AndroidManifest.xml android/app/src/main/AndroidManifest.xml 2>/dev/null || true
    cp -f update_storage/Info.plist ios/QuickstartReactNative/Info.plist 2>/dev/null || true
    cp -f update_storage/App.tsx src/App.tsx 2>/dev/null || true
    cp -f update_storage/.eslintrc.js .eslintrc.js 2>/dev/null || true
    cp -f update_storage/prettierrc.js .prettierrc.js 2>/dev/null || true
    cp -f update_storage/yarnrc.yml .yarnrc.yml 2>/dev/null || true
    cp -f update_storage/app.json app.json 2>/dev/null || true
    cp -f update_storage/README.md README.md 2>/dev/null || true

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

    rm -rf update_storage
    mkdir -p update_storage
    cp android/app/src/main/AndroidManifest.xml update_storage/AndroidManifest.xml 2>/dev/null || true
    cp ios/QuickstartReactNative/Info.plist update_storage/Info.plist 2>/dev/null || true
    cp src/App.tsx update_storage/App.tsx 2>/dev/null || true
    cp .eslintrc.js update_storage/.eslintrc.js 2>/dev/null || true
    cp .prettierrc.js update_storage/prettierrc.js 2>/dev/null || true
    cp .yarnrc.yml update_storage/yarnrc.yml 2>/dev/null || true
    cp app.json update_storage/app.json 2>/dev/null || true
    cp README.md update_storage/README.md 2>/dev/null || true

    # remove all files listed in rn_files.txt
    while IFS= read -r line; do
        rm -rf "$line"
    done < rn_files.txt

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
        "update_storage"
        ".git"
        ".githooks"
        ".gitignore"
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

