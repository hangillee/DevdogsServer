var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var db = mongoose.connection;
var Users = require('../DB/Users');
var Posts = require('../DB/Posts');

db.on('error', console.error);
db.once('open', function(){
  console.log('Connected to mongodb server');
})

mongoose.connect('mongodb://localhost:27017/Devdogs', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', function(req, res){
  res.render('register', {});
});

router.post('/register', function(req, res) {
  Users.findOne({"id":req.body.id}, function(err, result){
    if(!result) {
      Users.create({
        _id: new mongoose.Types.ObjectId,
        id: req.body.id,
        pw: req.body.pw,
        name: req.body.name
      });
      res.writeHead(200, {"Context-Type" : "applicaion/json; charset=utf-8"});
    }
    else {
      res.writeHead(404, {"Context-Type" : "applicaion/json; charset=utf-8"});
    }
    res.end();
  });
});

router.post('/login', function(req, res) {
  Users.findOne({"id":req.body.id}, function(err, result){
    if(!result) {
      res.writeHead(404, {"Context-Type" : "applicaion/json; charset=utf-8"});
    }
    else {
      if (result.pw == req.body.pw) {
        req.session.user = result._id;
        req.session.save();
        console.log(req.sessionID);
        res.writeHead(200, {"Context-Type" : "applicaion/json; charset=utf-8"});
      }
      else {
        res.writeHead(404, {"Context-Type" : "applicaion/json; charset=utf-8"});
      }
    }
    res.end();
  });
});

//Posts submit logic
router.post('/submit', function(req, res) {
  console.log(req.sessionID);
  Posts.create({
    _id: new mongoose.Types.ObjectId,
    title: req.body.title,
    author: req.session.user,
    content: req.body.content,
    date: new Date()
  });
  res.writeHead(200, {"Context-Type" : "applicaion/json; charset=utf-8"});
  res.end();
});

module.exports = router;
