import {
  Client, CommandInteraction, Constants, GuildMember, User,
} from 'discord.js';
import { Guild, GuildUser, LevelRole } from '@prosperitybot/database';
import { Op } from 'sequelize';
import { APIInteractionDataResolvedGuildMember } from 'discord.js/node_modules/discord-api-types';
import { Command } from '../typings/Command';
import { LogInteractionError } from '../managers/ErrorManager';
import { Format, GetTranslations } from '../managers/TranslationManager';
import { ReplyToInteraction } from '../managers/MessageManager';
import { AttemptToInitialiseUser, GetXpNeededForLevel } from '../managers/GuildUserManager';
import { IsWhitelabel } from '../managers/ClientManager';

const Xp: Command = {
  data: {
    name: 'xp',
    description: 'Provides commands to give/remove xp from a user',
    options: [
      {
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'give',
        description: 'Gives xp to a user',
        options: [
          {
            type: Constants.ApplicationCommandOptionTypes.USER,
            name: 'user',
            description: 'The user you want to give xp to',
            required: true,
          },
          {
            type: Constants.ApplicationCommandOptionTypes.INTEGER,
            name: 'amount',
            description: 'The amount of xp to give',
            required: true,
            minValue: 1,
          },
        ],
      },
      {
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'take',
        description: 'Takes xp from a user',
        options: [
          {
            type: Constants.ApplicationCommandOptionTypes.USER,
            name: 'user',
            description: 'The user you want to take xp from',
            required: true,
          },
          {
            type: Constants.ApplicationCommandOptionTypes.INTEGER,
            name: 'amount',
            description: 'The amount of xp to take',
            required: true,
            minValue: 1,
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
      const translations = await GetTranslations(interaction.user.id, interaction.guildId!);
      const command: string = interaction.options.getSubcommand();
      const user: User = interaction.options.getUser('user', true);
      const member: GuildMember | APIInteractionDataResolvedGuildMember = interaction.options.getMember('user', true);
      const amount: number = interaction.options.getInteger('amount', true);

      const attemptInitialise = await AttemptToInitialiseUser(client, user.id, interaction.guildId!);

      if (attemptInitialise === false) {
        await ReplyToInteraction(interaction, 'User not found', true, IsWhitelabel(client));
        return;
      }

      const guildUser: GuildUser | null = await GuildUser.findOne({ where: { userId: user.id, guildId: interaction.guildId } });
      const guild: Guild = await Guild.findByPk(interaction.guildId);

      if (guildUser === null) {
        await ReplyToInteraction(interaction, Format(translations.commands.xp.user_doesnt_exist, [['user', interaction.user.tag]]), true, IsWhitelabel(client));
        return;
      }

      switch (command) {
        case 'give': {
          guildUser.xp += amount;

          let levelToSet = guildUser.level;
          let levelFound = false;

          while (levelFound === false) {
            if (guildUser.xp > GetXpNeededForLevel(levelToSet)) {
              levelToSet += 1;
            } else {
              levelFound = true;
            }
          }

          if (guildUser.level !== levelToSet) {
            guildUser.level = levelToSet;
            const newLevelRole: LevelRole = await LevelRole.findOne({ where: { level: guildUser.level, guildId: interaction.guildId } });
            if (newLevelRole !== null) {
              if (member instanceof GuildMember) {
                member.roles.add(newLevelRole.id, `xp was added to the user by ${interaction.user.tag}`);
              }
            }
            if (guild.roleAssignType !== 'stack') {
              const oldLevelRole: LevelRole = await LevelRole.findOne({
                where: {
                  level: { [Op.lt]: guildUser.level },
                  guildId: interaction.guildId,
                },
              });
              if (member instanceof GuildMember && oldLevelRole !== null) {
                member.roles.remove(oldLevelRole.id, 'user levelled up to a new level');
              }
            }
          }
          await guildUser.save();
          await ReplyToInteraction(interaction, Format(translations.commands.xp.xp_added, [['user', user.tag], ['amount', amount]]), false, IsWhitelabel(client));
          break;
        }
        case 'take': {
          guildUser.xp -= amount;

          let levelToSet = guildUser.level;
          let levelFound = false;

          while (levelFound === false) {
            if (guildUser.xp < GetXpNeededForLevel(levelToSet)) {
              levelToSet -= 1;
            } else {
              levelFound = true;
            }
          }

          if (guildUser.level !== levelToSet) {
            guildUser.level = levelToSet;
            const newLevelRole: LevelRole = await LevelRole.findOne({ where: { level: guildUser.level, guildId: interaction.guildId } });
            if (newLevelRole !== null) {
              if (member instanceof GuildMember) {
                member.roles.add(newLevelRole.id, `xp was removed from the user by ${interaction.user.tag}`);
              }
            }
            const oldLevelRole: LevelRole = await LevelRole.findOne({
              where: {
                level: { [Op.gt]: guildUser.level },
                guildId: interaction.guildId,
              },
            });
            if (member instanceof GuildMember && oldLevelRole !== null) {
              member.roles.remove(oldLevelRole.id, 'user deranked to a new level');
            }
          }
          await guildUser.save();
          await ReplyToInteraction(interaction, Format(translations.commands.xp.xp_taken, [['user', user.tag], ['amount', amount]]), false, IsWhitelabel(client));
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

export default Xp;
