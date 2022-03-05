import {
  Client, CommandInteraction, Constants,
} from 'discord.js';
import { GuildUser } from '@prosperitybot/database';
import { Command } from '../typings/Command';
import { LogInteractionError } from '../managers/ErrorManager';
import { ReplyToInteraction } from '../managers/MessageManager';
import { GetTranslations, Format } from '../managers/TranslationManager';
import { GetGuildUser, GetCurrentLevel, GetXpForNextLevel } from '../managers/GuildUserManager';

const Level: Command = {
  data: {
    name: 'level',
    description: 'See your or someone elses current level',
    options: [
      {
        type: Constants.ApplicationCommandOptionTypes.USER,
        name: 'user',
        description: 'The user you want to check the level of',
        required: false,
      },
    ],
    type: 'CHAT_INPUT',
  },
  needsAccessLevel: [],
  needsPermissions: ['ADMINISTRATOR'],
  ownerOnly: false,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      const translations = await GetTranslations(interaction.user.id, interaction.guildId!);

      const user = interaction.options.getUser('user') ?? interaction.user;

      const guildUser: GuildUser = await GetGuildUser(user.id, interaction.guildId!);

      if (guildUser === null) {
        await ReplyToInteraction(
          interaction,
          user === interaction.user ? translations.commands.level.not_spoken_yet : Format(translations.commands.level.user_not_spoken_yet, [['user', user.tag]]),
          true,
        );
        return;
      }

      await ReplyToInteraction(
        interaction,
        Format(
          user === interaction.user ? translations.commands.level.your_current_level : translations.commands.level.user_current_level,
          [['user', user.tag], ['level', GetCurrentLevel(guildUser).toString()], ['xp', GetXpForNextLevel(guildUser).toString()]],
        ),
        false,
      );
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default Level;
