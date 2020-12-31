var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
require('dotenv').config();
var session = require('express-session');

var indexRouter = require('./routes/index');
let filesRouter = require('./routes/files');
let deleteRouter = require('./routes/delete');

if (!require('fs').existsSync("./.env"))
{
  console.log("Project is missing a .env file.\nThis file is required to run the app properly.\nPlease add one or run 'node setup.js' to generate\n");
  process.exit();
}

var app = express();

app.locals.moment = require('moment');

app.use(session({
  secret: 'keyboard cat',
  cookie: {
    maxAge: 60000
  },
  resave: true,
  saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/files', filesRouter);
app.use('/delete', deleteRouter);

app.get('/logout', function (req, res) {
  req.session.destroy();
  res.render('index', {
    CLIENT_ID: process.env.CLIENT_ID,
    REDIRECT_URI: process.env.REDIRECT_URI
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;