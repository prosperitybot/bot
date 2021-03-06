import {
  Client, CommandInteraction, MessageActionRow, MessageButton,
} from 'discord.js';
import { Command } from '../typings/Command';
import { LogInteractionError } from '../managers/ErrorManager';
import { HasPermission } from '../managers/PermissionManager';
import { ReplyToInteraction } from '../managers/MessageManager';
import { GetTranslations } from '../managers/TranslationManager';
import { IsWhitelabel } from '../managers/ClientManager';

const Language: Command = {
  data: {
    name: 'language',
    description: 'Shows current language & language settings for both user and servers',
    type: 'CHAT_INPUT',
  },
  needsAccessLevel: [],
  needsPermissions: [],
  ownerOnly: false,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      if (interaction.inCachedGuild()) {
        const translations = await GetTranslations(interaction.user.id, interaction.guildId!);
        const buttonRow = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setLabel(translations.commands.language.server_language)
              .setStyle('DANGER')
              .setCustomId('language-server_menu')
              .setEmoji('🖥️')
              .setDisabled(!HasPermission(interaction.member, 'ADMINISTRATOR')),
            new MessageButton()
              .setLabel(translations.commands.language.user_language)
              .setStyle('SUCCESS')
              .setEmoji('🧍')
              .setCustomId('language-user_menu'),
          );
        await ReplyToInteraction(interaction, translations.commands.language.choice_message, true, IsWhitelabel(client), [buttonRow]);
      }
      return;
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default Language;
