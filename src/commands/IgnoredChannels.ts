import {
  CommandInteraction, Client, Constants,
} from 'discord.js';
import * as Sentry from '@sentry/node';
import { IgnoredChannel } from '@prosperitybot/database';
import { Command } from '../typings/Command';
import { ReplyToInteraction } from '../utils/messageUtils';

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
      const command: string = interaction.options.getSubcommand();
      const channel = interaction.options.getChannel('channel');
      switch (command) {
        case 'add': {
          if (channel === null) {
            await ReplyToInteraction(interaction, 'Channel does not exist', true);
          }
          const ignoredChannel: IgnoredChannel = await IgnoredChannel.findOne({ where: { id: channel?.id } });
          if (ignoredChannel !== null) {
            // await ReplyToInteraction(interaction)
          }
          // const channel = interaction.options.getChannel('channel');
          // const ignoredChannel = await IgnoredChannel.findOne({ where: { id: channel.id } });
          // if (ignoredChannel != null) {
          //   await reply(
          //     interaction,
          //     translationManager.format(
          //       translations.commands.ignoredchannels.channel_already_ignored,
          //       [['channel', channel]],
          //     ),
          //     true,
          //   );
          //   break;
          // }

          // await IgnoredChannel.create({
          //   id: channel.id,
          //   guildId: interaction.guild.id,
          // });

          // await reply(
          //   interaction,
          //   translationManager.format(
          //     translations.commands.ignoredchannels.channel_now_ignored,
          //     [['channel', channel]],
          //   ),
          //   false,
          // );
          break;
        }
        default:
          break;
      }

      // await ReplyToInteraction(interaction, 'Please message Ben#2028 to get your levels migrated', true);
      return;
    } catch (e) {
      Sentry.setTag('guild_id', interaction.guild?.id);
      Sentry.setTag('bot_id', interaction.applicationId);
      Sentry.setTag('user_id', interaction.user.id);
      Sentry.setTag('command', interaction.commandName);
      const errorCode = Sentry.captureException(e);
      await ReplyToInteraction(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
    }
  },
};

export default IgnoredChannels;
