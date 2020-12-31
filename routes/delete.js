var express = require('express');
var router = express.Router();
let axios = require('axios');
var debug = require('debug')('slackfilemgr:delete');
debug.enabled = true;

router.get("/file/:id", (req, res) => 
{
  axios.get(`https://slack.com/api/files.delete?token=${req.session.accessToken}&file=${req.params.id}`)
  .then((response) => {
    if (response.data.ok)
    {
      debug(`file was deleted: ${req.params.id}`);
      req.session.files = req.session.files.filter((file) => file.id !== req.params.id);
    }
    else
    {
      debug(`file was not deleted: ${req.params.id}`, response.data);
    }
    res.redirect('/files');
  })
  .catch((err) => {
    debug('delete route ran into error', err);
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
        .then((response) => {
          if (response.data.ok)
          {
            debug(`file was deleted: ${file.name}`);
            req.session.files = req.session.files.filter((file) => file.id !== req.params.id);
          }
          else
          {
            debug(`file was not deleted: ${file.name}`, response.data);
          }
        })
    )
  });

  Promise.all(promiseChain)
    .then(() => {
      res.redirect('/files');
    })
    .catch((err) => {
      debug('delete route ran into error', err);
      res.status(500).end();
    });
});

module.exports = router;