const express = require('express');
const router = express.Router();
const bookSchema = require('../models/bookschema');
const bookseed = require('../models/seed.js');


//homepage
router.get('/', (req, res) => {
    bookSchema.find({}, (err, allBooks) => {
        if (err) console.log(err)
        console.log(allBooks)
        res.render('home.ejs', { data: allBooks });
    });
});

//bookshelf/list
router.get('/bookshelf', (req, res) => {
    res.render('bookshelf.ejs')
})

//post new book to bookshelf from new page
router.post('/create', (req, res) => {
    bookSchema.create(req.body, (err, createbookData) => {
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