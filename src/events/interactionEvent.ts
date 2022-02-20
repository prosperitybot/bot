import { CommandInteraction, Client, Interaction } from 'discord.js';
import { User } from '@prosperitybot/database';
import Commands from '../commands';
import { CreateEmbed } from '../utils/messageUtils';

const handleSlashCommand = async (client: Client, interaction: CommandInteraction<'cached'>): Promise<void> => {
  const slashCommand = Commands.find((c) => c.name === interaction.commandName);
  if (!slashCommand) {
    interaction.followUp({ content: 'An error has occurred' });
    return;
  }

  if (slashCommand.ownerOnly === true) {
    if (interaction.user.id !== '126429064218017802') {
      interaction.reply({ embeds: [CreateEmbed().setColor('RED').setDescription('Access Denied')], ephemeral: true });
    }
  }
  if (slashCommand.needsAccessLevel.length > 0 && interaction.user.id !== '126429064218017802') {
    const user = await User.findByPk(interaction.user.id);
    if (!user.access_levels.some((accessLevel: string) => slashCommand.needsAccessLevel.includes(accessLevel))) {
      interaction.reply({ embeds: [CreateEmbed().setColor('RED').setDescription('Access Denied')], ephemeral: true });
    }
  }
  if (slashCommand.needsPermissions.length > 0 && interaction.user.id !== '126429064218017802') {
    if (!interaction.member?.permissions.has(slashCommand.needsPermissions)) {
      interaction.reply({ embeds: [CreateEmbed().setColor('RED').setDescription('Access Denied')], ephemeral: true });
    }
  }
  slashCommand.run(client, interaction);
};

export default (client: Client): void => {
  client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isCommand() && interaction.inCachedGuild()) {
      await handleSlashCommand(client, interaction);
    }
  });
};
