var express = require('express');
var router = express.Router();

var Users = require('../DB/Users');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
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

router.post('/login', function(req, res, next) {
  console.log(req.sessionID);
  if(req.session.user) {
    console.log("Already Loginned User");
    res.end();
  }
  else {
    Users.findOne({"id":req.body.id}, function(err, result){
      if(!result) {
        res.writeHead(404, {"Context-Type" : "applicaion/json; charset=utf-8"});
      }
      else {
        if (result.pw == req.body.pw) {
          req.session.user = result._id;
          req.session.save();
          res.writeHead(200, {"Context-Type" : "applicaion/json; charset=utf-8"});
          console.log(req.session.user);
        }
        else {
          res.writeHead(404, {"Context-Type" : "applicaion/json; charset=utf-8"});
        }
      }
      res.end();
    });
  }
});

module.exports = router;
