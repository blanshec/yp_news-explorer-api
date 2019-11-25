const mongoose = require('mongoose');
const validate = require('validator');
const bcrypt = require('bcryptjs');

const errorMessages = require('../errors/error-messages.json');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validate.isEmail(v),
      message: errorMessages.invalidEmail,
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
});

// eslint-disable-next-line func-names
userSchema.statics.findUserByCreds = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw Promise.reject(new Error(errorMessages.ivalidCreds));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw Promise.reject(new Error(errorMessages.invalidCreds));
          }
          return user;
        });
    })
    .catch((error) => error);
};

module.exports = mongoose.model('user', userSchema);
