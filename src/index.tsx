import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { WebViewSyncUtils } from './utils/webview-sync';
import { IOSConfigUtils } from './utils/ios-config';
import { DiagnosticsUtils } from './utils/diagnostics';
import type {
  WebViewConsentData,
  IOSWebViewConfig,
  DiagnosticInfo,
  WebViewSyncResult,
} from './types/webview';

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

  setUserDeniedTracking(denied: boolean = true): Promise<void> {
    // Android bridge doesn't accept parameters (iOS-only feature)
    if (Platform.OS === 'ios') {
      return AxeptioSdkNative.setUserDeniedTracking(denied);
    }
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

  // SUP-277: iOS WebView synchronization methods

  /**
   * Get consent data formatted for WebView synchronization
   * Addresses iOS WKWebView cookie isolation issues
   */
  async getConsentDataForWebView(): Promise<WebViewConsentData> {
    const token = await this.getAxeptioToken();
    return WebViewSyncUtils.formatConsentDataForWebView(token);
  }

  /**
   * Generate JavaScript injection code for WebView consent synchronization
   * Use with WebView's injectedJavaScript prop
   */
  async getWebViewInjectionScript(): Promise<string> {
    const consentData = await this.getConsentDataForWebView();
    return WebViewSyncUtils.generateConsentInjectionScript(consentData);
  }

  /**
   * Sync consent state with WebView using token-based approach
   * Returns URL with token parameters for navigation
   */
  async syncConsentWithWebView(baseUrl: string): Promise<string> {
    const token = await this.getAxeptioToken();
    return WebViewSyncUtils.createTokenizedURL(baseUrl, token);
  }

  /**
   * Get optimized WebView configuration for iOS
   * Returns props that can be spread directly on WebView component
   */
  getIOSWebViewConfig(): IOSWebViewConfig {
    return IOSConfigUtils.getOptimizedWebViewConfig();
  }

  /**
   * Get WebView props optimized for iOS consent synchronization
   * Usage: <WebView {...AxeptioSDK.getWebViewProps()} />
   */
  getWebViewProps() {
    return IOSConfigUtils.getWebViewProps();
  }

  /**
   * Get comprehensive diagnostic information for troubleshooting
   * Useful for support tickets and debugging WebView issues
   */
  async getDiagnosticInfo(): Promise<DiagnosticInfo> {
    return DiagnosticsUtils.getDiagnosticInfo(
      () => this.getAxeptioToken(),
      () => this.getPlaformVersion()
    );
  }

  /**
   * Test WebView cookie synchronization capability
   * Returns detailed test results and recommendations
   */
  async testWebViewCookieSync(): Promise<{
    passed: boolean;
    details: string[];
    recommendations: string[];
  }> {
    return DiagnosticsUtils.testWebViewCookieSync(() => this.getAxeptioToken());
  }

  /**
   * Generate JavaScript code to test WebView capabilities
   * Inject this into WebView to test cookie and localStorage access
   */
  getWebViewCapabilityTestScript(): string {
    return DiagnosticsUtils.generateWebViewCapabilityTest();
  }

  /**
   * Validate WebView synchronization result from onMessage callback
   */
  validateWebViewSyncResult(message: any): WebViewSyncResult {
    return WebViewSyncUtils.validateSyncResult(message);
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

// SUP-277: Export new types and utilities for iOS WebView synchronization
export type {
  WebViewConsentData,
  IOSWebViewConfig,
  DiagnosticInfo,
  WebViewSyncResult,
} from './types/webview';
export { WebViewSyncUtils } from './utils/webview-sync';
export { IOSConfigUtils } from './utils/ios-config';
export { DiagnosticsUtils } from './utils/diagnostics';

export default new AxeptioSdk();
