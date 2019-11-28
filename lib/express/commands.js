const express = require('express');
const { bot } = require('./');

const router = express.Router();
let commands;

router.get('/', (req, res) => {
    if (!commands) module.exports.updateCommands();

    res.render('commands', {
        bot,
        commands,
        layout: 'layouts/main',
        err: ' ',
        title: `Commands | ${bot.user.username}`,
    });
});

module.exports.router = router;
module.exports.updateCommands = () => (commands = bot.commands.filter(e => e.conf.permLevel < 2).map(e => e.toJSON()));