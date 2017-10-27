// During the test the env variable is set to test
process.env.NODE_ENV = 'test';
process.env.PORT = 5002;
//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);
require('dotenv').config()
describe('Basic route testing', () => {
  var app;
  beforeEach(function () {
    delete require.cache[require.resolve('../app')];
    // Re import environment vairables
    app = require('../app');
  });
  afterEach(function (done) {
    app.close();
    console.log('app closed.');
    done();
  });

  it('it should GET the index page', (done) => {
    chai.request(app.server)
      .get('/')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('it should return 404 when requesting non existing page', (done) => {
    chai.request(app.server)
      .get('/foo')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });

  it('it should GET login page', (done) => {
    chai.request(app.server)
      .get('/login')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('it should GET yelp page', (done) => {
    chai.request(app.server)
      .get('/yelp')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});
