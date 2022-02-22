import {
  CommandInteraction, Client, Constants,
} from 'discord.js';
import { IgnoredChannel } from '@prosperitybot/database';
import { LogInteractionError } from '../managers/ErrorManager';
import { Command } from '../typings/Command';
import { ReplyToInteraction } from '../managers/MessageManager';
import { GetTranslations, Format } from '../managers/TranslationManager';

const IgnoredChannels: Command = {
  name: 'ignoredchannels',
  needsAccessLevel: [],
  needsPermissions: ['ADMINISTRATOR'],
  ownerOnly: false,
  description: 'Manages channels that are ignored from gaining xp',
  options: [
    {
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
      name: 'add',
      description: 'Adds an ignored channel',
      options: [
        {
          type: Constants.ApplicationCommandOptionTypes.CHANNEL,
          name: 'channel',
          description: 'The channel to ignore',
          required: true,
        },
      ],
    },
    {
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
      name: 'remove',
      description: 'Removes an ignored channel',
      options: [
        {
          type: Constants.ApplicationCommandOptionTypes.CHANNEL,
          name: 'channel',
          description: 'The channel to remove',
          required: true,
        },
      ],
    },
    {
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
      name: 'list',
      description: 'Lists all ignored channels',
    },
  ],
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      const translations = await GetTranslations(interaction.user.id, interaction.guildId!);
      const command: string = interaction.options.getSubcommand();
      const channel = interaction.options.getChannel('channel');
      switch (command) {
        case 'add': {
          if (channel === null) {
            await ReplyToInteraction(interaction, 'Channel does not exist', true);
          }
          const ignoredChannel: IgnoredChannel = await IgnoredChannel.findOne({ where: { id: channel?.id } });
          if (ignoredChannel !== null) {
            await ReplyToInteraction(interaction, Format(translations.commands.ignoredchannels.channel_already_ignored, [['channel', channel?.toString()!]]), true);
            break;
          }

          await IgnoredChannel.create({
            id: channel!.id,
            guildId: interaction.guild!.id,
          });

          await ReplyToInteraction(interaction, Format(translations.commands.ignoredchannels.channel_now_ignored, [['channel', channel?.toString()!]]));
          break;
        }
        case 'remove': {
          if (channel === null) {
            await ReplyToInteraction(interaction, 'Channel does not exist', true);
          }
          const ignoredChannel: IgnoredChannel = await IgnoredChannel.findOne({ where: { id: channel?.id } });
          if (ignoredChannel === null) {
            await ReplyToInteraction(interaction, Format(translations.commands.ignoredchannels.channel_not_ignored, [['channel', channel?.toString()!]]), true);
            break;
          }

          await ignoredChannel.destroy();

          await ReplyToInteraction(interaction, Format(translations.commands.ignoredchannels.channel_now_not_ignored, [['channel', channel?.toString()!]]));
          break;
        }
        case 'list': {
          const ignoredChannels: IgnoredChannel[] = await IgnoredChannel.findAll({ where: { guildId: interaction.guild!.id } });
          let listMsg = `${translations.commands.ignoredchannels.channel_list_title}: \n`;
          ignoredChannels.forEach((c) => {
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

export default IgnoredChannels;
