const { Guild } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { reply } = require('../utils/messages');
const translationManager = require('../translations/translationsManager');

module.exports = {
  name: 'guild_settings_notifications',
  async execute(interaction) {
    const translations = await translationManager.getTranslations(interaction.user.id, interaction.guild.id, interaction.client);
    try {
      const guild = await Guild.findByPk(interaction.guild.id);
      switch (interaction.values[0]) {
        case 'guild_settings_notifications-reply':
          guild.notificationType = 'reply';
          guild.notificationChannel = null;
          await guild.save();
          await reply(interaction, translations.menus.guild_settings_notifications.reply, true);
          break;
        case 'guild_settings_notifications-channel': {
          guild.notificationType = 'channel';
          guild.notificationChannel = null;
          await guild.save();
          await reply(interaction, translations.menus.guild_settings_notifications.channel, true);
          break;
        }
        case 'guild_settings_notifications-dm':
          guild.notificationType = 'dm';
          guild.notificationChannel = null;
          await guild.save();
          await reply(interaction, translations.menus.guild_settings_notifications.dm, true);
          break;
        case 'guild_settings_notifications-disable':
          guild.notificationType = 'disable';
          guild.notificationChannel = null;
          await guild.save();
          await reply(interaction, translations.menus.guild_settings_notifications.disable, true);
          break;
        default:
          break;
      }
    } catch (e) {
      const errorCode = Sentry.captureException(e);
      await reply(
        interaction,
        translationManager.format(
          translations.generic.error,
          [['error_code', errorCode]],
        ),
        true,
      );
    }
  },
};
