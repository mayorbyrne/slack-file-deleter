var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  console.log(process.env);
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
    uri: uri,
    json: true
  };

  request(options)
    .then(function (body) {
      if (body.error) throw new Error(body.error);
      req.session.files = body.files;
      res.render('files', {
        user: req.session.user,
        files: req.session.files
      });
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).end();
    })
});

module.exports = router;
