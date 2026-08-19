import AxeptioSDK

@objc(AxeptioSdk)
class AxeptioSdk: RCTEventEmitter {

    private let axeptioEventListener = AxeptioEventListener()

    // Events are delivered to JS over the promise channel (pollEvents) instead
    // of RCTEventEmitter.sendEvent: the legacy RCTDeviceEventEmitter delivery
    // path never reaches the JS runtime on RN 0.86 (any architecture), while
    // promise resolution works reliably. Events are buffered here until JS
    // collects them with the long-poll below.
    private var pendingEvents: [[String: Any]] = []
    private var eventWaiter: RCTPromiseResolveBlock?
    private var sdkListenerRegistered = false

    override init() {
        super.init()

        axeptioEventListener.onPopupClosedEvent = { [weak self] in
            self?.queueEvent("onPopupClosedEvent", nil)
        }

        axeptioEventListener.onConsentCleared = { [weak self] in
            self?.queueEvent("onConsentCleared", nil)
        }

        axeptioEventListener.onGoogleConsentModeUpdate = { [weak self] consents in
            self?.queueEvent("onGoogleConsentModeUpdate", consents.toJSObject())
        }

        axeptioEventListener.onError = { [weak self] message in
            self?.queueEvent("onError", message)
        }
    }

    deinit {
        Axeptio.shared.removeEventListener(axeptioEventListener)
    }

    private func queueEvent(_ name: String, _ body: Any?) {
        DispatchQueue.main.async {
            var event: [String: Any] = ["name": name]
            if let body { event["body"] = body }
            if let waiter = self.eventWaiter {
                self.eventWaiter = nil
                waiter([event])
            } else {
                self.pendingEvents.append(event)
            }
        }
    }

    private func ensureSdkListenerRegistered() {
        DispatchQueue.main.async {
            if !self.sdkListenerRegistered {
                self.sdkListenerRegistered = true
                Axeptio.shared.setEventListener(self.axeptioEventListener)
            }
        }
    }

    /// Long-poll for native SDK events. Resolves with an array of
    /// {name, body?} objects as soon as at least one event is available; a
    /// superseded poll resolves with an empty array.
    @objc(pollEvents:withRejecter:)
    func pollEvents(
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        ensureSdkListenerRegistered()
        DispatchQueue.main.async {
            if !self.pendingEvents.isEmpty {
                let events = self.pendingEvents
                self.pendingEvents = []
                resolve(events)
            } else {
                self.eventWaiter?([])
                self.eventWaiter = resolve
            }
        }
    }

    override func startObserving() {
        ensureSdkListenerRegistered()
    }

    @objc open override func supportedEvents() -> [String] {
        return [
            "onPopupClosedEvent",
            "onConsentCleared",
            "onGoogleConsentModeUpdate",
            "onError",
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
        if !token.isEmpty {
            // SDK >= 2.2.0 takes the token via configure() instead of an initialize overload
            Axeptio.shared.configure(token: token)
        }
        Axeptio.shared.initialize(targetService: targetService, clientId: clientId, cookiesVersion: cookiesVersion, widgetType: .production)
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

    @objc(getConsentStatus:withRejecter:)
    func getConsentStatus(
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        let consentStatus = UserDefaults.standard.string(forKey: "axeptioConsentStatus")
        resolve(consentStatus)
    }

    // MARK: - TCF Vendor Consent APIs (MSK-93)

    @objc(getVendorConsents:withRejecter:)
    func getVendorConsents(
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        let vendorConsents = Axeptio.shared.getVendorConsents()
            .reduce(into: [String: Bool]()) { $0[String($1.key)] = $1.value }
        resolve(vendorConsents)
    }

    @objc(getConsentedVendors:withRejecter:)
    func getConsentedVendors(
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        resolve(Axeptio.shared.getConsentedVendors().map { String($0) })
    }

    @objc(getRefusedVendors:withRejecter:)
    func getRefusedVendors(
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        resolve(Axeptio.shared.getRefusedVendors().map { String($0) })
    }

    @objc(isVendorConsented:withResolver:withRejecter:)
    func isVendorConsented(
        vendorId: String,
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        guard let vendorIdInt = Int(vendorId.trimmingCharacters(in: .whitespacesAndNewlines)) else {
            reject("IS_VENDOR_CONSENTED_ERROR", "Invalid vendor id: \(vendorId)", nil)
            return
        }
        resolve(Axeptio.shared.isVendorConsented(vendorIdInt))
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
