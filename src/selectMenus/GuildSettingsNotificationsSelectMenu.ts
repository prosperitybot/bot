import { SelectMenuInteraction } from 'discord.js';
import { Guild } from '@prosperitybot/database';
import { LogInteractionError } from '../managers/ErrorManager';
import { ReplyToInteraction } from '../managers/MessageManager';
import { SelectMenu } from '../typings/SelectMenu';
import { GetTranslations } from '../managers/TranslationManager';
import { IsWhitelabel } from '../managers/ClientManager';

const GuildSettingsNotificationsSelectMenu: SelectMenu = {
  name: 'guild_settings_notifications',
  needsAccessLevel: [],
  needsPermissions: ['ADMINISTRATOR'],
  execute: async (interaction: SelectMenuInteraction) => {
    try {
      const translations = await GetTranslations(interaction.user.id, interaction.guildId!);
      const guild: Guild = await Guild.findByPk(interaction.guildId);

      switch (interaction.values[0]) {
        case 'guild_settings_notifications-reply':
          guild.notificationType = 'reply';
          guild.notificationChannel = null;
          await guild.save();
          await ReplyToInteraction(interaction, translations.menus.guild_settings_notifications.reply, true, IsWhitelabel(interaction.client));
          break;
        case 'guild_settings_notifications-channel':
          guild.notificationType = 'channel';
          guild.notificationChannel = null;
          await guild.save();
          await ReplyToInteraction(interaction, translations.menus.guild_settings_notifications.channel, true, IsWhitelabel(interaction.client));
          break;
        case 'guild_settings_notifications-dm':
          guild.notificationType = 'dm';
          guild.notificationChannel = null;
          await guild.save();
          await ReplyToInteraction(interaction, translations.menus.guild_settings_notifications.dm, true, IsWhitelabel(interaction.client));
          break;
        case 'guild_settings_notifications-disable':
          guild.notificationType = 'disable';
          guild.notificationChannel = null;
          await guild.save();
          await ReplyToInteraction(interaction, translations.menus.guild_settings_notifications.disable, true, IsWhitelabel(interaction.client));
          break;
        default:
          break;
      }
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default GuildSettingsNotificationsSelectMenu;
