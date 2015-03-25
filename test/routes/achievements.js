"use strict";

var helper = require('../test_helper'),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = require('chai').expect,
  app = require('../../lib/app');

chai.use(chaiHttp);

describe('achievement routes', function() {
  describe("#social", function() {
    var achievement;

    before(function(done) {
      helper.clearDb(function() {
        helper.factories.create('Template', function(err, createdTemplate) {
          helper.factories.create('Achievement', {
            template: createdTemplate
          }, function(err, createdAchievement) {
            achievement = createdAchievement;
            done();
          });
        });
      });
    });

    it("is a success if the achievement exists", function(done) {
      chai.request(app)
        .get('/achievements/' + achievement.id + '/social')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });

    it("returns 404 if the achievement doesn't exist", function(done) {
      chai.request(app)
        .get('/achievements/blahblah/social')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(404);
          done();
        });
    });
  })
})
