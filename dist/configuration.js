'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var API_PATH = '/services/rest/';
var API_HOSTS = {
  us: 'api1.webpurify.com',
  eu: 'api1-eu.webpurify.com',
  ap: 'api1-ap.webpurify.com'
};

var ENV = {
  api_key: process.env.WEBPURIFY_API_KEY,
  endpoint: process.env.WEBPURIFY_ENDPOINT,
  enterprise: process.env.WEBPURIFY_ENTERPRISE
};

var DEFAULT_PARAMS = {
  endpoint: 'us',
  enterprise: false
};

var Configuration = function () {
  function Configuration() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Configuration);

    if (!(params instanceof Object)) {
      throw new Error('Invalid params - object required');
    }
    this.params = params;
  }

  _createClass(Configuration, [{
    key: 'config',
    get: function get() {
      if (!this._options) {
        this._config = {
          api_key: this.api_key,
          endpoint: this.endpoint,
          enterprise: this.enterprise
        };
      }
      return this._config;
    }
  }, {
    key: 'api_key',
    get: function get() {
      var key = ENV.WEBPURIFY_API_KEY || this.params.api_key;
      if (!key) {
        throw new Error('api_key is a required parameter');
      }
      if (typeof key !== 'string') {
        throw new Error('param.api_key must be of type string');
      }
      return key;
    }
  }, {
    key: 'endpoint',
    get: function get() {
      var hosts = Object.keys(API_HOSTS);
      var params_endpoint = hosts.includes(this.params.endpoint) || this.params.endpoint;
      var env_endpoint = hosts.includes(ENV.endpoint) || ENV.endpoint;
      return API_HOSTS[params_endpoint || env_endpoint || DEFAULT_PARAMS.endpoint];
    }
  }, {
    key: 'enterprise',
    get: function get() {
      var bools = ['true', 'false'];
      var params_enterprise = this.params.enterprise && bools.includes(this.params.enterprise.toString()) || this.params.enterprise;
      var env_enterprise = ENV.enterprise && bools.includes(ENV.enterprise.toString()) || ENV.enterprise;
      return params_enterprise || env_enterprise || DEFAULT_PARAMS.enterprise;
    }
  }, {
    key: 'path',
    get: function get() {
      return API_PATH;
    }
  }]);

  return Configuration;
}();

exports.default = Configuration;