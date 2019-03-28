var mongoose = require('mongoose');
var User = require('../models/users');


exports.init= function() {
    // uncomment if you need to drop the database
    //
    User.deleteMany({}, function(err) {
       console.log('collection removed')
    });

    var user = new User({
        unique_id:'0',
        username: 'admin',
        email: 'test@gmail.com',
        password: 'test'
    });
    console.log('please, test the web with test@gmail.com, test.');

    user.save(function (err, results) {
        console.log(results._id);
    });
}