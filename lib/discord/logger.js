const { Util, MessageEmbed } = require('discord.js');

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

    /**
     * Send info log
     * @param  {String} title
     * @param  [String] description
     * @param  [String] color
     * @return {Promise}
     */
    log(title, description, color) {
        return this.send({
            title,
            description,
            color: Util.resolveColor(color),
        });
    }

    message(msg, fields = []) {
        return this.send({
            title: this.getTitle(msg),
            description: msg.content,
            color: 0x3498db,
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
            color: 0xe74c3c,
            description: `\`\`\`js\n${simplifyError(error.stack)}\n\`\`\``,
            footer: this.getFooter(msg),
            fields: [
                {
                    name: 'Message',
                    value: msg.cleanContent,
                },
            ],
        });
    }

    getTitle(interaction) {
        return interaction.guild && interaction.guild.available
            ? `${interaction.guild.name} #${interaction.channel.name} (${interaction.channel.id})`
            : interaction.user.tag;
    }

    getFooter(interaction) {
        return {
            text: `${interaction.user.tag}  —  ${this.type}`,
            icon_url: interaction.user?.avatarURL(),
        };
    }

    /**
     * Send embed to logging channel
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    async send(data) {
        if (!this.channel && process.env.DISCORD_CHANNEL_LOGGING) this.channel = await this.bot.channels.fetch(process.env.DISCORD_CHANNEL_LOGGING);

        if (data.fields) data.fields = data.fields.filter((field) => field.value);

        return this.channel && this.channel.send({ embeds: [data] });
    }
}

module.exports = DiscordLogger;
