// Require dependencies
var express = require('express'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    fs = require('fs');

// App setup
var app = express();

app.use(session({
  name:   'sunrise',
  secret: 'mickeymouse',
  saveUninitialized: true,
  resave: true
}));
app.use(cookieParser());

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Uses EJS templates
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('./public'));

// Returns a book object w/ correct properties
var bookObj = function (info) {
  return {
    product_id: info.product_id,
    title: info.title,
    author: {
      first_name: info.author.first_name,
      last_name: info.author.last_name
    },
    msrp: info.msrp,
    ourprice: info.ourprice,
    tags: info.tags,
    pages: info.pages,
    publication: {
      year: info.publication.year,
      publisher: info.publication.publisher,
      type: info.publication.type
    },
    qty_stock: info.qty_stock
  };
}

// Validator to check fields when submitting new book
var isValidBook = function (data) {
  var errors = [],
      fields = ['product_id','title','first_name','last_name','msrp','ourprice','tags','pages','year','publisher','type','qty_stock'];

  fields.forEach(function (field) {
    if (!data[field]) {
      errors.push(field);
    }
  });

  return errors.length === 0;
};

var isUniqueId = function (books, productId) {
  var matches = 0;

  books.forEach(function (book) {
    if (book.product_id == productId) {
      matches++;
    }
  });

  return matches === 0;
};

// Middleware to grab books
// Checks session first, then books.json
// and saves to session variable "books"
var getBooks = function (req, res, next) {
  var dataStream = null,
      books = '';

  if (req.session.books) {
    next();
  } else {
    dataStream = fs.createReadStream('data/books.json');
    dataStream.on('data', function (chunk) {
      books += chunk;
    });

    dataStream.on('end', function () {
      req.session.books = JSON.parse(books);
      next();
    });
  }
};

app.use(getBooks);

// View routes
app.get('/', function (req, res) {
  res.render('index');
});

app.get('/form', function (req, res) {
  res.render('form');
});

// API routes
app.post('/api/books', function (req, res) {
  if (req.body && req.body.user_id === '1234') {
    if (!isValidBook(req.body)) {
      res.status(400).send('The data was not valid');
    } else {
      if (isUniqueId(req.session.books, req.body.product_id)) {
        // format data from form
        req.body.author = {
          first_name: req.body.first_name,
          last_name: req.body.last_name
        };

        req.body.publication = {
          year: req.body.year,
          publisher: req.body.publisher,
          type: req.body.type
        };

        req.body.tags = req.body.tags.replace(/;/g, ",");
        req.body.tags = req.body.tags.split(',');

        req.body.msrp = parseFloat(req.body.msrp).toFixed(2);
        req.body.ourprice = parseFloat(req.body.ourprice).toFixed(2);

        var book = bookObj(req.body);
        req.session.books.push(book);
        res.status(200).json(book);
      } else {
        res.status(400).json({ error: 'Product ID is already taken.' });
      }
    }
  } else {
    res.status(401).json({ error: 'Please provide a valid user ID' });
  }
});

app.get('/api/books/:book', function (req, res) {
  var result = null;

  req.session.books.forEach(function (book) {
    if (book.product_id == req.params.book) {
      result = book;
    }
  });

  if (result) {
    res.status(200).json(result);
  } else {
    res.status(404).json({ error: 'No match was found' });
  }
});

app.get('/api/publishers/:publisher', function (req, res) {
  var results = [];

  req.session.books.forEach(function (book) {
    if (book.publication.publisher.indexOf(req.params.publisher) > -1) {
      results.push(book);
    }
  });

  if (results.length) {
    res.status(200).json(results);
  } else {
    res.status(404).json({ error: 'No match was found' });
  }
});

// Run server
app.listen(3000, function () {
  console.log('Site is running at http://localhost:3000');
});
