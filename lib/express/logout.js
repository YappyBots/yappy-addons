const { host } = require('.').settings;

module.exports = (req, res) => {
    res.clearCookie("discord_access_token");
    res.redirect(host || '/');
}