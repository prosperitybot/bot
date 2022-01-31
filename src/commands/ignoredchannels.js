const { SlashCommandBuilder } = require('@discordjs/builders');
const { IgnoredChannel } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { reply } = require('../utils/messages');
const permissions = require('../utils/permissionUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ignoredchannels')
    .setDescription('Adds a channel that is ignored from gaining levels')
    .addSubcommand((subCommand) => subCommand
      .setName('add')
      .setDescription('Adds an ignored channel')
      .addChannelOption((channel) => channel
        .setName('channel')
        .setDescription('The channel to ignore')))
    .addSubcommand((subCommand) => subCommand
      .setName('remove')
      .setDescription('Removes an ignored channel')
      .addChannelOption((channel) => channel
        .setName('channel')
        .setDescription('The channel to remove from the ignored list')))
    .addSubcommand((subCommand) => subCommand
      .setName('list')
      .setDescription('Lists all of the ignored channels in the server')),
  async execute(interaction) {
    if (!permissions.has(interaction.member, 'ADMINISTRATOR')) {
      await reply(interaction, 'Access Denied', true);
      return;
    }
    try {
      switch (interaction.options.getSubcommand()) {
        case 'add': {
          const channel = interaction.options.getChannel('channel');
          const ignoredChannel = await IgnoredChannel.findOne({ where: { id: channel.id } });
          if (ignoredChannel != null) {
            await reply(interaction, 'This channel is already being ignored.', true);
            break;
          }

          await IgnoredChannel.create({
            id: channel.id,
            guildId: interaction.guild.id,
          });

          await reply(interaction, `${channel} will be ignored from gaining xp`, false);
          break;
        }
        case 'remove': {
          const channel = interaction.options.getChannel('channel');
          const ignoredChannel = await IgnoredChannel.findOne({ where: { id: channel.id } });
          if (ignoredChannel == null) {
            await reply(interaction, 'This channel is not being ignored.', true);
            break;
          }

          await ignoredChannel.destroy();

          await reply(interaction, `${channel} will not be ignored from gaining xp`, false);
          break;
        }
        case 'list': {
          const ignoredChannels = await IgnoredChannel.findAll({
            where: { guildId: interaction.guild.id },
          });
          let listMsg = 'Ignored Channels: \n';
          ignoredChannels.forEach((c) => {
            listMsg += `\n- <#${c.id}>`;
          });

          await reply(interaction, listMsg, false);
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
