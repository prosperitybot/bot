const { Guild } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { eventLogger } = require('../utils/loggingUtils');
const clientManager = require('../clientManager');

module.exports = {
  name: 'guildDelete',
  async execute(guild) {
    try {
      const dbGuild = await Guild.findByPk(guild.id);
      dbGuild.active = false;
      await dbGuild.save();

      const guildCount = clientManager.getTotalGuildCount();
      const memberCount = clientManager.getTotalMemberCount();
      guild.client.user.setActivity(`over ${memberCount} members (${guildCount} servers)`, { type: 'WATCHING' });

      eventLogger.info(`Left a guild '${guild.name}' (${guild.id}) with ${guild.memberCount} members`);
    } catch (e) {
      Sentry.setTag('guild_id', guild.id);
      Sentry.setTag('bot_id', guild.client.application.id);
      Sentry.captureException(e);
    }
  },
};
