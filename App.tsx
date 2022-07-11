import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';

import HyperTrack, {
  GeotagError,
  Location,
  LocationError,
} from 'hypertrack-sdk-react-native';

const Button = ({title, onPress}: {title: string; onPress: () => void}) => (
  <Pressable
    style={({pressed}) => [
      {
        backgroundColor: pressed ? 'rgba(60, 105, 246, 0.5)' : '#3C69F6',
      },
      styles.button,
    ]}
    onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </Pressable>
);

interface LocationType {
  latitude: number;
  longitude: number;
}

const PUBLISHABLE_KEY = 'Paste_your_publishable_key_here';

const App = () => {
  const hyperTrackRef = useRef<HyperTrack | null>(null);
  const [enableListeners, setEnableListeners] = useState(false);
  const [availability, setAvailability] = useState(true);
  const [deviceID, setDeviceID] = useState('');
  const [trackingState, setTrackingState] = useState(false);
  const [location, setLocation] = useState<LocationType | null>(null);

  useEffect(() => {
    const initSDK = async () => {
      // (Optional) This turns on logging for underlying native SDKs. Placed on top so SDKs start logging immediately
      try {
        HyperTrack.enableDebugLogging(true);
      } catch (error) {
        console.log('error logging', error);
      }

      try {
        const hyperTrack = await HyperTrack.initialize(PUBLISHABLE_KEY, true);
        hyperTrackRef.current = hyperTrack;

        const ID = await hyperTrackRef.current?.getDeviceID();
        setDeviceID(ID);
        console.log('ID', ID);

        // (Optional) Set the device name to display in dashboard (for ex. user name)
        hyperTrackRef.current?.setDeviceName('RN Driver');

        // (Optional) Attach any JSON metadata to this device to see in HyperTrack's API responses
        hyperTrackRef.current?.setMetadata({
          driver_id: 'RN Quickstart Driver',
          state: 'IN_PROGRESS',
        });
        setEnableListeners(true);

        const available = await hyperTrackRef.current?.isAvailable();
        setAvailability(available ?? false);
      } catch (error) {
        console.log(error);
      }
    };
    initSDK();
  }, []);

  useEffect(() => {
    const errorsListener = hyperTrackRef.current?.subscribeToErrors(error => {
      console.log('Error: ', error);
    });

    const trackingListener = hyperTrackRef.current?.subscribeToTracking(
      isTracking => {
        console.log('isTracking: ', isTracking);
        setTrackingState(isTracking);
      },
    );

    return () => {
      errorsListener?.remove();
      trackingListener?.remove();
    };
  }, [enableListeners]);

  const getLocation = async () => {
    function isLocation(loc: LocationError | Location): loc is Location {
      return (loc as Location).location !== undefined;
    }
    if (hyperTrackRef.current !== null) {
      const loc = await hyperTrackRef.current?.getLocation();
      console.log('location', loc);

      if (isLocation(loc)) {
        console.log('location', loc);
        setLocation({...loc.location});
      } else {
        Alert.alert(JSON.stringify(loc));
      }
    }
  };

  const addGeoTag = async () => {
    function isLocation(loc: GeotagError | Location): loc is Location {
      return (loc as Location).location !== undefined;
    }
    if (hyperTrackRef.current !== null) {
      const geoTag = await hyperTrackRef.current?.addGeotag({
        parking: 'test',
      });
      if (isLocation(geoTag)) {
        console.log('geoTag added to: ', geoTag);
        Alert.alert('successfully added');
      } else {
        Alert.alert(JSON.stringify(geoTag));
      }
    }
  };

  const isAvailable = async () => {
    const available = await hyperTrackRef.current?.isAvailable();
    console.log('isAvailable', available);
    setAvailability(available ?? false);
  };

  const changeAvailability = async () => {
    const res = await hyperTrackRef.current?.setAvailability(!availability);
    console.log(res);
    setAvailability(res ?? false);
  };

  const startTracking = async () => {
    console.log('Start tracking');
    hyperTrackRef.current?.startTracking();
  };

  const stopTracking = async () => {
    console.log('Stop tracking');
    setLocation(null);
    hyperTrackRef.current?.stopTracking();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'dark-content'} />
      <ScrollView style={styles.wrapper}>
        <Text style={styles.titleText}>Device ID:</Text>
        <Text selectable style={styles.text}>
          {deviceID}
        </Text>
        <Text style={styles.titleText}>{'Tracking state'}</Text>
        <Text style={styles.text}>
          {trackingState === true ? 'Started' : 'Stopped'}
        </Text>
        <View style={styles.buttonWrapper}>
          <Button title="Start" onPress={startTracking} />
          <Button title="Stop" onPress={stopTracking} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Get location" onPress={getLocation} />
        </View>
        <Text style={styles.titleText}>Location:</Text>
        <Text style={styles.text}>latitude: {location?.latitude}</Text>
        <Text style={styles.text}>longitude: {location?.longitude}</Text>
        <View style={styles.buttonWrapper}>
          <Button title="Add geoTag" onPress={addGeoTag} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Get availability" onPress={isAvailable} />
        </View>
        <Text style={styles.text}>
          {availability ? 'is available' : 'not available'}
        </Text>
        <View style={styles.buttonWrapper}>
          <Button title="Change availability" onPress={changeAvailability} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(238, 241, 246)',
  },
  wrapper: {
    backgroundColor: 'rgb(238, 241, 246)',
  },
  titleText: {
    textAlign: 'center',
    width: '100%',
    color: '#000',
    fontWeight: 'bold',
    padding: 2,
    fontSize: 20,
  },
  text: {
    textAlign: 'center',
    width: '100%',
    color: '#000',
    padding: 5,
    fontSize: 18,
  },
  buttonText: {
    textAlign: 'center',
    width: '100%',
    color: '#fff',
    padding: 10,
    fontSize: 18,
  },
  buttonWrapper: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
});
