import chai, { expect, should } from 'chai';
import sinon from 'sinon';
import http from 'http';
import chaiap from 'chai-as-promised';
import nock from 'nock';
import { PassThrough } from 'stream';

import WebPurify from '../dist/webpurify';


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
    this.wpScope = nock(/api1\.webpurify\.com/).get(/\/services\/rest\//).query({ method: 'some.method', text: 'blah' }).reply(200, {
      "rsp": {
        "@attributes": {
          "stat": "ok"
        },
        "method": "some.method",
        "format": "rest",
        "found": "0",
        "api_key": "1234567890"
      }
    });
  });


  // WebPurify
  it('should construct a new instance', function() {
    expect(this.wp).to.be.instanceof(WebPurify);
  });

  it('should throw error when given bad parameters', function() {
    function throwError() { new WebPurify('fdsfs'); }
    expect(throwError).to.throw(Error, /Invalid parameters/);
  });

  it('should throw an error if not given an api key', function() {
    function throwError() { new WebPurify({}); }
    expect(throwError).to.throw(Error, /Invalid API Key/);
  });

  it('should configure options', function() {
    expect(this.wp.options).to.deep.equal({ api_key: 'sdfsdfsdf', endpoint: 'api1.webpurify.com', enterprise: false });
    expect(this.wp_ssl.options).to.deep.equal({ api_key: 'sdfsdfsdf', endpoint: 'api1.webpurify.com', enterprise: true });
  });

  it('should configure a request base', function() {
    expect(this.wp.request_base).to.deep.equal({ host: 'api1.webpurify.com', path: '/services/rest/' });
  });

  it('should configure a query base', function() {
    expect(this.wp.query_base).to.deep.equal({ api_key: 'sdfsdfsdf', format: 'json' });
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
      var req = this.wp.request(this.host, this.path, this.method, this.ssl);
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
      var params = { method: 'some.method', text: 'blah' };
      var req = await this.wp.get(params);
      expect(req).to.not.be.empty;
    });

    it('should return a promise', function() {
      var params = { method: 'some.method', text: 'blah' };
      var req = this.wp.get(params);
      expect(req.then).to.be.a('function');
      expect(req.catch).to.be.a('function');
    });

    it('should reject promise if malformed response', async function() {
      var params = { method: 'some.method', text: 'malformed' };
      var req = await this.wp.get(params);
      expect(req).to.be.rejectedWith(Error, /Malformed Webpurify response/);
    });

    it('should reject promise if unknown error in request', function() {
      nock.removeInterceptor(this.wpScope);
      this.wpScope = nock(/api1\.webpurify\.com/).get(/\/services\/rest\//).reply({ err: {
        '@attributes': {
          code: 100,
          msg: "Invalid API Key"
        }
      }});
      var params = { method: 'some.method', text: 'blah' };
      var req = this.wp.get(params);
      return expect(req).to.be.rejectedWith(Error, /Unknown Webpurify Error/);
    });

    it('should resolve promise if valid request & response', async function() {
      var params = { method: 'some.method', text: 'blah' };
      var req = await this.wp.get(params);
      expect(req).to.not.be.empty;
    });
  });


  describe('#strip', function() {
    it('should strip response of attributes, api_key, method, and format', function() {
      var response = {
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
      var req = this.wp.check('no profanity');
      expect(req).to.eventually.equal(false);
    });

    it('should return true if profanity', function() {
      var req = this.wp.check('some profanity');
      return expect(req).to.eventually.equal(true);
    });
  });


  describe('#checkCount', function() {
    it('should 0 if no profanity', function() {
      var req = this.wp.checkCount('no profanity');
      expect(req).to.eventually.equal(0);
    });

    it('should number of profane if profanity', function() {
      var req = this.wp.checkCount('some profanity');
      return expect(req).to.eventually.equal(2);
    });
  });


  describe('#replace', function() {
    it('should replace profanity with symbol', function() {
      var req = this.wp.replace('its profane', '*');
      expect(req).to.eventually.equal('its *******');
    });
  });


  describe('#return', function() {
    it('should return an array of profanity', function() {
      var req = this.wp.return('some profanity');
      expect(req).to.eventually.equal(['some', 'profanity']);
    });

    it('should return an empty array if no profanity', function() {
      var req = this.wp.return('no profanity');
      expect(req).to.eventually.equal([]);
    });
  });


  describe('#addToBlacklist', function() {
    it('should return true on success', function() {
      var req = this.wp.addToBlacklist('its profane');
      expect(req).to.eventually.equal(true);
    });
  });


  describe('#removeFromBlacklist', function() {
    it('should return true on success', function() {
      var req = this.wp.removeFromBlacklist('its profane');
      expect(req).to.eventually.equal(true);
    });
  });


  describe('#getBlacklist', function() {
    it('should return an array of profanity in list', function() {
      var req = this.wp.getBlacklist();
      expect(req).to.eventually.equal(['some', 'profanity']);
    });

    it('should return an empty array if no profanity', function() {
      var req = this.wp.getBlacklist();
      expect(req).to.eventually.equal([]);
    });
  });


  describe('#addToWhitelist', function() {
    it('should return true on success', function() {
      var req = this.wp.addToBlacklist('its profane');
      expect(req).to.eventually.equal(true);
    });
  });


  describe('#removeFromBlacklist', function() {
    it('should return true on success', function() {
      var req = this.wp.removeFromBlacklist('its profane');
      expect(req).to.eventually.equal(true);
    });
  });


  describe('#removeFromWhitelist', function() {
    it('should return an array of profanity in list', function() {
      var req = this.wp.getBlacklist();
      expect(req).to.eventually.equal(['some', 'profanity']);
    });

    it('should return an empty array if no profanity', function() {
      var req = this.wp.getBlacklist();
      expect(req).to.eventually.equal([]);
    });
  });



  describe('#imgcheck', function() {
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
      this.request = sinon.stub(this.wp, 'request').returns({
        then: function(cb) {
          cb({ rsp: { '@attributes': true, imgid: '123' } });
        }
      });
      var req = this.wp.imgcheck('imgURL');
      return expect(req).to.eventually.equal('123');
    });

  });

  describe('#imgstatus', function() {
    // api_key (Required)
    //   Your API application key.
    // imgid (Required, if customimgid is not used)
    //   Image id
    // customimgid (Optional)
    //   Custom Image id
    // format (Optional)
    //   Response format: xml or json. Defaults to xml.

    it('should return the status – pending|approved|declined', function() {
      this.request = sinon.stub(this.wp, 'request').returns({
        then: function(cb) {
          cb({ rsp: { '@attributes': true, status: 'approved' } });
        }
      });
      var req = this.wp.imgstatus('imgID');
      return expect(req).to.eventually.equal('approved');
    });

  });

  describe('#imgaccount', function() {
    // api_key (Required)
    //   Your API application key.
    // imgid (Required, if customimgid is not used)
    //   Image id
    // customimgid (Optional)
    //   Custom Image id
    // format (Optional)
    //   Response format: xml or json. Defaults to xml.

    it('should return the remaining image submissions on license', function() {
      this.request = sinon.stub(this.wp, 'request').returns({
        then: function(cb) {
          cb({ rsp: { '@attributes': true, remaining: '151' } });
        }
      });
      var req = this.wp.imgaccount();
      return expect(req).to.eventually.equal('151');
    });

  });

});
