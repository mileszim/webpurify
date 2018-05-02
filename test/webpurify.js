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
  //nock.recorder.rec();

  before(function() {
    this.wp = new WebPurify({ api_key: 'sdfsdfsdf' });
    this.wp_ssl = new WebPurify({ api_key: 'sdfsdfsdf', enterprise: true });

    nock.disableNetConnect();
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
      this.simpleScope = nock(/http[s]{0,1}:\/\/test\.com/).get('/test').reply(200, { my: 'request' });
      this.host = 'test.com';
      this.path = '/test';
      this.method = 'GET';
      this.ssl = false;
    });

    it('should issue a request', function() {
      const req = this.wp.request(this.host, this.path, this.method, this.ssl);
      return expect(req).to.eventually.be.fulfilled;
    });

    it('should return a promise', function() {
      const req = this.wp.request(this.host, this.path, this.method, this.ssl);
      expect(req instanceof Promise).to.equal(true);
    });

    it('should resolve promise if request valid', function() {
      const req = this.wp.request(this.host, this.path, this.method, this.ssl);
      return req.should.eventually.have.property('my');
    });

    it('should reject promise if request invalid', function() {
      this.simpleScope.get('/invalid').replyWithError('something is on fire yo');
      const req = this.wp.request(this.host, '/invalid', this.method, this.ssl);
      return req.should.be.rejected;
    });
  });

  describe('#get', function() {
    it('should issue a get request', function() {
      const params = { method: 'some.method', text: 'blah' };
      const req = this.wp.get(params);
      return req.should.eventually.be.fulfilled;
    });

    it('should return a promise', function() {
      const params = { method: 'some.method', text: 'blah' };
      const req = this.wp.get(params);
      expect(req instanceof Promise).to.equal(true);
    });

    it('should reject promise if malformed response', function() {
      const params = { method: 'error.malformed', text: 'blah' };
      const req = this.wp.get(params);
      return req.should.be.rejectedWith(Error, /Malformed Webpurify response/);
    });

    it('should reject promise if unknown error in request', function() {
      const params = { method: 'error.unknown', text: 'blah' };
      const req = this.wp.get(params);
      return req.should.be.rejectedWith(Error, /Unknown Webpurify Error/);
    });

    it('should resolve promise if valid request & response', function() {
      const params = { method: 'some.method', text: 'blah' };
      const req = this.wp.get(params);
      return req.should.be.fulfilled;
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
      return expect(req).to.eventually.equal(false);
    });

    it('should return true if profanity', function() {
      const nock = generateResponse('webpurify.live.check', { found: '1' });
      const req = this.wp.check('some profanity');
      return req.should.eventually.equal(true);
    });
  });


  describe('#checkCount', function() {
    it('should 0 if no profanity', function() {
      const newNock = generateResponse('webpurify.live.checkcount', { found: '0' });
      const req = this.wp.checkCount('no profanity');
      return expect(req).to.eventually.equal(0);
    });

    it('should number of profane if profanity', function() {
      const newNock = generateResponse('webpurify.live.checkcount', { found: '2' });
      const req = this.wp.checkCount('some profanity');
      return req.should.eventually.equal(2);
    });
  });


  describe('#replace', function() {
    it('should replace profanity with symbol', function() {
      const newNock = generateResponse('webpurify.live.replace', { text: 'its *******' });
      const req = this.wp.replace('its profane', '*');
      return expect(req).to.eventually.equal('its *******');
    });
  });


  describe('#return', function() {
    it('should return an array of profanity', function() {
      const newNock = generateResponse('webpurify.live.return', { expletive: ['some', 'profanity'] });
      const req = this.wp.return('some profanity');
      return expect(req).to.eventually.equal(['some', 'profanity']);
    });

    it('should return an empty array if no profanity', function() {
      const newNock = generateResponse('webpurify.live.return', { expletive: [] });
      const req = this.wp.return('no profanity');
      return expect(req).to.eventually.equal([]);
    });
  });


  describe('#addToBlacklist', function() {
    it('should return true on success', function() {
      const newNock = generateResponse('webpurify.live.addtoblacklist', { success: '1' });
      const req = this.wp.addToBlacklist('its profane');
      return expect(req).to.eventually.equal(true);
    });
  });


  describe('#removeFromBlacklist', function() {
    it('should return true on success', function() {
      const newNock = generateResponse('webpurify.live.removefromblacklist', { success: '1' });
      const req = this.wp.removeFromBlacklist('its profane');
      return expect(req).to.eventually.equal(true);
    });
  });


  describe('#getBlacklist', function() {
    it('should return an array of profanity in list', function() {
      const newNock = generateResponse('webpurify.live.getblacklist', { word: ['some', 'profanity'] });
      const req = this.wp.getBlacklist();
      return expect(req).to.eventually.equal(['some', 'profanity']);
    });

    it('should return an empty array if no profanity', function() {
      const newNock = generateResponse('webpurify.live.getblacklist', {});
      const req = this.wp.getBlacklist();
      return expect(req).to.eventually.equal([]);
    });
  });


  describe('#addToWhitelist', function() {
    it('should return true on success', function() {
      const newNock = generateResponse('webpurify.live.addtowhitelist', { success: '1' });
      const req = this.wp.addToWhitelist('its profane');
      return expect(req).to.eventually.equal(true);
    });
  });


  describe('#removeFromWhitelist', function() {
    it('should return true on success', function() {
      const newNock = generateResponse('webpurify.live.removefromwhitelist', { success: '1' });
      const req = this.wp.removeFromWhitelist('its profane');
      return expect(req).to.eventually.equal(true);
    });
  });


  describe('#getWhiteList', function() {
    it('should return an array of profanity in list', function() {
      const newNock = generateResponse('webpurify.live.getwhitelist', { word: ['some', 'cleanliness'] });
      const req = this.wp.getWhitelist();
      return expect(req).to.eventually.equal(['some', 'cleanliness']);
    });

    it('should return an empty array if no profanity', function() {
      const newNock = generateResponse('webpurify.live.getwhitelist', {});
      const req = this.wp.getWhitelist();
      return expect(req).to.eventually.equal([]);
    });
  });


  describe('#imgCheck', function() {
    it('should return imgid – the ID of the moderation process', function() {
      const newNock = generateResponse('webpurify.live.imgcheck', { imgid: '123' });
      const req = this.wp.imgCheck('imgURL');
      return expect(req).to.eventually.equal('123');
    });
  });


  describe('#imgStatus', function() {
    it('should return the status – pending|approved|declined', function() {
      const newNock = generateResponse('webpurify.live.imgstatus', { status: 'approved' });
      const req = this.wp.imgStatus('imgID');
      return expect(req).to.eventually.equal('approved');
    });
  });


  describe('#imgAccount', function() {
    it('should return the remaining image submissions on license', function() {
      const newNock = generateResponse('webpurify.life.imgaccount', { remaining: '151' });
      const req = this.wp.imgAccount();
      return expect(req).to.eventually.equal('151');
    });
  });
});
