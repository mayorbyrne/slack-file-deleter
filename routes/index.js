var express = require('express');
var router = express.Router();
let axios = require('axios');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    REDIRECT_URI: process.env.REDIRECT_URI,
    CLIENT_ID: process.env.CLIENT_ID
  });
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
