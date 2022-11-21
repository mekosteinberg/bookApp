const express = require('express');
const app = express();
const mongoose = require("mongoose");
const db = mongoose.connection;
const methodOverride = require("method-override");
const bookRouter = require("./routes/routes");
const { auth } = require('express-openid-connect');


require('dotenv').config()
const mongoURI = process.env.MONGO_URI
const mongoUser = process.env.MONGO_USER
const mongoPassword = process.env.MONGO_PASSWORD

//auth0 config
const config = {
    authRequired: false,
    auth0Logout: true
};
app.use(auth(config));

// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
    res.locals.user = req.oidc.user;
    next();
});

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));

//router
app.use(bookRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handlers shown in error.ejs
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.ejs', {
        message: err.message,
        error: process.env.NODE_ENV !== 'production' ? err : {}
    });
});


db.on('error', (err) => console.log(err.message + ' is Mongod not running?'))
db.on('connected', () => console.log('mongo connected: ', mongoURI))
db.on('disconnected', () => console.log('mongo disconnected'))


mongoose.connect(mongoURI, {
    dbName: 'bookdragon',
    user: mongoUser,
    pass: mongoPassword,
}, () => {
    console.log("Database is connected");
});

app.listen(3000, () => console.log("Reading on port 3000"));


