import { SelectMenuInteraction } from 'discord.js';
import { Guild } from '@prosperitybot/database';
import { LogInteractionError } from '../managers/ErrorManager';
import { SelectMenu } from '../typings/SelectMenu';
import { ReplyToInteraction } from '../managers/MessageManager';
import { IsWhitelabel } from '../managers/ClientManager';

const ServerLanguageSettingsSelectMenu: SelectMenu = {
  name: 'language_server_settings_menu',
  needsAccessLevel: [],
  needsPermissions: ['ADMINISTRATOR'],
  execute: async (interaction: SelectMenuInteraction) => {
    try {
      const guild: Guild = await Guild.findByPk(interaction.guildId);
      const languagePriority = interaction.values[0];

      guild.serverLocaleOnly = languagePriority === 'language_server';
      await guild.save();

      await ReplyToInteraction(
        interaction,
        `The server's Language settings have been set to ${languagePriority === 'language_server' ? '**Server-Based Languages**' : '**User-Based Languages**'}`,
        true,
        IsWhitelabel(interaction.client),
      );
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default ServerLanguageSettingsSelectMenu;
