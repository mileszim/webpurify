import http from 'http';
import https from 'https';
import url from 'url';

import Configuration, { API_HOSTS } from './configuration';

/**
 * WebPurify NPM Module
 * A Node NPM module for interacting with the WebPurify API
*/
export default class WebPurify {
  /**
   * @param {Object} options - Pass configuration options here, or declare them in their respective ENV variables.
   * @param {Object} options.api_key - WebPurify API Key. ENV variable (takes precedence): WEBPURIFY_API_KEY
   * @param {Object} options.endpoint - Available: 'us', 'eu', 'ap'. Default: 'us'. ENV variable: WEBPURIFY_ENDPOINT
   * @param {Object} options.enterprise - Available: true, false. Default: false. ENV varable: WEBPURIFY_ENTERPRISE
   * @throws {Error} Throws an error if parameters are invalid.
   * @throws {Error} Throws an error if API key is missing.
   * @returns {WebPurify} A WebPurify instance.
   */
  constructor(options) {
    const configuration = new Configuration(options);
    this.config = configuration.config;
    this.request_base = { host: this.config.endpoint, path: configuration.path };
    this.query_base = { api_key: this.config.api_key, format: 'json' };
  }


  /**
   * Handles the HTTP/S requests
   * @param  {string}   host     The hostname for the request URL (ie. api1.webpurify.com)
   * @param  {string}   path     The path of the request (ie. /services/rest/)
   * @param  {string}   method   The method, either 'GET or 'PUT'
   * @param  {boolean}  ssl      True or false for using HTTPS or HTTP. If you are using enterprise API, you can set this to true.
   * @return {Promise}
   */
  request(host, path, method, ssl) {
    let options = {
      hostname: host,
      path: path,
      method: method
    };
    const baseType = ssl ? http : https;
    return new Promise((resolve, reject) => {
      const req = baseType.request(options, (res) => {
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
      req.on('error', (error) => reject(error));
      req.end();
    });
  }


  /**
   * Formats the request for the request function
   * @param  {Object}   params   The params object passed into the request
   * @param  {Object}   options  The optional parameters for the API request (can be left blank)
   * @return {Promise}
   */
  async get(params, options = {}, host = this.request_base.host) {
    // form query parameters
    let query = Object.assign(this.query_base, params, options);
    const path = url.format({ pathname: this.request_base.path, query });

    let rsp = null;
    let parsed;

    // make request
    try {
      parsed = await this.request(host, path, 'GET', this.config.enterprise);
      rsp = parsed ? parsed.rsp : null;
    } catch(error) {
      return error;
    }

    if (!rsp || !rsp.hasOwnProperty('@attributes')) {
      const error = new Error("Malformed Webpurify response");
      error.response = parsed;
      return Promise.reject(error);
    }

    if (rsp.hasOwnProperty('err')) {
      const errAttrs = rsp.err['@attributes'] || { msg: "Unknown Webpurify Error" };
      const error = new Error(errAttrs.msg);
      error.code = errAttrs.code;
      return Promise.reject(error);
    }

    return this.strip(rsp);
  }


  /**
   * Strips the WebPurify JSON response to be useful
   * @param  {Object} response The response JSON to be stripped
   * @return {Object} The stripped response
   */
  strip(response) {
    if (response) {
      delete response['@attributes'];
      delete response.api_key;
      delete response.method;
      delete response.format;
    }
    return response;
  }


  /**
   * Checks the passed text for any profanity. If found, returns true, else false.
   * @param  {string}   text     The text to check for profanity
   * @param  {Object}   options  The optional API parameters
   * @return {Promise}
   */
  async check(text, options) {
    const method = 'webpurify.live.check';
    const params = { method, text };

    try {
      const res = await this.get(params, options);
      return res.found === '1';
    } catch(error) {
      return error;
    }
  }


  /**
   * Checks the passed text for any profanity. If found, returns number of found words, else 0.
   * @param  {string}   text     The text to check for profanity
   * @param  {Object}   options  The optional API parameters
   * @return {Promise}
   */
  async checkCount(text, options) {
    let method = 'webpurify.live.checkcount';
    let params = { method, text };

    try {
      const res = await this.get(params, options);
      return parseInt(res.found, 10);
    } catch(error) {
      return error;
    }
  }


  /**
   * Checks the passed text for any profanity. If found, returns the text with profanity altered by symbol. Else 0.
   * @param  {string} text - The text to check for profanity
   * @param  {string} replacesymbol - The symbol to replace profanity with (ie. '*')
   * @param  {Object} options - The optional API parameters
   * @return {Promise}
   */
  async replace(text, replacesymbol, options) {
    let method = 'webpurify.live.replace';
    let params = { method, text, replacesymbol };

    try {
      const res = await this.get(params, options);
      return res.text;
    } catch(error) {
      return error;
    }
  }


  /**
   * Checks the passed text for any profanity. If found, returns an array of expletives.
   * @param {string} text - The text to check for profanity
   * @param {Object} options - The optional API parameters
   * @return {Promise}
   */
  async return(text, options) {
    let method = 'webpurify.live.return';
    let params = { method, text };

    try {
      const res = await this.get(params, options);
      return [].concat(res.expletive).filter(w => typeof w === 'string');
    } catch(error) {
      return error;
    }
  }


  /**
   * Add a word to the blacklist
   * @param  {string}   word        The word to add to the blacklist
   * @param  {string}   deep_search 1 if deepsearch, 0 or null if you don't care
   * @return {Promise}
   */
  async addToBlacklist(word, ds = null) {
    let method = 'webpurify.live.addtoblacklist';
    let params = { method, word, ds };

    try {
      const res = await this.get(params);
      return res.success === '1';
    } catch(error) {
      return error;
    }
  }


  /**
   * Remove a word from the blacklist
   * @param  {string}   word  The word to remove from the blacklist
   * @return {Promise}
   */
  async removeFromBlacklist(word) {
    let method = 'webpurify.live.removefromblacklist';
    let params = { method, word };

    try {
      const res = await this.get(params);
      return res.success === '1';
    } catch(error) {
      return error;
    }
  }


  /**
   * Get the blacklist
   * @return {Promise}
   */
  async getBlacklist() {
    let method = 'webpurify.live.getblacklist';
    let params = { method };

    try {
      const res = await this.get(params, options);
      return [].concat(res.word).filter(w => typeof w === 'string');
    } catch(error) {
      return error;
    }
  }


  /**
   * Add a word to the whitelist
   * @param  {string}   word        The word to add to the whitelist
   * @return {Promise}
   */
  async addToWhitelist(word) {
    let method = 'webpurify.live.addtowhitelist';
    let params = { method, word };

    try {
      const res = await this.get(params);
      return res.success === '1';
    } catch(error) {
      return error;
    }
  }


  /**
   * Remove a word from the whitelist
   * @param  {string}   word        The word to remove from the whitelist
   * @return {Promise}
   */
  async removeFromWhitelist(word) {
    let method = 'webpurify.live.removefromwhitelist';
    let params = { method, word };

    try {
      const res = await this.get(params);
      return res.success === '1';
    } catch(error) {
      return error;
    }
  }


  /**
   * Get the whitelist
   * @return {Promise}
   */
  async getWhitelist() {
    let method = 'webpurify.live.getwhitelist';
    let params = { method };

    try {
      const res = await this.get(params, options);
      return [].concat(res.word).filter(w => typeof w === 'string');
    } catch(error) {
      return error;
    }
  }

  /**
   * Checks the imgid for status of moderation.
   * @param {string} imgid - The URL of the image
   * @param {Object} options - The optional API parameters
   * @return {Promise}
   */
  async imgStatus(imgid, options = {}) {
    let method = 'webpurify.live.imgstatus';
    let params = { method, imgid };
    // ACCEPTED PARAMS
    // api_key (Required)
    //   Your API application key.
    // imgid (Required, if customimgid is not used)
    //   Image id
    // customimgid (Optional)
    //   Custom Image id
    // format (Optional)
    //   Response format: xml or json. Defaults to xml.
    try {
      const res = await this.get(params, options, API_HOSTS['im']);
      return res.status;
    } catch(error) {
      return error;
    }
  }

  /**
   * Checks the passed imageurl moderation. It will need a callback.
   * @param  {string}   imgurl     The URL of the image
   * @param  {Object}   options  The optional API parameters
   * @return {Promise}
   */
  async imgCheck(imgurl, options) {
    let method = 'webpurify.live.imgcheck';
    let params = { method, imgurl };
    // ACCEPTED PARAMS
    // imgurl (Required)
    //   Full url to the image you would like moderated.
    // format (Optional)
    //   Response format: xml or json. Defaults to xml.
    // customimgid (Optional)
    //   A custom ID you wish to associate with the image
    //   that will be carried through to the callback.
    // callback (Optional)
    //   You may also submit a URL encoded callback on
    //   a per image basis: read more
    try {
      const res = await this.get(params, options, API_HOSTS['im']);
      return res.imgid;
    } catch(error) {
      return error;
    }
  }

  /**
   * Checks the remaining submissions on licence for images.
   * @return {Promise}
   */
  async imgAccount() {
    let method = 'webpurify.live.imgaccount';
    let params = { method };
    try {
      const res = await this.get(params, options, API_HOSTS['im']);
      return res.remaining;
    } catch(error) {
      return error;
    }
  }

  /**
   * Checks the passed imageurl moderation. It will need a callback.
   * @param  {string}   imgurl     The URL of the image
   * @param  {Object}   options  The optional API parameters
   * @return {Promise}
   */
  async aimImgcheck(imgurl, options) {
    let method = 'webpurify.aim.imgcheck';
    let params = { method, imgurl };
    // ACCEPTED PARAMS
    // imgurl (Required)
    //   Full url to the image you would like moderated.
    // format (Optional)
    //   Response format: xml or json. Defaults to xml.
    try {
      const res = await this.get(params, options);
      return Number.parseFloat(res.nudity);
    } catch(error) {
      return error;
    }
  }

  /**
   * Check the number of AIM image submissions remaining on your license.
   * @return {Promise}
   */
  async aimImgAccount() {
    let method = 'webpurify.aim.imgaccount';
    let params = { method };
    try {
      const res = await this.get(params, options, API_HOSTS['im']);
      return res.remaining;
    } catch(error) {
      return error;
    }
  }

  /**
   * Combine our Automated Intelligent Moderation system (AIM) and our Live
   * moderators to create a powerful low cost solution.
   *
   * Images submitted to this method, are first sent to AIM and then sent to
   * our live moderation team based on thresholds you set.
   *
   * I.E any image that is given a 50% or greater probability by AIM can then be
   * sent to our human moderation team for further review.
   *
   * @param  {string}   imgurl     The URL of the image
   * @param  {Object}   options  The optional API parameters
   * @return {Promise}
   */
  async hybridImgcheck(imgurl, options) {
    let method = 'webpurify.hybrid.imgcheck';
    let params = { method, imgurl };
    // ACCEPTED PARAMS
    // imgurl (Required)
    //   Full url to the image you would like moderated.
    // format (Optional)
    //   Response format: xml or json. Defaults to xml.
    // thresholdlt (Optional)
    //   Set the lower threshold to pass the image to our live team
    //   thresholdlt=50 would send all images that AIM gives a nudity
    //   probability of less than 50 to our live team.
    // thresholdgt (Optional)
    //   Set the uypper threshold to pass the image to our live team
    //   thresholdgt=70 would send all images that AIM gives a nudity
    //   probability of greater than 70 to our live team.
    // customimgid (Optional)
    //   A custom ID you wish to associate with the image
    //   that will be carried through to the callback.
    // callback (Optional)
    //   You may also submit a URL encoded callback on
    //   a per image basis:
    //   https://www.webpurify.com/image-moderation/documentation/results/#callback
    try {
      const res = await this.get(params, options, API_HOSTS['im']);
      return Number.parseFloat(res.nudity);
    } catch(error) {
      return error;
    }
  }
}
