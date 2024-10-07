// "use strict";

const { google, Common } = require("googleapis");
const SCOPES = [
  "https://www.googleapis.com/auth/businesscommunications",
  "https://www.googleapis.com/auth/cloud-platform",
];

const businessCallsURL = "https://businesscalls.googleapis.com/";

const { tts_is_proxy, tts_proxy } = require("../_helpers/settings");

let ttsProxy = null;

if (tts_is_proxy == "1") {
  ttsProxy = tts_proxy;
}

class GoogleApi {
  constructor(PathToServiceAccountKey) {
    this.SERVICEACCOUNTKEY = require(PathToServiceAccountKey);
  }

  /**
   * Initializes the Google credentials for calling the
   * Business Communcations API.
   */
  initCredentials() {
    // configure a JWT auth client
    const authClient = new google.auth.JWT(
      this.SERVICEACCOUNTKEY.client_email,
      null,
      this.SERVICEACCOUNTKEY.private_key,
      SCOPES
    );

    return new Promise(function (resolve, reject) {
      // authenticate request
      authClient.authorize(function (err, tokens) {
        if (err) {
          // console.log("authClient Error : ",err);

          reject("Failed to connect Error : " + err);
        } else {
          // console.log("authClient Success : ",authClient);
          resolve(authClient);
        }
      });
    });
  }
}

class BusinessCalls {
  constructor(options) {
    this.context = {
      _options: options || {},
      google,
    };
  }

  checkVcallDeviceReachable(paramsOrCallback, optionsOrCallback, callback) {
    let params = paramsOrCallback || {};
    let options = optionsOrCallback || {};
    if (typeof paramsOrCallback === "function") {
      callback = paramsOrCallback;
      params = {};
      options = {};
    }
    if (typeof optionsOrCallback === "function") {
      callback = optionsOrCallback;
      options = {};
    }
    const rootUrl = options.rootUrl || businessCallsURL;
    const parameters = {
      options: Object.assign(
        {
          url: rootUrl + "/v1:checkVcallDeviceReachable",
          method: "POST",
          Proxy: ttsProxy,
        },
        options
      ),
      params,
      requiredParams: [],
      pathParams: [],
      context: this.context,
    };
    if (callback) {
      Common.createAPIRequest(parameters, callback);
    } else {
      return Common.createAPIRequest(parameters);
    }
  }

  sendVcallState(paramsOrCallback, optionsOrCallback, callback) {
    let params = paramsOrCallback || {};
    let options = optionsOrCallback || {};
    if (typeof paramsOrCallback === "function") {
      callback = paramsOrCallback;
      params = {};
      options = {};
    }
    if (typeof optionsOrCallback === "function") {
      callback = optionsOrCallback;
      options = {};
    }
    const rootUrl = options.rootUrl || businessCallsURL;
    const parameters = {
      options: Object.assign(
        {
          url: rootUrl + "/v1:sendVcallState",
          method: "POST",
          Proxy: ttsProxy,
        },
        options
      ),
      params,
      requiredParams: [],
      pathParams: [],
      context: this.context,
    };
    if (callback) {
      Common.createAPIRequest(parameters, callback);
    } else {
      return Common.createAPIRequest(parameters);
    }
  }

  sendVcallVerification(paramsOrCallback, optionsOrCallback, callback) {
    let params = paramsOrCallback || {};
    let options = optionsOrCallback || {};
    if (typeof paramsOrCallback === "function") {
      callback = paramsOrCallback;
      params = {};
      options = {};
    }
    if (typeof optionsOrCallback === "function") {
      callback = optionsOrCallback;
      options = {};
    }
    const rootUrl = options.rootUrl || businessCallsURL;
    const parameters = {
      options: Object.assign(
        {
          url: rootUrl + "/v1:sendVcallVerification",
          method: "POST",
          Proxy: ttsProxy,
        },
        options
      ),
      params,
      requiredParams: [],
      pathParams: [],
      context: this.context,
    };
    if (callback) {
      Common.createAPIRequest(parameters, callback);
    } else {
      return Common.createAPIRequest(parameters);
    }
  }
}

module.exports = { GoogleApi: GoogleApi, BusinessCalls: BusinessCalls };
