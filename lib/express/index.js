const express = require('express');
const path = require('path');
const Swag = require('swag');
const cookieParser = require('cookie-parser');
const hbs = require('hbs');

const app = express();
let host;

hbs.registerHelper('initials', (str) => str.split(' ').map(e => e[0].replace(/[^a-zA-Z0-9_]/g, '')).join(''));
hbs.registerHelper('host', () => host);
Swag.registerHelpers(hbs);

exports.middleware = (bot, models, settings) => {
  exports.bot = bot;
  exports.models = models;
  exports.settings = settings;

  app.set('view engine', 'hbs');
  app.set('views', path.resolve(__dirname, '../../views'));

  app.use((req, res, next) => {
    if (!host) {
      const hostWithPort = settings.port ? `${req.hostname}:${settings.port}` : req.hostname;
      let pathname = req.originalUrl.replace(req.path, '/').replace(/\/\//g, '/');
      if (pathname === '/') pathname = '';
      host = `${req.protocol}://${hostWithPort}${pathname}`;
      Log.debug(host);
    }
    next();
  });

  app.use(cookieParser());
  app.use('/assets', express.static(path.resolve(__dirname, '../../public')));
  app.use(require('./discordOAuth'));
  app.use('/dashboard', require('./dashboard'));

  return app;
};
