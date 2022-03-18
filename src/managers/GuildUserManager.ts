import { GuildUser, User } from '@prosperitybot/database';
import { Client } from 'discord.js';
import { LogClientError } from './ErrorManager';

export const GetGuildUser = async (userId: string, guildId: string): Promise<GuildUser | null> => {
  const guildUser = await GuildUser.findOne({ where: { userId, guildId } });
  return guildUser;
};

export const AttemptToInitialiseUser = async (client: Client, userId: string, guildId: string): Promise<boolean> => {
  try {
    const guildUser: GuildUser = await GuildUser.findOne({ where: { userId, guildId } });
    if (guildUser === null) {
      const user: User | null = await User.findByPk(userId);

      if (user === null) {
        const discordUser = await client.users.fetch(userId);
        await User.create({
          id: discordUser.id,
          username: discordUser.username,
          discriminator: discordUser.discriminator,
        });
      }

      await GuildUser.create({
        userId,
        guildId,
      });
    }

    return true;
  } catch (e) {
    await LogClientError(e, client);
    return false;
  }
};

export const GetCurrentLevel = (user: GuildUser): number => user.level;

export const GetXpForNextLevel = (user: GuildUser): number => {
  const nextLevel = user.level + 1;
  return Math.ceil((5 / 6) * nextLevel * (2 * nextLevel * nextLevel + 27 * nextLevel + 91));
};

export const GetXpNeededForUserLevel = (user: GuildUser, difference: number = 0): number => {
  const nextLevel = user.level + difference;
  return Math.ceil((5 / 6) * nextLevel * (2 * nextLevel * nextLevel + 27 * nextLevel + 91));
};

export const GetXpNeededForLevel = (level: number = 0): number => Math.ceil((5 / 6) * level * (2 * level * level + 27 * level + 91));
