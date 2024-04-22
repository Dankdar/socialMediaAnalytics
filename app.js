var createError = require('http-errors');
var express = require('express');
var path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const logger = require('morgan');
// const ordersCronJob = require('./cronjobs/orders');
const loggerMiddleware = require('./middleware/logs');

const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const reactionsRouter = require('./routes/reactions');
const analyticsRoutes = require('./routes/analytics');
const mongoose = require("mongoose");

const app = express();

mongoose.connect('mongodb+srv://huzaifadar:'+ process.env.MONGO_ATLAS_DB_PWD +'@socialcluster.dhsebq2.mongodb.net/',{ serverSelectionTimeoutMS: 50000 }) // mongodb+srv://huzaifadar:<password>@cluster0.9sf9tqo.mongodb.net/


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next)=>{
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type,Accept, Authorization");
  if(req.method==='OPTIONS'){
    res.header('Access-Control-Allow-Headers',"PUT, POST, PATCH, DELETE");
    return res.status(200).json({})
  }
  next();
}); // middleware for json parse.


app.use('/', loggerMiddleware.logger); // open middleware
app.use('/public/uploads', express.static('/public/uploads')); // folder for image uploads
app.use('/users', usersRouter); // users and admins.
app.use('/posts', postsRouter); // users and admins.
app.use('/reactions', reactionsRouter); // users and admins.
app.use('/analytics',analyticsRoutes);


app.use(function(req, res, next) {
  next(createError(404));
}); // catch 404 and forward to error handler


app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
}); // error handler

module.exports = app;
