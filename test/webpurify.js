var expect    = require('chai').expect;
var should    = require('chai').should();
var WebPurify = require('../dist/webpurify');

var wp;

describe('WebPurify', function() {
  beforeEach(function() {
    wp     = new WebPurify({ api_key: 'sdfsdfsdf' });
    wp_ssl = new WebPurify({ api_key: 'sdfsdfsdf', enterprise: true });
  });

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


  describe('#request', function() {
    it('should accept a host, path, method, and optional ssl boolean');
    it('should issue a request');
    it('should return a promise');
    it('should resolve promise if request valid');
    it('should reject promise if request invalid');
  });


  describe('#get', function() {
    it('should issue a get request');
    it('should return a promise');
    it('should reject promise if malformed response');
    it('should reject promise if unknown error in request');
    it('should resolve promise if valid request & response');
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
