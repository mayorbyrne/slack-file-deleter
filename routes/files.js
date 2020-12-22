var express = require('express');
var router = express.Router();
let axios = require('axios');

router.get('/', function(req, res, next) {
  if (!req.session.accessToken || !req.session.user) {
    res.redirect(`https://slack.com/oauth/v2/authorize?client_id=${process.env.CLIENT_ID}&scope=files:read,files:write&user_scope=&redirect_url=${process.env.REDIRECT_URI}`);
    return;
  }

  var uri = `https://slack.com/api/files.list?token=${req.session.accessToken}&page=2000`;

  if (!req.session.user)
  {
    console.log('There is no user logged in');
    res.status(500).end();
  }
  else if (req.session.user.email != process.env.ADMIN_EMAIL)
  {
    uri += `&user=${req.session.user.id}`;
  }

  var options = {
    url: uri
  };

  axios(options)
    .then((response) => {
      console.log(response);
      if (response.error) throw new Error(response.error);
      req.session.files = response.data.files;
      res.render('files', {
        user: req.session.user,
        files: req.session.files
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).end();
    })
});

module.exports = router;
