var request = require('request');
class SDKError extends Error {
  constructor(message, obj) {
    super(message);
    this.name = 'SDKError';
    this.error = obj.error;
    this.error_description = obj.error_description;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

function SteemConnect() {
  this.options = {
    baseURL: 'https://v2.steemconnect.com',
    app: '',
    callbackURL: '',
    scope: [],
  };
}

SteemConnect.prototype.setBaseURL = function setBaseURL(baseURL) {
  this.options.baseURL = baseURL;
};
SteemConnect.prototype.setApp = function setApp(app) {
  this.options.app = app;
};
SteemConnect.prototype.setCallbackURL = function setCallbackURL(callbackURL) {
  this.options.callbackURL = callbackURL;
};
SteemConnect.prototype.setAccessToken = function setAccessToken(accessToken) {
  this.options.accessToken = accessToken;
};
SteemConnect.prototype.removeAccessToken = function removeAccessToken() {
  this.options.accessToken = undefined;
};
SteemConnect.prototype.setScope = function setScope(scope) {
  this.options.scope = scope;
};

SteemConnect.prototype.getLoginURL = function getLoginURL(state) {
  let loginURL = `${this.options.baseURL}/oauth2/authorize?client_id=${
    this.options.app
  }&redirect_uri=${encodeURIComponent(this.options.callbackURL)}`;
  loginURL += this.options.scope ? `&scope=${this.options.scope.join(',')}` : '';
  loginURL += state ? `&state=${encodeURIComponent(state)}` : '';
  return loginURL;
};

SteemConnect.prototype.me = function me(cb) {
  return this.send('me', 'POST', {}, cb);
};

SteemConnect.prototype.send = function send(route, method, body, cb) {
    const url = `${this.options.baseURL}/api/${route}`;
    var clientServerOptions = {
        uri: url,
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': this.options.accessToken
        },
        body: JSON.stringify(body)
    }
    request(clientServerOptions, function (error, response) {
    //     console.log(error,response.body);
        cb(error, response); 
        return response.body;
    });
}

exports.Initialize = function Initialize(config) {
  const instance = new SteemConnect();

  if (!config) {
    throw new Error('You have to provide config');
  }

  if (typeof config !== 'object') {
    throw new Error('Config must be an object');
  }

  if (config.baseURL) instance.setBaseURL(config.baseURL);
  if (config.app) instance.setApp(config.app);
  if (config.callbackURL) instance.setCallbackURL(config.callbackURL);
  if (config.accessToken) instance.setAccessToken(config.accessToken);
  if (config.scope) instance.setScope(config.scope);

  return instance;
};
