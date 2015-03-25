"use strict";

var express = require('express'),
  router = express.Router(),
  achievements = require('../controllers/achievements');

router.route('/:id/social')
  .get(achievements.social);

module.exports = router;
