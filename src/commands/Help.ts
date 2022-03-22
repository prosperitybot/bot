import { BaseCommandInteraction, Client } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { Command } from '../typings/Command';
import { CreateEmbed } from '../managers/MessageManager';
import { LogInteractionError } from '../managers/ErrorManager';
import { IsWhitelabel } from '../managers/ClientManager';
// eslint-disable-next-line import/no-cycle
import Commands from '../managers/CommandManager';

const Help: Command = {
  data: {
    name: 'help',
    description: 'Provides a list of commands for the bot',
    type: 'CHAT_INPUT',
  },
  needsAccessLevel: [],
  needsPermissions: [],
  ownerOnly: false,
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    try {
      const allCommands = Commands;
      const whitelabelCommands = allCommands.filter((command) => command.needsAccessLevel.includes('WHITELABEL'));
      const regularCommands = allCommands.filter((command) => !command.needsAccessLevel.includes('OWNER'));

      const whitelabelCommandString = whitelabelCommands.map((c) => {
        const options = c.data.options?.filter((o) => o.type === ApplicationCommandOptionTypes.SUB_COMMAND).map((o) => `${o.name}`).join('/');
        return `**/${c.data.name} <${options}>**: ${c.data.description}\n`;
      }).join('');

      const regularCommandString = regularCommands.map((c) => {
        const options = c.data.options?.filter((o) => o.type === ApplicationCommandOptionTypes.SUB_COMMAND).map((o) => `${o.name}`).join('/');
        return options === undefined || options === '' ? `**/${c.data.name}**: ${c.data.description}\n` : `**/${c.data.name} <${options}>**: ${c.data.description}\n`;
      }).join('');

      const embed = CreateEmbed(IsWhitelabel(client))
        .addField('General Commands', regularCommandString, false)
        .addField('Whitelabel Commands', whitelabelCommandString, false);

      interaction.reply({ embeds: [embed], ephemeral: true });

      return;
    } catch (e) {
      await LogInteractionError(e, interaction);
    }
  },
};

export default Help;
