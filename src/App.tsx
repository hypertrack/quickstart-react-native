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
import {Platform} from 'react-native';

import HyperTrack, {
  HyperTrackError,
  Location,
  LocationError,
  LocationWithDeviation,
  Order,
  OrderStatus,
  Result,
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

const App = () => {
  const [errorsState, setErrorsState] = useState('');
  const [deviceIdState, setDeviceIdState] = useState('');
  const [isAvailableState, setIsAvailableState] = useState(false);
  const [isTrackingState, setIsTrackingState] = useState(false);
  const [locationState, setLocationState] = useState('');
  const [ordersState, setOrdersState] = useState(new Map<string, Order>());

  const errorsListener = useRef<EmitterSubscription | null | undefined>(null);
  const isAvailableListener = useRef<EmitterSubscription | null | undefined>(
    null,
  );
  const isTrackingListener = useRef<EmitterSubscription | null | undefined>(
    null,
  );
  const locationListener = useRef<EmitterSubscription | null | undefined>(null);
  const ordersListener = useRef<EmitterSubscription | null | undefined>(null);

  useEffect(() => {
    const initSDK = async () => {
      try {
        const deviceId = await HyperTrack.getDeviceId();
        console.log('getDeviceId', deviceId);
        setDeviceIdState(deviceId);

        const name = 'Quickstart ReactNative';
        HyperTrack.setName(name);
        console.log('setName', name);

        const metadata = {
          /**
           * Metadata is an custom data that is linked to the device.
           */
          source: name,
          employee_id: Math.round(Math.random() * 10000),
        };
        HyperTrack.setMetadata(metadata);
        console.log('setMetadata', metadata);

        let platformName = '';
        if (Platform.OS === 'android') {
          platformName = 'android';
        } else if (Platform.OS === 'ios') {
          platformName = 'ios';
        }
        /**
         * Worker handle is used to link the device and the worker.
         * You can use any unique user identifier here.
         * The recommended way is to set it on app login in set it to null on logout
         * (to remove the link between the device and the worker)
         **/
        HyperTrack.setWorkerHandle(
          `test_driver_quickstart_react_native_${platformName}`,
        );
        console.log('workerHandle is set');

        const workerHandle = await HyperTrack.getWorkerHandle();
        console.log('getWorkerHandle', workerHandle);

        errorsListener.current = HyperTrack.subscribeToErrors(
          (errors: HyperTrackError[]) => {
            let result = getErrorsText(errors);
            console.log('Listener errors: ', result);
            setErrorsState(result);
          },
        );

        isAvailableListener.current = HyperTrack.subscribeToIsAvailable(
          (isAvailable: boolean) => {
            console.log('Listener isAvailable: ', isAvailable);
            setIsAvailableState(isAvailable);
          },
        );

        isTrackingListener.current = HyperTrack.subscribeToIsTracking(
          (isTracking: boolean) => {
            console.log('Listener isTracking: ', isTracking);
            setIsTrackingState(isTracking);
          },
        );

        locationListener.current = HyperTrack.subscribeToLocation(
          (locationResult: Result<Location, LocationError>) => {
            console.log('Listener location: ', locationResult);
            setLocationState(getLocationResponseText(locationResult));
          },
        );

        ordersListener.current = HyperTrack.subscribeToOrders(
          (orders: Map<string, Order>) => {
            console.log('Listener orders: ', orders);
            setOrdersState(orders);
          },
        );
      } catch (error) {
        console.log(error, JSON.stringify(error));
      }
    };
    initSDK();

    return () => {
      errorsListener.current?.remove();
      isTrackingListener.current?.remove();
      isAvailableListener.current?.remove();
      locationListener.current?.remove();
      ordersListener.current?.remove();
    };
  }, []);

  const addGeotag = async () => {
    try {
      /**
       * geotagPayload is an arbitrary object.
       * You can put there any JSON-serializable data.
       * It will be displayed in the HyperTrack dashboard and
       * available in the webhook events.
       */
      const geotagPayload = {
        payload: 'Quickstart ReactNative',
        value: Math.random(),
      };

      const orderHandle = 'test_order';
      const orderStatus: OrderStatus = {
        type: 'orderStatusCustom',
        value: 'test_status',
      };
      const result = await HyperTrack.addGeotag(
        orderHandle,
        orderStatus,
        geotagPayload,
      );
      console.log('Add geotag: ', result);
      Alert.alert('Add geotag', getLocationResponseText(result));
    } catch (error) {
      console.log('error', error);
    }
  };

  const addGeotagWithExpectedLocation = async () => {
    try {
      /**
       * geotagPayload is an arbitrary object.
       * You can put there any JSON-serializable data.
       * It will be displayed in the HyperTrack dashboard and
       * available in the webhook events.
       */
      const geotagPayload = {
        payload: 'Quickstart ReactNative',
        value: Math.random(),
      };

      const orderHandle = 'test_order';
      const orderStatus: OrderStatus = {
        type: 'orderStatusCustom',
        value: 'test_status',
      };
      const result = await HyperTrack.addGeotag(
        orderHandle,
        orderStatus,
        geotagPayload,
        {
          latitude: 37.775,
          longitude: -122.418,
        },
      );
      console.log('Add geotag with expected location:', result);
      Alert.alert(
        'Add geotag with expected location',
        getLocationWithDeviationResponseText(result),
      );
    } catch (error) {
      console.log('error', error);
    }
  };

  const getErrors = async () => {
    const errors = await HyperTrack.getErrors();
    let result = getErrorsText(errors);
    console.log('Errors:', result);
    Alert.alert('errors', result);
  };

  const getIsAvailable = async () => {
    const available = await HyperTrack.getIsAvailable();
    console.log('isAvailable', available);
    Alert.alert('isAvailable', `${available}`);
  };

  const getIsTracking = async () => {
    const isTracking = await HyperTrack.getIsTracking();
    console.log('isTracking', isTracking);
    Alert.alert('isTracking', `${isTracking}`);
  };

  const getLocation = async () => {
    try {
      const result = await HyperTrack.getLocation();
      Alert.alert('Location:', getLocationResponseText(result));
    } catch (error) {
      console.log('error', error);
    }
  };

  const getMetadata = async () => {
    const metadata = await HyperTrack.getMetadata();
    console.log('Metadata:', metadata);
    Alert.alert('Metadata', JSON.stringify(metadata));
  };

  const getName = async () => {
    const name = await HyperTrack.getName();
    console.log('Name:', name);
    Alert.alert('Name', name);
  };

  const getOrders = async () => {
    const orders = await HyperTrack.getOrders();
    console.log('Orders:', orders);
    Alert.alert('Orders', getOrdersText(orders));
  };

  const locate = async () => {
    HyperTrack.locate((locationResult: Result<Location, HyperTrackError[]>) => {
      try {
        let result = getLocateResponseText(locationResult);
        console.log('Locate:', result);
        Alert.alert('Result', result);
      } catch (error) {
        console.log('error', error);
      }
    });
    console.log('Locate started');
  };

  const setIsAvailable = async (isAvailable: boolean) => {
    HyperTrack.setIsAvailable(isAvailable);
    console.log('setIsAvailable', isAvailable);
  };

  const setIsTracking = async (isTracking: boolean) => {
    HyperTrack.setIsTracking(isTracking);
    console.log('setIsTracking', isTracking);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'dark-content'} />
      <ScrollView style={styles.wrapper}>
        <Text style={styles.titleText}>Device ID:</Text>
        <Text selectable style={styles.text}>
          {deviceIdState}
        </Text>

        <Text style={styles.titleText}>Orders:</Text>
        {Array.from(ordersState.values()).map(order => {
          return (
            <View key={order.orderHandle}>
              <Text selectable style={styles.text}>
                {order.orderHandle}
              </Text>
              <Text>{getIsInsideGeofenceText(order.isInsideGeofence)}</Text>
            </View>
          );
        })}

        <Text style={styles.titleText}>{'Location'}</Text>
        <Text style={styles.text}>{locationState}</Text>

        <Text style={styles.titleText}>{'Errors'}</Text>
        <Text style={styles.text}>{errorsState}</Text>

        <View style={styles.buttonWrapper}>
          <Button title="Start tracking" onPress={() => setIsTracking(true)} />
          <View>
            <Text style={styles.titleText}>{'isTracking'}</Text>
            <Text style={styles.text}>{isTrackingState?.toString()}</Text>
          </View>
          <Button title="Stop tracking" onPress={() => setIsTracking(false)} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="Set available" onPress={() => setIsAvailable(true)} />
          <View>
            <Text style={styles.titleText}>{'isAvailable'}</Text>
            <Text style={styles.text}>{isAvailableState?.toString()}</Text>
          </View>
          <Button
            title="Set unavailable"
            onPress={() => setIsAvailable(false)}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="Add Geotag" onPress={addGeotag} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="Add Geotag with expected location"
            onPress={addGeotagWithExpectedLocation}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="Locate user" onPress={locate} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="Get errors" onPress={getErrors} />
          <Button title="Get isAvailable" onPress={getIsAvailable} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="Get isTracking" onPress={getIsTracking} />
          <Button title="Get location" onPress={getLocation} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="Get Metadata" onPress={getMetadata} />
          <Button title="Get Name" onPress={getName} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="Get Orders" onPress={getOrders} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;

function getLocateResponseText(response: Result<Location, HyperTrackError[]>) {
  switch (response.type) {
    case 'success':
      return `Location: ${JSON.stringify(
        [response.value.latitude, response.value.longitude],
        null,
        4,
      )}`;
    case 'failure':
      return `Errors:\n${getErrorsText(response.value)}`;
  }
}

function getLocationResponseText(
  response: Result<Location, LocationError>,
): string {
  switch (response.type) {
    case 'success':
      return `Location: ${JSON.stringify(
        [response.value.latitude, response.value.longitude],
        null,
        4,
      )}`;
    case 'failure':
      switch (response.value.type) {
        case 'notRunning':
          return 'Not running';
        case 'starting':
          return 'Starting';
        case 'errors':
          return `Errors:\n${getErrorsText(response.value.value)}`;
      }
    default:
      return `Unknown response: $response`;
  }
}

function getLocationWithDeviationResponseText(
  response: Result<LocationWithDeviation, LocationError>,
) {
  switch (response.type) {
    case 'success':
      return `Location: ${JSON.stringify(
        [response.value.location.latitude, response.value.location.longitude],
        null,
        4,
      )}\nDeviation: ${response.value.deviation}`;
    case 'failure':
      switch (response.value.type) {
        case 'notRunning':
          return 'Not running';
        case 'starting':
          return 'Starting';
        case 'errors':
          return `Errors:\n${getErrorsText(response.value.value)}`;
      }
  }
}

function getErrorsText(errors: HyperTrackError[]) {
  if (errors.length === 0) {
    return 'No errors';
  } else {
    return errors
      .map(error => {
        if (typeof error === 'string') {
          return error as string;
        } else {
          return `Failed to parse error: ${JSON.stringify(error)}`;
        }
      })
      .join('\n');
  }
}

function getIsInsideGeofenceText(
  isInsideResult: Result<boolean, LocationError>,
) {
  switch (isInsideResult.type) {
    case 'success':
      return isInsideResult.value.toString();
    case 'failure':
      switch (isInsideResult.value.type) {
        case 'notRunning':
          return 'Not running';
        case 'starting':
          return 'Starting';
        case 'errors':
          return `Errors:\n${getErrorsText(isInsideResult.value.value)}`;
      }
  }
}

function getOrdersText(orders: Map<string, Order>) {
  return Array.from(orders.values())
    .map(order => {
      return `${order.orderHandle}:\n\t\t${getIsInsideGeofenceText(
        order.isInsideGeofence,
      )}`;
    })
    .join('\n');
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
    fontSize: 16,
  },
  text: {
    textAlign: 'center',
    width: '100%',
    color: '#000',
    padding: 5,
    fontSize: 16,
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
    flex: 1,
    fontSize: 18,
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 3,
    marginLeft: 20,
    marginRight: 20,
  },
});
