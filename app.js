require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request-promise');
var session = require('express-session');

var app = express();

app.use(session({ secret: 'keyboard cat', name: 'fileMgrSession', cookie: { maxAge: 1800000 }}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.locals.moment = require('moment');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.render('index', {
    CLIENT_ID: process.env.CLIENT_ID,
    REDIRECT_URI: process.env.REDIRECT_URI
  });
});

app.get('/logout', function (req, res) {
  req.session.destroy();
  res.render('index', {
    CLIENT_ID: process.env.CLIENT_ID,
    REDIRECT_URI: process.env.REDIRECT_URI
  });
});

app.get('/delete/:fileId', function(req, res)
{
  request(`https://slack.com/api/files.delete?token=${req.session.accessToken}&file=${req.params.fileId}`)
    .then(function (body) {
      res.redirect('/files');
    })
    .catch(function (err) {
      console.log(err);
      res.redirect('/files');
    });
});

app.get('/deleteAll/:days?', function (req, res) {
  var days = req.params.days;

  let promiseChain = [];
  req.session.files.forEach(function (file) {
    if (days)
    {
      var xDaysAgo = app.locals.moment().subtract(days, 'days');
      var timestamp = app.locals.moment.unix(file.timestamp);

      if (timestamp.isAfter(xDaysAgo)) return;
    }

    promiseChain.push(
      request(`https://slack.com/api/files.delete?token=${req.session.accessToken}&file=${file.id}`)
    )
  });

    Promise.all(promiseChain)
      .then(function () {
        res.redirect('/files');
      })
      .catch(function (err) {
        console.log(err);
        res.status(500).end();
      });
});

app.get('/files', function (req, res) {
  if (!req.session.accessToken || !req.session.user) {
    res.redirect(`https://slack.com/oauth/authorize?scope=identity.basic,identity.email,identity.team,identity.avatar&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}`);
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

app.get('/redirect2', function (req, res) {
  if (req.query.code) {
    var options = {
      uri: `https://slack.com/api/oauth.access?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${req.query.code}&redirect_uri=${process.env.REDIRECT_URI}2`,
      json: true
    };

    request(options)
      .then(function (body) {
        if (!body.error) {
          res.redirect(`/files`);
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

app.get('/redirect', function (req, res) {
  if (req.query.code) {
    var options = {
      uri: `https://slack.com/api/oauth.access?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${req.query.code}&redirect_uri=${process.env.REDIRECT_URI}`,
      json: true
    };

    request(options)
      .then(function (body) {
        if (!body.error) {
          console.log('Username ' + body.user.name + ' logged in.');
          req.session.accessToken = body.access_token;
          req.session.user = body.user;

          res.redirect(`https://slack.com/oauth/authorize?scope=files:write:user,files:read&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}2`);
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

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});


app.listen(5050, function (err, res) {
  console.log("App listening on port 5050");
});
module.exports = app;
