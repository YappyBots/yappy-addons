const express = require('express');
const got = require('got');
const router = express.Router();
const settings = require('.').settings;
const { DiscordUser } = require('../utils');

const CLIENT_ID = settings.CLIENT_ID;
const CLIENT_SECRET = settings.CLIENT_SECRET;
const host = settings.host;
const redirect = `${host}/login/discord/callback`;

router.get('/login', (req, res) => {
    res.redirect(`https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify%20guilds&response_type=code&redirect_uri=${redirect}`);
});

router.get('/login/discord/callback', (req, res) => {
    if (!req.query.code) throw new Error('No code provided!');
    const code = req.query.code;
    const creds = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    got.post(`https://discord.com/api/oauth2/token`, {
        form: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirect,
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
        })
        .catch((err) => {
            Log.error(err);
            res.status(err.status || 500).send('Failed to log you in. ' + err);
        });
});

module.exports = router;
