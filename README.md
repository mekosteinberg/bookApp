Bootstrap Crash Course WebDevSimplified on Youtube https://www.youtube.com/watch?v=Jyvffr3aCp0


Login tactic used: Auth0
https://auth0.com/docs/authenticate/login/auth0-universal-login

npm install express express-openid-connect --save


to set query string params
https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/set


[Truncating text with CSS](https://www.youtube.com/watch?v=GxpUp0FecEw)
[Truncate with ellipsis](https://www.youtube.com/watch?v=HRBAXPSXfcM)

[Basic Ternary info](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator)

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