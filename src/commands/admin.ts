import {
  BaseCommandInteraction, Client, MessageActionRow, MessageSelectMenu,
} from 'discord.js';
import * as Sentry from '@sentry/node';
import { Command } from '../types/Command';
import { ReplyToInteraction } from '../utils/messageUtils';

const Admin: Command = {
  name: 'admin',
  needsAccessLevel: [],
  needsPermissions: [],
  ownerOnly: true,
  description: 'Information about the bot',
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    try {
      const adminRow = new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId('admin_menu')
            .setPlaceholder('Admin Menu')
            .addOptions([
              {
                label: 'Deploy Commands',
                description: 'This will deploy all of the commands in case anything has changed',
                value: 'admin_deploy_commands',
                emoji: '💾',
              },
            ]),
        );
      const databaseAdminRow = new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId('db_admin_menu')
            .setPlaceholder('Database Menu')
            .addOptions([
              {
                label: 'Run Migrations',
                description: 'This runs all migrations / syncs on the database',
                value: 'db_run_migrations',
                emoji: '📜',
              },
              {
                label: 'Run Migrations (Force)',
                description: 'This runs all migrations / syncs on the database - THIS WILL NUKE THE DATABASE',
                value: 'db_run_migrations_force',
                emoji: '⚠️',
              },
              {
                label: 'Seed Database',
                description: 'This will add all of the cached guilds into the database',
                value: 'db_seed',
                emoji: '🌱',
              },
            ]),
        );

      ReplyToInteraction(interaction, 'Please select an action from the below...', true, [adminRow, databaseAdminRow]);
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

export default Admin;
