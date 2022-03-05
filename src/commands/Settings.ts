import {
  Client, CommandInteraction, Constants, MessageActionRow, MessageSelectMenu,
} from 'discord.js';
import { Guild } from '@prosperitybot/database';
import { Command } from '../typings/Command';
import { LogInteractionError } from '../managers/ErrorManager';
import { ReplyToInteraction } from '../managers/MessageManager';
import { GetTranslations, Format } from '../managers/TranslationManager';

const Settings: Command = {
  data: {
    name: 'settings',
    description: 'Manages settings for the server',
    options: [
      {
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'notifications',
        description: 'Choose where the notifications are displayed for the guild',
        options: [
          {
            type: Constants.ApplicationCommandOptionTypes.CHANNEL,
            name: 'channel',
            description: 'The channel to send the notifications to',
            required: false,
          },
        ],
      },
      {
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'roles',
        description: 'Choose the type of logic to apply on the role (stack/single)',
        options: [
          {
            type: Constants.ApplicationCommandOptionTypes.STRING,
            name: 'type',
            description: 'The type of logic to apply to the role',
            required: true,
            choices: [
              {
                name: 'Single (Only apply one at a time and remove the previous role)',
                value: 'single',
              },
              {
                name: 'Stack (Stack all previous roles and do not remove old ones)',
                value: 'stack',
              },
            ],
          },
        ],
      },
      {
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'multiplier',
        description: 'Choose the XP multiplier for this server (1x by default)',
        options: [
          {
            type: Constants.ApplicationCommandOptionTypes.NUMBER,
            name: 'multiplier',
            description: 'The multiplier to apply',
            minValue: 0.00,
            maxValue: 5.00,
            required: true,
          },
        ],
      },
    ],
    type: 'CHAT_INPUT',
  },
  needsAccessLevel: [],
  needsPermissions: ['ADMINISTRATOR'],
  ownerOnly: false,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      const translations = await GetTranslations(interaction.user.id, interaction.guildId!);
      const command: string = interaction.options.getSubcommand();
      const guild: Guild = await Guild.findByPk(interaction.guildId!);

      switch (command) {
        case 'notifications': {
          const channel = interaction.options.getChannel('channel');
          if (channel !== null) {
            guild.notificationType = 'channel';
            guild.notificationChanel = channel.id;
            await guild.save();

            await ReplyToInteraction(interaction, Format(translations.commands.settings.notification_channel_updated, [['channel', channel.toString()]]), true);
            break;
          }

          const notificationsRow: MessageActionRow = new MessageActionRow()
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
                    description: translations.commands.settings.notification_type_disabled_description,
                    value: 'guild_settings_notifications-disable',
                    emoji: '🚫',
                  },
                ]),
            );

          await ReplyToInteraction(interaction, translations.commands.settings.please_select, true, [notificationsRow]);
          break;
        }
        case 'roles': {
          const roleType = interaction.options.getString('type', true);

          guild.roleAssignType = roleType;
          await guild.save();

          await ReplyToInteraction(interaction, roleType === 'stack' ? translations.commands.settings.role_type_stacked : translations.commands.settings.role_type_single, true);
          break;
        }
        case 'multiplier': {
          const multiplier = interaction.options.getNumber('multiplier', true);

          guild.xpRate = multiplier;
          await guild.save();

          await ReplyToInteraction(interaction, Format(translations.commands.settings.multiplier_set, [['multiplier', multiplier]]), true);
          break;
        }
        default:
          break;
      }
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default Settings;
