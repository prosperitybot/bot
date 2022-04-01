import {
  Client, CommandInteraction, MessageActionRow, MessageButton, Constants,
} from 'discord.js';
import { GuildUser, User } from '@prosperitybot/database';
import { Command } from '../typings/Command';
import { LogInteractionError } from '../managers/ErrorManager';
import { ReplyToInteraction } from '../managers/MessageManager';
import { GetTranslations, Format } from '../managers/TranslationManager';
import { IsWhitelabel } from '../managers/ClientManager';

const Leaderboard: Command = {
  data: {
    name: 'leaderboard',
    description: 'Displays the top users and their levels',
    options: [
      {
        type: Constants.ApplicationCommandOptionTypes.INTEGER,
        name: 'page',
        description: 'The page you want to display',
        required: false,
      },
    ],
    type: 'CHAT_INPUT',
  },
  needsAccessLevel: [],
  needsPermissions: [],
  ownerOnly: false,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      const translations = await GetTranslations(interaction.user.id, interaction.guildId!);
      const pageSize = 10;
      const page = interaction.options.getInteger('page') ?? 1;
      const userCount = await GuildUser.count({ where: { guildId: interaction.guildId } });
      const offset = pageSize * (page - 1);

      const guildUsers: GuildUser[] = await GuildUser.findAll({
        where: { guildId: interaction.guildId },
        offset,
        limit: pageSize,
        order: [['xp', 'DESC']],
        include: User,
      });

      let leaderboardMessage = `${Format(
        translations.commands.leaderboard.leaderboard_title,
        [['page_size', pageSize.toString()], ['page', page.toString()], ['total_pages', Math.ceil(userCount / pageSize).toString()]],
      )}\n`;

      guildUsers.forEach((guildUser) => {
        let rolePrefix = '';
        if (guildUser.user.access_levels.length > 0 && guildUser.user.access_levels[0] !== '') {
          rolePrefix = '(';
          guildUser.user.access_levels.forEach((accessLevel: string) => {
            if (accessLevel === 'TRANSLATOR') rolePrefix += '💬';
            if (accessLevel === 'BUG_HUNTER') rolePrefix += '🐛';
            if (accessLevel === 'ADMINISTRATOR') rolePrefix += '🛡️';
            if (accessLevel === 'DEVELOPER') rolePrefix += '🛠️';
            if (accessLevel === 'OWNER') rolePrefix += '👑';
          });

          rolePrefix += ') ';
        }
        leaderboardMessage += `\n ${rolePrefix}${guildUser.user.username}#${guildUser.user.discriminator} (Level ${guildUser.level})`;
      });

      const leaderboardButton = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel('View Leaderboard (BETA)')
            .setStyle('LINK')
            .setURL(`https://dash.prosperitybot.net/leaderboard/${interaction.guildId!}`),
        );

      await ReplyToInteraction(interaction, leaderboardMessage, false, IsWhitelabel(client), [leaderboardButton]);
      return;
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default Leaderboard;
