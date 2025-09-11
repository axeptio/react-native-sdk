import { Platform } from 'react-native';
import type { WebViewConsentData, WebViewSyncResult } from '../types/webview';

export class WebViewSyncUtils {
  /**
   * Formats consent data for WebView injection on iOS
   * Addresses WKWebView cookie isolation by using token-based sync
   */
  static formatConsentDataForWebView(token: string): WebViewConsentData {
    return {
      token,
      timestamp: Date.now(),
      platform: Platform.OS as 'ios' | 'android',
      hasConsent: token.length > 0,
    };
  }

  /**
   * Generates JavaScript injection code for WebView consent synchronization
   * This bypasses iOS cookie isolation by directly setting consent state
   */
  static generateConsentInjectionScript(
    consentData: WebViewConsentData
  ): string {
    const script = `
      (function() {
        // Axeptio iOS WebView Consent Sync - SUP-277 fix
        window.axeptioConsentSync = ${JSON.stringify(consentData)};
        
        // Set token in localStorage as fallback for cookie isolation
        if (window.localStorage) {
          window.localStorage.setItem('axeptio_token', '${consentData.token}');
          window.localStorage.setItem('axeptio_sync_timestamp', '${consentData.timestamp}');
        }
        
        // Dispatch custom event to notify Axeptio widget
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('axeptioTokenSync', {
            detail: {
              token: '${consentData.token}',
              platform: '${consentData.platform}',
              timestamp: ${consentData.timestamp}
            }
          }));
        }
        
        // Set cookie with explicit domain for broader compatibility
        if (document.cookie !== undefined) {
          document.cookie = 'axeptio_token=${consentData.token}; path=/; SameSite=None; Secure';
        }
      })();
    `;

    return script.trim();
  }

  /**
   * Creates URL with token parameters for WebView navigation
   * Alternative approach when script injection isn't sufficient
   */
  static createTokenizedURL(baseUrl: string, token: string): string {
    const url = new URL(baseUrl);
    url.searchParams.set('axeptio_token', token);
    url.searchParams.set('axeptio_platform', Platform.OS);
    url.searchParams.set('axeptio_sync', Date.now().toString());

    return url.toString();
  }

  /**
   * Validates if token sync was successful in WebView
   * Can be called from WebView's onMessage handler
   */
  static validateSyncResult(message: any): WebViewSyncResult {
    try {
      const data = typeof message === 'string' ? JSON.parse(message) : message;

      return {
        success: data.axeptioSyncSuccess === true,
        token: data.token,
        error: data.error,
        timestamp: data.timestamp || Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Invalid sync message: ${error}`,
        timestamp: Date.now(),
      };
    }
  }
}
