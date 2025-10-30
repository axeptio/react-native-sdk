import { Platform } from 'react-native';
import type { DiagnosticInfo } from '../types/webview';

export class DiagnosticsUtils {
  /**
   * Comprehensive diagnostic information for troubleshooting SUP-277 issues
   * Helps identify iOS WebView cookie sync problems
   */
  static async getDiagnosticInfo(
    getToken: () => Promise<string>,
    getPlatformVersion: () => Promise<string>
  ): Promise<DiagnosticInfo> {
    const [token, platformVersion] = await Promise.all([
      getToken().catch(() => ''),
      getPlatformVersion().catch(() => 'unknown'),
    ]);

    return {
      platform: Platform.OS as 'ios' | 'android',
      platformVersion,
      sdkVersion: '2.0.11',
      hasToken: token.length > 0,
      webViewSupport: this.getWebViewSupportInfo(),
    };
  }

  /**
   * WebView capability detection for iOS cookie sync issues
   */
  private static getWebViewSupportInfo() {
    const isIOS = Platform.OS === 'ios';

    return {
      cookieSyncCapable: !isIOS, // Android generally works, iOS has issues
      isolatedStorage: isIOS, // iOS WKWebView uses isolated storage
    };
  }

  /**
   * Test WebView cookie synchronization capability
   * Returns detailed results for debugging
   */
  static async testWebViewCookieSync(getToken: () => Promise<string>): Promise<{
    passed: boolean;
    details: string[];
    recommendations: string[];
  }> {
    const details: string[] = [];
    const recommendations: string[] = [];
    let passed = true;

    // Test 1: Check if token is available
    try {
      const token = await getToken();
      if (token && token.length > 0) {
        details.push('✅ Axeptio token is available');
      } else {
        details.push('❌ No Axeptio token found');
        passed = false;
        recommendations.push(
          'Initialize SDK and ensure consent is granted before using WebView'
        );
      }
    } catch (error) {
      details.push(`❌ Error getting token: ${error}`);
      passed = false;
      recommendations.push('Check SDK initialization and network connectivity');
    }

    // Test 2: Platform-specific checks
    if (Platform.OS === 'ios') {
      details.push(
        '⚠️  iOS platform detected - WebView cookie sync limitations expected'
      );

      const versionString = Platform.Version?.toString() ?? '0';
      const majorVersionStr = versionString.split('.')[0] ?? '0';
      const majorVersion = parseInt(majorVersionStr, 10);
      if (majorVersion >= 14) {
        details.push(
          `⚠️  iOS ${majorVersion} - WKWebView cookie isolation active`
        );
        recommendations.push(
          'Use token-based synchronization instead of relying on cookies'
        );
        recommendations.push(
          'Apply iOS-specific WebView configuration from IOSConfigUtils'
        );
      }

      recommendations.push(
        'Consider using native-only popups on iOS for better reliability'
      );
    } else {
      details.push(
        '✅ Android platform - WebView cookie sync should work normally'
      );
    }

    // Test 3: React Native WebView version check (if available)
    try {
      // This would require react-native-webview to be installed
      details.push(
        'ℹ️  For complete testing, ensure react-native-webview is up to date'
      );
    } catch {
      details.push('ℹ️  react-native-webview version check skipped');
    }

    return {
      passed,
      details,
      recommendations,
    };
  }

  /**
   * Format diagnostic info for logging or support tickets
   */
  static formatDiagnosticReport(diagnostic: DiagnosticInfo): string {
    return `
=== Axeptio React Native SDK Diagnostic Report ===
Platform: ${diagnostic.platform} ${diagnostic.platformVersion}
SDK Version: ${diagnostic.sdkVersion}
Token Available: ${diagnostic.hasToken ? 'Yes' : 'No'}
WebView Cookie Sync: ${diagnostic.webViewSupport.cookieSyncCapable ? 'Supported' : 'Limited'}
Storage Isolation: ${diagnostic.webViewSupport.isolatedStorage ? 'Yes (iOS WKWebView)' : 'No'}

${
  diagnostic.platform === 'ios'
    ? 'Note: iOS WebView cookie synchronization has known limitations.\nRecommend using token-based sync for reliable consent state management.'
    : 'Platform should support normal WebView cookie synchronization.'
}
================================================
    `.trim();
  }

  /**
   * Generate JavaScript code to test WebView capabilities from inside the WebView
   * This can be injected to test cookie access and localStorage availability
   */
  static generateWebViewCapabilityTest(): string {
    return `
      (function() {
        const results = {
          cookies: {
            readable: document.cookie !== undefined,
            writable: false,
            axeptioFound: false
          },
          localStorage: {
            available: !!window.localStorage,
            writable: false,
            axeptioFound: false
          },
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        };

        // Test cookie write capability
        try {
          const testCookie = 'axeptio_test=' + Date.now();
          document.cookie = testCookie + '; path=/';
          results.cookies.writable = document.cookie.includes('axeptio_test');
          results.cookies.axeptioFound = document.cookie.includes('axeptio_token');
        } catch (e) {
          results.cookies.error = e.message;
        }

        // Test localStorage capability
        try {
          window.localStorage.setItem('axeptio_test', Date.now().toString());
          results.localStorage.writable = !!window.localStorage.getItem('axeptio_test');
          results.localStorage.axeptioFound = !!window.localStorage.getItem('axeptio_token');
          window.localStorage.removeItem('axeptio_test');
        } catch (e) {
          results.localStorage.error = e.message;
        }

        // Send results back to React Native
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'axeptio_webview_capability_test',
            results: results
          }));
        }

        return results;
      })();
    `;
  }
}
