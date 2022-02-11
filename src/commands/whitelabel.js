const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const { WhitelabelBot, User } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { reply } = require('../utils/messages');
const permissions = require('../utils/permissionUtils');

module.exports = {
  mainBotOnly: true,
  data: new SlashCommandBuilder()
    .setName('whitelabel')
    .setDescription('Controls a whitelabel bot')
    .addSubcommand((subCommand) => subCommand
      .setName('setup')
      .setDescription('Sets up the whitelabel bot')
      .addStringOption((string) => string
        .setName('token')
        .setDescription('Bot Token'))
      .addStringOption((string) => string
        .setName('bot_id')
        .setDescription('The Id of the bot')))
    .addSubcommand((subCommand) => subCommand
      .setName('actions')
      .setDescription('Controls a whitelabel bot')),
  async execute(interaction) {
    const user = await User.findByPk(interaction.member.id);
    if (!permissions.hasAccessLevel(user, 'WHITELABEL')) {
      await reply(interaction, 'Access Denied - You need to have whitelabel for this', true);
      return;
    }
    try {
      switch (interaction.options.getSubcommand()) {
        case 'setup': {
          const token = interaction.options.getString('token');
          const botId = interaction.options.getString('bot_id');
          const currentBot = await WhitelabelBot.findOne({
            where: {
              userId: interaction.member.id,
            },
          });
          if (currentBot !== null) {
            currentBot.oldBotId = currentBot.botId;
            currentBot.botId = botId;
            currentBot.token = token;
            currentBot.action = 'start';
            await currentBot.save();
            await reply(interaction, 'Whitelabel bot created & started\nPlease give it a minute or so to register all of the commands', true);
          } else {
            await WhitelabelBot.create({
              botId,
              token,
              userId: interaction.member.id,
              action: 'start',
            });
            await reply(interaction, 'Whitelabel bot created & started\nPlease give it a minute or so to register all of the commands', true);
          }
          break;
        }
        case 'actions': {
          const currentBot = await WhitelabelBot.findOne({
            where: {
              userId: interaction.member.id,
            },
          });
          if (currentBot !== null) {
            const buttonRow = new MessageActionRow()
              .addComponents(
                new MessageButton()
                  .setLabel('Start')
                  .setStyle('SUCCESS')
                  .setCustomId('whitelabel_bot_start')
                  .setDisabled(currentBot.last_action !== 'stop'),
                new MessageButton()
                  .setLabel('Restart')
                  .setStyle('PRIMARY')
                  .setCustomId('whitelabel_bot_restart'),
                new MessageButton()
                  .setLabel('Stop')
                  .setStyle('DANGER')
                  .setCustomId('whitelabel_bot_stop')
                  .setDisabled(currentBot.last_action === 'stop'),
              );

            await reply(interaction, 'Please see below for the available actions for your whitelabel bot', true, [buttonRow]);
          } else {
            await reply(interaction, 'You currently do not have a whitelabel bot assigned', true);
          }
          break;
        }
        default:
          await reply(interaction, 'Unknown Command', true);
      }
    } catch (e) {
      Sentry.setTag('guild_id', interaction.guild.id);
      Sentry.setTag('bot_id', interaction.applicationId);
      const errorCode = Sentry.captureException(e);
      await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
    }
  },
};
