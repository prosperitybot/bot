import {
  Client, CommandInteraction, Constants,
} from 'discord.js';
import { GuildUser, LevelRole } from '@prosperitybot/database';
import { Op } from 'sequelize';
import { Command } from '../typings/Command';
import { LogInteractionError } from '../managers/ErrorManager';
import { EditReplyToInteraction, ReplyToInteraction } from '../managers/MessageManager';
import { GetTranslations, Format } from '../managers/TranslationManager';
import { IsWhitelabel } from '../managers/ClientManager';

const LevelRoles: Command = {
  data: {
    name: 'levelroles',
    description: 'Manages level roles',
    options: [
      {
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'add',
        description: 'Adds a level role',
        options: [
          {
            type: Constants.ApplicationCommandOptionTypes.ROLE,
            name: 'role',
            description: 'The role to give',
            required: true,
          },
          {
            type: Constants.ApplicationCommandOptionTypes.INTEGER,
            name: 'level',
            description: 'The level to give the role at',
            required: true,
          },
        ],
      },
      {
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'remove',
        description: 'Removes a level role',
        options: [
          {
            type: Constants.ApplicationCommandOptionTypes.ROLE,
            name: 'role',
            description: 'The role to remove',
            required: true,
          },
        ],
      },
      {
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'list',
        description: 'Lists all level roles',
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
      const command: string = interaction.options.getSubcommand();
      const role = interaction.options.getRole('role');
      const level = interaction.options.getInteger('level');
      switch (command) {
        case 'add': {
          if (role === null || level === null) {
            await ReplyToInteraction(interaction, 'Role does not exist', true);
          }
          const levelRole: LevelRole = await LevelRole.findOne({ where: { id: role?.id } });
          if (levelRole !== null) {
            await ReplyToInteraction(interaction, Format(translations.commands.levelroles.role_already_used, [['role', role?.toString()!]]), true);
            break;
          }

          if (level! < 1) {
            await ReplyToInteraction(interaction, translations.commands.levelroles.level_must_be_positive, true);
            break;
          }

          await LevelRole.create({
            id: role!.id,
            guildId: interaction.guild!.id,
            level: level!,
          });

          await ReplyToInteraction(interaction, Format(translations.commands.levelroles.role_granted, [['role', role!.toString()], ['level', level!]]), false, IsWhitelabel(client));

          let nextHighestLevel = 1000;
          const nextLevel = await LevelRole.findOne({ where: { level: { [Op.gt]: level } } });
          if (nextLevel !== null) {
            nextHighestLevel = nextLevel.level;
          }

          const { count: memCount, rows: members } = await GuildUser.findAndCountAll({
            where: {
              level: { [Op.gte]: level, [Op.lt]: nextHighestLevel },
              guildId: interaction.guildId,
            },
          });

          await EditReplyToInteraction(interaction, Format(translations.commands.levelroles.role_granted_status, [['level', level!], ['amount', memCount]]), IsWhitelabel(client));

          members.forEach(async (member: GuildUser) => {
            interaction.guild?.members.fetch(member.userId).then(async (gMember) => {
              gMember.roles.add(role!.id, `${interaction.user.tag} added a level role using /levelroles`);
              if (Object.is(members.length - 1, member)) {
                await EditReplyToInteraction(interaction, Format(translations.commands.levelroles.role_granted_status_complete, [['level', level!], ['amount', memCount]]), IsWhitelabel(client));
              }
            }).catch((e) => console.log(`Could not add role - ${e}`));
          });

          break;
        }
        case 'remove': {
          if (role === null) {
            await ReplyToInteraction(interaction, 'Role does not exist', true, IsWhitelabel(client));
          }
          const levelRole: LevelRole = await LevelRole.findOne({ where: { id: role?.id } });
          if (levelRole === null) {
            await ReplyToInteraction(interaction, Format(translations.commands.levelroles.role_not_used, [['role', role!.toString()]]), true, IsWhitelabel(client));
            break;
          }

          await levelRole.destroy();

          await ReplyToInteraction(interaction, Format(translations.commands.levelroles.role_removed, [['role', role!.toString()], ['level', level!]]), false, IsWhitelabel(client));
          break;
        }
        case 'list': {
          const levelRoles: LevelRole[] = await LevelRole.findAll({ where: { guildId: interaction.guild!.id } });
          let listMsg = `${translations.commands.ignoredroles.role_list_title}: \n`;
          levelRoles.forEach((c) => {
            listMsg += `\n- <#${c.id}>`;
          });

          await ReplyToInteraction(interaction, listMsg, false, IsWhitelabel(client));
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

export default LevelRoles;
