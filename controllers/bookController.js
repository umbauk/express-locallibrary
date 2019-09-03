const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.index = async (req, res) => {
  let [
    book_count,
    book_instance_count,
    book_instance_available_count,
    author_count,
    genre_count,
  ] = await Promise.all([
    Book.countDocuments(),
    BookInstance.countDocuments(),
    BookInstance.countDocuments({ status: 'Available' }),
    Author.countDocuments(),
    Genre.countDocuments(),
  ]);
  res.render('index', {
    title: 'Local Library Home',
    //error: err,
    data: {
      book_count: book_count,
      book_instance_count: book_instance_count,
      book_instance_available_count: book_instance_available_count,
      author_count: author_count,
      genre_count: genre_count,
    },
  });
};

exports.book_list = (req, res, next) => {
  Book.find({}, 'title author')
    .populate('author')
    .exec((err, list_books) => {
      if (err) return next(err);
      res.render('book_list', { title: 'Book List', book_list: list_books });
    });
};

exports.book_detail = async (req, res, next) => {
  let [book, book_instance] = await Promise.all([
    Book.findById(req.params.id)
      .populate('author')
      .populate('genre'),

    BookInstance.find({ book: req.params.id }),
  ]);

  if (book == null) {
    let err = new Error('Book not found');
    err.status = 404;
    return next(err);
  }
  res.render('book_detail', {
    title: book.title,
    book: book,
    book_instances: book_instance,
  });

  res.render('index', {
    title: 'Local Library Home',
    //error: err,
    data: {
      book_count: book_count,
      book_instance_count: book_instance_count,
      book_instance_available_count: book_instance_available_count,
      author_count: author_count,
      genre_count: genre_count,
    },
  });
};
exports.book_create_get = async (req, res, next) => {
  let [authors, genres] = await Promise.all([Author.find(), Genre.find()]);

  res.render('book_form', {
    title: 'Create Book',
    authors: authors,
    genres: genres,
  });
};

exports.book_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate fields.
  body('title', 'Title must not be empty.')
    .isLength({ min: 1 })
    .trim(),
  body('author', 'Author must not be empty.')
    .isLength({ min: 1 })
    .trim(),
  body('summary', 'Summary must not be empty.')
    .isLength({ min: 1 })
    .trim(),
  body('isbn', 'ISBN must not be empty')
    .isLength({ min: 1 })
    .trim(),

  // Sanitize fields (using wildcard).
  sanitizeBody('*').escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      let [authors, genres] = await Promise.all([Author.find(), Genre.find()]);

      // Mark our selected genres as checked.
      for (let i = 0; i < genres.length; i++) {
        if (book.genre.indexOf(genres[i]._id) > -1) {
          genres[i].checked = 'true';
        }
      }
      res.render('book_form', {
        title: 'Create Book',
        authors: authors,
        genres: genres,
        book: book,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Save book.
      book.save(function(err) {
        if (err) {
          return next(err);
        }
        //successful - redirect to new book record.
        res.redirect('../../' + book.url);
      });
    }
  },
];

exports.book_delete_get = (req, res) =>
  res.send('NOT IMPLEMENTED: Book delete GET');

exports.book_delete_post = (req, res) =>
  res.send('NOT IMPLEMENTED: Book delete POST');

exports.book_update_get = async (req, res, next) => {
  let [book, authors, genres] = await Promise.all([
    Book.findById(req.params.id)
      .populate('author')
      .populate('genre'),
    Author.find(),
    Genre.find(),
  ]);

  if (book == null) {
    let err = new Error('Book not found');
    err.status = 404;
    return next(err);
  }
  for (var all_g_iter = 0; all_g_iter < genres.length; all_g_iter++) {
    for (var book_g_iter = 0; book_g_iter < book.genre.length; book_g_iter++) {
      if (
        genres[all_g_iter]._id.toString() ==
        book.genre[book_g_iter]._id.toString()
      ) {
        genres[all_g_iter].checked = 'true';
      }
    }
  }
  res.render('book_form', {
    title: 'Update Book',
    authors: authors,
    genres: genres,
    book: book,
  });
};

exports.book_update_post = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate fields.
  body('title', 'Title must not be empty.')
    .isLength({ min: 1 })
    .trim(),
  body('author', 'Author must not be empty.')
    .isLength({ min: 1 })
    .trim(),
  body('summary', 'Summary must not be empty.')
    .isLength({ min: 1 })
    .trim(),
  body('isbn', 'ISBN must not be empty')
    .isLength({ min: 1 })
    .trim(),

  // Sanitize fields.
  sanitizeBody('title').escape(),
  sanitizeBody('author').escape(),
  sanitizeBody('summary').escape(),
  sanitizeBody('isbn').escape(),
  sanitizeBody('genre.*').escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === 'undefined' ? [] : req.body.genre,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      let [authors, genres] = await Promise.all([Author.find(), Genre.find()]);

      // Mark our selected genres as checked.
      for (let i = 0; i < genres.length; i++) {
        if (book.genre.indexOf(genres[i]._id) > -1) {
          genres[i].checked = 'true';
        }
      }
      res.render('book_form', {
        title: 'Update Book',
        authors: authors,
        genres: genres,
        book: book,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      Book.findByIdAndUpdate(req.params.id, book, {}, function(err, thebook) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to book detail page.
        res.redirect('../../../' + thebook.url);
      });
    }
  },
];
