import { Platform } from 'react-native';
import { DiagnosticsUtils } from '../diagnostics';

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '17.0',
  },
}));

describe('DiagnosticsUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as any).OS = 'ios';
    (Platform as any).Version = '17.0';
  });

  describe('getDiagnosticInfo', () => {
    it('should collect diagnostic information successfully', async () => {
      const mockGetToken = jest.fn().mockResolvedValue('test-token-123');
      const mockGetPlatformVersion = jest.fn().mockResolvedValue('iOS17.0');

      const result = await DiagnosticsUtils.getDiagnosticInfo(
        mockGetToken,
        mockGetPlatformVersion
      );

      expect(result).toEqual({
        platform: 'ios',
        platformVersion: 'iOS17.0',
        sdkVersion: '2.0.11',
        hasToken: true,
        webViewSupport: {
          cookieSyncCapable: false,
          isolatedStorage: true,
        },
      });

      expect(mockGetToken).toHaveBeenCalledTimes(1);
      expect(mockGetPlatformVersion).toHaveBeenCalledTimes(1);
    });

    it('should handle Android platform correctly', async () => {
      (Platform as any).OS = 'android';
      const mockGetToken = jest.fn().mockResolvedValue('android-token');
      const mockGetPlatformVersion = jest.fn().mockResolvedValue('Android 13');

      const result = await DiagnosticsUtils.getDiagnosticInfo(
        mockGetToken,
        mockGetPlatformVersion
      );

      expect(result.platform).toBe('android');
      expect(result.webViewSupport.cookieSyncCapable).toBe(true);
      expect(result.webViewSupport.isolatedStorage).toBe(false);
    });

    it('should handle empty token', async () => {
      const mockGetToken = jest.fn().mockResolvedValue('');
      const mockGetPlatformVersion = jest.fn().mockResolvedValue('iOS17.0');

      const result = await DiagnosticsUtils.getDiagnosticInfo(
        mockGetToken,
        mockGetPlatformVersion
      );

      expect(result.hasToken).toBe(false);
    });

    it('should handle token retrieval errors', async () => {
      const mockGetToken = jest
        .fn()
        .mockRejectedValue(new Error('Token error'));
      const mockGetPlatformVersion = jest.fn().mockResolvedValue('iOS17.0');

      const result = await DiagnosticsUtils.getDiagnosticInfo(
        mockGetToken,
        mockGetPlatformVersion
      );

      expect(result.hasToken).toBe(false);
    });

    it('should handle platform version retrieval errors', async () => {
      const mockGetToken = jest.fn().mockResolvedValue('test-token');
      const mockGetPlatformVersion = jest
        .fn()
        .mockRejectedValue(new Error('Platform error'));

      const result = await DiagnosticsUtils.getDiagnosticInfo(
        mockGetToken,
        mockGetPlatformVersion
      );

      expect(result.platformVersion).toBe('unknown');
    });
  });

  describe('testWebViewCookieSync', () => {
    it('should pass tests when token is available on Android', async () => {
      (Platform as any).OS = 'android';
      const mockGetToken = jest.fn().mockResolvedValue('valid-token');

      const result = await DiagnosticsUtils.testWebViewCookieSync(mockGetToken);

      expect(result.passed).toBe(true);
      expect(result.details).toContain('✅ Axeptio token is available');
      expect(result.details).toContain(
        '✅ Android platform - WebView cookie sync should work normally'
      );
    });

    it('should provide warnings for iOS platform', async () => {
      (Platform as any).Version = '15.0';
      const mockGetToken = jest.fn().mockResolvedValue('ios-token');

      const result = await DiagnosticsUtils.testWebViewCookieSync(mockGetToken);

      expect(result.details).toContain(
        '⚠️  iOS platform detected - WebView cookie sync limitations expected'
      );
      expect(result.details).toContain(
        '⚠️  iOS 15 - WKWebView cookie isolation active'
      );
      expect(result.recommendations).toContain(
        'Use token-based synchronization instead of relying on cookies'
      );
      expect(result.recommendations).toContain(
        'Apply iOS-specific WebView configuration from IOSConfigUtils'
      );
    });

    it('should fail when no token is available', async () => {
      const mockGetToken = jest.fn().mockResolvedValue('');

      const result = await DiagnosticsUtils.testWebViewCookieSync(mockGetToken);

      expect(result.passed).toBe(false);
      expect(result.details).toContain('❌ No Axeptio token found');
      expect(result.recommendations).toContain(
        'Initialize SDK and ensure consent is granted before using WebView'
      );
    });

    it('should handle token retrieval errors', async () => {
      const mockGetToken = jest
        .fn()
        .mockRejectedValue(new Error('Network error'));

      const result = await DiagnosticsUtils.testWebViewCookieSync(mockGetToken);

      expect(result.passed).toBe(false);
      expect(result.details).toContain(
        '❌ Error getting token: Error: Network error'
      );
      expect(result.recommendations).toContain(
        'Check SDK initialization and network connectivity'
      );
    });

    it('should not show iOS warnings for versions below 14', async () => {
      (Platform as any).Version = '13.0';
      const mockGetToken = jest.fn().mockResolvedValue('token');

      const result = await DiagnosticsUtils.testWebViewCookieSync(mockGetToken);

      const hasWkWebViewWarning = result.details.some((detail) =>
        detail.includes('WKWebView cookie isolation active')
      );
      expect(hasWkWebViewWarning).toBe(false);
    });

    it('should include React Native WebView information', async () => {
      const mockGetToken = jest.fn().mockResolvedValue('token');

      const result = await DiagnosticsUtils.testWebViewCookieSync(mockGetToken);

      expect(result.details).toContain(
        'ℹ️  For complete testing, ensure react-native-webview is up to date'
      );
    });
  });

  describe('formatDiagnosticReport', () => {
    it('should format iOS diagnostic report correctly', () => {
      const diagnostic = {
        platform: 'ios' as const,
        platformVersion: 'iOS17.0',
        sdkVersion: '2.0.11',
        hasToken: true,
        webViewSupport: {
          cookieSyncCapable: false,
          isolatedStorage: true,
        },
      };

      const report = DiagnosticsUtils.formatDiagnosticReport(diagnostic);

      expect(report).toContain(
        '=== Axeptio React Native SDK Diagnostic Report ==='
      );
      expect(report).toContain('Platform: ios iOS17.0');
      expect(report).toContain('SDK Version: 2.0.11');
      expect(report).toContain('Token Available: Yes');
      expect(report).toContain('WebView Cookie Sync: Limited');
      expect(report).toContain('Storage Isolation: Yes (iOS WKWebView)');
      expect(report).toContain(
        'iOS WebView cookie synchronization has known limitations'
      );
      expect(report).toContain('token-based sync');
    });

    it('should format Android diagnostic report correctly', () => {
      const diagnostic = {
        platform: 'android' as const,
        platformVersion: 'Android 13',
        sdkVersion: '2.0.11',
        hasToken: false,
        webViewSupport: {
          cookieSyncCapable: true,
          isolatedStorage: false,
        },
      };

      const report = DiagnosticsUtils.formatDiagnosticReport(diagnostic);

      expect(report).toContain('Platform: android Android 13');
      expect(report).toContain('Token Available: No');
      expect(report).toContain('WebView Cookie Sync: Supported');
      expect(report).toContain('Storage Isolation: No');
      expect(report).toContain(
        'Platform should support normal WebView cookie synchronization'
      );
      expect(report).not.toContain(
        'iOS WebView cookie synchronization has known limitations'
      );
    });
  });

  describe('generateWebViewCapabilityTest', () => {
    it('should generate valid JavaScript code', () => {
      const script = DiagnosticsUtils.generateWebViewCapabilityTest();

      // Should be valid JavaScript
      // eslint-disable-next-line no-new-func
      expect(() => new Function(script)).not.toThrow();

      // Should contain expected functionality
      expect(script).toContain('document.cookie');
      expect(script).toContain('window.localStorage');
      expect(script).toContain('axeptio_test');
      expect(script).toContain('axeptio_token');
      expect(script).toContain('ReactNativeWebView');
      expect(script).toContain('postMessage');
      expect(script).toContain('axeptio_webview_capability_test');
    });

    it('should test cookie capabilities', () => {
      const script = DiagnosticsUtils.generateWebViewCapabilityTest();

      expect(script).toContain('cookies: {');
      expect(script).toContain('readable: document.cookie');
      expect(script).toContain('writable: false');
      expect(script).toContain('axeptio_token');
    });

    it('should test localStorage capabilities', () => {
      const script = DiagnosticsUtils.generateWebViewCapabilityTest();

      expect(script).toContain('localStorage: {');
      expect(script).toContain('available: !!window.localStorage');
      expect(script).toContain('localStorage.setItem');
      expect(script).toContain('localStorage.getItem');
    });

    it('should include error handling', () => {
      const script = DiagnosticsUtils.generateWebViewCapabilityTest();

      expect(script).toContain('try {');
      expect(script).toContain('} catch');
      expect(script).toContain('.error = e.message');
    });

    it('should include timestamp and user agent', () => {
      const script = DiagnosticsUtils.generateWebViewCapabilityTest();

      expect(script).toContain('timestamp: Date.now()');
      expect(script).toContain('userAgent: navigator.userAgent');
    });
  });

  describe('error handling', () => {
    it('should handle malformed version strings gracefully', async () => {
      (Platform as any).Version = undefined;
      const mockGetToken = jest.fn().mockResolvedValue('token');

      const result = await DiagnosticsUtils.testWebViewCookieSync(mockGetToken);

      // Should not throw and should complete successfully
      expect(result).toBeDefined();
      expect(result.passed).toBeDefined();
      expect(result.details).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should handle concurrent async operations', async () => {
      const mockGetToken = jest
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve('delayed-token'), 10)
            )
        );
      const mockGetPlatformVersion = jest
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve('delayed-version'), 5)
            )
        );

      const result = await DiagnosticsUtils.getDiagnosticInfo(
        mockGetToken,
        mockGetPlatformVersion
      );

      expect(result.hasToken).toBe(true);
      expect(result.platformVersion).toBe('delayed-version');
    });
  });
});
