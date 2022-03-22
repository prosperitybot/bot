import { SelectMenuInteraction } from 'discord.js';
import Commands from '../managers/CommandManager';
import { LogInteractionError } from '../managers/ErrorManager';
import { ReplyToInteraction } from '../managers/MessageManager';
import { SelectMenu } from '../typings/SelectMenu';

const AdminSelectMenu: SelectMenu = {
  name: 'admin_menu',
  needsAccessLevel: ['OWNER'],
  needsPermissions: [],
  execute: async (interaction: SelectMenuInteraction) => {
    try {
      switch (interaction.values[0]) {
        case 'admin_deploy_commands':
          await interaction.client.application?.commands.set(Commands.map((c) => c.data));
          await ReplyToInteraction(interaction, 'Deployed Commands Successfully', true);
          break;
        default:
          break;
      }
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default AdminSelectMenu;
