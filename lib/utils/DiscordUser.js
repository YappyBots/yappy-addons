const { Permissions } = require('discord.js');
const snekfetch = require('snekfetch');

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
  },
};

module.exports = class DiscordUser {
  constructor(token, bot) {
    this._token = token;
    this.bot = bot;
  }

  getGuildsWhereAdmin() {
    return this._get(Constants.Endpoints.User().guilds)
    .then(res =>
      res.body.filter(g => new Permissions(g.permissions).has('ADMINISTRATOR', true))
    );
  }

  _get(url) {
    return snekfetch
    .get(url)
    .set('Authorization', `Bearer ${this._token}`);
  }
};
