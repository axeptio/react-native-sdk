export interface WebViewConsentData {
  token: string;
  timestamp: number;
  platform: 'ios' | 'android';
  hasConsent: boolean;
}

export interface IOSWebViewConfig {
  incognito: boolean;
  cacheEnabled: boolean;
  sharedCookiesEnabled: boolean;
  allowsBackForwardNavigationGestures?: boolean;
  bounces?: boolean;
  scrollEnabled?: boolean;
}

export interface DiagnosticInfo {
  platform: 'ios' | 'android';
  platformVersion: string;
  sdkVersion: string;
  hasToken: boolean;
  webViewSupport: {
    cookieSyncCapable: boolean;
    isolatedStorage: boolean;
  };
}

export interface WebViewSyncResult {
  success: boolean;
  token?: string;
  error?: string;
  timestamp: number;
}
