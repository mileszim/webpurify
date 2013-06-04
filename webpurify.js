var util = require('util');
var querystring = require('querystring');
var http = require('http');
var https = require('https');


/**
 * WebPurify NPM Module
 * A Node NPM module for interacting with the WebPurify API
 * @param {Object} options The options object, passed in on initialization. This defines 
 *   several master paramaters handling the connection and interaction with the API.
 * @throws {Error} Throws an error if parameters are invalid.
 * @throws {Error} Throws an error if API key is missing.
 * @constructor
 */
function WebPurify(options) {
    if (!(this instanceof WebPurify)) return new WebPurify(options);
    
    // Handle bad parameters
    if (!(options instanceof Object)) {
        throw new Error('Invalid parameters');
    }
    if (!(typeof options.api_key === 'string')) {
        throw new Error('Missing API Key');
    }
    
    // API Information
    var endpoints = {
        us: 'api1.webpurify.com',
        eu: 'api1-eu.webpurify.com',
        ap: 'api1-ap.webpurify.com'
    };
    var rest_path = '/services/rest/';
    
    // Configured options
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
        api_key:    this.options.api_key,
        format:     'json',
    };
    
}



/**
 * Handles the HTTP/S requests
 * @param {string}   host     The hostname for the request URL (ie. api1.webpurify.com)
 * @param {string}   path     The path of the request (ie. /services/rest/)
 * @param {string}   method   The method, either 'GET or 'PUT'
 * @param {boolean}  ssl      True or false for using HTTPS or HTTP. If you are using enterprise API, you can set this to true.
 * @param {Function} callback The callback function
 */
WebPurify.prototype.request = function(host, path, method, ssl, callback) {
    var options = {
        hostname: host,
        port: 80,
        path: path,
        method: method
    };
    var base_type = http;
    if (ssl) {
        base_type = https;
    }
    var req = base_type.request(options, function(res) {
        //res.setEncoding('utf8');
        res.on('data', function(data) {
            callback(null, JSON.parse(data));
        })
    });
    req.on('error', function(error) {
        callback(error.message, null);
    });
    req.end();
}



/**
 * Formats the request for the request function
 * @param  {Object}   params   The params object passed into the request
 * @param  {Object}   options  The optional parameters for the API request (can be left blank)
 * @param  {Function} callback The callback function
 * @throws {Error} Returns invalid callback error if callback is not a function.
 */
WebPurify.prototype.get = function(params, options, callback) {
    // Adjust or throw errors
    if (options instanceof Function) {
        callback = options;
        options = null;
    }
    if (!(callback instanceof Function)) {
        throw new Error('Invalid Callback');
        return this;
    }

    // make query and request
    var query = this.request_base.path + '?' + querystring.stringify(this.query_base) + '&' + querystring.stringify(params);
    this.request(this.request_base.host, query, 'GET', this.options.enterprise, function(error, response) {
        if (!error && response) {
            var rsp = response.rsp;
            var status = rsp['@attributes'].stat;
            // errors (to handle later)
            if (status==='fail' && rsp.err instanceof Object) {
                callback(rsp.err['@attributes'], null);
            
            // accepted
            } else if (status==='ok') {
                callback(null, WebPurify.prototype.strip(rsp));
            }
            
        }
    });
    
    return this;
}



/**
 * Strips the WepPrufiy JSON response to be useful
 * @param  {Object} response The response JSON to be stripped
 * @return {Object} The stripped response
 */
WebPurify.prototype.strip = function(response) {
    if (response) {
        delete response['@attributes'];
        delete response.api_key;
        delete response.method;
        delete response.format;
    }
    return response;
}



/**
 * WebPurify API: Check
 * Checks the passed text for any profanity. If found, returns 1, else 0.
 * @param  {string}   text     The text to check for profanity
 * @param  {Object}   options  The optional API parameters
 * @param  {Function} callback The callback function
 * @throws {Error}    Throws an error if callback is not a function.
 */
WebPurify.prototype.check = function(text, options, callback) {
    // Adjust or throw errors
    if (options instanceof Function) {
        callback = options;
        options = null;
    }
    if (!(callback instanceof Function)) {
        throw new Error('Invalid Callback');
        return this;
    }
    
    var method = 'webpurify.live.check';
    
    this.get({method:method,text:text}, options, function(err,res) {
        if (err) callback(err,null);
        callback(null, res.found);
    });
}



/**
 * WebPurify API: CheckCount
 * Checks the passed text for any profanity. If found, returns number of found words, else 0.
 * @param  {string}   text     The text to check for profanity
 * @param  {Object}   options  The optional API parameters
 * @param  {Function} callback The callback function
 * @throws {Error}    Throws an error if callback is not a function.
 */
WebPurify.prototype.checkCount = function(text, options, callback) {
    // Adjust or throw errors
    if (options instanceof Function) {
        callback = options;
        options = null;
    }
    if (!(callback instanceof Function)) {
        throw new Error('Invalid Callback');
        return this;
    }
    
    var method = 'webpurify.live.checkcount';
    
    this.get({method:method,text:text}, options, function(err,res) {
        if (err) callback(err,null);
        callback(null, res.found);
    });
}



/**
 * WebPurify API: Replace
 * Checks the passed text for any profanity. If found, returns the text with profanity altered by symbol. Else 0.
 * @param  {string}   text           The text to check for profanity
 * @param  {string}   replace_symbol The symbol to replace profanity with (ie. '*')
 * @param  {Object}   options        The optional API parameters
 * @param  {Function} callback       The callback function
 * @throws {Error}    Throws an error if callback is not a function.
 */
WebPurify.prototype.replace = function(text, replace_symbol, options, callback) {
    // Adjust or throw errors
    if (options instanceof Function) {
        callback = options;
        options = null;
    }
    if (!(callback instanceof Function)) {
        throw new Error('Invalid Callback');
        return this;
    }
    
    var method = 'webpurify.live.replace';
    
    this.get({method:method,text:text,replacesymbol:replace_symbol}, options, function(err,res) {
        if (err) callback(err,null);
        callback(null, res.text);
    });
}



/**
 * WebPurify API: Return
 * Checks the passed text for any profanity. If found, returns an array of expletives.
 * @param  {string}   text           The text to check for profanity
 * @param  {Object}   options        The optional API parameters
 * @param  {Function} callback       The callback function
 * @throws {Error}    Throws an error if callback is not a function.
 */
WebPurify.prototype.return = function(text, options, callback) {
    // Adjust or throw errors
    if (options instanceof Function) {
        callback = options;
        options = null;
    }
    if (!(callback instanceof Function)) {
        throw new Error('Invalid Callback');
        return this;
    }
    
    var method = 'webpurify.live.return';
    
    this.get({method:method,text:text}, options, function(err,res) {
        if (err) callback(err,null);
        if (!res.expletive) {
            callback(null, []);
        } else if (res.expletive && typeof res.expletive==='string') {
            callback(null, [res.expletive]);
        } else {
            callback(null, res.expletive);
        }
    });
}



/**
 * WebPurify API: addToBlacklist
 * Add a word to the blacklist
 * @param  {string}   word        The word to add to the blacklist
 * @param  {string}   deep_search 1 if deepsearch, 0 or null if you don't care
 * @param  {Function} callback    The callback function (optional)
 */
WebPurify.prototype.addToBlacklist = function(word, deep_search, callback) {
    // Adjust or throw errors
    if (deep_search instanceof Function) {
        callback = deep_search;
        deep_search = null;
    }
    
    var method = 'webpurify.live.addtoblacklist';
    
    this.get({method:method,word:word,ds:deep_search}, function(err,res) {
        if (callback) {
            if (err) callback(err,null);
            callback(null, res.success);
        }
    });
}



/**
 * WebPurify API: removeFromBlacklist
 * Remove a word to the blacklist
 * @param  {string}   word        The word to remove to the blacklist
 * @param  {Function} callback    The callback function
 */
WebPurify.prototype.removeFromBlacklist = function(word, callback) {    
    var method = 'webpurify.live.removefromblacklist';
    
    this.get({method:method,word:word}, function(err,res) {
        if (callback) {
            if (err) callback(err,null);
            callback(null, res.success);
        }
    });
}



/**
 * WebPurify API: getBlacklist
 * Get the blacklist
 * @param  {Function} callback    The callback function
 * @throws {Error} Throws an error if callback does not exist or invalid.
 */
WebPurify.prototype.getBlacklist = function(callback) {  
    if (!(callback instanceof Function)) {
        throw new Error('Invalid Callback');
        return this;
    }
      
    var method = 'webpurify.live.getblacklist';
    
    this.get({method:method}, function(err,res) {
        if (err) callback(err,null);
        if (!res.word) {
            callback(null, []);
        } else if (res.word && typeof res.word==='string') {
            callback(null, [res.word]);
        } else {
            callback(null, res.word);
        }
    });
}





/**
 * EXPORT
 */
module.exports = WebPurify;