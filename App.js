import React, {Component} from 'react';
import {
  NativeEventEmitter,
  Platform,
  StyleSheet,
  Text,
  View,
  Share,
  NativeModules} from 'react-native';
import { Dimensions } from "react-native";
import Button from 'apsl-react-native-button'
var RNHyperTrack = NativeModules.RNHyperTrack;
const hyperTrackEmitter = new NativeEventEmitter(RNHyperTrack);

export default class HyperTrackQuickstart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      device_id: "",
      isTracking: false,
      publishableKey: "YOUR_PUBLISHABLE_KEY"
    };

    // Initialize HyperTrack with a publishable key
    // Set your Publishable Key here
    RNHyperTrack.initialize(this.state.publishableKey);
  }

  componentWillMount() {
    // Here we use Events to push tracking statuses to every
    // controller that needs to update

    // This subscription receives critical errors
    // that need explicit handling. After an error is
    this.subscriptionHTRNError = hyperTrackEmitter.addListener(
      'hypertrack.error',
      (error) => this.handleInitializeErrors(error)
    );

    // Tracking stopped/started events
    this.subscriptionHTRNTracking = hyperTrackEmitter.addListener(
      'hypertrack.tracking.event',
      (state) => this.handleTrackingStateChange(state)
    );
  }

  componentDidMount() {
    // return a string which is used by HyperTrack to uniquely identify the user.
    this.getDeviceID();
  }

  componentWillUnmount() {
    this.subscriptionHTRNError.remove();
    this.subscriptionHTRNTracking.remove();
  }

  handleTrackingStateChange(state) {
    this.setState({isTracking: state['isTracking']});
  }

  handleInitializeErrors(error) {
      // For this simple example we display alerts
      // with an ability to try to start tracking again.
      console.log(error['error']);
      alert(error['error']);
  }

  getDeviceID() {
    RNHyperTrack.getDeviceID().then((data) => {
      this.setState({device_id: data.toString()});
    });
  }

  render() {
    let view = Platform.OS === 'ios' ? this.showHomeScreenIOS() : this.showHomeScreenAndroid();
    return (
        view
    );
  }

  getStartTrackingButtonIos() {
    return (
      <View style={styles.buttonContainer}>
      <Button
          onPress={this.startTracking.bind(this)}
          style={styles.htstartbutton}
        >
        <Text style={{color:'white'}}>
        Start tracking
        </Text>
      </Button>
      </View>
    );
  }

  getStopTrackingButtonIos() {
    return (
      <View style={styles.buttonContainer}>
      <Button
          onPress={this.stopTracking.bind(this)}
          style={styles.htstopbutton}
        >
        <Text style={{color:'white'}}>
        Stop tracking
        </Text>
      </Button>
      </View>
    );
  }

  showHomeScreenIOS() {
    var screenState;
    var shareButton = this.createShareButton()
    if (this.state.isTracking) {
      screenState = this.getStopTrackingButtonIos()
    } else {
      screenState = this.getStartTrackingButtonIos()
    }
    return (
      <View style={styles.bigContainer}>
        <Text style={styles.TitleIdText}>
        Device ID (long press to copy)
        </Text>
        <Text selectable>{this.state.device_id}</Text>
        <Text style={styles.IdText}>
        </Text>
        {shareButton}
        {screenState}
      </View>
    );
  }

  showHomeScreenAndroid() {
    var shareButton = this.createShareButton()
    return (
      <View style={styles.bigContainer}>
      <Text style={styles.TitleIdText}>
        Device ID (long press to copy)
        </Text>
          <Text selectable style={styles.IdText}>{ this.state.device_id }</Text>
          { shareButton }
        <View style={styles.buttonContainer}>
        <Button
            onPress={this.startTracking.bind(this)}
            style={styles.htstartbutton}
          >
            <Text style={{color:'white'}}>Start tracking</Text>
        </Button>
        <Button
          onPress={this.stopTracking.bind(this)}
          style={styles.htstopbutton}
        >
          <Text style={{color:'white'}}>Stop tracking</Text>
        </Button>
      </View>
    </View>
    );
  }

  createShareButton() {
    return (
      <View style={styles.middlebuttonContainer}>
        <Button
            onPress={this.shareLocation.bind(this)}
            style={styles.htsharebutton}
          >
            <Text style={{color:'white'}}>Share Your Location</Text>
        </Button>
      </View>
    );
  }

  shareLocation() {
    this.getTrackingLinkFromServer()
    .then((responseJson) => {
      var result = `https://track.hypertrack.com/${responseJson}`;
      Share.share({
        url: result,
      }, {
        // Android only:
        dialogTitle: 'Share Location',
        // iOS only:
        excludedActivityTypes: [
        ]
      });
    });
  }

  getTrackingLinkFromServer() {
    return fetch('https://7kcobbjpavdyhcxfvxrnktobjm.appsync-api.us-west-2.amazonaws.com/graphql', {
            method: 'POST',
            headers: {
                'X-Api-Key': 'da2-nt5vwlflmngjfbe6cbsone4emm',
            },
            body: JSON.stringify({
            'operationName': 'getPublicTrackingIdQuery',
            'variables':
            {
              "deviceId": this.state.device_id,
              "publishableKey": this.state.publishableKey
            },
            'query': 'query getPublicTrackingIdQuery($publishableKey: String!, $deviceId: String!){\n  getPublicTrackingId(publishable_key: $publishableKey, device_id: $deviceId){\n    tracking_id\n  }\n}',
          }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
          let tracking_id = responseJson.data.getPublicTrackingId.tracking_id;
          return tracking_id;
        });
  }

  /**
   * Start or resume tracking location and activity events.
   *
   * The SDK will automatically start recording data as soon as it receives the
   * required permissions.
   * If the SDK is uninitialized it will trigger an error in Listener.
   */
  startTracking() {
    RNHyperTrack.startTracking();
  }

  /**
   * Stops the SDK from listening to the user's movement updates and recording
   * any data.
   *
   * If this method is called, the SDK will not resume movement tracking until
   * `startTracking()` is called.
   */
  stopTracking() {
    RNHyperTrack.stopTracking();
  }

  /**
   * Send device name and metadata details to HyperTrack
   *
   * @param name Device name you want to see in the Dashboard.
   * @param metadata Send extra device information.
   */
  setDevice(name, metadata) {
    RNHyperTrack.setDevice(name, metadata).then(resp => {
      console.log("success");
    }, error => {
      console.log(error);
    });
  }

  /**
   * Send a custom event
   *
   * @param metadata Dictionary of type `<NSString*, id>`. Include
   * anything that can be parsed into JSON. Custom types are not allowed.
   *
   * Actual data will be sent to servers when conditions are optimal. Calls
   * made to this API during an internet outage will be recorded and sent
   * when the connection is available.
   */
  sendCustomEvent(metadata) {
    RNHyperTrack.sendCustomEvent(metadata).then(resp => {
      console.log("success");
    }, error => {
      console.log(error);
    });
  }
}

const styles = StyleSheet.create({
TitleIdText: {
  textAlign:'center',
  width: '100%',
  color: '#000000',
  fontWeight: 'bold',
  padding: 2,
  fontSize: 20
},
IdText: {
 textAlign:'center',
 width: '100%',
 color: '#000000',
 padding: 10,
 fontSize: 18
},
middlebuttonContainer: {
  flex: 1,
  backgroundColor: "#fff",
  justifyContent: 'center',
  alignItems: 'center'
},
buttonContainer: {
  flex: 1,
  backgroundColor: "#fff",
  justifyContent: "flex-end"
},
bigContainer: {
  flex: 1,
  padding: 50,
  backgroundColor: "#fff",
  justifyContent: "flex-start"
},
htstartbutton: {
  backgroundColor: "#7BE77B",
  color: 'white'
},
htsharebutton: {
  backgroundColor: "#040504",
  color: 'white'
},
htstopbutton: {
  backgroundColor: "#040504",
  color: 'white'
}
});
