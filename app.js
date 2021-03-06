require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { celebrate, Joi, errors } = require('celebrate');

const userRouter = require('./routes/userRouter');
const articleRouter = require('./routes/articleRouter');
const { createUser, loginUser, logoutUser } = require('./controllers/userController');

const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const errorMessages = require('./errors/error-messages.json');
const Error404 = require('./errors/404-err');

const {
  PORT = 3000,
  RATE_LIMIT_MINUTES,
  RATE_LIMIT_QTY,
  NODE_ENV,
  MONGO,
} = process.env;

const { MONGO_DEV } = require('./config');

const limiter = rateLimit({
  windowMs: RATE_LIMIT_MINUTES * 60 * 1000,
  max: RATE_LIMIT_QTY,
});

const app = express();

mongoose
  .connect(NODE_ENV === 'production' ? MONGO : MONGO_DEV, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

const whitelist = [
  'https://newsexplo.gq',
  'http://newsexplo.gq',
  'http://localhost:8080',
];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.set('trust proxy', 1);
app.use(limiter);
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(requestLogger);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    password: Joi.string().required().min(8),
    email: Joi.string().email().required(),
    username: Joi.string().min(2).max(30).required(),
  }),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    password: Joi.string().required().min(8),
    email: Joi.string().email().required(),
  }),
}), loginUser);
app.get('/logout', logoutUser);

app.use('/users', auth, userRouter);
app.use('/articles', auth, articleRouter);
app.use('*', (req, res, next) => {
  next(new Error404(errorMessages.notFoundError));
});

app.use(errorLogger);
app.use(errors());

app.use((err, req, res) => {
  const {
    message,
    statusCode = 500,
  } = err;

  res.status(statusCode)
    .send({
      message: statusCode === 500 ? errorMessages.serverError : message,
    });
});

app.listen(PORT, () => { });
