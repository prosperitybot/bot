const { Guild } = require('@prosperitybot/database');

module.exports = {
  get: async (guildId, client) => {
    let locale;
    if (client.guildTranslations.get(guildId) === undefined) {
      const guild = await Guild.findByPk(guildId);
      console.log(guild.locale);
      client.guildTranslations.set(guildId, guild.locale);
      locale = guild.locale;
    } else {
      locale = client.guildTranslations.get(guildId);
    }
    console.log(locale);
    console.log(client.translations.get(locale));
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
