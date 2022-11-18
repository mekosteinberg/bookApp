const express = require('express');
const app = express();

require('dotenv').config()
const mongoURI = process.env.MONGO_URI