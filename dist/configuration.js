"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.API_HOSTS = void 0;
const API_PATH = '/services/rest/';
const API_HOSTS = {
  us: 'api1.webpurify.com',
  eu: 'api1-eu.webpurify.com',
  ap: 'api1-ap.webpurify.com',
  im: 'im-api1.webpurify.com',
  vid: 'vid-api1.webpurify.com'
};
exports.API_HOSTS = API_HOSTS;
const ENV = {
  api_key: process.env.WEBPURIFY_API_KEY,
  endpoint: process.env.WEBPURIFY_ENDPOINT,
  enterprise: process.env.WEBPURIFY_ENTERPRISE
};
const DEFAULT_PARAMS = {
  endpoint: 'us',
  enterprise: false
};

class Configuration {
  constructor(params = {}) {
    if (!(params instanceof Object)) {
      throw new Error('Invalid params - object required');
    }

    this.params = params;
  }

  get config() {
    if (!this._options) {
      this._config = {
        api_key: this.api_key,
        endpoint: this.endpoint,
        enterprise: this.enterprise
      };
    }

    return this._config;
  }

  get api_key() {
    const key = ENV.WEBPURIFY_API_KEY || this.params.api_key;

    if (!key) {
      throw new Error('api_key is a required parameter');
    }

    if (typeof key !== 'string') {
      throw new Error('param.api_key must be of type string');
    }

    return key;
  }

  get endpoint() {
    const hosts = Object.keys(API_HOSTS);
    const params_endpoint = hosts.includes(this.params.endpoint) || this.params.endpoint;
    const env_endpoint = hosts.includes(ENV.endpoint) || ENV.endpoint;
    return API_HOSTS[params_endpoint || env_endpoint || DEFAULT_PARAMS.endpoint];
  }

  get enterprise() {
    const bools = ['true', 'false'];
    const params_enterprise = this.params.enterprise && bools.includes(this.params.enterprise.toString()) || this.params.enterprise;
    const env_enterprise = ENV.enterprise && bools.includes(ENV.enterprise.toString()) || ENV.enterprise;
    return params_enterprise || env_enterprise || DEFAULT_PARAMS.enterprise;
  }

  get path() {
    return API_PATH;
  }

}

exports.default = Configuration;