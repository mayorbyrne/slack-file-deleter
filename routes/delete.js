var express = require('express');
var router = express.Router();
let axios = require('axios');

router.get("/file/:id", (req, res) => 
{
  axios.get(`https://slack.com/api/files.delete?token=${req.session.accessToken}&file=${req.params.id}`)
  .then((response) => {
    console.log(response.data);
    res.redirect('/files');
  })
  .catch((err) => {
    console.log(err);
    res.redirect('/files');
  });
});

router.get("/all/:days?", (req, res) => 
{
  var days = req.params.days;

  let promiseChain = [];
  req.session.files.forEach((file) => {
    if (days)
    {
      var xDaysAgo = req.app.locals.moment().subtract(days, 'days');
      var timestamp = req.app.locals.moment.unix(file.timestamp);

      if (timestamp.isAfter(xDaysAgo)) return;
    }

    promiseChain.push(
      axios.get(`https://slack.com/api/files.delete?token=${req.session.accessToken}&file=${file.id}`)
    )
  });

  Promise.all(promiseChain)
    .then(() => {
      res.redirect('/files');
    })
    .catch((err) => {
      console.log(err);
      res.status(500).end();
    });
});

module.exports = router;