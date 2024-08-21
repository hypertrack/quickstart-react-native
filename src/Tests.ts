import HyperTrack from 'hypertrack-sdk-react-native';

export {};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function runTestSequence() {
  HyperTrack.setIsTracking(true);
  await sleep(5000);
  let location = await HyperTrack.getLocation();
  console.log(location);
  HyperTrack.addGeotag({
    source: 'wrapper_tests',
    result: 'success',
  });
  HyperTrack.setIsTracking(false);
}
