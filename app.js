require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request-promise');

var app = express();

var accessToken;
var user;
var files;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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
  accessToken = null;
  user = null;
  res.render('index', {
    CLIENT_ID: process.env.CLIENT_ID,
    REDIRECT_URI: process.env.REDIRECT_URI
  });
});

app.get('/deleteAll', function (req, res) {
  console.log('deleting files', files);

  let promiseChain = [];
  files.forEach(function (file) {
    promiseChain.push(
      request(`https://slack.com/api/files.delete?token=${accessToken}&file=${file.id}`)
        .then(function (res) {
          console.log(res);
        })
    )
  });

  Promise.all(promiseChain)
    .then(function () {
      res.redirect('files');
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).end();
    });
});

app.get('/files', function (req, res) {
  if (!accessToken || !user) {
    res.redirect(`https://slack.com/oauth/authorize?scope=identity.basic,identity.email,identity.team,identity.avatar&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}`)
  }
  var options = {
    uri: `https://slack.com/api/files.list?token=${accessToken}&user=${user.id}&page=2000`,
    json: true
  };

  request(options)
    .then(function (body) {
      if (body.error) throw new Error(body.error);
      files = body.files;
      res.render('files', {
        user,
        files
      });
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).end();
    })
});

app.get('/redirect2', function (req, res) {
  console.log('here now');
  if (req.query.code) {
    var options = {
      uri: `https://slack.com/api/oauth.access?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${req.query.code}&redirect_uri=${process.env.REDIRECT_URI}2`,
      json: true
    };

    request(options)
      .then(function (body) {
        if (!body.error) {
          console.log('body:', body);
          console.log('Your new scope is: ', body.scope);

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
  console.log(req.query);
  console.log(req.body);

  if (req.query.code) {
    var options = {
      uri: `https://slack.com/api/oauth.access?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${req.query.code}&redirect_uri=${process.env.REDIRECT_URI}`,
      json: true
    };

    console.log(options);

    request(options)
      .then(function (body) {
        if (!body.error) {
          console.log('body:', body);
          console.log('Hello, ', body.user.name);
          console.log('Your access token is: ', body.access_token);
          accessToken = body.access_token;
          user = body.user;

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

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.listen(5050, function (err, res) {
  console.log("App listening on port 5050");
});
module.exports = app;
