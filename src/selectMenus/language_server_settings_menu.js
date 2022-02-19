const { Guild } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { reply } = require('../utils/messages');

module.exports = {
  name: 'language_server_settings_menu',
  async execute(interaction) {
    try {
      const languagePriority = interaction.values[0];
      const guild = await Guild.findByPk(interaction.guild.id);

      guild.serverLocaleOnly = languagePriority === 'language_server';
      await guild.save();
      interaction.client.guildTranslationsOnly.set(interaction.guild.id, languagePriority === 'language_server');

      await reply(
        interaction,
        `The server's Language settings have been set to ${languagePriority === 'language_server' ? '**Server-Based Languages**' : '**User-Based Languages**'}`,
        true,
      );
    } catch (e) {
      Sentry.setTag('guild_id', interaction.guild.id);
      Sentry.setTag('bot_id', interaction.applicationId);
      const errorCode = Sentry.captureException(e);
      await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
    }
  },
};
