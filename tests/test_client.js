var assert = require('assert');
var Rest = require('../restClient');
var XMLHttpRequest = require('../node_modules/xmlhttprequest').XMLHttpRequest;
describe('client', function () {
  let client = new Rest.RestClient({
    create: () => {
      return new XMLHttpRequest();
    }
  });
  describe('url', function () {
    it('get pure', function (done) {
      this.timeout(10000);
      client.get('http://services.odata.org/V4/Northwind/Northwind.svc/Customers', {
        contentType: 'application/json'
      }).then((response) => {
        assert.equal(response.status, 200);
        done();
      }).catch(done);
    });
  });
});