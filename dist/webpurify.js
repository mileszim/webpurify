"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _http = _interopRequireDefault(require("http"));

var _https = _interopRequireDefault(require("https"));

var _url = _interopRequireDefault(require("url"));

var _configuration = _interopRequireWildcard(require("./configuration"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WebPurify {
  constructor(options) {
    const configuration = new _configuration.default(options);
    this._config = configuration.config;
    this._request_base = {
      host: this._config.endpoint,
      path: configuration.path
    };
    this._query_base = {
      api_key: this._config.api_key,
      format: 'json'
    };
  }

  request(host, path, method, ssl) {
    let options = {
      hostname: host,
      path: path,
      method: method
    };
    const baseType = ssl ? _http.default : _https.default;
    return new Promise((resolve, reject) => {
      const req = baseType.request(options, res => {
        const buff = [];
        res.on('data', chunk => buff.push(chunk));
        res.on('end', () => {
          try {
            let parsed = JSON.parse(buff.toString());
            return resolve(parsed);
          } catch (error) {
            return reject(error);
          }
        });
      });
      req.on('error', error => reject(error));
      req.end();
    });
  }

  async get(params, options = {}, host = this._request_base.host) {
    let query = Object.assign(this._query_base, params, options);

    const path = _url.default.format({
      pathname: this._request_base.path,
      query
    });

    let rsp = null;
    let parsed;

    try {
      parsed = await this.request(host, path, 'GET', this._config.enterprise);
      rsp = parsed ? parsed.rsp : null;
    } catch (error) {
      return error;
    }

    if (!rsp || !rsp.hasOwnProperty('@attributes')) {
      const error = new Error("Malformed Webpurify response");
      error.response = parsed;
      return Promise.reject(error);
    }

    if (rsp.hasOwnProperty('err')) {
      const errAttrs = rsp.err['@attributes'] || {
        msg: "Unknown Webpurify Error"
      };
      const error = new Error(errAttrs.msg);
      error.code = errAttrs.code;
      return Promise.reject(error);
    }

    return this.strip(rsp);
  }

  strip(response) {
    if (response) {
      delete response['@attributes'];
      delete response.api_key;
      delete response.method;
      delete response.format;
    }

    return response;
  }

  async check(text, options) {
    const method = 'webpurify.live.check';
    const params = {
      method,
      text
    };

    try {
      const res = await this.get(params, options);
      return res.found === '1';
    } catch (error) {
      return error;
    }
  }

  async checkCount(text, options) {
    let method = 'webpurify.live.checkcount';
    let params = {
      method,
      text
    };

    try {
      const res = await this.get(params, options);
      return parseInt(res.found, 10);
    } catch (error) {
      return error;
    }
  }

  async replace(text, replacesymbol, options) {
    let method = 'webpurify.live.replace';
    let params = {
      method,
      text,
      replacesymbol
    };

    try {
      const res = await this.get(params, options);
      return res.text;
    } catch (error) {
      return error;
    }
  }

  async return(text, options) {
    let method = 'webpurify.live.return';
    let params = {
      method,
      text
    };

    try {
      const res = await this.get(params, options);
      return [].concat(res.expletive).filter(w => typeof w === 'string');
    } catch (error) {
      return error;
    }
  }

  async addToBlacklist(word, ds = 0) {
    let method = 'webpurify.live.addtoblacklist';
    let params = {
      method,
      word,
      ds
    };

    try {
      const res = await this.get(params);
      return res.success === '1';
    } catch (error) {
      return error;
    }
  }

  async removeFromBlacklist(word) {
    let method = 'webpurify.live.removefromblacklist';
    let params = {
      method,
      word
    };

    try {
      const res = await this.get(params);
      return res.success === '1';
    } catch (error) {
      return error;
    }
  }

  async getBlacklist(ds = 0) {
    let method = 'webpurify.live.getblacklist';
    let params = {
      method
    };

    try {
      const res = await this.get(params, options);
      return [].concat(res.word).filter(w => typeof w === 'string');
    } catch (error) {
      return error;
    }
  }

  async addToWhitelist(word, ds = 0) {
    let method = 'webpurify.live.addtowhitelist';
    let params = {
      method,
      word
    };

    try {
      const res = await this.get(params);
      return res.success === '1';
    } catch (error) {
      return error;
    }
  }

  async removeFromWhitelist(word) {
    let method = 'webpurify.live.removefromwhitelist';
    let params = {
      method,
      word
    };

    try {
      const res = await this.get(params);
      return res.success === '1';
    } catch (error) {
      return error;
    }
  }

  async getWhitelist(ds = 0) {
    let method = 'webpurify.live.getwhitelist';
    let params = {
      method
    };

    try {
      const res = await this.get(params, options);
      return [].concat(res.word).filter(w => typeof w === 'string');
    } catch (error) {
      return error;
    }
  }

  async imgStatus(imgid, options = {}) {
    let method = 'webpurify.live.imgstatus';
    let params = {
      method,
      imgid
    };

    try {
      const res = await this.get(params, options, _configuration.API_HOSTS['im']);
      return res.status;
    } catch (error) {
      return error;
    }
  }

  async imgCheck(imgurl, options) {
    let method = 'webpurify.live.imgcheck';
    let params = {
      method,
      imgurl
    };

    try {
      const res = await this.get(params, options, _configuration.API_HOSTS['im']);
      return res.imgid;
    } catch (error) {
      return error;
    }
  }

  async imgAccount() {
    let method = 'webpurify.live.imgaccount';
    let params = {
      method
    };

    try {
      const res = await this.get(params, null, _configuration.API_HOSTS['im']);
      return res.remaining;
    } catch (error) {
      return error;
    }
  }

  async aimImgCheck(imgurl) {
    let method = 'webpurify.aim.imgcheck';
    let params = {
      method,
      imgurl
    };

    try {
      const res = await this.get(params, null, _configuration.API_HOSTS['im']);
      return Number.parseFloat(res.nudity);
    } catch (error) {
      return error;
    }
  }

  async aimImgAccount() {
    let method = 'webpurify.aim.imgaccount';
    let params = {
      method
    };

    try {
      const res = await this.get(params, null, _configuration.API_HOSTS['im']);
      return res.remaining;
    } catch (error) {
      return error;
    }
  }

  async hybridImgCheck(imgurl, options) {
    let method = 'webpurify.hybrid.imgcheck';
    let params = {
      method,
      imgurl
    };

    try {
      const res = await this.get(params, options, _configuration.API_HOSTS['im']);
      return Number.parseFloat(res.nudity);
    } catch (error) {
      return error;
    }
  }

}

exports.default = WebPurify;