import AxeptioSDK

@objc(AxeptioSdk)
class AxeptioSdk: NSObject {

    @objc(getPlaformVersion:withRejecter:)
    func getPlaformVersion(
      resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
        ) -> Void {
          resolve("iOS")
        }

    @objc(getAxeptioToken:withRejecter:)
    func axeptioToken(
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        resolve(Axeptio.shared.axeptioToken)
    }

    @objc(initialize:withCookiesVersion:withToken:withResolver:withRejecter:)
    func initialize(
        clientId: String,
        cookiesVersion: String,
        token: String,
        resolve: RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        if token.isEmpty {
            Axeptio.shared.initialize(clientId: clientId, cookiesVersion: cookiesVersion)
        } else {
            Axeptio.shared.initialize(clientId: clientId, cookiesVersion: cookiesVersion, token: token)
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
