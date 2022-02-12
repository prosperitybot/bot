/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const { Guild } = require('@prosperitybot/database');
const { Collection } = require('discord.js');

const guildTranslations = new Collection();
const translations = new Collection();

module.exports = {
  get: async (guildId) => {
    if (guildTranslations.get(guildId) === null) {
      const guild = await Guild.findByPk(guildId);
      guildTranslations.set(guildId, guild.locale);
    }
    const locale = guildTranslations.get(guildId);
    return translations.get(locale);
  },
  setup: (translationFiles) => {
    translationFiles.forEach((file) => {
      const translation = require(`../../translations/${file}`);
      translations.set(file, translation);
    });
  },
  format: (str, format) => {
    let formatted = str;
    format.forEach((f) => {
      formatted = formatted.replaceAll(`%${f[0]}%`, f[1]);
    });
    return formatted;
  },
};
