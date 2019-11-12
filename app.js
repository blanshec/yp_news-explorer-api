require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const { PORT = 3000 } = process.env;
const app = express();

mongoose
  .connect(process.env.NODE_ENV === 'production' ? process.env.MONGO : 'mongodb://localhost:27017/news-explorer-api', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());


app.listen(PORT, () => { });
