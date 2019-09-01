const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

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
exports.book_create_get = (req, res) =>
  res.send('NOT IMPLEMENTED: Book create GET');

exports.book_create_post = (req, res) =>
  res.send('NOT IMPLEMENTED: Book create POST');

exports.book_delete_get = (req, res) =>
  res.send('NOT IMPLEMENTED: Book delete GET');

exports.book_delete_post = (req, res) =>
  res.send('NOT IMPLEMENTED: Book delete POST');

exports.book_update_get = (req, res) =>
  res.send('NOT IMPLEMENTED: Book update GET');

exports.book_update_post = (req, res) =>
  res.send('NOT IMPLEMENTED: Book update POST');
