var express = require('express');
var router = express.Router();
let axios = require('axios');

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.user = {
    "name": "Kevin Moritz",
    "email": "tuber@gmail.com"
  };

  req.session.files = [{
    "name": "Test",
    "created": new Date().getTime(),
    "id": 1
  },{
    "name": "Test 2",
    "created": new Date().getTime(),
    "id": 2
  },{
    "name": "Test 3",
    "created": new Date().getTime(),
    "id": 3
  },{
    "name": "Test 4",
    "created": new Date().getTime(),
    "id": 4
  },{
    "name": "Test 5",
    "created": new Date().getTime(),
    "id": 5
  }];

  res.render('files', {
    user: req.session.user,
    files: req.session.files
  });
  /*
  res.render('index', { 
    REDIRECT_URI: process.env.REDIRECT_URI,
    CLIENT_ID: process.env.CLIENT_ID
  });
  */
});

router.get('/redirect', function(req, res, next) {
  if (req.query.code) {
    var options = {
      url: `https://slack.com/api/oauth.v2.access?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${req.query.code}&redirect_uri=${process.env.REDIRECT_URI}`
    };

    axios(options)
      .then(function (response) {
        if (response.status === 200)
        {
          req.session.accessToken = response.data.authed_user.access_token;
          req.session.user = response.data.authed_user;

          return axios({
            url: `https://slack.com/api/users.identity?token=${req.session.accessToken}`
          });

        }
        else {
          throw new Error(body.error);
        }
      })
      .then(function(response)
      {
        // append the user.identity fields to the req.session.user object
        let keys = Object.keys(response.data.user);
        for (let i = 0; i < keys.length; i++)
        {
          let key = keys[i];
          req.session.user[key] = response.data.user[key];
        }
        
        res.redirect('/files');
      })
      .catch(function (err) {
        console.log(err);
        res.status(500).end();
      });
  }
  else {
    res.status(500).end();
  }
});

module.exports = router;
