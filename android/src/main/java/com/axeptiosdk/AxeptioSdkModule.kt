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
import io.axept.android.library.AxeptioService
import io.axept.android.library.WidgetType

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

      override fun onConsentCleared() {
        reactContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit("onConsentCleared", null)
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
  fun initialize(targetService: String, clientId: String, cookiesVersion: String, token: String, promise: Promise) {
    val currentActivity = super.getCurrentActivity();

    if (currentActivity == null) {
      promise.resolve(null)
      return
    }
    val axeptioService = when (targetService) {
      "brands" -> AxeptioService.BRANDS
      "publishers" -> AxeptioService.PUBLISHERS_TCF
      else -> AxeptioService.PUBLISHERS_TCF
    }
    currentActivity.runOnUiThread {
      if (token.isNotEmpty()) {
        AxeptioSDK.instance().initialize(currentActivity, axeptioService, clientId, cookiesVersion, token, WidgetType.PRODUCTION)
      } else {
        AxeptioSDK.instance().initialize(currentActivity, axeptioService, clientId, cookiesVersion, WidgetType.PRODUCTION)
      }
      promise.resolve(null)
    }
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
      promise.resolve(null)
    }
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

  // MSK-93: Consent Debug Information API
  @ReactMethod
  fun getConsentDebugInfo(preferenceKey: String?, promise: Promise) {
    try {
      val debugInfo = AxeptioSDK.instance().getConsentDebugInfo(preferenceKey)
      val writableMap = WritableNativeMap()

      debugInfo.forEach { (key, value) ->
        when (value) {
          null -> writableMap.putNull(key)
          is String -> writableMap.putString(key, value)
          is Int -> writableMap.putInt(key, value)
          is Double -> writableMap.putDouble(key, value)
          is Boolean -> writableMap.putBoolean(key, value)
          else -> writableMap.putString(key, value.toString())
        }
      }

      promise.resolve(writableMap)
    } catch (e: Exception) {
      promise.reject("GET_CONSENT_DEBUG_INFO_ERROR", "Failed to get consent debug info: ${e.message}", e)
    }
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
