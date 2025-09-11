import { Platform } from 'react-native';
import { IOSConfigUtils } from '../ios-config';

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '17.0',
  },
}));

describe('IOSConfigUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as any).OS = 'ios';
    (Platform as any).Version = '17.0';
  });

  describe('getOptimizedWebViewConfig', () => {
    it('should return iOS-specific configuration for iOS platform', () => {
      const config = IOSConfigUtils.getOptimizedWebViewConfig();

      expect(config).toEqual({
        incognito: false,
        cacheEnabled: false,
        sharedCookiesEnabled: true,
        allowsBackForwardNavigationGestures: false,
        bounces: false,
        scrollEnabled: true,
      });
    });

    it('should return minimal configuration for Android platform', () => {
      (Platform as any).OS = 'android';

      const config = IOSConfigUtils.getOptimizedWebViewConfig();

      expect(config).toEqual({
        incognito: false,
        cacheEnabled: true,
        sharedCookiesEnabled: true,
      });

      expect(config.allowsBackForwardNavigationGestures).toBeUndefined();
      expect(config.bounces).toBeUndefined();
      expect(config.scrollEnabled).toBeUndefined();
    });
  });

  describe('getWebViewProps', () => {
    it('should return full props for iOS platform', () => {
      const props = IOSConfigUtils.getWebViewProps();

      expect(props).toEqual({
        incognito: false,
        cacheEnabled: false,
        sharedCookiesEnabled: true,
        allowsBackForwardNavigationGestures: false,
        bounces: false,
        scrollEnabled: true,
      });
    });

    it('should return minimal props for Android platform', () => {
      (Platform as any).OS = 'android';

      const props = IOSConfigUtils.getWebViewProps();

      expect(props).toEqual({
        incognito: false,
        cacheEnabled: true,
        sharedCookiesEnabled: true,
      });

      expect(props.allowsBackForwardNavigationGestures).toBeUndefined();
    });
  });

  describe('isProblematicIOSVersion', () => {
    it('should return false for Android platform', () => {
      (Platform as any).OS = 'android';

      const result = IOSConfigUtils.isProblematicIOSVersion();

      expect(result).toBe(false);
    });

    it('should return true for iOS 14 and above', () => {
      const problematicVersions = ['14.0', '15.5', '16.2', '17.0', '17.5.1'];

      problematicVersions.forEach((version) => {
        (Platform as any).Version = version;
        const result = IOSConfigUtils.isProblematicIOSVersion();
        expect(result).toBe(true);
      });
    });

    it('should return false for iOS versions below 14', () => {
      const safeVersions = ['13.7', '12.5', '11.0', '10.3'];

      safeVersions.forEach((version) => {
        (Platform as any).Version = version;
        const result = IOSConfigUtils.isProblematicIOSVersion();
        expect(result).toBe(false);
      });
    });

    it('should handle undefined Platform.Version', () => {
      (Platform as any).Version = undefined;

      const result = IOSConfigUtils.isProblematicIOSVersion();

      expect(result).toBe(false);
    });

    it('should handle invalid version strings', () => {
      const invalidVersions = ['invalid', '', 'abc.def'];

      invalidVersions.forEach((version) => {
        (Platform as any).Version = version;
        const result = IOSConfigUtils.isProblematicIOSVersion();
        expect(result).toBe(false); // parseInt will return NaN, which is < 14
      });
    });

    it('should handle version strings with extra parts', () => {
      (Platform as any).Version = '15.2.1.build.12345';

      const result = IOSConfigUtils.isProblematicIOSVersion();

      expect(result).toBe(true); // Should extract major version 15
    });

    it('should handle edge case at version boundary', () => {
      (Platform as any).Version = '14.0';

      const result = IOSConfigUtils.isProblematicIOSVersion();

      expect(result).toBe(true); // 14.0 should be considered problematic
    });
  });

  describe('getUserAgent', () => {
    it('should return iOS-specific user agent for iOS platform', () => {
      const userAgent = IOSConfigUtils.getUserAgent();

      expect(userAgent).toBe(
        'Mozilla/5.0 (iPhone; CPU iPhone OS like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 AxeptioRNSDK/2.0'
      );
    });

    it('should return undefined for Android platform', () => {
      (Platform as any).OS = 'android';

      const userAgent = IOSConfigUtils.getUserAgent();

      expect(userAgent).toBeUndefined();
    });
  });

  describe('getInjectionTime', () => {
    it('should return onLoadStart for consistent injection timing', () => {
      const injectionTime = IOSConfigUtils.getInjectionTime();

      expect(injectionTime).toBe('onLoadStart');
    });

    it('should return same value regardless of platform', () => {
      const iosTime = IOSConfigUtils.getInjectionTime();

      (Platform as any).OS = 'android';
      const androidTime = IOSConfigUtils.getInjectionTime();

      expect(iosTime).toBe(androidTime);
      expect(iosTime).toBe('onLoadStart');
    });
  });

  describe('platform consistency', () => {
    it('should maintain consistent behavior across different iOS versions', () => {
      const versions = ['14.0', '15.5', '16.2', '17.0'];

      versions.forEach((version) => {
        (Platform as any).Version = version;

        const config = IOSConfigUtils.getOptimizedWebViewConfig();
        const props = IOSConfigUtils.getWebViewProps();
        const userAgent = IOSConfigUtils.getUserAgent();

        // Configuration should be consistent across iOS versions
        expect(config.incognito).toBe(false);
        expect(config.cacheEnabled).toBe(false);
        expect(config.sharedCookiesEnabled).toBe(true);

        // Props should match config
        expect(props.incognito).toBe(config.incognito);
        expect(props.cacheEnabled).toBe(config.cacheEnabled);

        // User agent should be defined for iOS
        expect(userAgent).toBeDefined();
        expect(userAgent).toContain('AxeptioRNSDK');
      });
    });
  });
});
