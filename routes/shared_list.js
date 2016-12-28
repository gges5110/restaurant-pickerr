var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/user.js');
var SharedList = require('../models/sharedList.js');
var Restaurant = require('../models/restaurant.js');

router.get('/shared_list', function(request, response) {
    var login = false;
    var email, name;
    if (request.session && request.session.email) {
        login = true;
        email = request.session.email;
        name = request.session.name;
    }
    var list_id = request.query.list_id;

    SharedList.findOne({_id: list_id}).populate('restaurants').populate('users').exec(function(err, sharedList) {
        if (err) {
            console.log('error');
        } else if (!sharedList) {
            send_response(response, 'Could not find a list by id.', 0);
        } else {
            response.render('pages/shared_list', {
                login: login,
                email: email,
                name: name,
                sharedList: sharedList,
                restaurants: sharedList.restaurants
            });
        }
    });
});

module.exports = router;
