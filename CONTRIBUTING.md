# Contributing

## FAQ

### How to update HyperTrack SDK wrapper version?

Update the [package.json](./package.json) according to [Install guide](https://hypertrack.com/docs/install-sdk-react-native#add-hypertrack-sdk-to-your-project)

### How to run with local build of the SDK?

Run `just al`. This command will look for local SDK repo in `../sdk-react-native`. It will override the `node_modules` content of `../sdk-react-native/sdk` to avoid conflicts with the `devDependencies` of the SDK.

### How to change build config?

React Native version: `package.json` - `react-native`

#### Android

- `android/build.gradle` - `ext.buildscript`
  - compileSdkVersion
  - targetSdkVersion
  - minSdkVersion

### How to get logs

You can see native logs with according native IDE.

React Native logs are printed in Metro UI. Run `npx react-native start` to open it.
