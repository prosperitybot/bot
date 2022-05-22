import { Client, CommandInteraction, Constants } from 'discord.js';
import { Command } from '../typings/Command';
import { LogInteractionError } from '../managers/ErrorManager';
import { ReplyToInteraction } from '../managers/MessageManager';
import { GetTranslations, Format } from '../managers/TranslationManager';
import {
  AttemptToInitialiseUser,
  GetGuildUser,
  GetXpNeededForUserLevel,
} from '../managers/GuildUserManager';
import { IsWhitelabel } from '../managers/ClientManager';

const Levels: Command = {
  data: {
    name: 'levels',
    description: 'Manages user levels',
    options: [
      {
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'give',
        description: 'Gives levels to a user',
        options: [
          {
            type: Constants.ApplicationCommandOptionTypes.USER,
            name: 'user',
            description: 'The user to give levels to',
            required: true,
          },
          {
            type: Constants.ApplicationCommandOptionTypes.INTEGER,
            name: 'levels',
            description: 'The amount of levels to give',
            required: true,
          },
        ],
      },
      {
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'take',
        description: 'Takes levels from a user',
        options: [
          {
            type: Constants.ApplicationCommandOptionTypes.USER,
            name: 'user',
            description: 'The user to take levels from',
            required: true,
          },
          {
            type: Constants.ApplicationCommandOptionTypes.INTEGER,
            name: 'levels',
            description: 'The amount of levels to take',
            required: true,
          },
        ],
      },
    ],
    type: 'CHAT_INPUT',
  },
  needsAccessLevel: [],
  needsPermissions: ['MANAGE_MESSAGES', 'MANAGE_ROLES'],
  ownerOnly: false,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      const translations = await GetTranslations(
        interaction.user.id,
        interaction.guildId!,
      );
      const command: string = interaction.options.getSubcommand();
      const user = interaction.options.getUser('user');
      const levels = interaction.options.getInteger('levels');

      if (user === null || levels === null) {
        await ReplyToInteraction(
          interaction,
          Format(translations.commands.levels.user_doesnt_exist, [
            ['user', user!.toString()],
          ]),
          true,
          IsWhitelabel(client),
        );
        return;
      }

      const attemptInitialise = await AttemptToInitialiseUser(
        client,
        user.id,
        interaction.guildId!,
      );

      if (attemptInitialise === false) {
        await ReplyToInteraction(
          interaction,
          'User not found',
          true,
          IsWhitelabel(client),
        );
        return;
      }

      const gUser = await GetGuildUser(user.id, interaction.guildId!);
      switch (command) {
        case 'give': {
          if (levels <= 0) {
            await ReplyToInteraction(
              interaction,
              translations.commands.levels.level_to_give_must_be_positive,
              true,
              IsWhitelabel(client),
            );
            break;
          }

          gUser.level += levels;
          gUser.xp = GetXpNeededForUserLevel(gUser, levels);
          await gUser.save();

          await ReplyToInteraction(
            interaction,
            Format(translations.commands.levels.levels_added, [
              ['amount', levels],
              ['plural', levels > 1 ? 's' : ''],
              ['user', user.tag],
            ]),
            false,
            IsWhitelabel(client),
          );

          break;
        }
        case 'take': {
          if (levels <= 0) {
            await ReplyToInteraction(
              interaction,
              translations.commands.levels.level_to_take_must_be_positive,
              true,
              IsWhitelabel(client),
            );
            break;
          }

          gUser.level -= levels;
          gUser.xp = GetXpNeededForUserLevel(gUser);
          await gUser.save();

          await ReplyToInteraction(
            interaction,
            Format(translations.commands.levels.levels_taken, [
              ['amount', levels],
              ['plural', levels > 1 ? 's' : ''],
              ['user', user.tag],
            ]),
            false,
            IsWhitelabel(client),
          );

          break;
        }
        default:
          break;
      }
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default Levels;
