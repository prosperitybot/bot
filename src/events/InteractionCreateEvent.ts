import {
  CommandInteraction, Client, Interaction, ButtonInteraction, SelectMenuInteraction,
} from 'discord.js';
import { User, CommandLog } from '@prosperitybot/database';
import Commands from '../managers/CommandManager';
import { CreateEmbed } from '../managers/MessageManager';
import { LogClientError } from '../managers/ErrorManager';
import { Event } from '../typings/Event';
import ButtonLists from '../managers/ButtonListManager';
import SelectMenus from '../managers/SelectMenuManager';
import { CommandLogger } from '../utils/Logging';
import { IsWhitelabel, UpdateClient } from '../managers/ClientManager';
import { BaseInteraction } from '../typings/BaseInteraction';

const HasPermission = async (
  client: Client,
  baseInteraction: BaseInteraction,
  interaction: ButtonInteraction<'cached'> | CommandInteraction<'cached'> | SelectMenuInteraction<'cached'>,
): Promise<boolean> => {
  if (baseInteraction.needsAccessLevel.length > 0 && interaction.user.id !== '126429064218017802') {
    const user = await User.findByPk(interaction.user.id);
    if (!user.access_levels.some((accessLevel: string) => baseInteraction.needsAccessLevel.includes(accessLevel))) {
      if (baseInteraction.needsAccessLevel.includes('WHITELABEL')) {
        interaction.reply({
          embeds: [
            CreateEmbed(IsWhitelabel(client)).setColor('BLURPLE').setDescription('This command requires WHITELABEL!\nYou can subscribe to the patreon [here](https://patreon.com/benhdev) to get access now!'),
          ],
          ephemeral: true,
        });
      } else {
        interaction.reply({ embeds: [CreateEmbed(IsWhitelabel(client)).setColor('RED').setDescription('Access Denied')], ephemeral: true });
      }
      return false;
    }
  }
  if (baseInteraction.needsPermissions.length > 0 && interaction.user.id !== '126429064218017802') {
    if (!interaction.member?.permissions.has(baseInteraction.needsPermissions)) {
      interaction.reply({ embeds: [CreateEmbed(IsWhitelabel(client)).setColor('RED').setDescription('Access Denied')], ephemeral: true });
      return false;
    }
  }

  return true;
};

const HandleSlashCommand = async (client: Client, interaction: CommandInteraction<'cached'>): Promise<void> => {
  const slashCommand = Commands.find((c) => c.data.name === interaction.commandName);
  if (!slashCommand) {
    interaction.followUp({ content: 'An error has occurred' });
    return;
  }

  CommandLogger.info(`${interaction.user.tag} ran /${interaction.commandName} in ${interaction.guild.name} - ${interaction.guildId} (#${interaction.channel?.name} - ${interaction.channelId})`);

  const hasPermission = await HasPermission(client, slashCommand, interaction);
  if (hasPermission) {
    await CommandLog.create({
      userId: interaction.user.id,
      guildId: interaction.guildId!,
      command: interaction.commandName,
    });

    slashCommand.run(client, interaction);
  }
};

const HandleButtonList = async (client: Client, interaction: ButtonInteraction<'cached'>): Promise<void> => {
  const buttonList = ButtonLists.find((c) => c.name === interaction.customId.split('-')[0]);
  if (!buttonList) {
    interaction.followUp({ content: 'An error has occurred' });
    return;
  }
  const hasPermission = await HasPermission(client, buttonList, interaction);

  if (hasPermission) {
    buttonList.execute(interaction);
  }
};

const HandleSelectMenu = async (client: Client, interaction: SelectMenuInteraction<'cached'>): Promise<void> => {
  const selectMenu = SelectMenus.find((c) => c.name === interaction.customId);
  if (!selectMenu) {
    interaction.reply({ content: 'An error has occurred' });
    return;
  }

  const hasPermission = await HasPermission(client, selectMenu, interaction);
  if (hasPermission) {
    selectMenu.execute(interaction);
  }
};

const InteractionCreateEvent: Event = {
  name: 'interactionCreate',
  type: 'on',
  on: async (client: Client, args: any[]) => {
    UpdateClient(client);
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
