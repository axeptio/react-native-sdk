import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-axeptio-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const AxeptioSdkNative = NativeModules.AxeptioSdk
  ? NativeModules.AxeptioSdk
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export default class AxeptioSdk {
  static initialize(
    clientId: string,
    cookiesVersion: string,
    token?: string
  ): Promise<void> {
    return AxeptioSdkNative.initialize(clientId, cookiesVersion, token ?? '');
  }

  static getPlaformVersion(): Promise<string> {
    return AxeptioSdkNative.getPlaformVersion();
  }

  static getAxeptioToken(): Promise<string> {
    return AxeptioSdkNative.getAxeptioToken();
  }

  static setupUI(): Promise<void> {
    return AxeptioSdkNative.setupUI();
  }

  static setUserDeniedTracking(): Promise<void> {
    return AxeptioSdkNative.setUserDeniedTracking();
  }

  static showConsentScreen(): Promise<void> {
    return AxeptioSdkNative.showConsentScreen();
  }

  static clearConsent(): Promise<void> {
    return AxeptioSdkNative.clearConsent();
  }

  static appendAxeptioTokenURL(url: string, token: string): Promise<string> {
    return AxeptioSdkNative.appendAxeptioTokenURL(url, token);
  }
}
