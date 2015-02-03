"use strict";

var express = require('express'),
  router = express.Router(),
  users = require('../controllers/users');

router.route('/')
  .get(users.index);
router.route('/count')
  .get(users.count);
router.route('/:id')
  .get(users.show);
router.route('/:id/grant/:templateId')
  .post(users.ensureAuthenticated, users.grant);

module.exports = router;
