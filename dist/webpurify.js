'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var WebPurify = (function () {
  function WebPurify(options) {
    _classCallCheck(this, WebPurify);

    if (!(this instanceof WebPurify)) return new WebPurify(options);

    if (!(options instanceof Object)) {
      throw new Error('Invalid parameters');
    }
    if (typeof options.api_key !== 'string') {
      throw new Error('Invalid API Key');
    }

    var endpoints = {
      us: 'api1.webpurify.com',
      eu: 'api1-eu.webpurify.com',
      ap: 'api1-ap.webpurify.com'
    };
    var rest_path = '/services/rest/';

    this.options = {
      api_key: options.api_key,
      endpoint: options.endpoint || 'us',
      enterprise: options.enterprise || false
    };

    this.request_base = {
      host: endpoints[this.options.endpoint],
      path: rest_path
    };

    this.query_base = {
      api_key: this.options.api_key,
      format: 'json'
    };
  }

  _createClass(WebPurify, [{
    key: 'request',
    value: function request(host, path, method, ssl) {
      var options = {
        hostname: host,
        path: path,
        method: method
      };
      var base_type = ssl ? _http2['default'] : _https2['default'];
      return new _Promise(function (resolve, reject) {
        var req = base_type.request(options, function (res) {
          var chunks = [];
          res.on('data', chunks.push.bind(chunks));
          res.on('end', function () {
            try {
              var parsed = JSON.parse(Buffer.concat(chunks));
              return resolve(parsed);
            } catch (error) {
              return reject(error);
            }
          });
        });
        req.on('error', function (error) {
          return reject(error);
        });
        req.end();
      });
    }
  }, {
    key: 'get',
    value: function get(params, options) {
      var query = _Object$assign(this.query_base, params);
      if (options !== null) query = _Object$assign(query, options);
      var path = _url2['default'].format({ pathname: this.request_base.path, query: query });

      return new _Promise((function (resolve, reject) {
        this.request(this.request_base.host, path, 'GET', this.options.enterprise).then(function (parsed) {
          var rsp = parsed ? parsed.rsp : null;
          if (!rsp || !rsp.hasOwnProperty('@attributes')) {
            var error = new Error("Malformed Webpurify response");
            error.response = parsed;
            return reject(error);
          }

          if (rsp.hasOwnProperty('err')) {
            var err_attrs = rsp.err['@attributes'] || { msg: "Unknown Webpurify Error" };
            var error = new Error(err_attrs.msg);
            error.code = err_attrs.code;
            return reject(error);
          }

          return resolve(WebPurify.prototype.strip(rsp));
        });
      }).bind(this));
    }
  }, {
    key: 'strip',
    value: function strip(response) {
      if (response) {
        delete response['@attributes'];
        delete response.api_key;
        delete response.method;
        delete response.format;
      }
      return response;
    }
  }, {
    key: 'check',
    value: function check(text, options) {
      var method = 'webpurify.live.check';
      var params = { method: method, text: text };

      return this.get(params, options).then(function (res) {
        return res.found === '1';
      });
    }
  }, {
    key: 'checkCount',
    value: function checkCount(text, options) {
      var method = 'webpurify.live.checkcount';
      var params = { method: method, text: text };

      return this.get(params, options).then(function (res) {
        return parseInt(res.found, 10);
      });
    }
  }, {
    key: 'replace',
    value: function replace(text, replace_symbol, options) {
      var method = 'webpurify.live.replace';
      var params = { method: method, text: text, replacesymbol: replace_symbol };

      return this.get(params, options).then(function (res) {
        return res.text;
      });
    }
  }, {
    key: 'return',
    value: function _return(text, options) {
      var method = 'webpurify.live.return';
      var params = { method: method, text: text };

      return this.get(params, options).then(function (res) {
        return [].concat(res.expletive).filter(function (w) {
          return w instanceof String;
        });
      });
    }
  }, {
    key: 'addToBlacklist',
    value: function addToBlacklist(word, deep_search) {
      var method = 'webpurify.live.addtoblacklist';
      var params = { method: method, word: word, ds: deep_search };

      return this.get(params).then(function (res) {
        return res.success === '1';
      });
    }
  }, {
    key: 'removeFromBlacklist',
    value: function removeFromBlacklist(word) {
      var method = 'webpurify.live.removefromblacklist';
      var params = { method: method, word: word };

      return this.get(params).then(function (res) {
        return res.success === '1';
      });
    }
  }, {
    key: 'getBlacklist',
    value: function getBlacklist() {
      var method = 'webpurify.live.getblacklist';
      var params = { method: method };

      return this.get(params).then(function (res) {
        return [].concat(res.word).filter(function (w) {
          return w instanceof String;
        });
      });
    }
  }, {
    key: 'addToWhitelist',
    value: function addToWhitelist(word) {
      var method = 'webpurify.live.addtowhitelist';
      var params = { method: method, word: word };

      return this.get(params).then(function (res) {
        return res.success === '1';
      });
    }
  }, {
    key: 'removeFromWhitelist',
    value: function removeFromWhitelist(word) {
      var method = 'webpurify.live.removefromwhitelist';
      var params = { method: method, word: word };

      return this.get(params).then(function (res) {
        return res.success === '1';
      });
    }
  }, {
    key: 'getWhitelist',
    value: function getWhitelist() {
      var method = 'webpurify.live.getwhitelist';
      var params = { method: method };

      return this.get(params).then(function (res) {
        return [].concat(res.word).filter(function (w) {
          return w instanceof String;
        });
      });
    }
  }]);

  return WebPurify;
})();

exports['default'] = WebPurify;
module.exports = exports['default'];
