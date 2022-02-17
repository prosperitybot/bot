const Sentry = require('@sentry/node');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const permissions = require('../utils/permissionUtils');
const { reply } = require('../utils/messages');
const translationManager = require('../translations/translationsManager');

module.exports = {
  name: 'language',
  async execute(interaction) {
    try {
      const languageMenu = new MessageSelectMenu()
        .setCustomId('language_menu')
        .setPlaceholder('Choose a language...')
        .addOptions(translationManager.languageList().map((l) => ({
          label: l.name,
          value: l.locale,
          emoji: l.flag,
        })));
      // Generate language menu 1
      switch (interaction.customId) {
        case 'language-server_menu': {
          if (!permissions.has(interaction.member, 'ADMINISTRATOR')) {
            await reply(interaction, 'Access Denied', true);
          }
          languageMenu.setCustomId('language_server_menu');

          const settingsMenu = new MessageSelectMenu()
            .setCustomId('language_server_settings_menu')
            .setPlaceholder('Language Priority')
            .addOptions([{
              label: 'User\'s Choice',
              description: 'Enables user-based languages',
              value: 'language_own',
            }, {
              label: 'Server\'s Choice',
              description: 'Disables user-based languages',
              value: 'language_server',
            }]);
          const languageRow = new MessageActionRow().addComponents(languageMenu);
          const settingsRow = new MessageActionRow().addComponents(settingsMenu);

          await interaction.reply({
            content: 'Please choose a language & settings...',
            components: [languageRow, settingsRow],
            ephemeral: true,
          });
          break;
        }
        case 'language-user_menu': {
          languageMenu.setCustomId('language_user_menu');
          const row = new MessageActionRow()
            .addComponents(languageMenu);

          await interaction.reply({
            content: 'Please choose a language...',
            components: [row],
            ephemeral: true,
          });
          break;
        }
        default:
          break;
      }
    } catch (e) {
      Sentry.captureException(e);
    }
  },
};
