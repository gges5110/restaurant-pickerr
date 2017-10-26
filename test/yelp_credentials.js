
// During the test the env variable is set to test
process.env.NODE_ENV = 'test';
require('dotenv').config()

//Require the dev-dependencies
let chai = require('chai');
let should = chai.should();
let assert = chai.assert, expect = chai.expect;

describe('Load Yelp credentials', () => {
  let loadYelp = function() {
    require('../routes/api/yelp');
  }

  it('it should not throw when loading route/api/yelp.js', () => {
    expect(loadYelp).to.not.throw();
    // assert.throws(loadYelp, Error, "Cannot find module '../../credentials.js'");
  });
});
