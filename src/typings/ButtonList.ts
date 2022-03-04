import { ButtonInteraction, PermissionResolvable } from 'discord.js';

export interface ButtonList {
  name: string,
  needsAccessLevel: string[],
  needsPermissions: PermissionResolvable[],
  execute: (interaction: ButtonInteraction) => void;
}
