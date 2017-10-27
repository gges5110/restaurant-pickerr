// During the test the env variable is set to test
process.env.NODE_ENV = 'test';
require('dotenv').config()

//Require the dev-dependencies
let chai = require('chai');
let should = chai.should();
let assert = chai.assert, expect = chai.expect;

describe('Load database', () => {
  let load_database;
  afterEach(() => {
    load_database.close();
  });

  it('it should not throw when loading load_database.js', () => {
    load_database = require('../load_database');
    expect(load_database.load_database).to.not.throw();
  });

  it('it should throw an error if process.env.MONGODB_URI not found', () => {
    delete process.env.MONGODB_URI;
    load_database = require('../load_database');
    expect(load_database.load_database).to.throw();
  })
});
