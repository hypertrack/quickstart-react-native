# React Native Quickstart for HyperTrack SDKs

![GitHub](https://img.shields.io/github/license/hypertrack/quickstart-react-native.svg)
[![RN SDK](https://img.shields.io/npm/v/hypertrack-sdk-react-native.svg)](https://www.npmjs.com/package/hypertrack-sdk-react-native)
[![iOS SDK](https://img.shields.io/badge/iOS%20SDK-4.0.1-brightgreen.svg)](https://cocoapods.org/pods/HyperTrack)
![Android SDK](https://img.shields.io/badge/Android%20SDK-3.4.7-brightgreen.svg)

[HyperTrack](https://www.hypertrack.com) lets you add live location tracking to your mobile app.
Live location is made available along with ongoing activity, tracking controls and tracking outage with reasons.
This repo contains an example React Native app that has everything you need to get started in minutes.

## Create HyperTrack Account

[Sign up](https://dashboard.hypertrack.com/signup) for HyperTrack and 
get your publishable key from the [Setup page](https://dashboard.hypertrack.com/setup).

## Clone Quickstart app

### Install SDKs Dependencies

#### General Dependencies

```bash
yarn
```

or

```bash
npm install
```

#### iOS Dependencies

Quickstart app uses [CocoaPods](https://cocoapods.org) dependency manager to install the latest version of the iOS SDK. Using the latest version of CocoaPods is advised.

If you don't have CocoaPods, [install it first](https://guides.cocoapods.org/using/getting-started.html#installation).

```bash
cd ios
pod install
```

### Set your Publishable Key

Open the `App.js` file. Locate the line with `publishableKey: "YOUR_PUBLISHABLE_KEY"` in the App class and set your [Publishable Key](#publishable-key) inside the placeholder.

### Set up silent push notifications

Log into the HyperTrack dashboard, and open the [setup page](https://dashboard.hypertrack.com/setup) and scroll to "Server to Device communication" section.

#### Android

Enter your "Server key", which you can obtain by going to your [Firebase Console](https://console.firebase.google.com/), navigate to your project, project settings, Cloud Messaging and copying it from "Project credentials" section.

#### iOS

Upload your Auth Key (file in the format `AuthKey_KEYID.p8` obtained/created from Apple Developer console > Certificates, Identifiers & Profiles > Keys) and fill in your Team ID (Can be seen in Account > Membership).

### Run the app

To run the iOS version open the app's workspace file (`/ios/Quickstart.xcworkspace`) with Xcode. Select your device and hit Run.

To run the Android version execute `react-native run-android` in the repo's root directory.

Enable location and activity permissions (choose "Always Allow" for location).

> HyperTrack creates a unique internal device identifier that's used as mandatory key for all HyperTrack API calls.
> Please be sure to get the `device_id` from the app or the logs. The app calls
> `getDeviceID()` to retrieve it.

You may also set device name and metadata using the [Devices API](https://docs.hypertrack.com/#references-apis-devices)

## Start tracking

Now the app is ready to be tracked from the cloud. HyperTrack gives you powerful APIs
to control device tracking from your backend.

> To use the HyperTrack API, you will need the `{AccountId}` and `{SecretKey}` from the [Setup page](https://dashboard.hypertrack.com/setup).

### Track devices during work

Track devices when user is logged in to work, or during work hours by calling the 
[Devices API](https://docs.hypertrack.com/#references-apis-devices).

To start, call the [start](https://docs.hypertrack.com/?shell#references-apis-devices-post-devices-device_id-start) API.

```
curl -X POST \
  -u {AccountId}:{SecretKey} \
  https://v3.api.hypertrack.com/devices/{device_id}/start
```


Get the tracking status of the device by calling
[GET /devices/{device_id}](https://docs.hypertrack.com/?shell#references-apis-devices-get-devices) api.

```
curl \
  -u {AccountId}:{SecretKey} \
  https://v3.api.hypertrack.com/devices/{device_id}
```

To see the device on a map, open the returned embed_url in your browser (no login required, so you can add embed these views directly to you web app).
The device will also show up in the device list in the [HyperTrack dashboard](https://dashboard.hypertrack.com/).

To stop tracking, call the [stop](https://docs.hypertrack.com/?shell#references-apis-devices-post-devices-device_id-stop) API.

```
curl -X POST \
  -u {AccountId}:{SecretKey} \
  https://v3.api.hypertrack.com/devices/{device_id}/stop
```

### Track trips with ETA

If you want to track a device on its way to a destination, call the [Trips API](https://docs.hypertrack.com/#references-apis-trips-post-trips)
and add destination.

HyperTrack Trips API offers extra fields to get additional intelligence over the Devices API.
* set destination to track route and ETA
* set scheduled_at to track delays
* share live tracking URL of the trip with customers 
* embed live tracking view of the trip in your ops dashboard 

```curl
curl -u {AccountId}:{SecretKey} --location --request POST 'https://v3.api.hypertrack.com/trips/' \
--header 'Content-Type: application/json' \
--data-raw '{
    "device_id": "{device_id}",
    "destination": {
        "geometry": {
            "type": "Point",
            "coordinates": [{longitude}, {latitude}]
        }
    }
}'
```

To get `{longitude}` and `{latitude}` of your destination, you can use for example [Google Maps](https://support.google.com/maps/answer/18539?co=GENIE.Platform%3DDesktop&hl=en).

> HyperTrack uses [GeoJSON](https://en.wikipedia.org/wiki/GeoJSON). Please make sure you follow the correct ordering of longitude and latitude.

The returned JSON includes the embed_url for your dashboard and share_url for your customers.

When you are done tracking this trip, call [complete](https://docs.hypertrack.com/#references-apis-trips-post-trips-trip_id-complete) Trip API using the `trip_id` from the create trip call above.
```
curl -X POST \
  -u {AccountId}:{SecretKey} \
  https://v3.api.hypertrack.com/trips/{trip_id}/complete
```

After the trip is completed, use the [Trips API](https://docs.hypertrack.com/#references-apis-trips-post-trips) to
retrieve a full [summary](https://docs.hypertrack.com/#references-apis-trips-get-trips-trip_id-trip-summary) of the trip.
The summary contains the polyline of the trip, distance, duration and markers of the trip.

```
curl -X POST \
  -u {AccountId}:{SecretKey} \
  https://v3.api.hypertrack.com/trips/{trip_id}
```
 

### Track trips with geofences

If you want to track a device goig to a list of places, call the [Trips API](https://docs.hypertrack.com/#references-apis-trips-post-trips)
and add geofences. This way you will get arrival, exit, time spent and route to geofences. Please checkout our [docs](https://docs.hypertrack.com/#references-apis-trips-post-trips) for more details.

## Dashboard

Once your app is running, go to the [dashboard](https://dashboard.hypertrack.com/devices) where you can see a list of all your devices and their live location with ongoing activity on the map.

## Documentation

You can find our integration guide at the [SDK's README](https://github.com/hypertrack/sdk-react-native#integrate-the-react-native-sdk) and API reference on our [documentation website](https://docs.hypertrack.com/#references-sdks). There is also a full in-code reference for all SDK methods.

## Support
Join our [Slack community](https://join.slack.com/t/hypertracksupport/shared_invite/enQtNDA0MDYxMzY1MDMxLTdmNDQ1ZDA1MTQxOTU2NTgwZTNiMzUyZDk0OThlMmJkNmE0ZGI2NGY2ZGRhYjY0Yzc0NTJlZWY2ZmE5ZTA2NjI) for instant responses. You can also email us at help@hypertrack.com.
