// During the test the env variable is set to test
process.env.NODE_ENV = 'test';
process.env.PORT = 5002;
//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);

describe('Basic route testing', () => {
  var server;
  beforeEach(function () {
    delete require.cache[require.resolve('../app')];
    // Re import environment vairables    
    require('dotenv').config()
    server = require('../app');
  });
  afterEach(function (done) {
    server.close(done);
    console.log('Server closed.');
  });

  it('it should GET the index page', (done) => {
    chai.request(server)
      .get('/')
      .end((err, res) => {
          res.should.have.status(200);
        done();
      });
  });
});
