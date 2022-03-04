import {
  BaseCommandInteraction, Client, MessageActionRow, MessageSelectMenu,
} from 'discord.js';
import { Command } from '../typings/Command';
import { ReplyToInteraction } from '../managers/MessageManager';
import { LogInteractionError } from '../managers/ErrorManager';

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
            ]),
        );

      ReplyToInteraction(interaction, 'Please select an action from the below...', true, [adminRow, databaseAdminRow]);
      return;
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default Admin;
