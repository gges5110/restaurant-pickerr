var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/user.js');
var Restaurant = require('../models/restaurant.js');

router.get('/bucketlist', function(request, response) {
  var login = false;
  var email, name;
  if (request.session && request.session.email) {
    login = true;
    email = request.session.email;
    name = request.session.name;
  }
  
  if (login === false) {
    response.redirect('/');
  }

  // Query database and get bucket restaurants
  User.findOne({email: email}).populate('restaurants').exec(function(err, user) {
    if (err) {
        console.log('err');
    } else if(!user) {
      response.render('pages/bucketlist', {
        login: login,
        email: email,
        name: name
      });
      return;
    } else {
      response.render('pages/bucketlist', {
        login: login,
        email: email,
        name: name,
        restaurants: user.restaurants
      });
    }
  });
});

module.exports = router;
