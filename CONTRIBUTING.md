# Contributing

## FAQ

### Update HyperTrack SDK wrapper version

Change the `"hypertrack-sdk-react-native"` version in `package.json` file

### How to change build config

React Native version: `package.json` - `react-native`

#### Android 

- `android/build.gradle` - `ext.buildscript`
    - compileSdkVersion
    - targetSdkVersion
    - minSdkVersion

### How to get logs

You can see native logs with according native IDE.

React Native logs are printed in Metro UI. Run `npx react-native start` to open it.