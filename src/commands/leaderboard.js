const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const { GuildUser, User } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { reply } = require('../utils/messages');
const translationManager = require('../translations/translationsManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Displays the top users and their levels')
    .addIntegerOption((options) => options.setName('page')
      .setDescription('The page you want to display')
      .setRequired(false)),
  async execute(interaction) {
    const translations = await translationManager.get(interaction);
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
      let leaderboardMsg = translationManager.format(
        translations.commands.leaderboard.leaderboard_title,
        [['page_size', pageSize], ['page', page], ['total_pages', Math.ceil(userCount / pageSize)]],
      );
      leaderboardMsg += ': \n';
      guildUsers.forEach((gu) => {
        let rolePrefix = '';
        if (gu.user.access_levels.length > 0 && gu.user.access_levels[0] !== 'null') {
          rolePrefix = '(';
          gu.user.access_levels.forEach((accessLevel) => {
            if (accessLevel === 'TRANSLATOR') rolePrefix += '<:prosperity_language:940692871181381632>';
            if (accessLevel === 'ADMINISTRATOR') rolePrefix += '<:prosperity_admin:940692667216564244>';
            if (accessLevel === 'DEVELOPER') rolePrefix += '<:prosperity_dev:940692660388261928>';
            if (accessLevel === 'OWNER') rolePrefix += '<:prosperity_owner:940692775454797825>';
          });
          rolePrefix += ') ';
        }
        leaderboardMsg += `\n- ${rolePrefix}${gu.user.username}#${gu.user.discriminator} (Level ${gu.level})`;
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
      await reply(
        interaction,
        translationManager.format(
          translations.generic.error,
          [['error_code', errorCode]],
        ),
        true,
      );
    }
  },
};
