import { Client, GuildMember } from 'discord.js';
import { GuildUser, User } from '@prosperitybot/database';
import { fn } from 'sequelize';
import { LogMemberError } from '../managers/ErrorManager';
import { Event } from '../typings/Event';

const GuildMemberAddEvent: Event = {
  name: 'guildMemberAdd',
  type: 'on',
  on: async (client: Client, args: any[]) => {
    const member: GuildMember = args[0];
    try {
      const guildUser: GuildUser | null = await GuildUser.findOne({ where: { userId: member.id, guildId: member.guild.id } });
      if (guildUser === null) {
        await User.upsert({
          id: member.id,
          username: member.user.username,
          discriminator: member.user.discriminator,
          access_levels: [''],
        });
        await GuildUser.create({
          userId: member.id,
          guildId: member.guild.id,
          level: 0,
          xp: 0,
          lastXpMessageSent: fn('NOW'),
        });
      }
    } catch (e) {
      await LogMemberError(e, member);
    }
  },
};

export default GuildMemberAddEvent;
