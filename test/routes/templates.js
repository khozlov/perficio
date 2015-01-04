"use strict";

var helper = require('../test_helper'),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = require('chai').expect,
  app = require('../../lib/app'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Template = mongoose.model('Template');

chai.use(chaiHttp);

describe('templates routes', function() {

  var user1, user2, template1, template2;

  //TODO: Refactor setup
  beforeEach(function(done) {
    user1 = new User({
      'name': 'Han Solo',
      'email': 'han.solo@rebelion.com',
      'photoUrl': 'dummyUrl',
      'admin': true
    });
    user2 = new User({
      'name': 'Jewbacka',
      'email': 'fury@rebelion.com',
      'photoUrl': 'anotherDummyUrl'
    });

    helper.clearDb(function() {
      user1.save(function() {
        user2.save(done);
      });
    });
  });

  describe("#index", function() {

    beforeEach(function(done) {
      template1 = new Template({
        'name': 'Gold medal',
        'description': 'For achieveiving something',
        'imageUrl': 'someUrl',
        'author': user1
      });
      template2 = new Template({
        'name': 'Bronze medal',
        'description': 'For achieveiving something else',
        'imageUrl': 'someOtherUrl',
        'author': user2
      });

      template1.save(function() {
        template2.save(done);
      });
    });

    it("is a success", function(done) {
      chai.request(app)
        .get('/templates')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });

    it("returns all templates", function(done) {
      chai.request(app)
        .get('/templates')
        .end(function(err, res) {
          expect(res.body.length).to.equal(2);
          var templateIdMap = helper.idMap(res.body);
          expect(res.body[templateIdMap[template1.id]].name).to.equal('Gold medal');
          expect(res.body[templateIdMap[template1.id]].imageUrl).to.equal('someUrl');
          expect(res.body[templateIdMap[template1.id]].description).to.equal('For achieveiving something');
          expect(res.body[templateIdMap[template1.id]].author).to.equal(user1.id);

          expect(res.body[templateIdMap[template2.id]].name).to.equal('Bronze medal');
          expect(res.body[templateIdMap[template2.id]].imageUrl).to.equal('someOtherUrl');
          expect(res.body[templateIdMap[template2.id]].description).to.equal('For achieveiving something else');
          expect(res.body[templateIdMap[template2.id]].author).to.equal(user2.id);
          done();
        });
    });
  })

  describe("#show", function() {

    beforeEach(function(done) {
      template1 = new Template({
        'name': 'Gold medal',
        'description': 'For achieveiving something',
        'imageUrl': 'someUrl',
        'author': user1
      });

      template1.save(done);
    });

    it("is a success", function(done) {
      chai.request(app)
        .get('/templates/' + template1.id)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });

    it("returns the template", function(done) {
      chai.request(app)
        .get('/templates/' + template1.id)
        .end(function(err, res) {
          expect(res.body.name).to.equal('Gold medal');
          expect(res.body.imageUrl).to.equal('someUrl');
          expect(res.body.description).to.equal('For achieveiving something');
          expect(res.body.author).to.equal(user1.id);
          done();
        });
    });

    it("returns 404 if the template is not found", function(done) {
      chai.request(app)
        .get('/templates/trelemorele')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(404);
          done();
        });
    });
  })

  describe("#create", function() {
    it("responds with 401 when user is not authenticated", function(done) {
      chai.request(app)
        .post('/templates')
        .send({
          name: 'Silver medal',
          description: 'For being not quite the best',
          imageUrl: 'silverUrl'
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          done();
        });
    });

    it("responds with 401 when user is not an admin", function(done) {
      chai.request(app)
        .post('/templates')
        .set('Cookie', helper.sessionCookies({
          'passport': {
            'user': user2.id
          }
        }))
        .send({
          name: 'Silver medal',
          description: 'For being not quite the best',
          imageUrl: 'silverUrl'
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          done();
        });
    });

    it("creates the template", function(done) {
      Template.count({
        author: user1
      }, function(err, count) {
        expect(count).to.equal(0);
        chai.request(app)
          .post('/templates')
          .set('Cookie', helper.sessionCookies({
            'passport': {
              'user': user1.id
            }
          }))
          .send({
            name: 'Silver medal',
            description: 'For being not quite the best',
            imageUrl: 'silverUrl'
          })
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            Template.find({}, function(err, templates) {
              expect(err).to.be.null;
              expect(templates.length).to.equal(1);
              expect(templates[0].name).to.equal('Silver medal');
              expect(templates[0].description).to.equal('For being not quite the best');
              expect(templates[0].imageUrl).to.equal('silverUrl');
              expect(templates[0].author.toString()).to.equal(user1.id.toString());
              done();
            });
          });
      });
    });

    it("returns the created template", function(done) {
      Template.count({
        author: user1
      }, function(err, count) {
        expect(count).to.equal(0);
        chai.request(app)
          .post('/templates')
          .set('Cookie', helper.sessionCookies({
            'passport': {
              'user': user1.id
            }
          }))
          .send({
            name: 'Silver medal',
            description: 'For being not quite the best',
            imageUrl: 'silverUrl'
          })
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            Template.find({}, function(err, templates) {
              expect(err).to.be.null;
              expect(res.body._id).to.equal(templates[0].id);
              expect(res.body.name).to.equal(templates[0].name);
              expect(res.body.description).to.equal(templates[0].description);
              expect(res.body.imageUrl).to.equal(templates[0].imageUrl);
              expect(res.body.author).to.equal(templates[0].author.toString());
              done();
            });
          });
      });
    });
  });
});
