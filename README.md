# React Native Quickstart for HyperTrack SDK

[![GitHub](https://img.shields.io/github/license/hypertrack/quickstart-react-native?color=orange)](./LICENSE)
[![Github](https://img.shields.io/badge/hypertrack_sdk_react_native-11.0.0-brightgreen.svg)](https://github.com/hypertrack/sdk-react-native)

[HyperTrack](https://www.hypertrack.com/) lets you add live location tracking to your mobile app. Live location is made available along with ongoing activity, tracking controls and tracking outage with reasons.

This repo contains an example React Native app that has everything you need to get started.

For information about how to get started with React Native SDK, please check this [Guide](https://www.hypertrack.com/docs/install-sdk-react-native).

## How to get started?

### Create HyperTrack Account

[Sign up](https://dashboard.hypertrack.com/signup) for HyperTrack and get your publishable key from the [Setup page](https://dashboard.hypertrack.com/setup).

### Set up the environment

You need to [set up the development environment for React Native](https://reactnative.dev/docs/environment-setup)

### Clone Quickstart app

### Install Dependencies

#### General Dependencies

Run

- `yarn`

#### iOS dependencies

Quickstart app uses [CocoaPods](https://cocoapods.org/) dependency manager to install the latest version of the iOS SDK. Using the latest version of CocoaPods is advised.

If you don't have CocoaPods, [install it first](https://guides.cocoapods.org/using/getting-started.html#installation).

```sh
cd ios
pod install
```

### Set up the publishable key

Follow the [instructions on setting up publishable key](https://hypertrack.com/docs/install-sdk-react-native#set-the-publishable-key) in our docs

### Set up silent push notifications

Follow the [instructions on setting up silent push notifications](https://hypertrack.com/docs/install-sdk-react-native/#set-up-silent-push-notifications) in our docs.

HyperTrack SDK needs Firebase Cloud Messaging and APNS to manage on-device tracking as well as enable using HyperTrack cloud APIs from your server to control the tracking.

### Run the app

#### Android

Run `npx react-native run-android`

#### iOS

Open the app's workspace file (`/ios/QuickstartReactNative.xcworkspace`) with Xcode.

Select your device and hit Run.

The SDK works both on real devices and simulators.

### Grant permissions

[Grant required permissions to the app](https://hypertrack.com/docs/install-sdk-react-native#grant-the-permissions-to-the-app)

### Start tracking

Press `Start tracking` button.

To see the device on a map, open the [HyperTrack dashboard](https://dashboard.hypertrack.com/).

The app will create a driver with driver handle `test_driver_quickstart_react_native_<your platform>`

## Support

Join our [Slack community](https://join.slack.com/t/hypertracksupport/shared_invite/enQtNDA0MDYxMzY1MDMxLTdmNDQ1ZDA1MTQxOTU2NTgwZTNiMzUyZDk0OThlMmJkNmE0ZGI2NGY2ZGRhYjY0Yzc0NTJlZWY2ZmE5ZTA2NjI) for instant responses. You can also email us at help@hypertrack.com
