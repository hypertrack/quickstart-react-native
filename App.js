import React, {Component} from 'react';
import {Platform, Share, StyleSheet, Text, View} from 'react-native';
import Button from 'apsl-react-native-button'
import {CriticalErrors, HyperTrack} from 'hypertrack-sdk-react-native';

const PUBLISHABLE_KEY = "YOUR_PUBLISHABLE_KEY";

export default class HyperTrackQuickstart extends Component {

    state = {
        deviceId: "",
        trackingState: "",
        isTracking: false,
        isShareButtonDisabled: false
    };

    constructor(props) {
        super(props);
        // Initialize HyperTrack with a publishable key
        // Set your Publishable Key here
        HyperTrack.initialize(PUBLISHABLE_KEY, false);
        HyperTrack.enableDebugLogging(true);
        // return a string which is used by HyperTrack to uniquely identify the user.
        HyperTrack.getDeviceID().then((deviceId) => this.setState({deviceId: deviceId}));
    }

    componentWillMount() {
        HyperTrack.addTrackingListeners(this,
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
            () => this.setState({trackingState: "Started", isTracking: true}),
            () => this.setState({trackingState: "Stopped", isTracking: false}));
    }

    componentWillUnmount() {
        HyperTrack.removeTrackingListeners(this);
    }

    async _onStartStopButtonPress() {
        await HyperTrack.isTracking() ? HyperTrack.stopTracking() : HyperTrack.startTracking()
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
                        onPress={this._onStartStopButtonPress}
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
                var result = `https://trck.at/${responseJson}`;
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
