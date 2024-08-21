alias a := add-plugin
alias al := add-plugin-local
alias ap := add-plugin
alias c := compile
alias cn := clear-nm
alias epn := extract-plugin-nm
alias ogp := open-github-prs
alias oi := open-ios
alias pi := pod-install
alias ra := run-android
alias sm := start-metro
alias td := test-device
alias us := update-sdk
alias v := version
alias va := version-android

REPOSITORY_NAME := "quickstart-react-native"
SDK_NAME := "HyperTrack SDK React Native"

# Source: https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
# \ are escaped
SEMVER_REGEX := "(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?"

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
    if grep -q '"hypertrack-sdk-react-native-plugin-android-location-services-google"' package.json; then
        yarn remove hypertrack-sdk-react-native-plugin-android-location-services-google
    fi
    if grep -q '"hypertrack-sdk-react-native-plugin-android-push-service-firebase"' package.json; then
        yarn remove hypertrack-sdk-react-native-plugin-android-push-service-firebase
    fi

    MAJOR_VERSION=$(echo {{version}} | grep -o '^[0-9]\+')
    if [ $MAJOR_VERSION -ge 12 ]; then
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
    if grep -q '"hypertrack-sdk-react-native-plugin-android-location-services-google"' package.json; then
        yarn remove hypertrack-sdk-react-native-plugin-android-location-services-google
    fi
    if grep -q '"hypertrack-sdk-react-native-plugin-android-push-service-firebase"' package.json; then
        yarn remove hypertrack-sdk-react-native-plugin-android-push-service-firebase
    fi
    yarn add hypertrack-sdk-react-native@file:{{SDK_PLUGIN_LOCAL_PATH}}
    yarn add hypertrack-sdk-react-native-plugin-android-location-services-google@file:{{LOCATION_SERVICES_GOOGLE_PLUGIN_LOCAL_PATH}}
    yarn add hypertrack-sdk-react-native-plugin-android-push-service-firebase@file:{{PUSH_SERVICE_FIREBASE_PLUGIN_LOCAL_PATH}}

    just pod-install

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

start-metro: hooks compile
    npx react-native start

test-device token="no_data":
    #!/usr/bin/env sh
    HASH=$(uuidgen)
    DATETIME=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    # echo $DATETIME

    # get the latest device id for the worker_handle

# provide the key as recipe param
# store key securely
#     curl --location 'https://v3.api.hypertrack.com/drivers/test_driver_quickstart_react_native_android' \
# --header 'Authorization: Basic {{token}}'

    # cat input.txt | jq -r '.markers[] | select(.type == "device_linked") | "\(.timestamp),\(.device_id)"' > output.txt
    echo "$DATETIME,6698EA79-4F81-48B1-B3F1-01872E7AC86F" > output.txt

    DEVICE_ID=""
    output=$(grep -Eo "^([^,]+)," output.txt)

    while read -r line; do
        if [[ "$line" > "$DATETIME" || "$line" == "$DATETIME"* ]]; then
            LINE=$(grep "$line" output.txt)
            DEVICE_ID=$(echo "$LINE" | cut -d, -f2)
            # echo "Device ID: $DEVICE_ID"
            break
        fi
    done <<< "$output" 

    if [ -z "$DEVICE_ID" ]; then
        echo "Device not found"
        exit 1
    fi
    echo "Device ID: $DEVICE_ID"

    # todo: update run hash in sources
    # todo: update tests code in sources
    just ra
    sleep 30s

    # todo: get geotags
    # todo: store key securely
#     curl --location 'https://v3.api.hypertrack.com/workers/test_driver_quickstart_react_native_android/history' \
# --header 'Authorization: Basic {{token}}'

    cat result.json | jq ".markers[].data | select(.metadata != null) | [.recorded_at, (.metadata | tojson)] | @csv" > geotags.txt




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
