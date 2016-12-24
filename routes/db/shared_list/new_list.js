var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../../../models/user.js');
var Restaurant = require('../../../models/restaurant.js');
var SharedList = require('../../../models/sharedList.js');
var helper = require('../../../helper.js');

router.post('/db/shared_list/new_list', function(request, response) {
    // Create a restaurant and add to user list.
    if (!helper.check_session_email(request, response)) {
        return;
    }

    var email = request.body.email;

    User.find({email: email}).exec(function(err, user) {
        if (user.length == 0) {
            helper.send_response(response, 'Cannot find this user in database.', 0);
            return;
        } else {
            my_user = user[0];
            // TODO: Check request body data
            var name = request.body.name;

            var newUsers = [];
            newUsers.push(my_user);
            var newSharedList = new SharedList({
                name: name,
                users: newUsers
            });

            newSharedList.save(function(err) {
                if (err) {
                    console.log(err);
                    helper.send_response(response, 'Error occurred when creating new sharedList!', 0);
                    return;
                } else {
                    // Update the user as well.
                    my_user.sharedLists.push(newSharedList);
                    my_user.save(function(err) {
                        if (err) {
                            helper.send_response(response, 'Error occurred when saving user!', 0);
                            return;
                        } else {
                            helper.send_response(response, name + ' is added!', 1);
                            return;
                        }
                    })
                }
            })
        }
    });
});

module.exports = router;
