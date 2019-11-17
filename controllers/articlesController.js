const Article = require('../models/article');

const Error500 = require('../errors/500-err');
const Error404 = require('../errors/not-found-err');

module.exports.createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;

  const owner = req.user._id;

  Article.create({
    keyword, title, text, date, source, link, image, owner,
  })
    .then((article) => res.send(article))
    .catch((err) => next(new Error500(`Error creating an article:  ${err.message}`)));
};

module.exports.getArticles = (req, res, next) => {
  Article.find({})
    .populate('owner')
    .then((articles) => res.send({ data: articles }))
    .catch(() => next(new Error500('Error reading article list')));
};

module.exports.deleteArticle = (req, res, next) => {
  Article.findById(req.params.id).select('+owner')
    // eslint-disable-next-line consistent-return
    .then((article) => {
      if (JSON.stringify(article.owner) !== JSON.stringify(req.user._id)) {
        const notArticleOwner = new Error('You cant delete what you dont own');
        notArticleOwner.statusCode = 403;
        throw notArticleOwner;
      }

      Article.remove(article)
        .then((articleToDelete) => res.send(articleToDelete !== null ? { data: article } : { data: 'Nothing to delete' }))
        .catch(() => { throw new Error500('Error deleting article'); });
    })
    .catch((err) => next(err.statusCode ? err : new Error404('There is no such article')));
};
