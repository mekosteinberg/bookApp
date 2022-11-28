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
    // https://dev.to/hakimraissi/pagination-with-express-and-mongoose-pnh
    const {
        page = 1,
        limit = 10,
    } = req.query;

    //ensures that the full list always sorts ascending by title
    const sortBy = !req.query.sortBy
        ? 'title'
        : req.query.sortBy

    const sortDirection = !req.query.sortDirection
        ? 'asc'
        : req.query.sortDirection

    //guarantee that these are always an array or undefined
    const filtertags = req.query.tags && Array.isArray(req.query.tags)
        ? req.query.tags
        : req.query.tags
            ? [req.query.tags]
            : undefined

    const bookFormat = req.query.bookFormat && Array.isArray(req.query.bookFormat)
        ? req.query.bookFormat
        : req.query.bookFormat
            ? [req.query.bookFormat]
            : undefined

    const readStatus = req.query.readStatus && Array.isArray(req.query.readStatus)
        ? req.query.readStatus
        : req.query.readStatus
            ? [req.query.readStatus]
            : undefined

    const bookQuery = {
        userid: req.oidc.user.sub
    }
    //filter with read Status
    // https://www.mongodb.com/docs/manual/reference/operator/query/
    if (readStatus) {
        // if (Array.isArray(readStatus)) {
        bookQuery.readStatus = {
            $in: readStatus
        }
        // } else {
        //     bookQuery.readStatus = readStatus
        // }
    }

    //filter with Own Status (Paper/Audio/ebook) 
    if (bookFormat) {
        // if (Array.isArray(bookFormat)) {
        bookQuery['$or'] = []
        bookFormat.forEach(item => {
            bookQuery['$or'].push({ ['own.' + item]: true })
            //example: checks when clicked to see if own.paper: true in the database
        })
        // } else {
        //     //if only one item is checked in the filter box then it doesnt go through the 'or' function and checks if its true
        //     //own is wrapped in brackets because it needs to pull the value of own, not use the key own.
        //     bookQuery['own.' + bookFormat] = true
        // }
    }

    //filter with tags (genre tags)
    if (filtertags) {
        bookQuery.tags = { $all: filtertags }
    }
    console.log(bookQuery)

    const allBooks = await bookSchema.find(bookQuery)
        .sort({ [sortBy]: sortDirection })
        .skip((page - 1) * limit)
        .limit(limit * 1);

    const count = await bookSchema.count(bookQuery);

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
        }, {
            $sort: { tag: 1 }
        }
    ])

    res.render('bookshelf.ejs', { data: allBooks, sortBy, sortDirection, tags, filtertags, readStatus, bookFormat, count, page, limit });

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