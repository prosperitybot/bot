import { SelectMenuInteraction } from 'discord.js';
import { migrate } from '@prosperitybot/database';
import { LogInteractionError } from '../managers/ErrorManager';
import { ReplyToInteraction } from '../managers/MessageManager';
import { SelectMenu } from '../typings/SelectMenu';

const DbAdminSelectMenu: SelectMenu = {
  name: 'db_admin_menu',
  execute: async (interaction: SelectMenuInteraction) => {
    try {
      switch (interaction.values[0]) {
        case 'db_run_migrations':
          migrate();
          await ReplyToInteraction(interaction, 'Migrations Ran Successfully', true);
          break;
        default:
          break;
      }
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default DbAdminSelectMenu;
