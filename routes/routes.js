const express = require('express');
const router = express.Router();
const bookSchema = require('../models/bookschema');
const bookseed = require('../models/seed.js');
const { requiresAuth } = require('express-openid-connect');

//homepage
router.get('/', (req, res) => {
    if (req.oidc.user) {
        res.redirect('/bookshelf')
    } else {
        res.render('home.ejs')
    }
});

//bookshelf/list
router.get('/bookshelf', requiresAuth(), (req, res) => {
    bookSchema.find({}, (err, allBooks) => {
        if (err) console.log(err)
        res.render('bookshelf.ejs', { data: allBooks });
    });

})

//post new book to bookshelf from new page
router.post('/create', requiresAuth(), (req, res) => {
    const own = {
        paper: false,
        audio: false,
        ebook: false,
    }
    //mapping values set in the webform to the mongoose dataset
    if (req.body.paper === 'on') {
        own.paper = true
    }
    if (req.body.audio === 'on') {
        own.audio = true
    }
    if (req.body.ebook === 'on') {
        own.ebook = true
    }
    const genretag = req.body.genretag
    const tags = genretag.split(' ');
    const book = { ...req.body, own, userid: req.oidc.user.sub, tags }
    console.log(book);
    bookSchema.create(book, (err, createbookData) => {
        console.log(err)
        res.redirect('/bookshelf')
    });
});

//seed
router.get('/seed', (req, res) => {
    bookSchema.create(bookseed, (err, data) => {
        if (err) res.send(err.message)
        res.send('added book data');
    });
});

//add new / post to booklist
router.get('/new', requiresAuth(), (req, res) => {
    res.render('new.ejs');
});



module.exports = router;