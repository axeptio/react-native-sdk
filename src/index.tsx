import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package '@axeptio/react-native-sdk' doesn't seem to be linked. Make sure: \n\n` +
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

const EventEmitter = new NativeEventEmitter(AxeptioSdkNative);

class AxeptioSdk {
  private listeners: AxeptioEventListener[] = [];

  constructor() {
    Object.keys(AxeptioEvent).forEach((event) => {
      EventEmitter.addListener(event, (body: any) => {
        this.sendEvent(event as AxeptioEvent, body);
      });
    });
  }

  getPlaformVersion(): Promise<string> {
    return AxeptioSdkNative.getPlaformVersion();
  }

  getAxeptioToken(): Promise<string> {
    return AxeptioSdkNative.getAxeptioToken();
  }

  initialize(
    targetService: AxeptioService,
    clientId: string,
    cookiesVersion: string,
    token?: string
  ): Promise<void> {
    return AxeptioSdkNative.initialize(
      targetService,
      clientId,
      cookiesVersion,
      token ?? ''
    );
  }

  setupUI(): Promise<void> {
    return AxeptioSdkNative.setupUI();
  }

  setUserDeniedTracking(): Promise<void> {
    return AxeptioSdkNative.setUserDeniedTracking();
  }

  showConsentScreen(): Promise<void> {
    return AxeptioSdkNative.showConsentScreen();
  }

  clearConsent(): Promise<void> {
    return AxeptioSdkNative.clearConsent();
  }

  appendAxeptioTokenURL(url: string, token: string): Promise<string> {
    return AxeptioSdkNative.appendAxeptioTokenURL(url, token);
  }

  private sendEvent(name: AxeptioEvent, body: any) {
    this.listeners.forEach((listener) => {
      listener[name]?.(body);
    });
  }

  addListener(listener: AxeptioEventListener) {
    this.listeners.push(listener);
  }

  removeListeners() {
    this.listeners = [];
  }
}

enum AxeptioEvent {
  onPopupClosedEvent = 'onPopupClosedEvent',
  onConsentCleared = 'onConsentCleared',
  onGoogleConsentModeUpdate = 'onGoogleConsentModeUpdate',
}

export enum AxeptioService {
  brands = 'brands',
  tcfPublishers = 'publisher',
}

export type AxeptioEventListener = {
  [AxeptioEvent.onPopupClosedEvent]?: () => void;
  [AxeptioEvent.onConsentCleared]?: () => void;
  [AxeptioEvent.onGoogleConsentModeUpdate]?: (consent: GoogleConsentV2) => void;
};

export type GoogleConsentV2 = {
  adPersonalization: boolean;
  adStorage: boolean;
  adUserData: boolean;
  analyticsStorage: boolean;
};

export default new AxeptioSdk();
