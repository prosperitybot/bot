const { Guild } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { reply } = require('../utils/messages');

module.exports = {
  name: 'guild_settings_notifications',
  async execute(interaction) {
    try {
      const guild = await Guild.findByPk(interaction.guild.id);
      switch (interaction.values[0]) {
        case 'guild_settings_notifications-reply':
          guild.notificationType = 'reply';
          guild.notificationChannel = null;
          await guild.save();
          await reply(interaction, 'Successfully updated level up notifications to be sent via **replies**', true);
          break;
        case 'guild_settings_notifications-channel': {
          guild.notificationType = 'channel';
          guild.notificationChannel = null;
          await guild.save();
          await reply(interaction, 'Please use the slash command `/settings notifications` and specify the channel', true);
          break;
        }
        case 'guild_settings_notifications-dm':
          guild.notificationType = 'dm';
          guild.notificationChannel = null;
          await guild.save();
          await reply(interaction, 'Successfully updated level up notifications to be sent via **Direct Messages**', true);
          break;
        case 'guild_settings_notifications-disable':
          guild.notificationType = 'disable';
          guild.notificationChannel = null;
          await guild.save();
          await reply(interaction, 'Successfully updated level up notifications to be disabled', true);
          break;
        default:
          break;
      }
    } catch (e) {
      const errorCode = Sentry.captureException(e);
      await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
    }
  },
};
