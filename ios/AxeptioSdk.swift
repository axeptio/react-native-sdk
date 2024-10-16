import AxeptioSDK

@objc(AxeptioSdk)
class AxeptioSdk: RCTEventEmitter {

    private let axeptioEventListener = AxeptioEventListener()

    override init() {
        super.init()

        axeptioEventListener.onPopupClosedEvent = { [weak self] in
            guard let self else { return }
            self.sendEvent(withName: "onPopupClosedEvent", body: nil)
        }

        axeptioEventListener.onConsentChanged = { [weak self] in
            guard let self else { return }
            self.sendEvent(withName: "onConsentChanged", body: nil)
        }

        axeptioEventListener.onGoogleConsentModeUpdate = { [weak self] consents in
            guard let self else { return }
            self.sendEvent(withName: "onGoogleConsentModeUpdate", body: consents.toJSObject())
        }

        Axeptio.shared.setEventListener(axeptioEventListener)
    }

    deinit {
        Axeptio.shared.removeEventListener(axeptioEventListener)
    }

    @objc open override func supportedEvents() -> [String] {
        return [
            "onPopupClosedEvent",
            "onConsentChanged",
            "onGoogleConsentModeUpdate",
        ]
    }

    @objc(getPlaformVersion:withRejecter:)
    func getPlaformVersion(
      resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
        ) -> Void {
          resolve("iOS" + UIDevice.current.systemVersion)
        }

    @objc(getAxeptioToken:withRejecter:)
    func getAxeptioToken(
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        resolve(Axeptio.shared.axeptioToken)
    }

    
    @objc(initialize:withClientId:withCookiesVersion:withToken:withResolver:withRejecter:)
    func initialize(
        targetService: String,
        clientId: String,
        cookiesVersion: String,
        token: String,
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        let targetService = AxeptioServiceHelper.fromString(targetService)
        if token.isEmpty {
            Axeptio.shared.initialize(targetService: targetService,clientId: clientId, cookiesVersion: cookiesVersion)
        } else {
            Axeptio.shared.initialize(targetService: targetService,clientId: clientId, cookiesVersion: cookiesVersion, token: token)
        }
        resolve(nil)
    }

    @objc(setupUI:withRejecter:)
    func setupUI(
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        Axeptio.shared.setupUI()
        resolve(nil)
    }

    @objc(setUserDeniedTracking:withRejecter:)
    func setUserDeniedTracking(
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        Axeptio.shared.setUserDeniedTracking()
        resolve(nil)
    }

    @objc(showConsentScreen:withRejecter:)
    func showConsentScreen(
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        Axeptio.shared.showConsentScreen()
        resolve(nil)
    }

    @objc(clearConsent:withRejecter:)
    func clearConsent(
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        Axeptio.shared.clearConsent()
        resolve(nil)
    }

    @objc(appendAxeptioTokenURL:withToken:withResolver:withRejecter:)
    func appendAxeptioTokenURL(
        url: String,
        token: String,
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        guard let url = URL(string: url) else {
            resolve(nil)
            return
        }
        let result = Axeptio.shared.appendAxeptioTokenToURL(url, token: token)
        resolve(result.absoluteString)
    }

}

extension GoogleConsentV2 {
    func toJSObject() -> Dictionary<String, Any> {
        var js: [String: Any] = [:]
        js["analyticsStorage"] = self.analyticsStorage == GoogleConsentStatus.granted ? true : false
        js["adStorage"] = self.adStorage == GoogleConsentStatus.granted ? true : false
        js["adUserData"] = self.adUserData == GoogleConsentStatus.granted ? true : false
        js["adPersonalization"] = self.adPersonalization == GoogleConsentStatus.granted ? true : false
        return js
    }
}
