import React, { useEffect, useState } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';
import AxeptioSDK from 'react-native-axeptio-sdk';
import { TokenModal } from './TokenModal';

export default function App() {
  const [tokenModalVisible, setTokenModalVisible] = useState(false);

  useEffect(() => {
    async function init() {
      await AxeptioSDK.initialize(
        '5fbfa806a0787d3985c6ee5f',
        'google cmp partner program sandbox-en-EU'
      );
      await AxeptioSDK.setupUI();
    }
    init();
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
        style={[styles.button, styles.clearButton]}
        onPress={() => AxeptioSDK.clearConsent()}
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
  label: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
  },
});
