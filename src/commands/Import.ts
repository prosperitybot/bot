import { BaseCommandInteraction, Client } from 'discord.js';
import * as Sentry from '@sentry/node';
import { Command } from '../typings/Command';
import { ReplyToInteraction } from '../utils/messageUtils';

const Import: Command = {
  name: 'import',
  needsAccessLevel: [],
  needsPermissions: [],
  ownerOnly: false,
  description: 'Import levels from another bot',
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    try {
      await ReplyToInteraction(interaction, 'Please message Ben#2028 to get your levels migrated', true);
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

export default Import;
