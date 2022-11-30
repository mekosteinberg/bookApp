# Book Dragon 
[BookDragon Heroku](https://bookdragon.herokuapp.com/)
[Meko's Github bookapp](https://github.com/mekosteinberg/bookApp)

![Wireframe](/Screen%20Shot%202022-11-23%20at%204.04.41%20PM.png)

## Technologies used
- Express/Node
- EJS
- Bootstrap/CSS
- Heroku
- Mongo Atlas/Compass
- jQuery/JavaScript
- Auth0

## Unsolved Problems
One thing I never finished was in my filter modal. The tags (genre tags) is one long scrollable column, instead of having it wrap and list them in a more visually friendly fashion

App doesnt automatically redirect to 'https:' for mobile.

Many books have multiple authors, I would revamp the author to either be able to add a second author or change the schema to make authors an array.

Be able to expand the search to find the books available online to purchase.

Be able to load book data with an API to include pictures/skus

Rate books and add personal comments and thoughts.

## Approach Taken
I started with my wireframe and basic thoughts on functionality of an app. I dont like lots of hidden features in an app so I wanted to keep it simple and intuitive for people to use.

Started with the normal file setups, partials, HTML, express and ejs until it was functional and working but very little layout.

Started to add styles with bootstrap and more found much more functionality. Forms, inputs, radios, checkboxes were super handy in this, especially later when it came time to use them for sorting and filtering purposes.

I decided to implement login with Auth0 instead of creating and owning my own since most companies go this route.

Data filtering was my big push on this project and I spent countless hours researching and looking at documentation for JQuery, MongoDB and lots of other sources to get my two features working. 

## Links to some Resources
Bootstrap Crash Course WebDevSimplified on Youtube https://www.youtube.com/watch?v=Jyvffr3aCp0

Login tactic used: Auth0
https://auth0.com/docs/authenticate/login/auth0-universal-login

npm install express express-openid-connect --save

to set query string params
https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/set

[Truncating text with CSS](https://www.youtube.com/watch?v=GxpUp0FecEw)
[Truncate with ellipsis](https://www.youtube.com/watch?v=HRBAXPSXfcM)

[Basic Ternary info](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator)

## Exports from Compass
filter aggregate
```js
[
  {
    '$match': {
      'userid': req.oidc.user.sub, 
      'readStatus': {
        '$in': [
          'read'
        ]
      }, 
      '$or': [
        {
          'own.paper': true
        }
      ], 
      'tags': {
        '$all': [
          'Fantasy'
        ]
      }
    }
  }, {
    '$sort': {
      'title': 1
    }
  }, {
    '$skip': 0
  }, {
    '$limit': 10
  }
]
```

search aggregate
```js
[
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
              'query': search, // search terms 
              'path': [
                'title', 'authorFirst', 'authorLast'
              ], 
              'fuzzy': {
                'maxExpansions': 3
              }
            }
          }
        ]
      }
    }
  }, {
    '$project': {
      'userid': 1, 
      'authorFirst': 1, 
      'authorLast': 1, 
      'title': 1, 
      'own': 1, 
      'readStatus': 1, 
      'tags': 1, 
      'score': {
        '$meta': 'searchScore'
      }
    }
  }, {
    '$match': {
      'score': {
        '$gte': 1
      }
    }
  }, {
    '$skip': 0
  }, {
    '$limit': 10
  }
]
```