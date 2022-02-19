const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const Sentry = require('@sentry/node');
const { reply } = require('../utils/messages');
const permissions = require('../utils/permissionUtils');

module.exports = {
  mainBotOnly: true,
  data: new SlashCommandBuilder()
    .setName('language')
    .setDescription('Shows current language & language settings for both user and servers'),
  async execute(interaction) {
    try {
      const buttonRow = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel('Server Language')
            .setStyle('DANGER')
            .setCustomId('language-server_menu')
            .setEmoji('🖥️')
            .setDisabled(!permissions.has(interaction.member, 'ADMINISTRATOR')),
          new MessageButton()
            .setLabel('User Language')
            .setStyle('SUCCESS')
            .setEmoji('🧍')
            .setCustomId('language-user_menu'),
        );

      await reply(interaction, 'Please choose below whether you want to set your own language, or the server language', true, [buttonRow]);
    } catch (e) {
      Sentry.setTag('guild_id', interaction.guild.id);
      Sentry.setTag('bot_id', interaction.applicationId);
      Sentry.setTag('user_id', interaction.user.id);
      Sentry.setTag('command', interaction.commandName);
      const errorCode = Sentry.captureException(e);
      await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
    }
  },
};
