import { NativeModules, Platform } from 'react-native';
import AxeptioSDK from '../index';

// Mock React Native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '17.0',
    select: jest.fn((obj) => obj.ios || obj.default),
  },
  NativeModules: {
    AxeptioSdk: {
      getAxeptioToken: jest.fn(),
      getPlaformVersion: jest.fn(),
      initialize: jest.fn(),
      setupUI: jest.fn(),
      showConsentScreen: jest.fn(),
      clearConsent: jest.fn(),
      setUserDeniedTracking: jest.fn(),
      appendAxeptioTokenURL: jest.fn(),
    },
  },
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
}));

const mockAxeptioSdkNative = NativeModules.AxeptioSdk as jest.Mocked<
  typeof NativeModules.AxeptioSdk
>;

describe('AxeptioSDK WebView Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as any).OS = 'ios';
    (Platform as any).Version = '17.0';
  });

  describe('getConsentDataForWebView', () => {
    it('should return formatted consent data with token', async () => {
      const mockToken = 'integration-token-123';
      mockAxeptioSdkNative.getAxeptioToken.mockResolvedValue(mockToken);

      const result = await AxeptioSDK.getConsentDataForWebView();

      expect(result).toEqual({
        token: mockToken,
        timestamp: expect.any(Number),
        platform: 'ios',
        hasConsent: true,
      });
      expect(mockAxeptioSdkNative.getAxeptioToken).toHaveBeenCalledTimes(1);
    });

    it('should handle empty token', async () => {
      mockAxeptioSdkNative.getAxeptioToken.mockResolvedValue('');

      const result = await AxeptioSDK.getConsentDataForWebView();

      expect(result.hasConsent).toBe(false);
      expect(result.token).toBe('');
    });

    it('should propagate token retrieval errors', async () => {
      mockAxeptioSdkNative.getAxeptioToken.mockRejectedValue(
        new Error('Token error')
      );

      await expect(AxeptioSDK.getConsentDataForWebView()).rejects.toThrow(
        'Token error'
      );
    });
  });

  describe('getWebViewInjectionScript', () => {
    it('should generate injection script with real token', async () => {
      const mockToken = 'script-token-456';
      mockAxeptioSdkNative.getAxeptioToken.mockResolvedValue(mockToken);

      const script = await AxeptioSDK.getWebViewInjectionScript();

      expect(script).toContain(mockToken);
      expect(script).toContain('window.axeptioConsentSync');
      expect(script).toContain('localStorage.setItem');
      expect(script).toContain('axeptioTokenSync');
      expect(typeof script).toBe('string');
      expect(script.length).toBeGreaterThan(100);
    });

    it('should create valid JavaScript', async () => {
      mockAxeptioSdkNative.getAxeptioToken.mockResolvedValue('valid-token');

      const script = await AxeptioSDK.getWebViewInjectionScript();

      // Should be valid JavaScript that can be parsed
      // eslint-disable-next-line no-new-func
      expect(() => new Function(script)).not.toThrow();
    });
  });

  describe('syncConsentWithWebView', () => {
    it('should create tokenized URL with real token', async () => {
      const mockToken = 'url-token-789';
      const baseUrl = 'https://example.com/consent';
      mockAxeptioSdkNative.getAxeptioToken.mockResolvedValue(mockToken);

      const result = await AxeptioSDK.syncConsentWithWebView(baseUrl);

      const url = new URL(result);
      expect(url.origin).toBe('https://example.com');
      expect(url.pathname).toBe('/consent');
      expect(url.searchParams.get('axeptio_token')).toBe(mockToken);
      expect(url.searchParams.get('axeptio_platform')).toBe('ios');
      expect(url.searchParams.get('axeptio_sync')).toBeTruthy();
    });

    it('should preserve existing URL parameters', async () => {
      mockAxeptioSdkNative.getAxeptioToken.mockResolvedValue('preserve-token');
      const baseUrl = 'https://example.com/page?existing=value&other=param';

      const result = await AxeptioSDK.syncConsentWithWebView(baseUrl);

      const url = new URL(result);
      expect(url.searchParams.get('existing')).toBe('value');
      expect(url.searchParams.get('other')).toBe('param');
      expect(url.searchParams.get('axeptio_token')).toBe('preserve-token');
    });
  });

  describe('getIOSWebViewConfig', () => {
    it('should return iOS-specific configuration', () => {
      const config = AxeptioSDK.getIOSWebViewConfig();

      expect(config).toEqual({
        incognito: false,
        cacheEnabled: false,
        sharedCookiesEnabled: true,
        allowsBackForwardNavigationGestures: false,
        bounces: false,
        scrollEnabled: true,
      });
    });

    it('should return Android configuration when on Android', () => {
      (Platform as any).OS = 'android';

      const config = AxeptioSDK.getIOSWebViewConfig();

      expect(config).toEqual({
        incognito: false,
        cacheEnabled: true,
        sharedCookiesEnabled: true,
      });
    });
  });

  describe('getWebViewProps', () => {
    it('should return props suitable for WebView component', () => {
      const props = AxeptioSDK.getWebViewProps();

      // Should have the required WebView props
      expect(props).toHaveProperty('incognito');
      expect(props).toHaveProperty('cacheEnabled');
      expect(props).toHaveProperty('sharedCookiesEnabled');

      // iOS should have additional props
      expect(props).toHaveProperty('allowsBackForwardNavigationGestures');
      expect(props).toHaveProperty('bounces');
      expect(props).toHaveProperty('scrollEnabled');
    });

    it('should be spreadable on WebView component', () => {
      const props = AxeptioSDK.getWebViewProps();

      // Simulate spreading props (should not throw)
      const webViewProps = {
        source: { uri: 'https://example.com' },
        ...props,
      };

      expect(webViewProps.source).toEqual({ uri: 'https://example.com' });
      expect(webViewProps.incognito).toBeDefined();
    });
  });

  describe('getDiagnosticInfo', () => {
    it('should collect comprehensive diagnostic information', async () => {
      const mockToken = 'diagnostic-token';
      const mockPlatformVersion = 'iOS17.0.1';
      mockAxeptioSdkNative.getAxeptioToken.mockResolvedValue(mockToken);
      mockAxeptioSdkNative.getPlaformVersion.mockResolvedValue(
        mockPlatformVersion
      );

      const result = await AxeptioSDK.getDiagnosticInfo();

      expect(result).toEqual({
        platform: 'ios',
        platformVersion: mockPlatformVersion,
        sdkVersion: '2.0.10',
        hasToken: true,
        webViewSupport: {
          cookieSyncCapable: false,
          isolatedStorage: true,
        },
      });

      expect(mockAxeptioSdkNative.getAxeptioToken).toHaveBeenCalledTimes(1);
      expect(mockAxeptioSdkNative.getPlaformVersion).toHaveBeenCalledTimes(1);
    });

    it('should handle native method failures gracefully', async () => {
      mockAxeptioSdkNative.getAxeptioToken.mockRejectedValue(
        new Error('Token failed')
      );
      mockAxeptioSdkNative.getPlaformVersion.mockRejectedValue(
        new Error('Platform failed')
      );

      const result = await AxeptioSDK.getDiagnosticInfo();

      expect(result.hasToken).toBe(false);
      expect(result.platformVersion).toBe('unknown');
    });
  });

  describe('testWebViewCookieSync', () => {
    it('should run comprehensive sync test', async () => {
      const mockToken = 'test-sync-token';
      mockAxeptioSdkNative.getAxeptioToken.mockResolvedValue(mockToken);

      const result = await AxeptioSDK.testWebViewCookieSync();

      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('details');
      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.details)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);

      // Should have positive result for token availability
      const tokenDetail = result.details.find((detail) =>
        detail.includes('Axeptio token')
      );
      expect(tokenDetail).toContain('✅');
    });

    it('should provide platform-specific recommendations', async () => {
      mockAxeptioSdkNative.getAxeptioToken.mockResolvedValue('token');
      (Platform as any).Version = '15.0'; // Problematic iOS version

      const result = await AxeptioSDK.testWebViewCookieSync();

      expect(result.recommendations).toContain(
        'Use token-based synchronization instead of relying on cookies'
      );
      expect(result.recommendations).toContain(
        'Apply iOS-specific WebView configuration from IOSConfigUtils'
      );
    });
  });

  describe('getWebViewCapabilityTestScript', () => {
    it('should return valid JavaScript for WebView injection', () => {
      const script = AxeptioSDK.getWebViewCapabilityTestScript();

      expect(typeof script).toBe('string');
      expect(script.length).toBeGreaterThan(0);
      // eslint-disable-next-line no-new-func
      expect(() => new Function(script)).not.toThrow();
      expect(script).toContain('axeptio_webview_capability_test');
    });
  });

  describe('validateWebViewSyncResult', () => {
    it('should validate successful sync messages', () => {
      const successMessage = {
        axeptioSyncSuccess: true,
        token: 'validated-token',
        timestamp: Date.now(),
      };

      const result = AxeptioSDK.validateWebViewSyncResult(successMessage);

      expect(result.success).toBe(true);
      expect(result.token).toBe('validated-token');
      expect(result.error).toBeUndefined();
    });

    it('should validate failed sync messages', () => {
      const failMessage = {
        axeptioSyncSuccess: false,
        error: 'Sync failed',
      };

      const result = AxeptioSDK.validateWebViewSyncResult(failMessage);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync failed');
    });

    it('should handle JSON string messages', () => {
      const messageString = JSON.stringify({
        axeptioSyncSuccess: true,
        token: 'json-string-token',
      });

      const result = AxeptioSDK.validateWebViewSyncResult(messageString);

      expect(result.success).toBe(true);
      expect(result.token).toBe('json-string-token');
    });
  });

  describe('cross-platform behavior', () => {
    it('should behave differently on Android vs iOS', async () => {
      mockAxeptioSdkNative.getAxeptioToken.mockResolvedValue(
        'cross-platform-token'
      );

      // Test iOS behavior
      (Platform as any).OS = 'ios';
      const iosConfig = AxeptioSDK.getIOSWebViewConfig();
      const iosData = await AxeptioSDK.getConsentDataForWebView();

      // Test Android behavior
      (Platform as any).OS = 'android';
      const androidConfig = AxeptioSDK.getIOSWebViewConfig();
      const androidData = await AxeptioSDK.getConsentDataForWebView();

      // Configurations should be different
      expect(iosConfig.cacheEnabled).toBe(false);
      expect(androidConfig.cacheEnabled).toBe(true);

      // Data platforms should be different
      expect(iosData.platform).toBe('ios');
      expect(androidData.platform).toBe('android');
    });
  });

  describe('error resilience', () => {
    it('should handle native module unavailability gracefully', async () => {
      // Simulate native module method not available
      delete (mockAxeptioSdkNative as any).getAxeptioToken;

      // Should throw meaningful error due to our linking error handling
      await expect(AxeptioSDK.getConsentDataForWebView()).rejects.toThrow();
    });

    it('should handle malformed native responses', async () => {
      const mockAxeptioSdkNativeBackup = mockAxeptioSdkNative.getAxeptioToken;
      mockAxeptioSdkNative.getAxeptioToken = jest
        .fn()
        .mockResolvedValue(null as any);

      const result = await AxeptioSDK.getConsentDataForWebView();

      // Should handle null token gracefully
      expect(result.token).toBe(null);
      expect(result.hasConsent).toBe(false);

      // Restore the mock
      mockAxeptioSdkNative.getAxeptioToken = mockAxeptioSdkNativeBackup;
    });
  });
});
