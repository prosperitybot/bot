const { Guild } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { reply } = require('../utils/messages');
const translationsManager = require('../translations/translationsManager');

module.exports = {
  name: 'language_server_menu',
  async execute(interaction) {
    try {
      const locale = interaction.values[0];
      const guild = await Guild.findByPk(interaction.guild.id);
      const language = translationsManager.languageList().find((l) => l.locale === locale);

      guild.locale = locale;
      await guild.save();
      interaction.client.guildTranslations.set(interaction.guild.id, locale);

      await reply(interaction, `The server's language has been updated to ${language.flag} **${language.name}**`, true);
    } catch (e) {
      Sentry.setTag('guild_id', interaction.guild.id);
      Sentry.setTag('bot_id', interaction.applicationId);
      const errorCode = Sentry.captureException(e);
      await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
    }
  },
};
