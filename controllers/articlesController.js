const Article = require('../models/article');

const errorMessages = require('../errors/error-messages.json');
const Error500 = require('../errors/500-err');
const Error404 = require('../errors/404-err');
const Error403 = require('../errors/403-err');

module.exports.createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;

  const owner = req.user._id;

  Article.create({
    keyword, title, text, date, source, link, image, owner,
  })
    .then((article) => res.send(article))
    .catch(() => next(new Error500(errorMessages.createArticleError)));
};

module.exports.getArticles = (req, res, next) => {
  Article.find({ owner: req.user._id })
    .populate('owner')
    .then((articles) => res.send({ data: articles }))
    .catch(() => next(new Error500(errorMessages.readArticleListError)));
};

module.exports.deleteArticle = (req, res, next) => {
  Article.findById(req.params.id).select('+owner')
    // eslint-disable-next-line consistent-return
    .then((article) => {
      if (JSON.stringify(article.owner) !== JSON.stringify(req.user._id)) {
        throw new Error403(errorMessages.articleOwnerError);
      }

      Article.remove(article)
        .then((articleToDelete) => res.send(
          articleToDelete !== null
            ? { data: article }
            : { data: errorMessages.noDataToDelete },
        ))
        .catch(() => { throw new Error500(errorMessages.deleteArticleError); });
    })
    .catch((err) => next(err.statusCode ? err : new Error404(errorMessages.articleNotFoundError)));
};
