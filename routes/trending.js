var express = require('express');
var router = express.Router();
var Favorite = require('../models/favorite');
var Restaurant = require('../models/restaurant');

router.get('/trending', function(request, response) {
  var login = false;
  var email, name;

  if (request.session && request.session.email && request.session.email != null) {
    console.log("session: " + request.session);
    console.log("email: " + request.session.email);
    login = true;
    email = request.session.email;
    name = request.session.name;
  }

  // Get all the popular restaurants.
  Favorite
    .find({})
    .populate('restaurant')
    .limit(20)
    .sort({time: -1})
    .exec(function(err, favorites) {
    if (err) {
      //
    } else {
      // According to https://github.com/Automattic/mongoose/issues/2202, sorting via populated subdocuments currently has bug.
      // If required, sort the favorites array manually.

      response.render('pages/trending', {
        login: login,
        email: email,
        name: name,
        favorites: favorites
      });
    }
  });
});

module.exports = router;
