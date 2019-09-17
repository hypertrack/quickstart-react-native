import React, {Component} from 'react';
import {Platform, Share, StyleSheet, Text, View} from 'react-native';
import Button from 'apsl-react-native-button'

// Import HyperTrack SDK API
// You can also use CriticalErrors to react to different kind of errors preventing tracking (ex: permissions deined)
import {CriticalErrors, HyperTrack} from 'hypertrack-sdk-react-native';

const PUBLISHABLE_KEY = "Paste_your_publishable_key_here";

export default class HyperTrackQuickstart extends Component {

    state = {
        deviceId: "",
        trackingState: "Started",
        isTracking: true,
        isShareButtonDisabled: false
    };

    _initializeHyperTrack = async () => {
        // (Optional) This turns on logging for underlying native SDKs. Placed on top so SDKs start logging immediately
        HyperTrack.enableDebugLogging(true);

        // Initialize HyperTrack with a publishable key
        this.hyperTrack = await HyperTrack.createInstance(PUBLISHABLE_KEY);

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

    _onPressTrackingButton = async () => {
        const isTracking = await this.hyperTrack.isTracking();

        if (isTracking) this.hyperTrack.stopTracking();
        else this.hyperTrack.startTracking();
    };

    // Call the initialization in componentWillMount
    componentWillMount() {
        this._initializeHyperTrack();
    }

    // (Optional) Unregister tracking listeners if they were registered in previous step
    componentWillUnmount() {
        this.hyperTrack.unregisterTrackingListeners(this);
    }

    render() {
        const {
            isTracking,
            trackingState,
            isShareButtonDisabled
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
                <View style={styles.middleButtonContainer}>
                    <Button
                        onPress={() => this._shareLocation()}
                        style={styles.shareButton}
                        textStyle={styles.buttonText}
                        isDisabled={isShareButtonDisabled}
                    >
                        {"Share Your Location"}
                    </Button>
                </View>
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={this._onPressTrackingButton.bind(this)}
                        style={isTracking ? styles.stopButton : styles.startButton}
                        textStyle={styles.buttonText}
                    >
                        {isTracking ? "Stop Tracking" : "Start Tracking"}
                    </Button>
                </View>
            </View>
        );
    }

    _shareLocation() {
        this.setState({isShareButtonDisabled: true});
        this._getTrackingLinkFromServer()
            .then((responseJson) => {
                this.setState({isShareButtonDisabled: false});
                const result = `https://trck.at/${responseJson}`;
                Share.share({
                    message: result,
                    url: result
                }, {
                    // Android only:
                    dialogTitle: 'Share Location',
                    // iOS only:
                    excludedActivityTypes: []
                });
            });
    }

    _getTrackingLinkFromServer() {
        return fetch('https://7kcobbjpavdyhcxfvxrnktobjm.appsync-api.us-west-2.amazonaws.com/graphql', {
            method: 'POST',
            headers: {
                'X-Api-Key': 'da2-nt5vwlflmngjfbe6cbsone4emm',
            },
            body: JSON.stringify({
                'operationName': 'getPublicTrackingIdQuery',
                'variables':
                    {
                        "deviceId": this.state.deviceId,
                        "publishableKey": PUBLISHABLE_KEY
                    },
                'query': 'query getPublicTrackingIdQuery($publishableKey: String!, $deviceId: String!){\n  getPublicTrackingId(publishable_key: $publishableKey, device_id: $deviceId){\n    tracking_id\n  }\n}',
            }),
        })
            .then((response) => response.json())
            .then((responseJson) => {
                return responseJson.data.getPublicTrackingId.tracking_id;
            });
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
    shareButton: {
        backgroundColor: "#040504",
        borderWidth: 0
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
