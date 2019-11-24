const jwt = require('jsonwebtoken');
const { JWT_DEV_SECRET } = require('../config');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET : JWT_DEV_SECRET);
  } catch (err) {
    err.statusCode = 401;
    err.message = 'Authorisation required';
    next(err);
  }
  req.user = payload;

  next();
};
