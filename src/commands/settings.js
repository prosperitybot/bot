const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { Guild } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { reply } = require('../utils/messages');
const permissions = require('../utils/permissionUtils');
const translationManager = require('../translations/translationsManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Guild Bot Settings')
    .addSubcommand((subcommand) => subcommand
      .setName('notifications')
      .setDescription('Choose where the notifications are displayed for the guild')
      .addChannelOption((options) => options.setName('channel')
        .setDescription('The channel to set the notification to')
        .setRequired(false)))
    .addSubcommand((subcommand) => subcommand
      .setName('roles')
      .setDescription('Choose the type of logic to apply on the role (Whether to stack or only assign one role)')
      .addStringOption((options) => options.setName('type')
        .setDescription('The type of logic to apply to the role')
        .setRequired(true)
        .addChoice('Single (Only apply one at a time and remove the previous role)', 'single')
        .addChoice('Stack (Stack all previous roles and never remove old ones)', 'stack')))
    .addSubcommand((subcommand) => subcommand
      .setName('multiplier')
      .setDescription('Choose the XP multiplier for this server (1x by default)')
      .addIntegerOption((options) => options.setName('multiplier')
        .setDescription('The multiplier to apply to this server')
        .setRequired(true))),
  async execute(interaction) {
    const translations = await translationManager.get(interaction.guild.id, interaction.client);
    try {
      if (!permissions.has(interaction.member, 'ADMINISTRATOR')) {
        await reply(interaction, translations.generic.access_denied, true);
        return;
      }
      switch (interaction.options.getSubcommand()) {
        case 'notifications': {
          if (interaction.options.getChannel('channel') != null) {
            const guild = await Guild.findByPk(interaction.guild.id);
            guild.notificationType = 'channel';
            guild.notificationChannel = interaction.options.getChannel('channel').id;
            await guild.save();
            await reply(
              interaction,
              translationManager.format(
                translations.commands.settings.notification_channel_updated,
                [['channel', interaction.otpions.getChannel('channel')]],
              ),
              true,
            );
            break;
          }
          const notificationsRow = new MessageActionRow()
            .addComponents(
              new MessageSelectMenu()
                .setCustomId('guild_settings_notifications')
                .setPlaceholder('Choose type of notifications')
                .addOptions([
                  {
                    label: translations.commands.settings.notification_type_reply_label,
                    description: translations.commands.settings.notification_type_reply_description,
                    value: 'guild_settings_notifications-reply',
                    emoji: '💬',
                  },
                  {
                    label: translations.commands.settings.notification_type_channel_label,
                    // eslint-disable-next-line max-len
                    description: translations.commands.settings.notification_type_channel_description,
                    value: 'guild_settings_notifications-channel',
                    emoji: '📃',
                  },
                  {
                    label: translations.commands.settings.notification_type_dm_label,
                    description: translations.commands.settings.notification_type_dm_description,
                    value: 'guild_settings_notifications-dm',
                    emoji: '🔏',
                  },
                  {
                    label: translations.commands.settings.notification_type_disabled_label,
                    // eslint-disable-next-line max-len
                    description: translations.commands.settings.notification_type_disabled_description,
                    value: 'guild_settings_notifications-disable',
                    emoji: '🚫',
                  },
                ]),
            );
          // eslint-disable-next-line max-len
          await reply(interaction, translations.commands.settings.please_select, true, [notificationsRow]);
          break;
        }
        case 'roles': {
          const type = interaction.options.getString('type');
          const guild = await Guild.findByPk(interaction.guild.id);
          guild.roleAssignType = type;
          await guild.save();
          if (type === 'stack') {
            await reply(interaction, translations.commands.settings.role_type_stacked, true);
          } else {
            await reply(interaction, translations.commands.settings.role_type_single, true);
          }
          break;
        }
        case 'multiplier': {
          const multiplier = interaction.options.getInteger('multiplier');
          const guild = await Guild.findByPk(interaction.guild.id);
          guild.xpRate = multiplier;
          await guild.save();
          await reply(
            interaction,
            translationManager.format(
              translations.commands.settings.multiplier_set,
              [['multiplier', multiplier]],
            ),
            true,
          );
          break;
        }
        default:
          await reply(interaction, 'Unknown Command', true);
      }
    } catch (e) {
      Sentry.setTag('guild_id', interaction.guild.id);
      Sentry.setTag('bot_id', interaction.applicationId);
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
