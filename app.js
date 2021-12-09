const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { Sequelize } = require('sequelize');
const routes = require('./src/routes');
const DB = require('./src/config/database');
const sequelize = new Sequelize(DB.development);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//test database connection
try {
  sequelize.authenticate();
  console.log('Connection to the database has been established successfully');
} catch (error) {
  console.log('Error connecting to the database:', error);
}

app.use(routes);

// TODO: add react for google sign in page
// TODO: use mongoDB instead of postgres

module.exports = app;
