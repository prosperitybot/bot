import { PermissionResolvable } from 'discord.js';

export interface BaseInteraction {
  needsAccessLevel: string[],
  needsPermissions: PermissionResolvable[],
}
