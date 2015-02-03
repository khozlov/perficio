"use strict";

var express = require('express'),
  router = express.Router(),
  users = require('../controllers/users'),
  templates = require('../controllers/templates');

router.route('/')
  .get(templates.index)
  .post(users.ensureAdmin, templates.create);
router.route('/:id')
  .get(templates.show);
router.route('/:id/achievements/count')
  .get(templates.achievementsCount);


module.exports = router;
