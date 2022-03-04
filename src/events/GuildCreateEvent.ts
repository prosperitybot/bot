import { Client, Guild } from 'discord.js';
import { Guild as dGuild } from '@prosperitybot/database';
import { LogGuildError } from '../managers/ErrorManager';
import { Event } from '../typings/Event';
import { EventLogger } from '../utils/Logging';

const GuildCreateEvent: Event = {
  name: 'guildCreate',
  type: 'on',
  on: async (client: Client, guild: Guild) => {
    try {
      await dGuild.upsert({
        id: guild.id,
        name: guild.name,
        active: true,
      });
      EventLogger.info(`Joined a guild '${guild.name}' (${guild.id}) with ${guild.memberCount} members.`);
    } catch (e) {
      await LogGuildError(e, guild);
    }
  },
};

export default GuildCreateEvent;
