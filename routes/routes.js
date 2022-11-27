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
router.get('/bookshelf', requiresAuth(), async (req, res) => {
    console.log('-----query params', req.query)
    const {
        sortBy,
        sortDirection,
        skip,
        limit,
        tag,
    } = req.query;

    const allBooks = await bookSchema.find({ userid: req.oidc.user.sub })
        .sort({ [sortBy]: sortDirection })
        .skip(skip || 0)
        .limit(limit || 10);

    const tags = await bookSchema.aggregate([
        {
            // only get books for this user
            '$match': {
                'userid': req.oidc.user.sub
            }
        }, {
            // grab just the tags field
            '$project': {
                'tags': 1,
                '_id': 0
            }
        }, {
            // flatten the arrays into individual items
            '$unwind': {
                'path': '$tags'
            }
        }, {
            // deduplicate tags
            '$group': {
                '_id': {
                    'tag': '$tags'
                },
                'tag': {
                    '$first': '$tags'
                }
            }
        }
    ])

    console.log(tags)
    res.render('bookshelf.ejs', { data: allBooks, sortBy, sortDirection, tags });

});

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

//book details
router.get('/bookshelf/:id', requiresAuth(), (req, res) => {
    bookSchema.findOne({ userid: req.oidc.user.sub, _id: req.params.id }, (err, data) => {
        if (err) console.log(err)
        res.render('bookdetails.ejs', { data });
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

//edit/update to booklist
router.get('/bookshelf/:id/edit', requiresAuth(), (req, res) => {
    bookSchema.findOne({ userid: req.oidc.user.sub, _id: req.params.id }, (err, foundBook) => {
        const genretag = foundBook.tags.join(' ');
        //.toObject required to remove mongoose functions. Mongo function didnt work with spread(...)
        const data = { ...foundBook.toObject(), genretag }
        res.render('edit.ejs', { data });
    });
});

router.put("/bookshelf/:id", requiresAuth(), (req, res) => {
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
    bookSchema.findOneAndUpdate({ userid: req.oidc.user.sub, _id: req.params.id }, book, (err, editData) => {
        console.log(err)
        res.redirect('/bookshelf');
    });
});

//delete book
router.delete('/bookshelf/:id', (req, res) => {
    bookSchema.findByIdAndRemove({ userid: req.oidc.user.sub, _id: req.params.id }, (err, data) => {
        res.redirect('/bookshelf');
    });
});




module.exports = router;