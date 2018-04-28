'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _configuration = require('./configuration');

var _configuration2 = _interopRequireDefault(_configuration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebPurify = function () {
  function WebPurify(options) {
    _classCallCheck(this, WebPurify);

    var configuration = new _configuration2.default(options);
    this.config = configuration.config;
    this.request_base = { host: this.config.endpoint, path: configuration.path };
    this.query_base = { api_key: this.config.api_key, format: 'json' };
  }

  _createClass(WebPurify, [{
    key: 'request',
    value: function request(host, path, method, ssl) {
      var options = {
        hostname: host,
        path: path,
        method: method
      };
      var baseType = ssl ? _http2.default : _https2.default;
      return new Promise(function (resolve, reject) {
        var req = baseType.request(options, function (res) {
          var buff = [];
          res.on('data', function (chunk) {
            return buff.push(chunk);
          });
          res.on('end', function () {
            try {
              var parsed = JSON.parse(buff.toString());
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
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(params) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var query, path, rsp, parsed, error, errAttrs, _error;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                query = Object.assign(this.query_base, params, options);
                path = _url2.default.format({ pathname: this.request_base.path, query });
                rsp = null;
                parsed = void 0;
                _context.prev = 4;
                _context.next = 7;
                return this.request(this.request_base.host, path, 'GET', this.config.enterprise);

              case 7:
                parsed = _context.sent;

                rsp = parsed ? parsed.rsp : null;
                _context.next = 14;
                break;

              case 11:
                _context.prev = 11;
                _context.t0 = _context['catch'](4);
                return _context.abrupt('return', _context.t0);

              case 14:
                if (!(!rsp || !rsp.hasOwnProperty('@attributes'))) {
                  _context.next = 18;
                  break;
                }

                error = new Error("Malformed Webpurify response");

                error.response = parsed;
                return _context.abrupt('return', Promise.reject(error));

              case 18:
                if (!rsp.hasOwnProperty('err')) {
                  _context.next = 23;
                  break;
                }

                errAttrs = rsp.err['@attributes'] || { msg: "Unknown Webpurify Error" };
                _error = new Error(errAttrs.msg);

                _error.code = errAttrs.code;
                return _context.abrupt('return', Promise.reject(_error));

              case 23:
                return _context.abrupt('return', this.strip(rsp));

              case 24:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[4, 11]]);
      }));

      function get(_x2) {
        return _ref.apply(this, arguments);
      }

      return get;
    }()
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
    value: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(text, options) {
        var method, params, res;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                method = 'webpurify.live.check';
                params = { method, text };
                _context2.prev = 2;
                _context2.next = 5;
                return this.get(params, options);

              case 5:
                res = _context2.sent;
                return _context2.abrupt('return', res.found === '1');

              case 9:
                _context2.prev = 9;
                _context2.t0 = _context2['catch'](2);
                return _context2.abrupt('return', _context2.t0);

              case 12:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[2, 9]]);
      }));

      function check(_x3, _x4) {
        return _ref2.apply(this, arguments);
      }

      return check;
    }()
  }, {
    key: 'checkCount',
    value: function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(text, options) {
        var method, params, res;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                method = 'webpurify.live.checkcount';
                params = { method: method, text: text };
                _context3.prev = 2;
                _context3.next = 5;
                return this.get(params, options);

              case 5:
                res = _context3.sent;
                return _context3.abrupt('return', parseInt(res.found, 10));

              case 9:
                _context3.prev = 9;
                _context3.t0 = _context3['catch'](2);
                return _context3.abrupt('return', _context3.t0);

              case 12:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[2, 9]]);
      }));

      function checkCount(_x5, _x6) {
        return _ref3.apply(this, arguments);
      }

      return checkCount;
    }()
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
          return typeof w === 'string';
        });
      });
    }
  }, {
    key: 'addToBlacklist',
    value: function addToBlacklist(word) {
      var ds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var method = 'webpurify.live.addtoblacklist';
      var params = { method, word, ds };

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
          return typeof w === 'string';
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
  }, {
    key: 'imgstatus',
    value: function imgstatus(imgid, options) {
      var method = 'webpurify.live.imgstatus';

      var params = { method: method, imgid: imgid };
      return this.get(params, options).then(function (res) {
        return res.status;
      });
    }
  }, {
    key: 'imgcheck',
    value: function imgcheck(imgurl, options) {
      var method = 'webpurify.live.imgcheck';

      var params = { method: method, imgurl: imgurl };
      return this.get(params, options).then(function (res) {
        return res.imgid;
      });
    }
  }, {
    key: 'imgaccount',
    value: function imgaccount() {
      var method = 'webpurify.live.imgaccount';
      var params = { method: method };
      return this.get(params, {}).then(function (res) {
        return res.remaining;
      });
    }
  }, {
    key: 'aimImgcheck',
    value: function aimImgcheck(imgurl, options) {
      var method = 'webpurify.aim.imgcheck';

      var params = { method: method, imgurl: imgurl };
      return this.get(params, options).then(function (res) {
        return Number.parseFloat(res.nudity);
      });
    }
  }, {
    key: 'aimImgaccount',
    value: function aimImgaccount() {
      var method = 'webpurify.aim.imgaccount';
      var params = { method: method };
      return this.get(params, {}).then(function (res) {
        return res.remaining;
      });
    }
  }, {
    key: 'hybridImgcheck',
    value: function hybridImgcheck(imgurl, options) {
      var method = 'webpurify.hybrid.imgcheck';

      var params = { method: method, imgurl: imgurl };
      return this.get(params, options).then(function (res) {
        return Number.parseFloat(res.nudity);
      });
    }
  }]);

  return WebPurify;
}();

exports.default = WebPurify;