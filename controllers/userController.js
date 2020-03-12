const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_DEV_SECRET } = require('../config');

const errorMessages = require('../errors/error-messages.json');
const Error404 = require('../errors/404-err');
const Error400 = require('../errors/400-err');
const Error401 = require('../errors/401-err');

const User = require('../models/user');

// eslint-disable-next-line consistent-return
module.exports.createUser = (req, res, next) => {
  if (Object.keys(req.body).length === 0) return new Error400(errorMessages.emptyRequestError);

  const {
    email, username, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email, username, password: hash,
    }))
    .then((user) => res.status(201).send({
      _id: user._id,
      username: user.username,
      email: user.email,
    }))
    .catch(() => next(new Error400(errorMessages.createUserError)));
};

module.exports.loginUser = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCreds(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET : JWT_DEV_SECRET,
        { expiresIn: '7d' },
      );

      res
        .status(201)
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          domain: 'newsexplo.gq',
          httpOnly: true,
          sameSite: true,
        })
        .send({ login: true });
    })
    .catch(() => {
      next(new Error401(errorMessages.ivalidCreds));
    });
};

module.exports.logoutUser = (req, res) => res
  .status(201)
  .cookie('jwt', '', {
    maxAge: 0,
    httpOnly: true,
    sameSite: false,
  })
  .send({ login: false });

module.exports.getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) throw Error;
      res.send({ username: user.username, email: user.email });
    })
    .catch(() => next(new Error404(errorMessages.userNotFoundError)));
};
