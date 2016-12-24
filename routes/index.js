var express = require('express');
var router = express.Router();

router.get('/', function(request, response) {
    var login = false;
    var email, name;
    console.log("in!");
    if (request.session && request.session.email && request.session.email != null) {
        console.log("session: " + request.session);
        console.log("email: " + request.session.email);
        login = true;
        email = request.session.email;
        name = request.session.name;
    }

  response.render('pages/index', {
      login: login,
      email: email,
      name: name
  });
});

module.exports = router;
