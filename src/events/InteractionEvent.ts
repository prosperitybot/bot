import { CommandInteraction, Client, Interaction } from 'discord.js';
import { User } from '@prosperitybot/database';
import Commands from '../managers/CommandManager';
import { CreateEmbed } from '../managers/MessageManager';

const HandleSlashCommand = async (client: Client, interaction: CommandInteraction<'cached'>): Promise<void> => {
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
      if (slashCommand.needsAccessLevel.includes('WHITELABEL')) {
        interaction.reply({
          embeds: [
            CreateEmbed().setColor('BLURPLE').setDescription('This command requires WHITELABEL!\nYou can subscribe to the patreon [here](https://patreon.com/benhdev) to get access now!'),
          ],
          ephemeral: true,
        });
      } else {
        interaction.reply({ embeds: [CreateEmbed().setColor('RED').setDescription('Access Denied')], ephemeral: true });
      }
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
      await HandleSlashCommand(client, interaction);
    }
  });
};