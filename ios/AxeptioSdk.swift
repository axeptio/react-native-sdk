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

        axeptioEventListener.onConsentCleared = { [weak self] in
            guard let self else { return }
            self.sendEvent(withName: "onConsentCleared", body: nil)
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
            "onConsentCleared",
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
            Axeptio.shared.initialize(targetService: targetService, clientId: clientId, cookiesVersion: cookiesVersion, widgetType: .production)
        } else {
            Axeptio.shared.initialize(targetService: targetService, clientId: clientId, cookiesVersion: cookiesVersion, token: token, widgetType: .production)
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

    @objc(setUserDeniedTracking:withResolver:withRejecter:)
    func setUserDeniedTracking(
        denied: Bool,
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        Axeptio.shared.setUserDeniedTracking(denied: denied)
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

    // MARK: - TCF Vendor Consent APIs (MSK-93)

    @objc(getVendorConsents:withRejecter:)
    func getVendorConsents(
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        do {
            let vendorConsents = try Axeptio.shared.getVendorConsents()
            resolve(vendorConsents)
        } catch {
            reject("GET_VENDOR_CONSENTS_ERROR", "Failed to get vendor consents", error)
        }
    }

    @objc(getConsentedVendors:withRejecter:)
    func getConsentedVendors(
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        do {
            let consentedVendors = try Axeptio.shared.getConsentedVendors()
            resolve(consentedVendors)
        } catch {
            reject("GET_CONSENTED_VENDORS_ERROR", "Failed to get consented vendors", error)
        }
    }

    @objc(getRefusedVendors:withRejecter:)
    func getRefusedVendors(
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        do {
            let refusedVendors = try Axeptio.shared.getRefusedVendors()
            resolve(refusedVendors)
        } catch {
            reject("GET_REFUSED_VENDORS_ERROR", "Failed to get refused vendors", error)
        }
    }

    @objc(isVendorConsented:withResolver:withRejecter:)
    func isVendorConsented(
        vendorId: String,
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        do {
            let isConsented = try Axeptio.shared.isVendorConsented(vendorId: vendorId)
            resolve(isConsented)
        } catch {
            reject("IS_VENDOR_CONSENTED_ERROR", "Failed to check vendor consent for \(vendorId)", error)
        }
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
