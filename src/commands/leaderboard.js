const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const { GuildUser, User } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { reply } = require('../utils/messages');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Displays the top users and their levels')
    .addIntegerOption((options) => options.setName('page')
      .setDescription('The page you want to display')
      .setRequired(false)),
  async execute(interaction) {
    let offset = 0;
    const pageSize = 10;
    const page = interaction.options.getInteger('page') ?? 1;
    const userCount = await GuildUser.count({ where: { guildId: interaction.guild.id } });
    try {
      offset = pageSize * (page - 1);

      const guildUsers = await GuildUser.findAll({
        where: { guildId: interaction.guild.id },
        offset,
        limit: pageSize,
        order: [['xp', 'DESC']],
        include: User,
      });
      let leaderboardMsg = `**Top ${pageSize} members (Page ${page}/${Math.ceil(userCount / pageSize)})**: \n`;

      guildUsers.forEach((gu) => {
        leaderboardMsg += `\n- ${gu.user.username}#${gu.user.discriminator} (Level ${gu.level})`;
      });

      const buttonRow = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel('View Leaderboard (BETA)')
            .setStyle('LINK')
            .setURL(`https://dash.prosperitybot.net/leaderboard/${interaction.guild.id}`),
        );

      await reply(interaction, leaderboardMsg, false, [buttonRow]);
    } catch (e) {
      Sentry.setTag('guild_id', interaction.guild.id);
      Sentry.setTag('bot_id', interaction.applicationId);
      const errorCode = Sentry.captureException(e);
      await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
    }
  },
};
