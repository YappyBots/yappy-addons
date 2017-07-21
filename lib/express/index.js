const express = require('express');
const cookieParser = require('cookie-parser');

const app = express.Router();

exports.middleware = (bot, models, settings) => {
  exports.bot = bot;
  exports.models = models;
  exports.settings = settings;

  app.use(cookieParser());
  app.use(require('./discordOAuth'));
  app.use('/dashboard', require('./dashboard'));

  return app;
};
