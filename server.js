const express = require('express');
const app = express();
const mongoose = require("mongoose");
const db = mongoose.connection;
const methodOverride = require("method-override");
const bookRouter = require("./routes/routes");


require('dotenv').config()
const mongoURI = process.env.MONGO_URI
const mongoUser = process.env.MONGO_USER
const mongoPassword = process.env.MONGO_PASSWORD

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));

//router
app.use(bookRouter);

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


