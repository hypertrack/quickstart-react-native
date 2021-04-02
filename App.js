/*
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */


import React, {Component} from 'react';
import Button from 'apsl-react-native-button';
import {
  StyleSheet,
  View,
  Text
} from 'react-native';

// Import HyperTrack SDK API
// You can also use CriticalErrors to react to different kind of errors preventing tracking (ex: permissions deined)
import {CriticalErrors, HyperTrack} from 'hypertrack-sdk-react-native';

const PUBLISHABLE_KEY = "Paste_your_publishable_key_here";

export default class HyperTrackQuickstart extends Component {

    state = {
        deviceId: "",
        trackingState: "Stopped",
        isTracking: false
    };

    _initializeHyperTrack = async () => {
        // (Optional) This turns on logging for underlying native SDKs. Placed on top so SDKs start logging immediately
        HyperTrack.enableDebugLogging(true);

        // Initialize HyperTrack with a publishable key
        this.hyperTrack = await HyperTrack.createInstance(PUBLISHABLE_KEY, false);

        // Obtain the unique HyperTrack's DeviceID identifier to use it with HyperTrack's APIs
        const deviceId = await this.hyperTrack.getDeviceID();
        this.setState({deviceId: deviceId});

        // (Optional) Set the device name to display in dashboard (for ex. user name)
        this.hyperTrack.setDeviceName("RN Quickstart");

        // (Optional) Attach any JSON metadata to this device to see in HyperTrack's API responses
        this.hyperTrack.setMetadata({driver_id: "83B3X5", state: "IN_PROGRESS"});

        // (Optional) Register tracking listeners to update your UI when SDK starts/stops or react to errors
        this.hyperTrack.registerTrackingListeners(this,
            // Display or log errors
            (error) => {
                if (error.code === CriticalErrors.INVALID_PUBLISHABLE_KEY
                    || error.code === CriticalErrors.AUTHORIZATION_FAILED) {
                    console.log("Initialization failed")
                } else {
                    console.log("Tracking failed")
                }
                this.setState({
                    trackingState: "Stopped with error: " + error.code + " - " + error.message,
                    isTracking: false
                })
            },
            // Update UI when tracking starts
            () => this.setState({trackingState: "Started", isTracking: true}),
            // Update UI when tracking stops
            () => this.setState({trackingState: "Stopped", isTracking: false}));
    };

    startTracking = function () {
        console.log("Start tracking")
        this.hyperTrack.startTracking()
    };
    stopTracking = function () {
        console.log("Stop tracking")
        this.hyperTrack.stopTracking()
    };

    getotag = async () => {
        console.log("Add geotag")
        // this.hyperTrack.addGeotag({'test': true})
        let expectedLocation = {latitude: 37.7953, longitude: -122.3969}
        let result = await this.hyperTrack.addGeotag({'test': true}, expectedLocation, true);
       console.log("Got geotag result " + result?.code);
    };


    // Call the initialization in componentWillMount
    UNSAFE_componentWillMount() {
        this._initializeHyperTrack();
    }

    // (Optional) Unregister tracking listeners if they were registered in previous step
    UNSAFE_componentWillUnmount() {
        this.hyperTrack.unregisterTrackingListeners(this);
    }

    render() {
        const {
            isTracking,
            trackingState
        } = this.state;

        return (
            <View style={styles.bigContainer}>
                <Text style={styles.titleText}>
                    {"Device ID (long press to copy)"}
                </Text>
                <Text selectable style={styles.text}>{this.state.deviceId}</Text>
                <Text style={styles.titleText}>
                    {"Tracking state"}
                </Text>
                <Text style={styles.text}>{trackingState}</Text>
                <Button onPress={() => { this.startTracking(); }}>Start Tracking</Button>
                <Button onPress={() => { this.stopTracking();  }}>Stop Tracking</Button>
                <Button onPress={() => { this.getotag(); }}>Add Geotag</Button>
                <View style={styles.buttonContainer}>
                    <Button
                        style={isTracking ? styles.startButton : styles.stopButton }
                        textStyle={styles.buttonText}
                    >
                        {isTracking ? "Tracking" : "Not Tracking"}
                    </Button>
                </View>
            </View>
        );
    }
}

const stylesBase = {
    titleText: {
        textAlign: 'center',
        width: '100%',
        color: '#000000',
        fontWeight: 'bold',
        padding: 2,
        fontSize: 20
    },
    text: {
        textAlign: 'center',
        width: '100%',
        color: '#000000',
        padding: 10,
        fontSize: 18
    },
    buttonText: {
        color: '#ffffff',
    },
    bigContainer: {
        flex: 1,
        padding: 50,
        backgroundColor: "#fff",
        justifyContent: "flex-start"
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "flex-end"
    },
    middleButtonContainer: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: 'center',
        alignItems: 'center'
    },
    startButton: {
        backgroundColor: "#00ce5b",
        borderWidth: 0
    },
    stopButton: {
        backgroundColor: "#040504",
        borderWidth: 0
    }
};

const styles = StyleSheet.create(stylesBase);
