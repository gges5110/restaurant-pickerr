var express = require('express');
var router = express.Router();

router.get('/login', function(request, response) {

    var login = false;
    var email, name;
    if (request.session && request.session.email) {
        login = true;
        email = request.session.email;
        name = request.session.name;
    }

    response.render('pages/login.ejs', {
        login: login,
        email: email,
        name: name
    });
});

module.exports = router;
