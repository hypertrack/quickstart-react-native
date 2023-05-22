alias ag := add-plugin-from-github
alias av := add-plugin
alias ra := run-android
alias sm := start-metro

alias ul := use-local-dependency
alias cn := clear-nm
alias cpn := clear-plugin-nm

hooks:
    chmod +x .githooks/pre-push
    git config core.hooksPath .githooks

run-android:
    npx react-native run-android

start-metro:
    npx react-native start

add-plugin version:
    yarn remove hypertrack-sdk-react-native
    yarn add hypertrack-sdk-react-native@{{version}}

add-plugin-from-github branch:
    yarn remove hypertrack-sdk-react-native
    yarn add hypertrack-sdk-react-native@https://github.com/hypertrack/sdk-react-native#{{branch}}

clear-nm:
    rm -rf node_modules
    rm yarn.lock

clear-plugin-nm:
    rm -rf node_modules/hypertrack-sdk-react-native

use-local-dependency: hooks clear-plugin-nm
    yarn remove hypertrack-sdk-react-native
    yarn add hypertrack-sdk-react-native@file:../sdk-react-native
