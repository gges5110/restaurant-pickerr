var express = require('express');
var router = express.Router();

router.post('/logout', function(request, response) {
    my_session = request.session;

    request.session.destroy(function(err) {
        if (err) {
            response.send({
                msg: err
            });
        } else {
            response.redirect('/login');
        }
    });
    // request.logout();
    request.session = null;

});

module.exports = router;
