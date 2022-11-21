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
        console.log(allBooks)
        res.render('bookshelf.ejs', { data: allBooks });
    });

})

//post new book to bookshelf from new page
router.post('/create', (req, res) => {
    bookSchema.create({ ...req.body, userid: req.oidc.user.sub }, (err, createbookData) => {
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
router.get('/new', (req, res) => {
    res.render('new.ejs');
});



module.exports = router;