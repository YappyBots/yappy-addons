const express = require('express');
const path = require('path');
const { bot, models: {
  ChannelConfig, ServerConfig,
} } = require('./');
const { DiscordUser, statistics } = require('../utils');

const router = express.Router();
const viewsPath = path.resolve(__dirname, '../../views/dashboard');

const getBotStatus = () => { // eslint-disable-line arrow-body-style
  return {
    status: bot.statuses[bot.status],
    statusColor: bot.statusColors[bot.status],
  };
};

router.use((req, res, next) => {
  const token = req.cookies.discord_access_token;
  if (token) req.user = DiscordUser.get(token);
  next();
});

router.get('/', (req, res, next) => {
  const code = req.cookies.discord_access_token;
  if (!code) return res.redirect('/login');
  req.user.getGuildsWhereAdmin()
  .then(data => {
    const status = bot.statuses[bot.status];
    const statusColor = bot.statusColors[bot.status];
    const guilds = data.filter(g => bot.guilds.has(g.id));

    res.render(`${viewsPath}/index`, {
      guilds, bot, status, statusColor,
      layout: 'dashboard/layout',
      user: req.user,
      title: `Dashboard | ${bot.user.username}`,
    });
  }).catch(err => {
    next(err);
  });
});

router.get('/admin/statistics', (req, res, next) => {
  if (bot.config.owner.includes(req.user.id)) {
    const { status, statusColor } = getBotStatus(bot);
    res.render('dashboard/admin', {
      bot, status, statusColor, statistics,
      title: `Statistics - Dashboard | ${bot.user.username}`,
      layout: 'dashboard/layout',
      user: req.user,
    });
  } else {
    next({ status: 404, code: 'NOT_FOUND' });
  }
});

router.get('/admin/statistics/json', (req, res, next) => {
  if (bot.config.owner.includes(req.user.id)) {
    res.json({
      cpu: statistics.cpu,
      prc: statistics.prc,
      ram: statistics.ram,
    });
  } else {
    next({ status: 404, code: 'NOT_FOUND' });
  }
});

router.get('/:guildID', (req, res, next) => {
  const code = req.cookies.discord_access_token;
  if (!code) return res.redirect('/login');

  req.user.getGuildsWhereAdmin()
  .then(guilds => {
    const { status, statusColor } = getBotStatus(bot);
    const guild = guilds.filter(g => g.id === req.params.guildID && bot.guilds.has(g.id))[0];
    const channels = bot.guilds.get(guild.id).channels
    .filterArray(ch => ch.type === 'text')
    .sort((a, b) => a.position < b.position ? -1 : 1);

    if (!guild) return Promise.reject({ status: 404, code: 'NOT_FOUND', message: 'Guild Not Found' });

    res.render(`dashboard/guild`, {
      bot, status, statusColor, guild, channels,
      title: `${guild.name} - Dashboard | ${bot.user.username}`,
      layout: 'dashboard/layout',
      user: req.user,
      conf: {
        global: ServerConfig.get(guild.id),
      },
    });
  }).catch(err => {
    next(err);
  });
});

router.get('/:guildID/:channelID', (req, res, next) => {
  const code = req.cookies.discord_access_token;
  if (!code) return res.redirect('/login');

  req.user.getGuildsWhereAdmin()
  .then(guilds => {
    const guild = guilds.filter(g => g.id === req.params.guildID)[0];
    const channel = bot.channels.get(req.params.channelID);

    if (!guild) return Promise.reject({ status: 404, code: 'NOT_FOUND', message: 'Guild Not Found' });
    if (!channel) return Promise.reject({ status: 404, code: 'NOT_FOUND', message: 'Channel Not Found' });

    res.render(`dashboard/channel`, {
      bot, guild, channel,
      layout: 'dashboard/layout',
      user: req.user,
      title: `${guild.name} #${channel.name} - Dashboard | ${bot.user.username}`,
      conf: {
        global: ServerConfig.get(guild.id),
        channel: ChannelConfig._data.get(channel.id),
      },
    });
  })
  .catch(next);
});

router.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err && err.status !== 404) Log.error(err);
  res.status(err.status || 500);
  if (!err.status) err.status = 500;
  res.render('dashboard/error', {
    bot, err,
    layout: 'dashboard/layout',
    path: req.path,
  });
});

module.exports = router;
