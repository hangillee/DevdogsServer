var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Users = require('../DB/Users');
var Posts = require('../DB/Posts');

router.get('/', function(req, res, next) {
    res.render('submit');
})

router.get('/list', function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'text/json; charset=utf-8'});

    var result;
    var authors = []
    Posts.find({}, function(err, posts) {
        result = JSON.parse(JSON.stringify(posts)); // to modify values
        for (var i = 0; i < posts.length; ++i) {
            authors.push(posts[i].author);
        }

        Users.find({ '_id': { $in: authors } }, function(err, users) {
            //console.log(JSON.stringify(users));
        
            for (var i = 0; i < result.length; ++i) {
                for (var j = 0; j < users.length; ++j) {
                    // console.log("WRITER: " + result[i].author);
                    //console.log("ID: " + users[j].name);
                    if (result[i].author.toString() === users[j]._id.toString()) {
                        result[i].author = users[j].name;
                        //console.log("WRITER2: " + result[i].author);
                        //console.log("FOUND!");
                    }
                }
            }
            res.write(JSON.stringify(result));
            res.end();
        });
    });
});

//Posts submit logic
router.post('/submit', function(req, res, next) {
    console.log(req.session.user);
    if(req.session.user == undefined){
      res.writeHead(404, {"Context-Type" : "applicaion/json; charset=utf-8"});
    }
    else {
      console.log(req.session.user);
      Posts.create({
        _id: new mongoose.Types.ObjectId,
        title: req.body.title,
        author: req.session.user,
        content: req.body.content,
        date: new Date()
      }, (err, result) => {
          if (err) console.log("SAVE ERR" + err);
      });
      res.writeHead(200, {"Context-Type" : "applicaion/json; charset=utf-8"});
    }
    res.end();
});

module.exports = router;