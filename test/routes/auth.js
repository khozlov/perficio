"use strict";

var helper = require('../test_helper'),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = require('chai').expect,
  auth = require('../../lib/routes/auth'),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  passport = require('passport'),
  express = require('express'),
  fakeApp = express(),
  config = require('config'),
  mountPoint = config.get('mountPoint');

chai.use(sinonChai);
chai.use(chaiHttp);

describe('auth routes', function() {
  before(function() {
    sinon.spy(passport, 'authenticate');
    fakeApp.use('/auth', auth(passport));
  });

  describe("google", function() {
    it("starts user authentication process pulling profile and email data", function(done) {
      chai.request(fakeApp)
        .get('/auth/google')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(passport.authenticate).to.have.been.calledWith('google', {
            scope: ['https://www.googleapis.com/auth/plus.login',
              'email'
            ]
          });
          done();
        });
    });
  });

  describe("google callback", function() {
    it("authenticates the user with google strategy redirecting on failure", function(done) {
      chai.request(fakeApp)
        .get('/auth/google/callback')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(passport.authenticate).to.have.been.calledWith('google', {
            failureRedirect: mountPoint + '/'
          });
          done();
        });
    });
  });
});
