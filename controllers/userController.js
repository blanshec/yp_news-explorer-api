const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Error404 = require('../errors/not-found-err');

const User = require('../models/user');

// eslint-disable-next-line consistent-return
module.exports.createUser = (req, res, next) => {
  if (Object.keys(req.body).length === 0) return res.status(400).send({ message: 'Empty request body' });

  const {
    name, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    }))
    .then((user) => res.status(201).send({
      _id: user._id,
      name: user.name,
      email: user.email,
    }))
    .catch(() => {
      const err = new Error('Error creating a user');
      err.statusCode = 400;
      next(err);
    });
};

module.exports.loginUser = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCreds(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );

      res.status(201).cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      }).send({ message: 'User logged in' });
    })
    .catch((e) => {
      const err = new Error(e.message);
      err.statusCode = 401;
      next(err);
    });
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) throw Error;
      res.send({ data: user });
    })
    .catch(() => next(new Error404(`User with this id does not exist ${req.user._id}`)));
};
