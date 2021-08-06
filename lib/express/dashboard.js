const express = require('express');
const path = require('path');
const {
    bot,
    settings,
    models: { Channel, Guild },
} = require('./');
const { DiscordUser, statistics } = require('../utils');

const router = express.Router();
const viewsPath = path.resolve(__dirname, '../../views/dashboard');

const getBotStatus = () => {
    return {
        status: bot.statuses[bot.status],
        statusColor: bot.statusColors[bot.status],
    };
};

router.use(async (req, res, next) => {
    const token = req.cookies.discord_access_token;
    if (!token) return res.redirect(`${settings.host}/login`);
    req.user = await DiscordUser.get(token);
    next();
});

router.get('/', async (req, res, next) => {
    const data = await req.user.getGuildsWhereAdmin();

    const status = bot.statuses[bot.status];
    const statusColor = bot.statusColors[bot.status];
    const guilds = await data.filter((g) => bot.guilds.cache.get(g.id));

    res.render(`${viewsPath}/index`, {
        guilds,
        bot,
        status,
        statusColor,
        layout: 'layouts/main',
        user: req.user,
        title: `Dashboard | ${bot.user.username}`,
    });
});

router.get('/admin/statistics', (req, res, next) => {
    if (bot.config.owner.includes(req.user.id)) {
        const { status, statusColor } = getBotStatus(bot);
        res.render('dashboard/admin', {
            bot,
            status,
            statusColor,
            statistics,
            title: `Statistics - Dashboard | ${bot.user.username}`,
            layout: 'layouts/main',
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
        });
    } else {
        next({ status: 404, code: 'NOT_FOUND' });
    }
});

router.get('/guilds/:guildID', async (req, res, next) => {
    const guilds = await req.user.getGuildsWhereAdmin();

    const { status, statusColor } = getBotStatus(bot);
    const guild = guilds.find((g) => g.id === req.params.guildID && bot.guilds.cache.has(g.id));
    const guildChannels = bot.guilds.cache.get(guild.id).channels.cache;
    const textChannels = guildChannels.filter((ch) => ch.isText()).sort((a, b) => (a.position < b.position ? -1 : 1));
    const categories = guildChannels.filter((ch) => ch.type === 'GUILD_CATEGORY').sort((a, b) => (a.position < b.position ? -1 : 1));
    const channelsInCategories = {};

    textChannels.forEach((channel) => {
        const id = channel.parentID;
        const category = categories.has(id) ? categories.get(id).name : undefined;
        if (!channelsInCategories[category]) channelsInCategories[category] = [];
        channelsInCategories[category].push(channel);
    });

    if (!guild) return next({ status: 404, code: 'NOT_FOUND', message: 'Guild Not Found' });

    console.log((await Guild.find(guild.id)).previousAttributes());

    res.render(`dashboard/guild`, {
        bot,
        status,
        statusColor,
        guild,
        title: `${guild.name} - Dashboard | ${bot.user.username}`,
        layout: 'layouts/main',
        user: req.user,
        channels: channelsInCategories,
        conf: {
            global: (await Guild.find(guild.id)).previousAttributes(),
        },
    });
});

router.get('/guilds/:guildID/:channelID', async (req, res, next) => {
    const guilds = await req.user.getBotGuildsWhereAdmin();

    const guild = guilds.filter((g) => g.id === req.params.guildID)[0];
    const channel = bot.channels.cache.get(req.params.channelID);

    if (!guild) return next({ status: 404, code: 'NOT_FOUND', message: 'Guild Not Found' });
    if (!channel) return next({ status: 404, code: 'NOT_FOUND', message: 'Channel Not Found' });

    res.render(`dashboard/channel`, {
        bot,
        guild,
        channel,
        layout: 'layouts/main',
        user: req.user,
        title: `${guild.name} #${channel.name} - Dashboard | ${bot.user.username}`,
        conf: {
            global: (await Guild.find(guild.id)).previousAttributes(),
            channel: (await Channel.find(channel.id)).previousAttributes(),
        },
    });
});

router.use((err, req, res, next) => {
    // eslint-disable-line no-unused-vars
    if (err && err.status !== 404) Log.error(err);
    res.status(err.status || 500);
    if (!err.status) err.status = 500;
    res.render('dashboard/error', {
        bot,
        err,
        layout: 'layouts/main',
        path: req.path,
    });
});

module.exports = router;
