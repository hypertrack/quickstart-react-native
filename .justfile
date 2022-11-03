run-android:
    npx react-native run-android

start-metro:
    npx react-native start

re-add-plugin-from-github branch:
    yarn remove hypertrack-sdk-react-native
    just a {{branch}}

add-plugin-from-github branch:
    yarn add hypertrack-sdk-react-native@https://github.com/hypertrack/sdk-react-native#{{branch}}

alias add := add-plugin-from-github
alias r := re-add-plugin-from-github
alias a := run-android
alias s := start-metro
