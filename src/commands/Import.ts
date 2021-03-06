import { BaseCommandInteraction, Client } from 'discord.js';
import * as Sentry from '@sentry/node';
import { Command } from '../typings/Command';
import { ReplyToInteraction } from '../managers/MessageManager';
import { IsWhitelabel } from '../managers/ClientManager';

const Import: Command = {
  data: {
    name: 'import',
    description: 'Import levels from another bot',
    type: 'CHAT_INPUT',
  },
  needsAccessLevel: [],
  needsPermissions: [],
  ownerOnly: false,
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    try {
      await ReplyToInteraction(interaction, 'Please message Ben#2028 to get your levels migrated', true, IsWhitelabel(client));
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
