import React, { useCallback, useEffect, useState } from 'react';

import AxeptioSDK, {
  type AxeptioEventListener,
} from '@axeptio/react-native-sdk';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';
import {
  getTrackingStatus,
  requestTrackingPermission,
} from 'react-native-tracking-transparency';
import { TokenModal } from './TokenModal';

const adUnitId =
  Platform.OS === 'ios'
    ? 'ca-app-pub-3940256099942544/1033173712'
    : 'ca-app-pub-3940256099942544/4411468910';
// const interstitial = InterstitialAd.createForAdRequest(adUnitId);

export default function App() {
  const [tokenModalVisible, setTokenModalVisible] = useState(false);
  const [interstitial, setInterstitial] = useState<InterstitialAd>();
  const [loaded, setLoaded] = useState(false);

  const loadAd = useCallback(async () => {
    setInterstitial(undefined);
    const ad = await InterstitialAd.createForAdRequest(adUnitId);
    setInterstitial(ad);
  }, []);

  useEffect(() => {
    setLoaded(false);
    if (!interstitial) {
      return;
    }
    const unsubscribe = interstitial.addAdEventsListener(({ type }) => {
      switch (type) {
        case AdEventType.LOADED:
          setLoaded(true);
          break;
        case AdEventType.ERROR:
          setLoaded(false);
          break;
        case AdEventType.CLOSED:
          // Reload ad when closed
          loadAd();
          break;
      }
    });
    interstitial.load();

    return unsubscribe;
  }, [interstitial, loadAd]);

  useEffect(() => {
    async function init() {
      const platform = await AxeptioSDK.getPlaformVersion();
      console.log('Platform', platform);
      await AxeptioSDK.initialize(
        '5fbfa806a0787d3985c6ee5f',
        'google cmp partner program sandbox-en-EU'
      );

      const listener: AxeptioEventListener = {
        onPopupClosedEvent: () => {
          // The CMP notice is being hidden
          loadAd();
        },
        onConsentChanged: () => {
          // The consent of the user changed
          // Do something
        },
        onGoogleConsentModeUpdate: (_consents) => {
          // The Google Consent V2 status
          // Do something
        },
      };
      AxeptioSDK.addListener(listener);

      // Manage ATT
      let trackingStatus = await getTrackingStatus();

      if (trackingStatus === 'not-determined') {
        trackingStatus = await requestTrackingPermission();
      }

      if (trackingStatus === 'denied') {
        await AxeptioSDK.setUserDeniedTracking();
      } else {
        await AxeptioSDK.setupUI();
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        onPress={() => AxeptioSDK.showConsentScreen()}
      >
        <Text style={styles.label}>Consent popup</Text>
      </Pressable>
      <Pressable
        style={[styles.button, !loaded && styles.disabledButton]}
        onPress={() => interstitial?.show()}
        disabled={!interstitial || !loaded}
      >
        <Text style={styles.label}>Google Ad</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.clearButton]}
        onPress={() => {
          AxeptioSDK.clearConsent().then(loadAd);
        }}
      >
        <Text style={styles.label}>Clear consent</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => setTokenModalVisible(true)}
      >
        <Text style={styles.label}>Show webview with token</Text>
      </Pressable>
      <TokenModal
        modalVisible={tokenModalVisible}
        setModalVisible={setTokenModalVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(253, 247, 231, 1)',
  },
  button: {
    margin: 8,
    padding: 12,
    backgroundColor: 'rgba(247, 209, 94, 1)',
    borderRadius: 999,
    maxWidth: 320,
    width: '100%',
  },
  clearButton: {
    backgroundColor: 'rgba(205, 97, 91, 1)',
  },
  disabledButton: {
    backgroundColor: '#FAFAFA',
  },
  label: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
  },
});
