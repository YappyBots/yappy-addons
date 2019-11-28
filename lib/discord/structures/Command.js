const Discord = require('discord.js');

const merge = (def, given) => {
    if (!given) return def;
    for (const key in def) {
        if (!{}.hasOwnProperty.call(given, key)) {
            given[key] = def[key];
        } else if (given[key] === Object(given[key])) {
            given[key] = merge(def[key], given[key]);
        }
    }

    return given;
};
const default_help = command => {
    if (!command) return {};
    /**
     * The command's help
     * @typedef {Object} CommandHelp
     * @property {String} name           - command's name
     * @property {String} summary        - command's summary
     * @property {String} description    - command's description
     * @property {String} usage         - command's usage
     * @property {String[]} examples     - command's usage examples
     */
    return {
        name: command ? command.name : '???',
        description: `Description for ${command ? command.name : 'null'}`,
        usage: command ? command.name : '???',
    };
};

/**
 * The command's config
 * @typedef {Object} CommandConfig
 * @property {Boolean} enabled   - is command enabled
 * @property {Boolean} guildOnly - is command guild only
 * @property {String[]} aliases  - command's aliases
 * @property {Number} permLevel  - command's perm level; 0 - everyone, 1 - admin, 2 - owner
 */
const default_conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: 0,
};

/**
 * Discord bot command
 */
class Command {
    /**
     * @param {Client} bot - discord bot
     */
    constructor(bot) {
        this.bot = bot;
        /**
         * Command props
         * @private
         * @type {Object}
         */
        this.props = {
            conf: default_conf,
            help: default_help(this),
        };
        this.embed = Discord.MessageEmbed;
    }

    /**
     * Command's function
     * @param {Message} msg - the message
     * @param {String[]} args - message arguments; no command
     */
    run(msg) {
        return this.commandError(msg, 'No run command configured');
    }

    /**
     * Set command's config
     * @param {CommandConfig} conf - new config
     */
    setConf(conf = {}) {
        this.props.conf = merge(default_conf, conf);
    }

    /**
     * Get command's config
     * @type {CommandConfig}
     */
    get conf() {
        return this.props.conf;
    }

    /**
     * Set command's help
     * @param {CommandHelp} conf - new config
     */
    setHelp(help = {}) {
        this.props.help = merge(default_help(this), help);
    }

    /**
     * Get command's help
     * @type {CommandHelp}
     */
    get help() {
        return this.props.help;
    }

    /**
     * Function to shorten sending error messages
     * @param {Message} msg - message sent by user (for channel)
     * @param {Error|String} err - error message to send user
     * @param {String} [title = 'An Error Ocurred'] - title of error embed to send to user
     * @param {String} [footer] - footer of error embed
     * @return {Promise<Message>}
     */
    commandError(msg, err, title, footer) {
        if (err instanceof Error) Log.error(err);
        const embed = this.textToEmbed(err.name || title || 'Error', err.message || err, '#CE0814');
        if (footer) embed.footer.text = footer;
        return msg.channel.send({ embed });
    }

    /**
     * Error the command's usage to the channel
     * @param {Message} msg - message sent by user (for channel)
     * @return {Promise<Message>}
     */
    errorUsage(msg) {
        return this.commandError(msg, `Correct usage: \`${this.bot.prefix}${this.help.usage}\``, 'Incorrect Usage');
    }

    /**
     * Convert normal text to an embed object
     * @param {String} [title = 'Auto Generated Response'] - embed title
     * @param {String|String[]} text - embed description, joined with newline if array
     * @param {external:ColorResolvable} [color = '#84F139'] - embed color
     * @return {MessageEmbed}
     */
    textToEmbed(title = 'Auto Generated Response', text, color = '#84F139') {
        if (Array.isArray(text)) text = text.join('\n');
        return new this.embed()
            .setColor(color)
            .setTitle(title)
            .setDescription(text)
            .setFooter(this.bot.user.username, this.bot.user.avatarURL);
    }

    /**
     * Return JSON of command
     * @return {Object} json output
     */
    toJSON() {
        return {
            name: this.help.name,
            help: this.help,
            conf: this.conf,
        };
    }

    /**
     * Generate args, keeping strings in quotes as one argument
     * @example
     * generateArgs("hi 'hello there' hehe") // ['hi', 'hello there', 'hehe']
     * @type {String}
     */
    generateArgs(strOrArgs = '') {
        const str = Array.isArray(strOrArgs) ? strOrArgs.join(' ') : strOrArgs;
        const y = str.match(/[^\s'']+|'([^']*)'|'([^']*)'/g);
        if (y === null) return str.split(' ');
        return y.map(e => e.replace(/'/g, ``));
    }

    _permLevelToWord(permLvl) {
        if (!permLvl || permLvl === 0) return 'Everyone';
        else if (permLvl === 1) return 'Admin';
        else if (permLvl === 2) return 'Owner';
        else return 'God';
    }
}

module.exports = Command;
