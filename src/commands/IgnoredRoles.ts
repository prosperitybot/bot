import {
  CommandInteraction, Client, Constants,
} from 'discord.js';
import { IgnoredRole } from '@prosperitybot/database';
import { LogInteractionError } from '../managers/ErrorManager';
import { Command } from '../typings/Command';
import { ReplyToInteraction } from '../managers/MessageManager';
import { GetTranslations, Format } from '../managers/TranslationManager';

const IgnoredRoles: Command = {
  name: 'ignoredroles',
  needsAccessLevel: [],
  needsPermissions: ['ADMINISTRATOR'],
  ownerOnly: false,
  description: 'Manages roles that are ignored from gaining xp',
  options: [
    {
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
      name: 'add',
      description: 'Adds an ignored role',
      options: [
        {
          type: Constants.ApplicationCommandOptionTypes.ROLE,
          name: 'role',
          description: 'The role to ignore',
          required: true,
        },
      ],
    },
    {
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
      name: 'remove',
      description: 'Removes an ignored role',
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
      description: 'Lists all ignored roles',
    },
  ],
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      const translations = await GetTranslations(interaction.user.id, interaction.guildId!);
      const command: string = interaction.options.getSubcommand();
      const role = interaction.options.getRole('role');
      switch (command) {
        case 'add': {
          if (role === null) {
            await ReplyToInteraction(interaction, 'Role does not exist', true);
          }
          const ignoredRole: IgnoredRole = await IgnoredRole.findOne({ where: { id: role?.id } });
          if (ignoredRole !== null) {
            await ReplyToInteraction(interaction, Format(translations.commands.ignoredroles.role_already_ignored, [['role', role?.toString()!]]), true);
            break;
          }

          await IgnoredRole.create({
            id: role!.id,
            guildId: interaction.guild!.id,
          });

          await ReplyToInteraction(interaction, Format(translations.commands.ignoredroles.role_now_ignored, [['role', role?.toString()!]]));
          break;
        }
        case 'remove': {
          if (role === null) {
            await ReplyToInteraction(interaction, 'Role does not exist', true);
          }
          const ignoredRole: IgnoredRole = await IgnoredRole.findOne({ where: { id: role?.id } });
          if (ignoredRole === null) {
            await ReplyToInteraction(interaction, Format(translations.commands.ignoredroles.role_not_ignored, [['role', role?.toString()!]]), true);
            break;
          }

          await ignoredRole.destroy();

          await ReplyToInteraction(interaction, Format(translations.commands.ignoredroles.role_now_not_ignored, [['role', role?.toString()!]]));
          break;
        }
        case 'list': {
          const ignoredRoles: IgnoredRole[] = await IgnoredRole.findAll({ where: { guildId: interaction.guild!.id } });
          let listMsg = `${translations.commands.ignoredroles.role_list_title}: \n`;
          ignoredRoles.forEach((c) => {
            listMsg += `\n- <#${c.id}>`;
          });

          await ReplyToInteraction(interaction, listMsg, false);
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

export default IgnoredRoles;
