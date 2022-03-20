import { ButtonInteraction, MessageActionRow, MessageSelectMenu } from 'discord.js';
import { IsWhitelabel } from '../managers/ClientManager';
import { LogInteractionError } from '../managers/ErrorManager';
import { CreateEmbed, ReplyToInteraction } from '../managers/MessageManager';
import { LanguageList } from '../managers/TranslationManager';
import { ButtonList } from '../typings/ButtonList';

const LanguageButtonList: ButtonList = {
  name: 'language',
  needsAccessLevel: [],
  needsPermissions: [],
  execute: async (interaction: ButtonInteraction) => {
    try {
      const languageMenu = new MessageSelectMenu()
        .setCustomId('language_menu')
        .setPlaceholder('Choose a language....')
        .addOptions(LanguageList().map((l) => ({
          label: l.name,
          value: l.locale,
          emoji: l.flag,
        })));

      switch (interaction.customId) {
        case 'language-server_menu':
          if (interaction.inCachedGuild()) {
            if (!interaction.member?.permissions.has('ADMINISTRATOR') && interaction.user.id !== '126429064218017802') {
              interaction.reply({ embeds: [CreateEmbed(IsWhitelabel(interaction.client)).setColor('RED').setDescription('Access Denied')], ephemeral: true });
            }

            languageMenu.setCustomId('language_server_menu');

            const settingsMenu = new MessageSelectMenu()
              .setCustomId('language_server_settings_menu')
              .setPlaceholder('Language Priority')
              .addOptions([{
                label: "User's Choice",
                description: 'Enables user-based languages',
                value: 'language_own',
              }, {
                label: "Server's Choice",
                description: 'Disables user-based languages',
                value: 'language_server',
              }]);

            const languageRow = new MessageActionRow().addComponents(languageMenu);
            const settingsRow = new MessageActionRow().addComponents(settingsMenu);

            await ReplyToInteraction(interaction, 'Please choose a language & settings...', true, IsWhitelabel(interaction.client), [languageRow, settingsRow]);
            break;
          }
          break;
        case 'language-user_menu':
          if (interaction.inCachedGuild()) {
            languageMenu.setCustomId('language_user_menu');
            const languageRow = new MessageActionRow().addComponents(languageMenu);

            await ReplyToInteraction(interaction, 'Please choose a language...', true, IsWhitelabel(interaction.client), [languageRow]);
            break;
          }
          break;
        default:
          break;
      }
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default LanguageButtonList;
