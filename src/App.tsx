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
  EmitterSubscription,
} from 'react-native';

import HyperTrack, {HyperTrackError, Location, LocationError} from 'hypertrack-sdk-react-native';

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

const PUBLISHABLE_KEY =
  'B42VhCTk6-LoJ-4XcX6Z06achUxt3NFNh-5rejSBUpXeXFMaWJWZF6hBCQvLhrvyGdmUf8uYfYLTXS-Czz2tkw';

const App = () => {
  const hyperTrack = useRef<HyperTrack | null>(null);
  const [deviceIdState, setDeviceIdState] = useState('');
  const [isAvailableState, setAvailabilityState] = useState(false);
  const [isTrackingState, setIsTrackingState] = useState(false);
  const [errorsState, setErrorsState] = useState<HyperTrackError[]>([]);

  const errorsListener = useRef<EmitterSubscription | null | undefined>(null);
  const trackingListener = useRef<EmitterSubscription | null | undefined>(null);
  const availabilityListener = useRef<EmitterSubscription | null | undefined>(
    null,
  );

  useEffect(() => {
    const initSDK = async () => {
      try {
        const hyperTrackInstance = await HyperTrack.initialize(
          PUBLISHABLE_KEY,
          // {
          //   loggingEnabled: true,
          //   requireBackgroundTrackingPermission: true,
          //   allowMockLocations: true,
          //   automaticallyRequestPermissions: true,
          // },
        );
        hyperTrack.current = hyperTrackInstance;

        const deviceId = await hyperTrack.current?.getDeviceId();
        console.log('getDeviceId', deviceId);
        setDeviceIdState(deviceId);

        const name = 'Quickstart ReactNative';
        hyperTrack.current?.setName(name);
        console.log('setName', name);

        const metadata = {
          app: 'Quickstart ReactNative',
          value: Math.random(),
        };
        hyperTrack.current?.setMetadata(metadata);
        console.log('setMetadata', metadata);
      } catch (error) {
        console.log(error);
      }

      trackingListener.current = hyperTrack.current?.subscribeToTracking(
        isTracking => {
          console.log('Listener isTracking: ', isTracking);
          setIsTrackingState(isTracking);
          setErrorsState([]);
        },
      );

      availabilityListener.current =
        hyperTrack.current?.subscribeToAvailability(isAvailable => {
          console.log('Listener isAvailable: ', isAvailable);
          setAvailabilityState(isAvailable);
          setErrorsState([]);
        });

      errorsListener.current = hyperTrack.current?.subscribeToErrors(errors => {
        console.log('Listener onError: ', errors);
        setErrorsState(errors);
      });
    };
    initSDK();

    return () => {
      errorsListener.current?.remove();
      trackingListener.current?.remove();
      availabilityListener.current?.remove();
    };
  }, []);

  useEffect(() => {}, []);

  const getLocation = async () => {
    if (hyperTrack.current !== null) {
      try {
        const result = await hyperTrack.current?.getLocation();
        Alert.alert('Result', getLocationResponseText(result));
      } catch (error) {
        console.log('error', error);
      }
    }
  };

  const addGeoTag = async () => {
    if (hyperTrack.current !== null) {
      try {
        const result = await hyperTrack.current?.addGeotag({
          payload: 'Quickstart ReactNative',
          value: Math.random(),
        });
        console.log('Add geotag: ', result);
        Alert.alert('Result', getLocationResponseText(result));
      } catch (error) {
        console.log('error', error);
      }
    }
  };

  const addGeotagWithExpectedLocation = async () => {
    if (hyperTrack.current !== null) {
      try {
        const result = await hyperTrack.current?.addGeotag(
          {
            payload: 'Quickstart ReactNative',
            value: Math.random(),
          },
          // {
          //   latitude: 37.775,
          //   longitude: -122.418,
          // },
        );
        console.log('Add geotag with expected location: ', result);
        Alert.alert('Result', getLocationResponseText(result));
      } catch (error) {
        console.log('error', error);
      }
    }
  };

  const invokeIsTracking = async () => {
    const isTracking = await hyperTrack.current?.isTracking();
    console.log('isTracking', isTracking);
    Alert.alert('isTracking', `${isTracking}`);
    setIsTrackingState(isTracking ?? false);
  };

  const invokeIsAvailable = async () => {
    const available = await hyperTrack.current?.isAvailable();
    console.log('isAvailable', available);
    Alert.alert('isAvailable', `${available}`);
    setAvailabilityState(available ?? false);
  };

  const changeAvailability = async () => {
    await hyperTrack.current?.setAvailability(!isAvailableState);
  };

  const startTracking = async () => {
    console.log('Start tracking');
    hyperTrack.current?.startTracking();
  };

  const stopTracking = async () => {
    console.log('Stop tracking');
    hyperTrack.current?.stopTracking();
  };

  const sync = async () => {
    hyperTrack.current?.sync();
    console.log('Sync');
    Alert.alert('Sync performed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'dark-content'} />
      <ScrollView style={styles.wrapper}>
        <Text style={styles.titleText}>Device ID:</Text>
        <Text selectable style={styles.text}>
          {deviceIdState}
        </Text>

        <Text style={styles.titleText}>{'isTracking'}</Text>
        <Text style={styles.text}>{isTrackingState?.toString()}</Text>

        <Text style={styles.titleText}>{'isAvailable'}</Text>
        <Text style={styles.text}>{isAvailableState?.toString()}</Text>

        <Text style={styles.titleText}>{'errors'}</Text>
        <Text style={styles.text}>{JSON.stringify(errorsState, null, 4)}</Text>

        <View style={styles.buttonWrapper}>
          <Button title="Start tracking" onPress={startTracking} />
          <Button title="Stop tracking" onPress={stopTracking} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Get location" onPress={getLocation} />
          <Button title="Add Geotag" onPress={addGeoTag} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            title="Add Geotag with expected location"
            onPress={addGeotagWithExpectedLocation}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="isTracking" onPress={invokeIsTracking} />
          <Button title="isAvailable" onPress={invokeIsAvailable} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Change availability" onPress={changeAvailability} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Sync" onPress={sync} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;

function getLocationResponseText(response: Location | LocationError) {
  switch (response.type) {
    case 'location':
      return `Location: ${JSON.stringify([
        response.value.latitude,
        response.value.longitude,
      ], null, 4)}`;
    case 'notRunning':
      return 'Not running';
    case 'starting': 
      return 'Starting';
    case 'errors':
      return `Errors: ${JSON.stringify(response.value, null, 4)}`;
    default:
      return 'Invalid response: ' + JSON.stringify(response, null, 4);
    }
}

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
