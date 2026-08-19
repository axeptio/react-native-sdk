/**
 * Covers the iOS promise-channel event transport: when the native module
 * exposes pollEvents, the SDK long-polls it (starting with the first
 * addListener) and fans results out to registered listeners; the legacy
 * NativeEventEmitter path is bypassed.
 */
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '17.0',
    select: jest.fn((obj) => obj.ios || obj.default),
  },
  NativeModules: {
    AxeptioSdk: {
      pollEvents: jest.fn(),
    },
  },
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
  })),
}));

describe('iOS event polling transport', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('delivers polled events to listeners, tolerates empty batches and errors', async () => {
    jest.useFakeTimers();
    const { NativeModules, NativeEventEmitter } = require('react-native');
    const pollEvents = NativeModules.AxeptioSdk.pollEvents as jest.Mock;

    pollEvents
      .mockResolvedValueOnce([
        { name: 'onPopupClosedEvent' },
        {
          name: 'onGoogleConsentModeUpdate',
          body: { adStorage: true },
        },
      ])
      // A superseded poll resolves with an empty batch.
      .mockResolvedValueOnce([])
      // Native side going away (e.g. reload) must not kill the loop.
      .mockRejectedValueOnce(new Error('native gone'))
      // Park the loop afterwards.
      .mockImplementation(() => new Promise(() => {}));

    let sdk: any;
    jest.isolateModules(() => {
      sdk = require('../index').default;
    });

    // The loop only starts with the first listener registration.
    expect(pollEvents).not.toHaveBeenCalled();

    const onPopupClosedEvent = jest.fn();
    const onGoogleConsentModeUpdate = jest.fn();
    sdk.addListener({ onPopupClosedEvent, onGoogleConsentModeUpdate });

    // Flush the first batch, the empty batch and the rejection (which
    // schedules the 1s backoff timer).
    await jest.advanceTimersByTimeAsync(0);
    expect(onPopupClosedEvent).toHaveBeenCalledTimes(1);
    expect(onGoogleConsentModeUpdate).toHaveBeenCalledWith({ adStorage: true });

    // After the backoff elapses the loop re-arms with a pending poll.
    await jest.advanceTimersByTimeAsync(1000);
    expect(pollEvents.mock.calls.length).toBeGreaterThanOrEqual(4);

    // The legacy emitter path must not be used when pollEvents exists.
    expect(NativeEventEmitter).not.toHaveBeenCalled();
  });
});
