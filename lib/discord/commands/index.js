const path = require('path');

module.exports = {
  Exec: require('./Exec'),

  addCommands(bot) {
    if (!bot.addCommand) return;
    const that = module.exports;
    for (const name in that) {
      if (name === 'addCommands') continue;
      bot.addCommand(that[name], path.resolve(`${name}.js`));
    }
  },
}
