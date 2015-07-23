var expect    = require('chai').expect;
var WebPurify = require('../dist/webpurify');

describe('WebPurify', function() {
  it('should construct a new instance');
  it('should throw error when given bad parameters');
  it('should throw an error if not given an api key');
  it('should configure options');
  it('should configure a request base');
  it('should configure a query base');


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
    it('should strip response of attributes, api_key, method, and format');
  });
});
