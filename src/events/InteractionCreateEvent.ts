import {
  CommandInteraction, Client, Interaction, ButtonInteraction, SelectMenuInteraction,
} from 'discord.js';
import { User } from '@prosperitybot/database';
import Commands from '../managers/CommandManager';
import { CreateEmbed } from '../managers/MessageManager';
import { LogClientError } from '../managers/ErrorManager';
import { Event } from '../typings/Event';
import ButtonLists from '../managers/ButtonListManager';
import SelectMenus from '../managers/SelectMenuManager';
import { CommandLogger } from '../utils/Logging';

const HandleSlashCommand = async (client: Client, interaction: CommandInteraction<'cached'>): Promise<void> => {
  const slashCommand = Commands.find((c) => c.data.name === interaction.commandName);
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
  // eslint-disable-next-line max-len
  CommandLogger.info(`${interaction.user.tag} ran /${interaction.commandName} in ${interaction.guild.name} - ${interaction.guildId} (#${interaction.channel?.name} - ${interaction.channelId})`);
  slashCommand.run(client, interaction);
};

const HandleButtonList = async (client: Client, interaction: ButtonInteraction<'cached'>): Promise<void> => {
  const buttonList = ButtonLists.find((c) => c.name === interaction.customId.split('-')[0]);
  if (!buttonList) {
    interaction.followUp({ content: 'An error has occurred' });
    return;
  }

  if (buttonList.needsAccessLevel.length > 0 && interaction.user.id !== '126429064218017802') {
    const user = await User.findByPk(interaction.user.id);
    if (!user.access_levels.some((accessLevel: string) => buttonList.needsAccessLevel.includes(accessLevel))) {
      if (buttonList.needsAccessLevel.includes('WHITELABEL')) {
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
  if (buttonList.needsPermissions.length > 0 && interaction.user.id !== '126429064218017802') {
    if (!interaction.member?.permissions.has(buttonList.needsPermissions)) {
      interaction.reply({ embeds: [CreateEmbed().setColor('RED').setDescription('Access Denied')], ephemeral: true });
    }
  }
  buttonList.execute(interaction);
};

const HandleSelectMenu = async (client: Client, interaction: SelectMenuInteraction<'cached'>): Promise<void> => {
  const selectMenu = SelectMenus.find((c) => c.name === interaction.customId);
  if (!selectMenu) {
    interaction.reply({ content: 'An error has occurred' });
    return;
  }
  selectMenu.execute(interaction);
};

const InteractionCreateEvent: Event = {
  name: 'interactionCreate',
  type: 'on',
  on: async (client: Client, args: any[]) => {
    try {
      const interaction: Interaction = args[0];
      if (interaction instanceof CommandInteraction && interaction.inCachedGuild()) {
        await HandleSlashCommand(client, interaction);
      }
      if (interaction instanceof ButtonInteraction && interaction.inCachedGuild()) {
        await HandleButtonList(client, interaction);
      }
      if (interaction instanceof SelectMenuInteraction && interaction.inCachedGuild()) {
        await HandleSelectMenu(client, interaction);
      }
    } catch (e) {
      await LogClientError(e, client);
    }
  },
};

export default InteractionCreateEvent;
