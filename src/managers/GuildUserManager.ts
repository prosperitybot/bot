import { GuildUser } from '@prosperitybot/database';

export const GetGuildUser = async (userId: string, guildId: string): Promise<GuildUser | null> => {
  const guildUser = await GuildUser.findOne({ where: { userId, guildId } });
  return guildUser;
};

export const GetCurrentLevel = (user: GuildUser): number => user.level;

export const GetXpForNextLevel = (user: GuildUser): number => {
  const nextLevel = user.level + 1;
  return Math.ceil((5 / 6) * nextLevel * (2 * nextLevel * nextLevel + 27 * nextLevel + 91));
};
