const { User } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { reply } = require('../utils/messages');
const translationsManager = require('../translations/translationsManager');

module.exports = {
  name: 'language_user_menu',
  async execute(interaction) {
    try {
      const locale = interaction.values[0];
      const user = await User.findByPk(interaction.user.id);
      const language = translationsManager.languageList().find((l) => l.locale === locale);

      user.locale = locale;
      await user.save();
      interaction.client.userTranslations.set(interaction.user.id, locale);

      await reply(interaction, `Your language has been updated to ${language.flag} **${language.name}**`, true);
    } catch (e) {
      Sentry.setTag('guild_id', interaction.guild.id);
      Sentry.setTag('bot_id', interaction.applicationId);
      const errorCode = Sentry.captureException(e);
      await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
    }
  },
};
