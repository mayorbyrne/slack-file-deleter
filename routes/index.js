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
          console.log(response);
          console.log('UserID ' + response.data.authed_user.id + ' logged in.');
          req.session.accessToken = response.data.authed_user.access_token;
          req.session.user = response.data.authed_user;

          res.redirect('/files');
        }
        else {
          throw new Error(body.error);
        }
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
