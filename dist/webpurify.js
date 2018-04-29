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
        var host = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.request_base.host;

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
                return this.request(host, path, 'GET', this.config.enterprise);

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

      function get(_x3) {
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

      function check(_x4, _x5) {
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
                params = { method, text };
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

      function checkCount(_x6, _x7) {
        return _ref3.apply(this, arguments);
      }

      return checkCount;
    }()
  }, {
    key: 'replace',
    value: function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(text, replacesymbol, options) {
        var method, params, res;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                method = 'webpurify.live.replace';
                params = { method, text, replacesymbol };
                _context4.prev = 2;
                _context4.next = 5;
                return this.get(params, options);

              case 5:
                res = _context4.sent;
                return _context4.abrupt('return', res.text);

              case 9:
                _context4.prev = 9;
                _context4.t0 = _context4['catch'](2);
                return _context4.abrupt('return', _context4.t0);

              case 12:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[2, 9]]);
      }));

      function replace(_x8, _x9, _x10) {
        return _ref4.apply(this, arguments);
      }

      return replace;
    }()
  }, {
    key: 'return',
    value: function () {
      var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(text, options) {
        var method, params, res;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                method = 'webpurify.live.return';
                params = { method, text };
                _context5.prev = 2;
                _context5.next = 5;
                return this.get(params, options);

              case 5:
                res = _context5.sent;
                return _context5.abrupt('return', [].concat(res.expletive).filter(function (w) {
                  return typeof w === 'string';
                }));

              case 9:
                _context5.prev = 9;
                _context5.t0 = _context5['catch'](2);
                return _context5.abrupt('return', _context5.t0);

              case 12:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this, [[2, 9]]);
      }));

      function _return(_x11, _x12) {
        return _ref5.apply(this, arguments);
      }

      return _return;
    }()
  }, {
    key: 'addToBlacklist',
    value: function () {
      var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(word) {
        var ds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var method, params, res;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                method = 'webpurify.live.addtoblacklist';
                params = { method, word, ds };
                _context6.prev = 2;
                _context6.next = 5;
                return this.get(params);

              case 5:
                res = _context6.sent;
                return _context6.abrupt('return', res.success === '1');

              case 9:
                _context6.prev = 9;
                _context6.t0 = _context6['catch'](2);
                return _context6.abrupt('return', _context6.t0);

              case 12:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this, [[2, 9]]);
      }));

      function addToBlacklist(_x14) {
        return _ref6.apply(this, arguments);
      }

      return addToBlacklist;
    }()
  }, {
    key: 'removeFromBlacklist',
    value: function () {
      var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(word) {
        var method, params, res;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                method = 'webpurify.live.removefromblacklist';
                params = { method, word };
                _context7.prev = 2;
                _context7.next = 5;
                return this.get(params);

              case 5:
                res = _context7.sent;
                return _context7.abrupt('return', res.success === '1');

              case 9:
                _context7.prev = 9;
                _context7.t0 = _context7['catch'](2);
                return _context7.abrupt('return', _context7.t0);

              case 12:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this, [[2, 9]]);
      }));

      function removeFromBlacklist(_x15) {
        return _ref7.apply(this, arguments);
      }

      return removeFromBlacklist;
    }()
  }, {
    key: 'getBlacklist',
    value: function () {
      var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
        var method, params, res;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                method = 'webpurify.live.getblacklist';
                params = { method };
                _context8.prev = 2;
                _context8.next = 5;
                return this.get(params, options);

              case 5:
                res = _context8.sent;
                return _context8.abrupt('return', [].concat(res.word).filter(function (w) {
                  return typeof w === 'string';
                }));

              case 9:
                _context8.prev = 9;
                _context8.t0 = _context8['catch'](2);
                return _context8.abrupt('return', _context8.t0);

              case 12:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this, [[2, 9]]);
      }));

      function getBlacklist() {
        return _ref8.apply(this, arguments);
      }

      return getBlacklist;
    }()
  }, {
    key: 'addToWhitelist',
    value: function () {
      var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(word) {
        var method, params, res;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                method = 'webpurify.live.addtowhitelist';
                params = { method, word };
                _context9.prev = 2;
                _context9.next = 5;
                return this.get(params);

              case 5:
                res = _context9.sent;
                return _context9.abrupt('return', res.success === '1');

              case 9:
                _context9.prev = 9;
                _context9.t0 = _context9['catch'](2);
                return _context9.abrupt('return', _context9.t0);

              case 12:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this, [[2, 9]]);
      }));

      function addToWhitelist(_x16) {
        return _ref9.apply(this, arguments);
      }

      return addToWhitelist;
    }()
  }, {
    key: 'removeFromWhitelist',
    value: function () {
      var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(word) {
        var method, params, res;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                method = 'webpurify.live.removefromwhitelist';
                params = { method, word };
                _context10.prev = 2;
                _context10.next = 5;
                return this.get(params);

              case 5:
                res = _context10.sent;
                return _context10.abrupt('return', res.success === '1');

              case 9:
                _context10.prev = 9;
                _context10.t0 = _context10['catch'](2);
                return _context10.abrupt('return', _context10.t0);

              case 12:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this, [[2, 9]]);
      }));

      function removeFromWhitelist(_x17) {
        return _ref10.apply(this, arguments);
      }

      return removeFromWhitelist;
    }()
  }, {
    key: 'getWhitelist',
    value: function () {
      var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11() {
        var method, params, res;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                method = 'webpurify.live.getwhitelist';
                params = { method };
                _context11.prev = 2;
                _context11.next = 5;
                return this.get(params, options);

              case 5:
                res = _context11.sent;
                return _context11.abrupt('return', [].concat(res.word).filter(function (w) {
                  return typeof w === 'string';
                }));

              case 9:
                _context11.prev = 9;
                _context11.t0 = _context11['catch'](2);
                return _context11.abrupt('return', _context11.t0);

              case 12:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this, [[2, 9]]);
      }));

      function getWhitelist() {
        return _ref11.apply(this, arguments);
      }

      return getWhitelist;
    }()
  }, {
    key: 'imgStatus',
    value: function () {
      var _ref12 = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(imgid) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var method, params, res;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                method = 'webpurify.live.imgstatus';
                params = { method, imgid };
                _context12.prev = 2;
                _context12.next = 5;
                return this.get(params, options, _configuration.API_HOSTS['im']);

              case 5:
                res = _context12.sent;
                return _context12.abrupt('return', res.status);

              case 9:
                _context12.prev = 9;
                _context12.t0 = _context12['catch'](2);
                return _context12.abrupt('return', _context12.t0);

              case 12:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this, [[2, 9]]);
      }));

      function imgStatus(_x19) {
        return _ref12.apply(this, arguments);
      }

      return imgStatus;
    }()
  }, {
    key: 'imgCheck',
    value: function () {
      var _ref13 = _asyncToGenerator(regeneratorRuntime.mark(function _callee13(imgurl, options) {
        var method, params, res;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                method = 'webpurify.live.imgcheck';
                params = { method, imgurl };
                _context13.prev = 2;
                _context13.next = 5;
                return this.get(params, options, _configuration.API_HOSTS['im']);

              case 5:
                res = _context13.sent;
                return _context13.abrupt('return', res.imgid);

              case 9:
                _context13.prev = 9;
                _context13.t0 = _context13['catch'](2);
                return _context13.abrupt('return', _context13.t0);

              case 12:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this, [[2, 9]]);
      }));

      function imgCheck(_x20, _x21) {
        return _ref13.apply(this, arguments);
      }

      return imgCheck;
    }()
  }, {
    key: 'imgAccount',
    value: function () {
      var _ref14 = _asyncToGenerator(regeneratorRuntime.mark(function _callee14() {
        var method, params, res;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                method = 'webpurify.live.imgaccount';
                params = { method };
                _context14.prev = 2;
                _context14.next = 5;
                return this.get(params, options, _configuration.API_HOSTS['im']);

              case 5:
                res = _context14.sent;
                return _context14.abrupt('return', res.remaining);

              case 9:
                _context14.prev = 9;
                _context14.t0 = _context14['catch'](2);
                return _context14.abrupt('return', _context14.t0);

              case 12:
              case 'end':
                return _context14.stop();
            }
          }
        }, _callee14, this, [[2, 9]]);
      }));

      function imgAccount() {
        return _ref14.apply(this, arguments);
      }

      return imgAccount;
    }()
  }, {
    key: 'aimImgcheck',
    value: function () {
      var _ref15 = _asyncToGenerator(regeneratorRuntime.mark(function _callee15(imgurl, options) {
        var method, params, res;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                method = 'webpurify.aim.imgcheck';
                params = { method, imgurl };
                _context15.prev = 2;
                _context15.next = 5;
                return this.get(params, options);

              case 5:
                res = _context15.sent;
                return _context15.abrupt('return', Number.parseFloat(res.nudity));

              case 9:
                _context15.prev = 9;
                _context15.t0 = _context15['catch'](2);
                return _context15.abrupt('return', _context15.t0);

              case 12:
              case 'end':
                return _context15.stop();
            }
          }
        }, _callee15, this, [[2, 9]]);
      }));

      function aimImgcheck(_x22, _x23) {
        return _ref15.apply(this, arguments);
      }

      return aimImgcheck;
    }()
  }, {
    key: 'aimImgAccount',
    value: function () {
      var _ref16 = _asyncToGenerator(regeneratorRuntime.mark(function _callee16() {
        var method, params, res;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                method = 'webpurify.aim.imgaccount';
                params = { method };
                _context16.prev = 2;
                _context16.next = 5;
                return this.get(params, options, _configuration.API_HOSTS['im']);

              case 5:
                res = _context16.sent;
                return _context16.abrupt('return', res.remaining);

              case 9:
                _context16.prev = 9;
                _context16.t0 = _context16['catch'](2);
                return _context16.abrupt('return', _context16.t0);

              case 12:
              case 'end':
                return _context16.stop();
            }
          }
        }, _callee16, this, [[2, 9]]);
      }));

      function aimImgAccount() {
        return _ref16.apply(this, arguments);
      }

      return aimImgAccount;
    }()
  }, {
    key: 'hybridImgcheck',
    value: function () {
      var _ref17 = _asyncToGenerator(regeneratorRuntime.mark(function _callee17(imgurl, options) {
        var method, params, res;
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                method = 'webpurify.hybrid.imgcheck';
                params = { method, imgurl };
                _context17.prev = 2;
                _context17.next = 5;
                return this.get(params, options, _configuration.API_HOSTS['im']);

              case 5:
                res = _context17.sent;
                return _context17.abrupt('return', Number.parseFloat(res.nudity));

              case 9:
                _context17.prev = 9;
                _context17.t0 = _context17['catch'](2);
                return _context17.abrupt('return', _context17.t0);

              case 12:
              case 'end':
                return _context17.stop();
            }
          }
        }, _callee17, this, [[2, 9]]);
      }));

      function hybridImgcheck(_x24, _x25) {
        return _ref17.apply(this, arguments);
      }

      return hybridImgcheck;
    }()
  }]);

  return WebPurify;
}();

exports.default = WebPurify;