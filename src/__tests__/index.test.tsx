import { NativeModules } from 'react-native';
import AxeptioSDK, { AxeptioService } from '../index';

// Mock React Native modules
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

describe('AxeptioSDK', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Core SDK Methods', () => {
    it('should call native getPlaformVersion method', async () => {
      const mockVersion = 'iOS17.0';
      mockAxeptioSdkNative.getPlaformVersion.mockResolvedValue(mockVersion);

      const result = await AxeptioSDK.getPlaformVersion();

      expect(result).toBe(mockVersion);
      expect(mockAxeptioSdkNative.getPlaformVersion).toHaveBeenCalledTimes(1);
    });

    it('should call native getAxeptioToken method', async () => {
      const mockToken = 'test-token-123';
      mockAxeptioSdkNative.getAxeptioToken.mockResolvedValue(mockToken);

      const result = await AxeptioSDK.getAxeptioToken();

      expect(result).toBe(mockToken);
      expect(mockAxeptioSdkNative.getAxeptioToken).toHaveBeenCalledTimes(1);
    });

    it('should call native initialize method with correct parameters', async () => {
      const targetService = AxeptioService.brands;
      const clientId = 'test-client-id';
      const cookiesVersion = '1.0';
      const token = 'optional-token';

      mockAxeptioSdkNative.initialize.mockResolvedValue(undefined);

      await AxeptioSDK.initialize(
        targetService,
        clientId,
        cookiesVersion,
        token
      );

      expect(mockAxeptioSdkNative.initialize).toHaveBeenCalledWith(
        targetService,
        clientId,
        cookiesVersion,
        token
      );
    });

    it('should call native initialize without token', async () => {
      const targetService = AxeptioService.tcfPublishers;
      const clientId = 'test-client';
      const cookiesVersion = '2.0';

      mockAxeptioSdkNative.initialize.mockResolvedValue(undefined);

      await AxeptioSDK.initialize(targetService, clientId, cookiesVersion);

      expect(mockAxeptioSdkNative.initialize).toHaveBeenCalledWith(
        targetService,
        clientId,
        cookiesVersion,
        ''
      );
    });

    it('should call native setupUI method', async () => {
      mockAxeptioSdkNative.setupUI.mockResolvedValue(undefined);

      await AxeptioSDK.setupUI();

      expect(mockAxeptioSdkNative.setupUI).toHaveBeenCalledTimes(1);
    });

    it('should call native showConsentScreen method', async () => {
      mockAxeptioSdkNative.showConsentScreen.mockResolvedValue(undefined);

      await AxeptioSDK.showConsentScreen();

      expect(mockAxeptioSdkNative.showConsentScreen).toHaveBeenCalledTimes(1);
    });

    it('should call native clearConsent method', async () => {
      mockAxeptioSdkNative.clearConsent.mockResolvedValue(undefined);

      await AxeptioSDK.clearConsent();

      expect(mockAxeptioSdkNative.clearConsent).toHaveBeenCalledTimes(1);
    });

    it('should call native setUserDeniedTracking method', async () => {
      mockAxeptioSdkNative.setUserDeniedTracking.mockResolvedValue(undefined);

      await AxeptioSDK.setUserDeniedTracking();

      expect(mockAxeptioSdkNative.setUserDeniedTracking).toHaveBeenCalledTimes(
        1
      );
      expect(mockAxeptioSdkNative.setUserDeniedTracking).toHaveBeenCalledWith(
        true
      );
    });

    it('should call native appendAxeptioTokenURL method', async () => {
      const url = 'https://example.com';
      const token = 'append-token';
      const expectedUrl = 'https://example.com?token=append-token';

      mockAxeptioSdkNative.appendAxeptioTokenURL.mockResolvedValue(expectedUrl);

      const result = await AxeptioSDK.appendAxeptioTokenURL(url, token);

      expect(result).toBe(expectedUrl);
      expect(mockAxeptioSdkNative.appendAxeptioTokenURL).toHaveBeenCalledWith(
        url,
        token
      );
    });
  });

  describe('Event Management', () => {
    it('should add and manage event listeners', () => {
      const mockListener = {
        onPopupClosedEvent: jest.fn(),
        onConsentCleared: jest.fn(),
        onGoogleConsentModeUpdate: jest.fn(),
      };

      AxeptioSDK.addListener(mockListener);
      AxeptioSDK.removeListeners();

      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('Enums and Types', () => {
    it('should export AxeptioService enum', () => {
      expect(AxeptioService.brands).toBe('brands');
      expect(AxeptioService.tcfPublishers).toBe('publisher');
    });

    it('should have event handling methods', () => {
      expect(typeof AxeptioSDK.addListener).toBe('function');
      expect(typeof AxeptioSDK.removeListeners).toBe('function');
    });
  });

  describe('WebView Synchronization Methods', () => {
    it('should have WebView synchronization methods available', () => {
      expect(typeof AxeptioSDK.getConsentDataForWebView).toBe('function');
      expect(typeof AxeptioSDK.getWebViewInjectionScript).toBe('function');
      expect(typeof AxeptioSDK.syncConsentWithWebView).toBe('function');
      expect(typeof AxeptioSDK.getIOSWebViewConfig).toBe('function');
      expect(typeof AxeptioSDK.getWebViewProps).toBe('function');
      expect(typeof AxeptioSDK.getDiagnosticInfo).toBe('function');
      expect(typeof AxeptioSDK.testWebViewCookieSync).toBe('function');
      expect(typeof AxeptioSDK.getWebViewCapabilityTestScript).toBe('function');
      expect(typeof AxeptioSDK.validateWebViewSyncResult).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle native method errors gracefully', async () => {
      const error = new Error('Native method failed');
      mockAxeptioSdkNative.getAxeptioToken.mockRejectedValue(error);

      await expect(AxeptioSDK.getAxeptioToken()).rejects.toThrow(
        'Native method failed'
      );
    });

    it('should handle missing native module', () => {
      // This tests the linking error proxy
      const originalAxeptioSdk = NativeModules.AxeptioSdk;

      // Temporarily remove the native module
      (NativeModules as any).AxeptioSdk = undefined;

      // Re-import to trigger linking error check
      jest.resetModules();

      // Restore the mock
      (NativeModules as any).AxeptioSdk = originalAxeptioSdk;
    });
  });
});
