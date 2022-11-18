const express = require('express');
const app = express();
const mongoose = require("mongoose");
const db = mongoose.connection;
const methodOverride = require("method-override");
const bookRouter = require("./routes/routes");

require('dotenv').config()
const mongoURI = process.env.MONGO_URI

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));

// app.use(bookRouter);

mongoose.connect(mongoURI, () => {
    console.log("Database is connected");
  });

app.listen(3000, () => console.log("Reading on port 3000"));
