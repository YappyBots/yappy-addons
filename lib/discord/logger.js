// eslint-disable-next-line newline-per-chained-call
const simplifyError = (e = '') => e.split('\n').slice(0, 5).join('\n').substr(0, 2000);

/**
* Discord logger
*/
class DiscordLogger {
  /**
  * Create logger instance
  * @param {Client} bot Discord client instance
  * @param {String} type Type of logger, will appear in embed
  */
  constructor(bot, type) {
    this.bot = bot;
    this.type = type;
  }

  message(msg, fields = []) {
    return this.send({
      title: this.getTitle(msg),
      description: msg.content,
      color: 0x3498DB,
      footer: this.getFooter(msg),
      fields,
    });
  }

  /**
   * Log an error to channel
   * @param  {Message} msg message that introduced error
   * @param  {Error} error error to log
   * @return {Promise}
   */
  error(msg, error) {
    return this.send({
      title: this.getTitle(msg),
      color: 0xE74C3C,
      description: `\`\`\`js\n${simplifyError(error.stack)}\n\`\`\``,
      footer: this.getFooter(msg),
      fields: [{
        name: 'Message',
        value: msg.cleanContent,
      }],
    });
  }

  getTitle(msg) {
    return msg.guild && msg.guild.available ? `${msg.guild.name} #${msg.channel.name}` : msg.author.tag;
  }

  getFooter(msg) {
    return {
      text: `${msg.author.username}#${msg.author.discriminator}  —  ${this.type}`,
      icon_url: msg.author.avatarURL(),
    };
  }

  /**
  * Send embed to logging channel
  * @param  {[type]} data [description]
  * @return {[type]}      [description]
  */
  send(data) {
    if (!this.channel && process.env.DISCORD_CHANNEL_LOGGING) this.channel = this.bot.channels.get(process.env.DISCORD_CHANNEL_LOGGING);
    return this.channel ? this.channel.send({ embed: data }) : Promise.reject('Logging channel not found');
  }
}

module.exports = DiscordLogger;
