import chai, { expect, should, assert } from 'chai';
import sinon from 'sinon';
import http from 'http';
import chaiap from 'chai-as-promised';
import nock from 'nock';

import WebPurify from '../dist';


const GENERIC_SCOPE = {
  "rsp": {
    "@attributes": {
      "stat": "ok"
    },
    "method": "some.method",
    "format": "rest",
    "found": "0",
    "api_key": "1234567890"
  }
};
const MALFORMED_SCOPE = {
  "rsp": {
    "bad": "response"
  }
};
const ERROR_SCOPE = {
  "rsp": {
    "@attributes": {
      "stat": "fail"
    },
    "err": {
      "unknown": "error",
      "code": "1234"
    }
  }
};


// Object.entries polyfill for node 6
if (!Object.entries) {
  Object.entries = function( obj ){
    var ownProps = Object.keys( obj ),
        i = ownProps.length,
        resArray = new Array(i); // preallocate the Array
    while (i--)
      resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
  };
}


function generateResponse(method = "some.method", mergeOptions = {}, code = 200) {
  let resScope = Object.assign({}, GENERIC_SCOPE);
  resScope["rsp"]["method"] = method;
  Object.entries(mergeOptions).forEach(e => resScope["rsp"][e[0]] = e[1]);

  return nock(/[\w\-]{1,8}\.webpurify\.com/)
    .get(/\/services\/rest\//)
    .query(function(queryObject) {
      return queryObject.method === method;
    })
    .reply(code, resScope);
}

describe('WebPurify', function() {
  // Setup
  chai.use(chaiap);
  should();
  nock.disableNetConnect();

  before(function() {
    this.wp = new WebPurify({ api_key: 'sdfsdfsdf' });
    this.wp_ssl = new WebPurify({ api_key: 'sdfsdfsdf', enterprise: true });
  });

  beforeEach(function() {
    this.malformedScope = nock(/api1\.webpurify\.com/)
      .get(/\/services\/rest\//)
      .query(function(queryObject) {
        return queryObject.method === 'error.malformed';
      })
      .reply(500, MALFORMED_SCOPE);
    this.errorScope = nock(/api1\.webpurify\.com/)
        .get(/\/services\/rest\//)
        .query(function(queryObject) {
          return queryObject.method === 'error.unknown';
        })
        .reply(500, ERROR_SCOPE);
    this.wpScope = nock(/api1\.webpurify\.com/)
      .get(/\/services\/rest\//)
      .query(true)
      .reply(200, GENERIC_SCOPE);
  });


  // WebPurify
  it('should construct a new instance', function() {
    const requiredPlugin = require('../dist');
    assert.equal(requiredPlugin, WebPurify);
    assert.notEqual(requiredPlugin.default, WebPurify);
    expect(this.wp).to.be.instanceof(WebPurify);
  });

  it('should throw error when given bad parameters', function() {
    function throwError() { new WebPurify('fdsfs'); }
    expect(throwError).to.throw(Error, /Invalid params - object required/);
  });

  it('should throw an error if not given an api key', function() {
    function throwError() { new WebPurify({}); }
    expect(throwError).to.throw(Error, /api_key is a required parameter/);
  });

  it('should configure options', function() {
    expect(this.wp._config).to.deep.equal({ api_key: 'sdfsdfsdf', endpoint: 'api1.webpurify.com', enterprise: false });
    expect(this.wp_ssl._config).to.deep.equal({ api_key: 'sdfsdfsdf', endpoint: 'api1.webpurify.com', enterprise: true });
  });

  it('should configure a request base', function() {
    expect(this.wp._request_base).to.deep.equal({ host: 'api1.webpurify.com', path: '/services/rest/' });
  });

  it('should configure a query base', function() {
    expect(this.wp._query_base).to.deep.equal({ api_key: 'sdfsdfsdf', format: 'json' });
  });

  it('should have all documented functions available', function() {
    const functions = [
      'check',
      'checkCount',
      'replace',
      'return',
      'addToBlacklist',
      'removeFromBlacklist',
      'getBlacklist',
      'addToWhitelist',
      'removeFromWhitelist',
      'getWhitelist',
      'imgCheck',
      'imgStatus',
      'imgAccount',
      'aimImgCheck',
      'aimImgAccount',
      'hybridImgCheck',
    ];
    const wpFunctions = Object.getOwnPropertyNames(this.wp);
    functions.forEach(f => expect(this.wp[f]).to.not.equal(undefined));
  });



  // Methods
  describe('#request', function() {
    beforeEach(function() {
      this.simpleScope = nock(/test\.com/).get('/test').reply(200, { my: 'request' });
      this.host = 'test.com';
      this.path = '/test';
      this.method = 'GET';
      this.ssl = false;
    });

    it('should issue a request', async function() {
      var req = await this.wp.request(this.host, this.path, this.method, this.ssl);
      expect(this.simpleScope.isDone()).to.be.true;
    });

    it('should return a promise', function() {
      const req = this.wp.request(this.host, this.path, this.method, this.ssl);
      expect(req.then).to.be.a('function');
      expect(req.catch).to.be.a('function');
    });

    it('should resolve promise if request valid', async function() {
      const req = await this.wp.request(this.host, this.path, this.method, this.ssl);
      expect(this.simpleScope.isDone()).to.be.true;
      expect(req).to.deep.equal({ my: 'request' });
    });

    it('should reject promise if request invalid', function() {
      this.simpleScope = nock(/test\.com/).get('/invalid').reply(500);
      const req = this.wp.request(this.host, '/invalid', this.method, this.ssl);
      expect(req).to.be.rejected;
    });
  });

  describe('#get', function() {
    it('should issue a get request', async function() {
      const params = { method: 'some.method', text: 'blah' };
      var req = await this.wp.get(params);
      expect(req).to.not.be.empty;
    });

    it('should return a promise', function() {
      const params = { method: 'some.method', text: 'blah' };
      const req = this.wp.get(params);
      expect(req.then).to.be.a('function');
      expect(req.catch).to.be.a('function');
    });

    it('should reject promise if malformed response', function() {
      const params = { method: 'error.malformed', text: 'blah' };
      const req = this.wp.get(params);
      expect(req).to.be.rejectedWith(Error, /Malformed Webpurify response/);
    });

    it('should reject promise if unknown error in request', function() {
      const params = { method: 'error.unknown', text: 'blah' };
      const req = this.wp.get(params);
      expect(req).to.be.rejectedWith(Error, /Unknown Webpurify Error/);
    });

    it('should resolve promise if valid request & response', async function() {
      const params = { method: 'some.method', text: 'blah' };
      const req = await this.wp.get(params);
      expect(req).to.not.be.empty;
    });
  });


  describe('#strip', function() {
    it('should strip response of attributes, api_key, method, and format', function() {
      const response = {
        "@attributes": true,
        api_key: true,
        method: true,
        format: true
      };
      return expect(this.wp.strip(response)).to.deep.equal({});
    });
  });


  describe('#check', function() {
    it('should return false if no profanity', function() {
      const req = this.wp.check('no profanity');
      expect(req).to.eventually.equal(false);
    });

    it('should return true if profanity', async function() {
      const newNock = generateResponse('webpurify.live.check', { found: '1' });
      const req = this.wp.check('some profanity');
      expect(req).to.eventually.equal(true);
    });
  });


  describe('#checkCount', function() {
    it('should 0 if no profanity', function() {
      const newNock = generateResponse('webpurify.live.checkcount', { found: '0' });
      const req = this.wp.checkCount('no profanity');
      expect(req).to.eventually.equal(0);
    });

    it('should number of profane if profanity', function() {
      const newNock = generateResponse('webpurify.live.checkcount', { found: '2' });
      const req = this.wp.checkCount('some profanity');
      expect(req).to.eventually.equal(2);
    });
  });


  describe('#replace', function() {
    it('should replace profanity with symbol', function() {
      const newNock = generateResponse('webpurify.live.replace', { text: 'its *******' });
      const req = this.wp.replace('its profane', '*');
      expect(req).to.eventually.equal('its *******');
    });
  });


  describe('#return', function() {
    it('should return an array of profanity', function() {
      const newNock = generateResponse('webpurify.live.return', { expletive: ['some', 'profanity'] });
      const req = this.wp.return('some profanity');
      expect(req).to.eventually.equal(['some', 'profanity']);
    });

    it('should return an empty array if no profanity', function() {
      const newNock = generateResponse('webpurify.live.return', { expletive: [] });
      const req = this.wp.return('no profanity');
      expect(req).to.eventually.equal([]);
    });
  });


  describe('#addToBlacklist', function() {
    it('should return true on success', function() {
      const newNock = generateResponse('webpurify.live.addtoblacklist', { success: '1' });
      const req = this.wp.addToBlacklist('its profane');
      expect(req).to.eventually.equal(true);
    });
  });


  describe('#removeFromBlacklist', function() {
    it('should return true on success', function() {
      const newNock = generateResponse('webpurify.live.removefromblacklist', { success: '1' });
      const req = this.wp.removeFromBlacklist('its profane');
      expect(req).to.eventually.equal(true);
    });
  });


  describe('#getBlacklist', function() {
    it('should return an array of profanity in list', function() {
      const newNock = generateResponse('webpurify.live.getblacklist', { word: ['some', 'profanity'] });
      const req = this.wp.getBlacklist();
      expect(req).to.eventually.equal(['some', 'profanity']);
    });

    it('should return an empty array if no profanity', function() {
      const newNock = generateResponse('webpurify.live.getblacklist', {});
      const req = this.wp.getBlacklist();
      expect(req).to.eventually.equal([]);
    });
  });


  describe('#addToWhitelist', function() {
    it('should return true on success', function() {
      const newNock = generateResponse('webpurify.live.addtowhitelist', { success: '1' });
      const req = this.wp.addToWhitelist('its profane');
      expect(req).to.eventually.equal(true);
    });
  });


  describe('#removeFromWhitelist', function() {
    it('should return true on success', function() {
      const newNock = generateResponse('webpurify.live.removefromwhitelist', { success: '1' });
      const req = this.wp.removeFromWhitelist('its profane');
      expect(req).to.eventually.equal(true);
    });
  });


  describe('#getWhiteList', function() {
    it('should return an array of profanity in list', function() {
      const newNock = generateResponse('webpurify.live.getwhitelist', { word: ['some', 'cleanliness'] });
      const req = this.wp.getWhitelist();
      expect(req).to.eventually.equal(['some', 'cleanliness']);
    });

    it('should return an empty array if no profanity', function() {
      const newNock = generateResponse('webpurify.live.getwhitelist', {});
      const req = this.wp.getWhitelist();
      expect(req).to.eventually.equal([]);
    });
  });



  describe('#imgCheck', function() {
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

    it('should return imgid – the ID of the moderation process', function() {
      const newNock = generateResponse('webpurify.live.imgcheck', { imgid: '123' });
      const req = this.wp.imgCheck('imgURL');
      expect(req).to.eventually.equal('123');
    });

  });

  describe('#imgStatus', function() {
    // api_key (Required)
    //   Your API application key.
    // imgid (Required, if customimgid is not used)
    //   Image id
    // customimgid (Optional)
    //   Custom Image id
    // format (Optional)
    //   Response format: xml or json. Defaults to xml.

    it('should return the status – pending|approved|declined', function() {
      const newNock = generateResponse('webpurify.live.imgstatus', { status: 'approved' });
      const req = this.wp.imgStatus('imgID');
      expect(req).to.eventually.equal('approved');
    });

  });

  describe('#imgAccount', function() {
    // api_key (Required)
    //   Your API application key.
    // imgid (Required, if customimgid is not used)
    //   Image id
    // customimgid (Optional)
    //   Custom Image id
    // format (Optional)
    //   Response format: xml or json. Defaults to xml.

    it('should return the remaining image submissions on license', function() {
      const newNock = generateResponse('webpurify.life.imgaccount', { remaining: '151' });
      const req = this.wp.imgAccount();
      expect(req).to.eventually.equal('151');
    });

  });

});
