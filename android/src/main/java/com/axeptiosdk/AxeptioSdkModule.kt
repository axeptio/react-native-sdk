package com.axeptiosdk

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule

import android.net.Uri
import io.axept.android.googleconsent.GoogleConsentStatus
import io.axept.android.googleconsent.GoogleConsentType
import io.axept.android.library.AxeptioEventListener
import io.axept.android.library.AxeptioSDK

class AxeptioSdkModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var axeptioEventListener: AxeptioEventListener? = null

  init {
    axeptioEventListener = object : AxeptioEventListener {
      override fun onPopupClosedEvent() {
        reactContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit("onPopupClosedEvent", null)
      }

      override fun onGoogleConsentModeUpdate(consentMap: Map<GoogleConsentType, GoogleConsentStatus>) {
        val map = WritableNativeMap()
        map.putBoolean("analyticsStorage", consentMap[GoogleConsentType.ANALYTICS_STORAGE] == GoogleConsentStatus.GRANTED)
        map.putBoolean("adStorage", consentMap[GoogleConsentType.AD_STORAGE] == GoogleConsentStatus.GRANTED)
        map.putBoolean("adUserData", consentMap[GoogleConsentType.AD_USER_DATA] == GoogleConsentStatus.GRANTED)
        map.putBoolean("adPersonalization", consentMap[GoogleConsentType.AD_PERSONALIZATION] == GoogleConsentStatus.GRANTED)

        reactContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit("onGoogleConsentModeUpdate", map)
      }
    }

    axeptioEventListener?.let { AxeptioSDK.instance().setEventListener(it) }
  }

  override fun getName(): String {
    return NAME
  }

  private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  private fun sendEvent(reactContext: ReactContext, eventName: String, params: String) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  @ReactMethod
  fun getPlaformVersion(promise: Promise) {
    promise.resolve("Android ${android.os.Build.VERSION.RELEASE}")
  }

  @ReactMethod
  fun getAxeptioToken(promise: Promise) {
    promise.resolve(AxeptioSDK.instance().token)
  }

  @ReactMethod
  fun initialize(clientId: String, cookiesVersion: String, token: String, promise: Promise) {
    val currentActivity = super.getCurrentActivity();

    if (currentActivity == null) {
      promise.resolve(null)
      return
    }

    currentActivity.runOnUiThread {
      AxeptioSDK.instance().initialize(currentActivity, clientId, cookiesVersion, token)
    }

    promise.resolve(null)
  }

  @ReactMethod
  fun setupUI(promise: Promise) {
    // iOS specific
    promise.resolve(null)
  }

  @ReactMethod
  fun setUserDeniedTracking(promise: Promise) {
    // iOS specific
    promise.resolve(null)
  }

  @ReactMethod
  fun showConsentScreen(promise: Promise) {
    val currentActivity = super.getCurrentActivity();

    if (currentActivity == null) {
      promise.resolve(null)
      return
    }

    currentActivity.runOnUiThread {
      AxeptioSDK.instance().showConsentScreen(currentActivity, true)
    }

    promise.resolve(null)
  }

  @ReactMethod
  fun clearConsent(promise: Promise) {
    AxeptioSDK.instance().clearConsents()
    promise.resolve(null)
  }

  @ReactMethod
  fun appendAxeptioTokenURL(url: String, token: String, promise: Promise) {
    val uri = Uri.parse(url)
    var response = AxeptioSDK.instance().appendAxeptioToken(uri, token)
    promise.resolve(response.toString())
  }

  @ReactMethod
  fun addListener(eventName: String?) {

  }

  @ReactMethod
  fun removeListeners(count: Int) {

  }

  companion object {
    const val NAME = "AxeptioSdk"
  }
}
