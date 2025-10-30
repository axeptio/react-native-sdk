import { Platform } from 'react-native';
import { WebViewSyncUtils } from '../webview-sync';
import type { WebViewConsentData } from '../../types/webview';

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

describe('WebViewSyncUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as any).OS = 'ios';
  });

  describe('formatConsentDataForWebView', () => {
    it('should format consent data correctly for iOS', () => {
      const mockToken = 'test-token-123';
      const beforeTime = Date.now();

      const result = WebViewSyncUtils.formatConsentDataForWebView(mockToken);

      const afterTime = Date.now();

      expect(result).toEqual({
        token: mockToken,
        timestamp: expect.any(Number),
        platform: 'ios',
        hasConsent: true,
      });

      expect(result.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(result.timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should format consent data correctly for Android', () => {
      (Platform as any).OS = 'android';
      const mockToken = 'android-token';

      const result = WebViewSyncUtils.formatConsentDataForWebView(mockToken);

      expect(result.platform).toBe('android');
      expect(result.token).toBe(mockToken);
    });

    it('should set hasConsent to false for empty token', () => {
      const result = WebViewSyncUtils.formatConsentDataForWebView('');

      expect(result.hasConsent).toBe(false);
      expect(result.token).toBe('');
    });
  });

  describe('generateConsentInjectionScript', () => {
    it('should generate valid JavaScript injection code', () => {
      const consentData: WebViewConsentData = {
        token: 'test-token-123',
        timestamp: 1234567890,
        platform: 'ios',
        hasConsent: true,
      };

      const script =
        WebViewSyncUtils.generateConsentInjectionScript(consentData);

      expect(script).toContain('window.axeptioConsentSync');
      expect(script).toContain(consentData.token);
      expect(script).toContain('axeptio_token');
      expect(script).toContain('localStorage.setItem');
      expect(script).toContain('document.cookie');
      expect(script).toContain('CustomEvent');
      // Script should be properly formatted
      expect(script.length).toBeGreaterThan(100);
    });

    it('should handle special characters in token', () => {
      const consentData: WebViewConsentData = {
        token: 'test\'with"quotes\nand\\backslash',
        timestamp: Date.now(),
        platform: 'ios',
        hasConsent: true,
      };

      const script =
        WebViewSyncUtils.generateConsentInjectionScript(consentData);

      // Should create valid JavaScript that safely escapes special chars
      // eslint-disable-next-line no-new-func
      expect(() => new Function(script)).not.toThrow();
      // Token should be properly escaped in the script
      expect(script).toContain("test'with");
      expect(script).toContain('quotes');
      expect(script).toContain('backslash');
    });

    it('should include platform and timestamp in custom event', () => {
      const consentData: WebViewConsentData = {
        token: 'test-token',
        timestamp: 9876543210,
        platform: 'android',
        hasConsent: true,
      };

      const script =
        WebViewSyncUtils.generateConsentInjectionScript(consentData);

      expect(script).toContain('"platform":"android"');
      expect(script).toContain('"timestamp":9876543210');
    });
  });

  describe('createTokenizedURL', () => {
    it('should add token parameters to URL', () => {
      const baseUrl = 'https://example.com/page';
      const token = 'test-token-123';

      const result = WebViewSyncUtils.createTokenizedURL(baseUrl, token);

      const url = new URL(result);
      expect(url.searchParams.get('axeptio_token')).toBe(token);
      expect(url.searchParams.get('axeptio_platform')).toBe('ios');
      expect(url.searchParams.get('axeptio_sync')).toBeTruthy();
    });

    it('should preserve existing URL parameters', () => {
      const baseUrl = 'https://example.com/page?existing=param&other=value';
      const token = 'test-token';

      const result = WebViewSyncUtils.createTokenizedURL(baseUrl, token);

      const url = new URL(result);
      expect(url.searchParams.get('existing')).toBe('param');
      expect(url.searchParams.get('other')).toBe('value');
      expect(url.searchParams.get('axeptio_token')).toBe(token);
    });

    it('should handle URLs with hash fragments', () => {
      const baseUrl = 'https://example.com/page#section';
      const token = 'hash-token';

      const result = WebViewSyncUtils.createTokenizedURL(baseUrl, token);

      expect(result).toContain('#section');
      expect(result).toContain('axeptio_token=hash-token');
    });

    it('should include sync timestamp', () => {
      const baseUrl = 'https://example.com';
      const token = 'timestamp-token';
      const beforeTime = Date.now();

      const result = WebViewSyncUtils.createTokenizedURL(baseUrl, token);

      const afterTime = Date.now();
      const url = new URL(result);
      const syncTimestamp = parseInt(
        url.searchParams.get('axeptio_sync') || '0',
        10
      );

      expect(syncTimestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(syncTimestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('validateSyncResult', () => {
    it('should validate successful sync result', () => {
      const message = {
        axeptioSyncSuccess: true,
        token: 'success-token',
        timestamp: 1234567890,
      };

      const result = WebViewSyncUtils.validateSyncResult(message);

      expect(result.success).toBe(true);
      expect(result.token).toBe('success-token');
      expect(result.timestamp).toBe(1234567890);
      expect(result.error).toBeUndefined();
    });

    it('should validate failed sync result', () => {
      const message = {
        axeptioSyncSuccess: false,
        error: 'Sync failed',
        timestamp: 1234567890,
      };

      const result = WebViewSyncUtils.validateSyncResult(message);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync failed');
      expect(result.timestamp).toBe(1234567890);
    });

    it('should parse JSON string messages', () => {
      const messageString = JSON.stringify({
        axeptioSyncSuccess: true,
        token: 'json-token',
      });

      const result = WebViewSyncUtils.validateSyncResult(messageString);

      expect(result.success).toBe(true);
      expect(result.token).toBe('json-token');
    });

    it('should handle malformed messages', () => {
      const invalidMessage = 'invalid-json-{';

      const result = WebViewSyncUtils.validateSyncResult(invalidMessage);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid sync message');
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it('should handle messages without sync success flag', () => {
      const message = {
        token: 'no-flag-token',
        timestamp: 9876543210,
      };

      const result = WebViewSyncUtils.validateSyncResult(message);

      expect(result.success).toBe(false);
      expect(result.token).toBe('no-flag-token');
      expect(result.timestamp).toBe(9876543210);
    });

    it('should set default timestamp when missing', () => {
      const message = {
        axeptioSyncSuccess: true,
        token: 'no-timestamp-token',
      };

      const beforeTime = Date.now();
      const result = WebViewSyncUtils.validateSyncResult(message);
      const afterTime = Date.now();

      expect(result.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(result.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });
});
