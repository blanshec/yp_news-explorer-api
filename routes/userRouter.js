const usersRouter = require('express').Router();
const { getUser } = require('../controllers/userController');

usersRouter.get('/me', getUser);


module.exports = usersRouter;
