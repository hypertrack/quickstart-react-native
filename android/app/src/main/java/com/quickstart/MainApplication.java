package com.quickstart;

import android.app.Application;

import com.facebook.react.ReactApplication;
import io.hypertrack.RNHyperTrackPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import io.hypertrack.RNHyperTrackPackage;
import io.hypertrack.RNHyperTrackPackage;
import io.hypertrack.RNHyperTrackPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      new MainReactPackage(); 
      new RNHyperTrackPackage(); 
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNHyperTrackPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
