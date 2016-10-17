import http  from 'http';
import https from 'https';
import url   from 'url';


/**
 * WebPurify NPM Module
 * A Node NPM module for interacting with the WebPurify API
 * @param {Object} options The options object, passed in on initialization. This defines
 *   several master paramaters handling the connection and interaction with the API.
 * @throws {Error} Throws an error if parameters are invalid.
 * @throws {Error} Throws an error if API key is missing.
 */
export default class WebPurify {
  constructor(options) {
    if (!(this instanceof WebPurify)) return new WebPurify(options);

    // Handle bad parameters
    if (!(options instanceof Object)) {
      throw new Error('Invalid parameters');
    }
    if (typeof options.api_key !== 'string') {
      throw new Error('Invalid API Key');
    }

    // API Information
    let endpoints = {
      us: 'api1.webpurify.com',
      eu: 'api1-eu.webpurify.com',
      ap: 'api1-ap.webpurify.com'
    };
    let rest_path = '/services/rest/';

    // Configured options
    this.options = {
      api_key:    options.api_key,
      endpoint:   options.endpoint   || 'us',
      enterprise: options.enterprise || false
    };

    this.request_base = {
      host: endpoints[this.options.endpoint],
      path: rest_path
    };

    this.query_base = {
      api_key: this.options.api_key,
      format:  'json'
    };
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
    let base_type = ssl ? http : https;
    return new Promise(function(resolve, reject) {
      let req = base_type.request(options, function(res) {
        let chunks = [];
        res.on('data', chunks.push.bind(chunks));
        res.on('end', function() {
          try {
            let parsed = JSON.parse(Buffer.concat(chunks));
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
  get(params, options) {
    // form query parameters
    let query = Object.assign(this.query_base, params);
    if (options !== null) query = Object.assign(query, options);
    let path = url.format({pathname: this.request_base.path, query: query});

    // make request
    return new Promise(function(resolve, reject) {
      this.request(this.request_base.host, path, 'GET', this.options.enterprise)
      .then(function(parsed) {
        let rsp = parsed ? parsed.rsp : null;
        if (!rsp || !rsp.hasOwnProperty('@attributes')) {
          let error = new Error("Malformed Webpurify response")
          error.response = parsed;
          return reject(error);
        }

        if (rsp.hasOwnProperty('err')) {
          let err_attrs = rsp.err['@attributes'] || { msg: "Unknown Webpurify Error" };
          let error = new Error(err_attrs.msg);
          error.code = err_attrs.code;
          return reject(error);
        }

        return resolve(WebPurify.prototype.strip(rsp));
      });
    }.bind(this));
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
  check(text, options) {
    let method = 'webpurify.live.check';
    let params = { method: method, text: text };

    return this.get(params, options).then(res => res.found === '1');
  }


  /**
   * Checks the passed text for any profanity. If found, returns number of found words, else 0.
   * @param  {string}   text     The text to check for profanity
   * @param  {Object}   options  The optional API parameters
   * @return {Promise}
   */
  checkCount(text, options) {
    let method = 'webpurify.live.checkcount';
    let params = { method: method, text: text};

    return this.get(params, options).then(res => parseInt(res.found, 10));
  }


  /**
   * Checks the passed text for any profanity. If found, returns the text with profanity altered by symbol. Else 0.
   * @param  {string}   text           The text to check for profanity
   * @param  {string}   replace_symbol The symbol to replace profanity with (ie. '*')
   * @param  {Object}   options        The optional API parameters
   * @return {Promise}
   */
  replace(text, replace_symbol, options) {
    let method = 'webpurify.live.replace';
    let params = { method: method, text: text, replacesymbol: replace_symbol };

    return this.get(params, options).then(res => res.text);
  }


  /**
   * Checks the passed text for any profanity. If found, returns an array of expletives.
   * @param  {string}   text           The text to check for profanity
   * @param  {Object}   options        The optional API parameters
   * @return {Promise}
   */
  return(text, options) {
    let method = 'webpurify.live.return';
    let params = { method: method, text: text };

    return this.get(params, options).then((res) => {
      return [].concat(res.expletive).filter(w => typeof w === 'string');
    });
  }


  /**
   * Add a word to the blacklist
   * @param  {string}   word        The word to add to the blacklist
   * @param  {string}   deep_search 1 if deepsearch, 0 or null if you don't care
   * @return {Promise}
   */
  addToBlacklist(word, deep_search) {
    let method = 'webpurify.live.addtoblacklist';
    let params = { method: method, word: word, ds: deep_search };

    return this.get(params).then(res => res.success === '1');
  }


  /**
   * Remove a word from the blacklist
   * @param  {string}   word  The word to remove from the blacklist
   * @return {Promise}
   */
  removeFromBlacklist(word) {
    let method = 'webpurify.live.removefromblacklist';
    let params = { method: method, word: word };

    return this.get(params).then(res => res.success === '1');
  }


  /**
   * Get the blacklist
   * @return {Promise}
   */
  getBlacklist() {
    let method = 'webpurify.live.getblacklist';
    let params = { method: method };

    return this.get(params).then((res) => {
      return [].concat(res.word).filter(w => typeof w === 'string');
    });
  }


  /**
   * Add a word to the whitelist
   * @param  {string}   word        The word to add to the whitelist
   * @return {Promise}
   */
  addToWhitelist(word) {
    let method = 'webpurify.live.addtowhitelist';
    let params = { method: method, word: word };

    return this.get(params).then(res => res.success === '1');
  }


  /**
   * Remove a word from the whitelist
   * @param  {string}   word        The word to remove from the whitelist
   * @return {Promise}
   */
  removeFromWhitelist(word) {
    let method = 'webpurify.live.removefromwhitelist';
    let params = { method: method, word: word };

    return this.get(params).then(res => res.success === '1');
  }


  /**
   * Get the whitelist
   * @return {Promise}
   */
  getWhitelist() {
    let method = 'webpurify.live.getwhitelist';
    let params = { method: method };

    return this.get(params).then((res) => {
      return [].concat(res.word).filter(w => w instanceof String);
    });
  }
}
