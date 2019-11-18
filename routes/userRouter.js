const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getUser } = require('../controllers/userController');

usersRouter.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum(),
  }),
}), getUser);


module.exports = usersRouter;
