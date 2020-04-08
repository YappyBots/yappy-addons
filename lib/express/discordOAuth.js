const express = require('express');
const got = require('got');
const router = express.Router();
const settings = require('.').settings;
const { DiscordUser } = require('../utils');

const CLIENT_ID = settings.CLIENT_ID;
const CLIENT_SECRET = settings.CLIENT_SECRET;
const host = settings.host;
const redirect = encodeURIComponent(`${host}/login/discord/callback`);

router.get('/login', (req, res) => {
    res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify+guilds&response_type=code&redirect_uri=${redirect}`);
});

router.get('/login/discord/callback', (req, res) => {
    if (!req.query.code) throw new Error('No code provided!');
    const code = req.query.code;
    const creds = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    got.post(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`, {
        headers: {
            Authorization: `Basic ${creds}`,
        },
    })
        .json()
        .then((body) => {
            const token = body.access_token;

            res.cookie('discord_access_token', token, {
                maxAge: 604800000,
            });
            DiscordUser.create(token);

            res.redirect(`${host}/dashboard`);
        });
});

module.exports = router;
