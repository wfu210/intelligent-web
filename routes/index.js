var express = require('express');
var router = express.Router();
var bodyParser= require("body-parser");

var UserController = require('../controllers/users');
var initDB= require('../controllers/init');
var User = require('../models/users')
initDB.init();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', login_is_correct:true});
});

/*
* TODO
* can not save new user to database
* also, has problem with
* console.log(results._id);
* */
router.post('/events', function (req,res, next) {
  const event = new Event(req.body.location,req.body.date,req.body.name);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(event));
});

router.post("/posts", function (req,res, next) {
  const post = new Post(req.body.author,req.body.content);
  console.log(req.body.content);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(post));
});

/**
 * @param name
 * @param location
 * @param date
 * @constructor
 */
class Event{
  constructor (location, date, name) {
    this.location= location;
    this.date = date;
    this.name = name
  }
}

/**
 *
 * @param n
 * @returns {boolean}
 */
class Post {
  constructor (author, content) {
    this.author = author;
    this.content = content;
  }
}


function isNumeric(n) {
  return !isNaN(parseInt(n)) && isFinite(n);
}

module.exports = router;
