const jwt = require('jsonwebtoken');
const { JWT_DEV_SECRET } = require('../config');

const errorMessages = require('../errors/error-messages.json');
const Error401 = require('../errors/401-err');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET : JWT_DEV_SECRET);
  } catch (err) {
    throw new Error401(errorMessages.authError);
  }
  req.user = payload;

  next();
};
