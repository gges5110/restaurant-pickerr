var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/user.js');
var SharedList = require('../models/sharedList.js');
var helper = require('../helper.js');

router.get('/invite', function(request, response) {
    var login = false;
    var email, name;
    if (request.session && request.session.email) {
        login = true;
        email = request.session.email;
        name = request.session.name;
    }

    var list_id = request.query.list_id.replace(/[^a-z0-9]/gi,'');

    // Check if the user is logged in
    if (login) {
        // Get the sharedList and add user as an editor
        User.findOne({email: email}).populate('sharedLists_edit').populate('sharedLists_own').exec(function(err, user) {
            if (!err) {
                // Check if the list is already in user's collection
                for (var i = 0; i < user.sharedLists_edit.length; ++i) {
                    if (user.sharedLists_edit[i]._id.toString() == list_id) {
                        // helper.send_response(response, 'You have already the permission to edit the list.', 0);
                        response.redirect('/shared_list?list_id=' + list_id);
                        return;
                    }
                }

                // Check if the user owns the list
                for (var i = 0; i < user.sharedLists_own.length; ++i) {
                    if (user.sharedLists_own[i]._id.toString() == list_id) {
                        // helper.send_response(response, 'You have already the permission to edit the list.', 0);
                        response.redirect('/shared_list?list_id=' + list_id);
                        return;
                    }
                }

                // Query the sharedList and add to it
                SharedList.findOne({_id: list_id}).populate('users').exec(function(err, shared_list) {
                    if (!err) {
                        shared_list.users.push(user);
                        shared_list.save(function(err) {
                            if (!err) {
                                console.log("Shared list saved.");
                            }
                        });

                        user.sharedLists_edit.push(shared_list);
                        user.save(function(err) {
                            if (!err) {
                                console.log("User saved.");
                                response.redirect('/shared_list?list_id=' + list_id);
                            }
                        });
                    } else {
                        helper.send_response(response, 'Cannot find the list.', 0);
                        return;
                    }
                });
            }
        });
    } else {
        // Redirect the user to login page.
        console.log("Please log in.");
        request.session.invite = true;
        request.session.invite_list_id = list_id;
        response.redirect('/login');
    }
});

module.exports = router;
