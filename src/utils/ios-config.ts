import { Platform } from 'react-native';
import type { IOSWebViewConfig } from '../types/webview';

export class IOSConfigUtils {
  /**
   * Returns optimized WebView configuration for iOS consent synchronization
   * Addresses WKWebView cookie isolation issues identified in SUP-277
   */
  static getOptimizedWebViewConfig(): IOSWebViewConfig {
    if (Platform.OS !== 'ios') {
      // Return minimal config for Android as it doesn't have the same issues
      return {
        incognito: false,
        cacheEnabled: true,
        sharedCookiesEnabled: true,
      };
    }

    // iOS-specific configuration to maximize consent sync reliability
    return {
      // Disable incognito to allow cookie sharing
      incognito: false,

      // Disable cache to prevent stale consent state
      cacheEnabled: false,

      // Enable shared cookies (though this has known limitations on iOS)
      sharedCookiesEnabled: true,

      // Additional iOS optimizations
      allowsBackForwardNavigationGestures: false,
      bounces: false,
      scrollEnabled: true,
    };
  }

  /**
   * Returns WebView props as a flat object for direct spreading
   * Usage: <WebView {...IOSConfigUtils.getWebViewProps()} />
   */
  static getWebViewProps() {
    const config = this.getOptimizedWebViewConfig();

    return {
      incognito: config.incognito,
      cacheEnabled: config.cacheEnabled,
      sharedCookiesEnabled: config.sharedCookiesEnabled,
      ...(Platform.OS === 'ios' && {
        allowsBackForwardNavigationGestures:
          config.allowsBackForwardNavigationGestures,
        bounces: config.bounces,
        scrollEnabled: config.scrollEnabled,
      }),
    };
  }

  /**
   * Determines if the current iOS version is likely to have WebView issues
   * Based on known issues documented in react-native-webview GitHub issues
   */
  static isProblematicIOSVersion(): boolean {
    if (Platform.OS !== 'ios') {
      return false;
    }

    // iOS versions known to have WKWebView cookie sync issues
    const versionString = Platform.Version?.toString() ?? '0';
    const majorVersionStr = versionString.split('.')[0] ?? '0';
    const majorVersion = parseInt(majorVersionStr, 10);

    // Issues documented on iOS 14+ with WKWebView cookie isolation
    return majorVersion >= 14;
  }

  /**
   * Returns user agent modifications for better consent detection
   */
  static getUserAgent(): string | undefined {
    if (Platform.OS !== 'ios') {
      return undefined;
    }

    // Add identifier to help Axeptio widget detect React Native WebView context
    return 'Mozilla/5.0 (iPhone; CPU iPhone OS like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 AxeptioRNSDK/2.0';
  }

  /**
   * Gets recommended injection time for consent scripts
   */
  static getInjectionTime(): 'onLoadStart' | 'onLoadEnd' | 'onLoad' {
    // Inject at load start to ensure consent state is available immediately
    return 'onLoadStart';
  }
}
