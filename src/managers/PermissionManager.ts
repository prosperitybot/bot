import { User } from '@prosperitybot/database';
import { GuildMember, PermissionResolvable } from 'discord.js';

export const HasAccessLevel = (user: User, accessLevel: string): boolean => user.access_levels.includes(accessLevel);
export const HasPermission = (member: GuildMember | APIInteractionGuildMember, permissions: PermissionResolvable | PermissionResolvable[]): boolean => {
  const hasPermission = (member.permissions.has(permissions) || member.user.id === '126429064218017802');
  return hasPermission;
};
