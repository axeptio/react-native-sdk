import AxeptioSdk from '@axeptio/react-native-sdk';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

type Props = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
};

export function TokenModal({ modalVisible, setModalVisible }: Props) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!modalVisible) {
      setUrl(undefined);
    }
  }, [modalVisible]);

  async function updateWebViewUrl(token: string) {
    const finalToken =
      token.length > 0 ? token : await AxeptioSdk.getAxeptioToken();
    const axeptioUrl = await AxeptioSdk.appendAxeptioTokenURL(
      'https://google-cmp-partner.axept.io/cmp-for-publishers.html',
      finalToken
    );
    setUrl(axeptioUrl);
  }

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      onRequestClose={() => {
        setModalVisible(false);
      }}
    >
      {url ? (
        <SafeAreaView style={styles.container}>
          <Button title="Fermer" onPress={() => setModalVisible(false)} />
          <WebView source={{ uri: url }} />
        </SafeAreaView>
      ) : (
        <Pressable
          style={[styles.backdrop]}
          onPress={() => {
            setModalVisible(false);
          }}
        >
          <Pressable style={styles.alert}>
            <View style={styles.box}>
              <Text style={styles.title}>Enter Axeptio token</Text>
              <TextInput
                style={styles.input}
                placeholder="Axeptio token"
                onChangeText={setText}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                placeholderTextColor="#CCCCCC"
              />
              <View style={styles.buttons}>
                <View>
                  <Button
                    title="Open in browser"
                    onPress={() => updateWebViewUrl(text)}
                  />
                </View>
                <View style={styles.button}>
                  <Button
                    title="Cancel"
                    onPress={() => setModalVisible(false)}
                  />
                </View>
              </View>
            </View>
          </Pressable>
        </Pressable>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alert: {
    maxWidth: 320,
    width: '100%',
  },
  box: {
    padding: 24,
    elevation: 24,
    borderRadius: 2,
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 24,
    color: '#000',
  },
  input: {
    marginTop: 24,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    color: '#000',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  button: {
    marginLeft: 12,
  },
});
