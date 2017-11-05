const express = require('express');
const { bot } = require('./');

const router = express.Router();
let commands;

router.get('/', (req, res) => {
  if (!commands) commands = bot.commands.map(e => e.toJSON());

  res.render('commands', {
    bot, commands,
    layout: 'layouts/main',
    err: ' ',
    title: `Commands | ${bot.user.username}`,
  });
});

module.exports.router = router;
module.exports.updateCommands = () => commands = bot.commands.map(e => e.toJSON());
