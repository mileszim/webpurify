var chai        = require("chai");
var expect      = require('chai').expect;
var should      = require('chai').should();
var sinon       = require('sinon');
var http        = require('http');
var chaiap      = require("chai-as-promised");
var PassThrough = require('stream').PassThrough;

var WebPurify   = require('../dist/webpurify');


describe('WebPurify', function() {
  // Setup
  var wp;
  var request;
  chai.use(chaiap);

  beforeEach(function() {
    wp      = new WebPurify({ api_key: 'sdfsdfsdf' });
    wp_ssl  = new WebPurify({ api_key: 'sdfsdfsdf', enterprise: true });
    request = sinon.stub(http, 'request');
  });

  afterEach(function() {
    http.request.restore();
  });


  // WebPurify
  it('should construct a new instance', function() {
    expect(wp).to.be.instanceof(WebPurify);
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
    expect(wp.options).to.deep.equal({ api_key: 'sdfsdfsdf', endpoint: 'us', enterprise: false });
    expect(wp_ssl.options).to.deep.equal({ api_key: 'sdfsdfsdf', endpoint: 'us', enterprise: true });
  });

  it('should configure a request base', function() {
    expect(wp.request_base).to.deep.equal({ host: 'api1.webpurify.com', path: '/services/rest/' });
  });

  it('should configure a query base', function() {
    expect(wp.query_base).to.deep.equal({ api_key: 'sdfsdfsdf', format: 'json' });
  });



  // Methods
  describe('#request', function() {
    var host   = 'test.com';
    var path   = '/test';
    var method = 'GET';
    var ssl    = false;

    it('should issue a request', function() {
      var req = wp.request(host, path, method, ssl);
      expect(request.calledOnce).to.be.true;
    });

    it('should return a promise', function() {
      var req = wp.request(host, path, method, ssl);
      expect(req.then).to.be.a('function');
      expect(req.catch).to.be.a('function');
    });

    it('should resolve promise if request valid', function() {
      var response = new PassThrough();
      response.write(JSON.stringify({ my: 'request' }));
      response.end();

      request.callsArgWith(1, response).returns(new PassThrough());
      var req = wp.request(host, path, method, ssl);
      return expect(req).to.become({ my: 'request' });
    });

    it('should reject promise if request invalid', function() {
      var response = new PassThrough();
      response.write('not json');
      response.end();

      request.callsArgWith(1, response).returns(new PassThrough());
      var req = wp.request(host, path, method, ssl);
      return expect(req).to.be.rejected;
    });
  });


  describe('#get', function() {
    it('should issue a get request', function() {
      var params = { some: 'params' };
      var req = wp.get(params);
      expect(request.calledOnce).to.be.true;
      expect(request.firstCall.args[0].method).to.equal('GET');
    });

    it('should return a promise', function() {
      var params = { some: 'params' };
      var req = wp.get(params);
      expect(req.then).to.be.a('function');
      expect(req.catch).to.be.a('function');
    });

    it('should reject promise if malformed response', function() {
      var params = { some: 'fdsfsd' };
      var wprequest = sinon.stub(wp, 'request').returns({
        then: function(cb) {
          cb({ malformed: 'response' });
        }
      });
      var req = wp.get(params);
      return expect(req).to.be.rejectedWith(Error, /Malformed Webpurify response/);
    });

    it('should reject promise if unknown error in request', function() {
      var params = { some: 'fdsfsd' };
      var wprequest = sinon.stub(wp, 'request').returns({
        then: function(cb) {
          cb({ rsp: {
              '@attributes': true,
              err: 'a webpurify error'
            } });
        }
      });
      var req = wp.get(params);
      return expect(req).to.be.rejectedWith(Error, /Unknown Webpurify Error/);
    });

    it('should resolve promise if valid request & response', function() {
      var params = { some: 'fdsfsd' };
      var wprequest = sinon.stub(wp, 'request').returns({
        then: function(cb) {
          cb({ rsp: { '@attributes': true, good: 'attribute' } });
        }
      });
      var req = wp.get(params);
      return expect(req).to.eventually.have.property('good');
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
      expect(wp.strip(response)).to.deep.equal({});
    });
  });
});
