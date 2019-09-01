const Author = require('../models/author');
const Book = require('../models/book');

exports.author_list = (req, res, next) => {
  Author.find()
    .sort([['family_name', 'ascending']])
    .exec((err, list_authors) => {
      if (err) return next(err);

      res.render('author_list', {
        title: 'Author List',
        author_list: list_authors,
      });
    });
};

exports.author_detail = async (req, res) => {
  let [author, authors_books] = await Promise.all([
    Author.findById(req.params.id),
    Book.find({ author: req.params.id }, 'title summary'),
  ]);
  if (author == null) {
    let err = new Error('Author not found');
    err.status = 404;
    return next(err);
  }

  res.render('author_detail', {
    title: 'Author Detail',
    author: author,
    author_books: authors_books,
  });
};

exports.author_create_get = (req, res) =>
  res.send('NOT IMPLEMENTED: Author create GET');

exports.author_create_post = (req, res) =>
  res.send('NOT IMPLEMENTED: Author create POST');

exports.author_delete_get = (req, res) =>
  res.send('NOT IMPLEMENTED: Author delete GET');

exports.author_delete_post = (req, res) =>
  res.send('NOT IMPLEMENTED: Author delete POST');

exports.author_update_get = (req, res) =>
  res.send('NOT IMPLEMENTED: Author update GET');

exports.author_update_post = (req, res) =>
  res.send('NOT IMPLEMENTED: Author update POST');
