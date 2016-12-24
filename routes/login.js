var express = require('express');
var router = express.Router();

router.get('/login', function(request, response) {
    my_session = request.session;

    var login = false;
    var email, name;
    if (my_session && my_session.email) {
        login = true;
        email = my_session.email;
        name = my_session.name;
    }

    response.render('pages/login.ejs', {
        login: login,
        email: email,
        name: name
    });
});

module.exports = router;
