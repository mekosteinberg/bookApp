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
        search,
    } = req.query;

    //ensures that the full list always sorts ascending by title
    const sortBy = !req.query.sortBy
        ? 'title'
        : req.query.sortBy

    const sortDirection = !req.query.sortDirection
        ? 1 // 1 is asc, -1 is desc
        : req.query.sortDirection === 'desc'
            ? -1
            : 1 // safely fall back to asc sort in case somoene is playing with the url

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

    const bookAggregate = [];


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


    // if user chose to search, don't use filter matches, just
    // use the search phrase they sent in
    if (search) {
        const searchStage =
        {
            '$search': {
                'index': 'bookSearch',
                'compound': {
                    'must': [
                        {
                            'text': {
                                'query': req.oidc.user.sub,
                                'path': 'userid'
                            }
                        }, {
                            'text': {
                                'query': decodeURIComponent(search), // search terms, decode, because we encoded in app.js 
                                'path': [
                                    'title', 'authorFirst', 'authorLast'
                                ],
                                'fuzzy': {
                                    'maxExpansions': 5,
                                    'maxEdits': 1
                                }
                            }
                        }
                    ]
                }
            }
        }

        // Have to use project to get access to the search score
        // so results can be limited to ones with strong match. trying to
        // avoid matching titles with "of" when searching "return of" 
        const projectWithScore = {
            '$project': {
                'userid': 1,
                'authorFirst': 1,
                'authorLast': 1,
                'title': 1,
                'own': 1,
                'readStatus': 1,
                'tags': 1,
                'score': {
                    '$meta': 'searchScore' // this gets the search score, so less "strong" results are excluded in the match stage below
                }
            }
        }

        const matchHigherSearchScore = {
            '$match': {
                'score': {
                    '$gte': 0.6 // played around a lot with this, some exact matches still have a low score, so this seemed the right spot currently
                }
            }
        }

        bookAggregate.push(searchStage, projectWithScore, matchHigherSearchScore)
    } else {
        const match = {
            $match: bookQuery
        }
        const sort = {
            $sort: {
                [sortBy]: sortDirection
            }
        }
        bookAggregate.push(match, sort)
    }

    bookAggregate.push({
        '$skip': (page - 1) * limit
    }, {
        '$limit': limit * 1
    })

    console.log('----aggregate', JSON.stringify(bookAggregate))

    const allBooks = await bookSchema.aggregate(bookAggregate)

    // TODO remove these. not needed with aggregate pipeline doing sort, skip, limit    
    // .sort({ [sortBy]: sortDirection })
    // .skip((page - 1) * limit)
    // .limit(limit * 1);

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