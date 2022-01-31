const { Guild } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { eventLogger } = require('../utils/loggingUtils');

module.exports = {
  name: 'guildDelete',
  async execute(guild) {
    try {
      const dbGuild = await Guild.findByPk(guild.id);
      dbGuild.active = false;
      await dbGuild.save();

      guild.client.user.setActivity(`${guild.client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} members in ${guild.client.guilds.cache.size} servers`, { type: 'WATCHING' });
      eventLogger.info(`Left a guild '${guild.name}' (${guild.id}) with ${guild.memberCount} members`);
    } catch (e) {
      Sentry.setTag('guild_id', guild.id);
      Sentry.setTag('bot_id', guild.client.application.id);
      Sentry.captureException(e);
    }
  },
};
