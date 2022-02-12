const { Guild } = require('@prosperitybot/database');

module.exports = {
  get: async (guildId, client) => {
    if (client.guildTranslations.get(guildId) === null) {
      const guild = await Guild.findByPk(guildId);
      console.log(guild.locale);
      client.guildTranslations.set(guildId, guild.locale);
    }
    const locale = client.guildTranslations.get(guildId);
    return client.translations.get(locale);
  },
  format: (str, format) => {
    let formatted = str;
    format.forEach((f) => {
      formatted = formatted.replaceAll(`%${f[0]}%`, f[1]);
    });
    return formatted;
  },
};
