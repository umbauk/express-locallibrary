const Genre = require('../models/genre');
const Book = require('../models/book');

exports.genre_list = (req, res, next) => {
  Genre.find()
    .sort([['name', 'asc']])
    .exec((err, list_of_genres) => {
      if (err) return next(err);
      res.render('genre_list', {
        title: 'Genre List',
        genre_list: list_of_genres,
      });
    });
};

exports.genre_detail = async (req, res, next) => {
  let [genre, genre_books] = await Promise.all([
    Genre.findById(req.params.id),
    Book.find({ genre: req.params.id }),
  ]);
  if (genre == null) {
    // No results.
    var err = new Error('Genre not found');
    err.status = 404;
    return next(err);
  }

  res.render('genre_detail', {
    title: 'Genre Detail',
    genre: genre,
    genre_books: genre_books,
  });
};

exports.genre_create_get = (req, res) =>
  res.send('NOT IMPLEMENTED: Genre create GET');

exports.genre_create_post = (req, res) =>
  res.send('NOT IMPLEMENTED: Genre create POST');

exports.genre_delete_get = (req, res) =>
  res.send('NOT IMPLEMENTED: Genre delete GET');

exports.genre_delete_post = (req, res) =>
  res.send('NOT IMPLEMENTED: Genre delete POST');

exports.genre_update_get = (req, res) =>
  res.send('NOT IMPLEMENTED: Genre update GET');

exports.genre_update_post = (req, res) =>
  res.send('NOT IMPLEMENTED: Genre update POST');
