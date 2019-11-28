const express = require('express');
const path = require('path');
const Swag = require('swag');
const cookieParser = require('cookie-parser');
const hbs = require('hbs');

const app = express();

hbs.registerHelper('initials', str =>
    str
        .split(' ')
        .map(e => e[0].replace(/[^a-zA-Z0-9_]/g, ''))
        .join('')
);
hbs.registerHelper('host', () => exports.settings.host);
hbs.registerHelper('url', str => exports.settings.host + str);
hbs.registerHelper('includes', function includes(obj, item, options) {
    return obj.includes && obj.includes(item) ? options.fn(this) : options.inverse(this);
});

Swag.registerHelpers(hbs);

exports.middleware = (bot, models, settings) => {
    exports.bot = bot;
    exports.models = models;
    exports.settings = settings || {};

    app.set('view engine', 'hbs');
    app.set('views', path.resolve(__dirname, '../../views'));

    app.use(cookieParser());
    app.use('/assets', express.static(path.resolve(__dirname, '../../public')));
    app.use(require('./discordOAuth'));
    app.use('/commands', require('./commands').router);
    app.use('/dashboard', require('./dashboard'));
    app.use('/logout', require('./logout'));

    return app;
};
