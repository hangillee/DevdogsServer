var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Users = require('../DB/Users');

var transporter = require('../data/mailer');

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
      var authCode = Math.floor(Math.random() * 10000).toString();
      var id = new mongoose.Types.ObjectId;
      Users.create({
        _id: id,
        id: req.body.id,
        pw: req.body.pw,
        name: req.body.name,
        code: authCode,
        posts: []
      });
      var link = "http://" + req.get("host") + "/users/auth?key=" + makeKey(id, authCode);
      console.log(link);
      var mailOptions = {
        from: "devPBstudio@gmail.com",
        to: req.body.id,
        subject: "[Devdogs] Authorize mail.",
        generateTextFromHTML: true,
        html: '<p>Please enter this link to authorize your email: </p>' +
        '<a href="' + link + '">' + link + '</a>'
      };
      transporter.sendMail(mailOptions, function(err, info){
        console.log(info.response);
        if(err){
          console.log("EMAIL ERROR");
          res.writeHead(404, {"Context-Type" : "applicaion/json; charset=utf-8"});
        }
        else {
          console.log("SUCCESS");
          res.writeHead(200, {"Context-Type" : "applicaion/json; charset=utf-8"});
        }
      });
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
          req.session.user = result;
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

function makeKey(id, code) {
  _code = code.toString(16);
  _id = id.toString();
  console.log('[AUTH] _id: ' + _id + '\n_code: ' + _code);
  var res = '';

  while (_code.length < 4) {
    _code = "0" + _code;
  }

  for (var i=1; i<=8; ++i) {
    if (i%2 == 0) res += _code[i/2 - 1];
    else res += _id[parseInt(i/2)];
  }

  res += _id.substring(4, _id.length);

  console.log("[MAKEKEY] res: " + res);

  return res;
}

function decode(key) {
  var id = "";
  var code = "";

  for (var i=1; i<=8; ++i) {
    if (i%2 == 0) code += key[i-1];
    else id += key[i-1];
  }

  id += key.substring(8, key.length);

  var stack = 0;
  for (var i=0; i<code.length; ++i) {
    if (code[i] == "0") stack++;
    else break;
  }
  code = code.substring(stack, code.length);

  console.log('[DECODE] id:' + id);
  console.log('[DECODE] code:' + code);

  return [id, code];
}

// authorize code
router.get('/auth', function(req, res) {
  var sess = req.session;
  var key = req.query.key;

  decoded = decode(key);

  var id = decoded[0];
  var code = decoded[1];

  console.log("[AUTH] id: " + id);
  console.log("[AUTH] code: " + code);

  Users.findById(id.toString(), function(err, result) { // findBy"_id"
    if (err) {
      res.writeHead(404, {"Context-Type" : "applicaion/json; charset=utf-8"});
    }
    else {
      console.log(result);
      if (result.code == "xxxx") {
        res.writeHead(200, {"Context-Type" : "applicaion/json; charset=utf-8"});
      }
      else if (result.code == code) {
        Users.updateOne({'_id': id }, { 'code':  "xxxx" }, function(err, raw) {
          if (err) console.log(err);
        });
      }
      else {
      }
    }
    res.end();
  });
});

//get user settings
router.get('/settings', function(req, res) {
  // res.writeHead(200, {"Content-Type" : "text/json; charset=utf-8"});
  var sess = req.session;

  if (sess.user) {
    var isAuthorized = (sess.user.code == "xxxx");
    console.log(isAuthorized);
    console.log(sess.user.code);

    var output = JSON.parse('{}');
    output.isAuthorized = isAuthorized;
    res.status(200).send(JSON.stringify(output));
    res.end();
  } else {
    res.status(300).send("<h1>Please Log in</h1>");
    res.end();
  }
});

// login
router.get('/login', function(req, res) {
  var sess = req.session;

  if (!sess.user) {
    res.render('login');
  } else {
    // res.writeHead(200, {"Content-Type" : "text/html; charset=utf-8"});
    res.send("<h1>Already Logged in</h1>");
    res.end();

    console.log("Already Logged in!");
    console.log("[LOGIN-SESSION] sessionID: " + req.sessionID);
    console.log("[LOGIN-SESSION] session.user.id: " + sess.user.id);
  }
});

module.exports = router;
