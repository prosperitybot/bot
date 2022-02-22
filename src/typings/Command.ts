import {
  CommandInteraction, ChatInputApplicationCommandData, Client, PermissionResolvable,
} from 'discord.js';

export interface Command extends ChatInputApplicationCommandData {
  needsAccessLevel: string[],
  needsPermissions: PermissionResolvable[],
  ownerOnly: Boolean,
  run: (client: Client, interaction: CommandInteraction) => void;
}
