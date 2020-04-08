const { Permissions } = require('discord.js');
const got = require('got');

const Constants = {
    Endpoints: {
        base: 'https://discordapp.com/api',
        User: () => {
            const base = `${Constants.Endpoints.base}/users/@me`;
            return {
                toString: () => base,
                guilds: `${base}/guilds`,
            };
        },
        Channels: () => {
            const base = `${Constants.Endpoints.base}/channels`;
            return {
                toString: () => base,
                Channel: (id) => `${base}/${id}`,
            };
        },
    },
};

const users = new Map();

module.exports = class DiscordUser {
    constructor(token) {
        this.token = token;
    }

    static async create(token) {
        const user = new DiscordUser(token);

        await user.loadData();

        users.set(token, user);
        return user;
    }

    static async get(token) {
        return users.has(token) ? users.get(token) : await DiscordUser.create(token);
    }

    loadData() {
        return this._get(Constants.Endpoints.User()).then((body) => {
            for (const prop in body) {
                this[prop] = body[prop];
            }
        });
    }

    async getGuildsWhereAdmin() {
        if (this._adminGuilds) return this._adminGuilds;

        await this.load();
        return this._get(Constants.Endpoints.User().guilds).then(
            (body) => (this._adminGuilds = body.filter((g) => new Permissions(g.permissions).has('ADMINISTRATOR', true)))
        );
    }

    async getBotGuildsWhereAdmin() {
        await this.load();
        return this._get(Constants.Endpoints.User().guilds).then((body) =>
            body.filter((g) => new Permissions(g.permissions).has('ADMINISTRATOR', true))
        );
    }

    _get(url) {
        if (typeof url === 'object') url = url.toString();

        return got(String(url), {
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
        })
            .json()
            .catch((err) => Log.error(url, err));
    }

    load() {
        if (this.username) return Promise.resolve();
        return this.loadData();
    }
};
