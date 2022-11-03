run-android:
    npx react-native run-android

start-metro:
    npx react-native start

update-plugin-from-github branch:
    yarn remove hypertrack-sdk-react-native
    yarn add hypertrack-sdk-react-native@https://github.com/hypertrack/sdk-react-native#{{branch}}

alias u := update-plugin-from-github
alias a := run-android
alias s := start-metro
