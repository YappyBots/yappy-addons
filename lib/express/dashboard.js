const express = require('express');
const path = require('path');
const { bot } = require('./');
const { DiscordUser } = require('../utils');

const statuses = ['Online', 'Connecting', 'Reconnecting', 'Idle', 'Nearly', 'Offline'];

const router = express.Router();

router.use((req, res, next) => {
  const token = req.cookies.discord_access_token;
  if (token) req.user = new DiscordUser(token, bot);
  next();
});

router.get('/', (req, res, next) => {
  const code = req.cookies.discord_access_token;
  if (!code) return res.redirect('/login');
  req.user.getGuildsWhereAdmin()
  .then(guilds => {
    guilds = guilds.slice(0).filter(e => e.name.includes('Testing') || e.name.includes('Yappy'));
    res.render(path.resolve(__dirname, '../../views/dashboard/index'), {
      guilds,
      bot,
      user: req.user,
      layout: 'layout',
      title: 'Dashboard | Yappy, the GitLab Monitor',
    })
  }).catch(err => {
    next(err);
  });
});

module.exports = router;
