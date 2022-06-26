import {
  Client, CommandInteraction, Constants, MessageActionRow, MessageSelectMenu,
} from 'discord.js';
import { PremiumKey } from '@prosperitybot/database';
import { v4 as uuidv4 } from 'uuid';
import { Command } from '../typings/Command';
import { ReplyToInteraction } from '../managers/MessageManager';
import { LogInteractionError } from '../managers/ErrorManager';
import { IsWhitelabel } from '../managers/ClientManager';

const Admin: Command = {
  data: {
    name: 'admin',
    description: 'Information about the bot',
    type: 'CHAT_INPUT',
    options: [
      {
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'menu',
        description: 'Opens the admin menu',
      },
      {
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: 'createkey',
        description: 'Creates a premium key',
        options: [
          {
            type: Constants.ApplicationCommandOptionTypes.INTEGER,
            name: 'key_count',
            description: 'Amount of keys to create',
            required: true,
            minValue: 1,
          },
          {
            type: Constants.ApplicationCommandOptionTypes.INTEGER,
            name: 'key_expiry',
            description: 'Set how many days until the key expires',
            required: true,
            minValue: -1,
          },
        ],
      },
    ],
  },
  needsAccessLevel: ['OWNER'],
  needsPermissions: [],
  ownerOnly: true,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      const command: string = interaction.options.getSubcommand();
      // const guild: Guild = await Guild.findByPk(interaction.guildId!);

      switch (command) {
        case 'createkey': {
          const keyCount = interaction.options.getInteger('key_count', true);
          const keyExpiryDays = interaction.options.getInteger('key_expiry', true);

          let reply = `Generated **${keyCount}** keys that expire after **${keyExpiryDays}** days: \n`;

          // eslint-disable-next-line no-plusplus
          for (let i = 1; i <= keyCount; i++) {
            const key: string = uuidv4();
            PremiumKey.create({
              duration: keyExpiryDays,
              key,
              redeemed: false,
            });
            reply += `${keyCount}. \`${key}\`\n`;
          }

          ReplyToInteraction(interaction, reply, true, IsWhitelabel(client));
          break;
        }
        case 'menu': {
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

          ReplyToInteraction(interaction, 'Please select an action from the below...', true, IsWhitelabel(client), [adminRow, databaseAdminRow]);
          return;
        }
        default:
          break;
      }
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default Admin;
