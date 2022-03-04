import { Client, Guild } from 'discord.js';
import { LogGuildError } from '../managers/ErrorManager';
import { EventLogger } from '../utils/Logging';

export default (client: Client): void => {
  client.on('guildDelete', async (guild: Guild) => {
    try {
      EventLogger.info(`Left a guild '${guild.name}' (${guild.id}) with ${guild.memberCount} members.`);
    } catch (e) {
      await LogGuildError(e, guild);
    }
  });
};
