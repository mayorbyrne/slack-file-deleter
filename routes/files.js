var express = require('express');
var router = express.Router();
let axios = require('axios');

router.get('/', function(req, res, next) {
  let promiseChain = [];
  req.session.files = [];

  if (!req.session.accessToken || !req.session.user) {
    res.redirect(`https://slack.com/oauth/v2/authorize?client_id=${process.env.CLIENT_ID}&scope=&user_scope=files:read,files:write`);
    return;
  }

  var url = `https://slack.com/api/files.list?token=${req.session.accessToken}&count=1`;

  if (req.session.user.email === process.env.ADMIN_EMAIL)
  {
    url += `&user=${req.session.user.id}`;
  }

  var options = {
    url
  };

  axios(options)
    .then((response) => {
      if (response.error) throw new Error(response.error);

      req.session.files = req.session.files.concat(response.data.files);

      if (response.data.files.length > 0 && response.data.paging && response.data.paging.pages > 1) {
        // TODO: handle if pages is astronomical

        // we've already got the first page of results, start at index 1
        for (let i = 1; i < response.data.paging.pages; i++) {
          let pageUrl = url + `&page=${i}`;
          promiseChain.push(axios({
            url: pageUrl
          }));
        }
      }

      return Promise.all(promiseChain);
    })
    .then((responseArray) => {
      responseArray.forEach((response) => {
        if (response.error) throw new Error(response.error);
        req.session.files = req.session.files.concat(response.data.files);
      });

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
