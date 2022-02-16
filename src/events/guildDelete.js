const Sentry = require('@sentry/node');
const { eventLogger } = require('../utils/loggingUtils');

module.exports = {
  name: 'guildDelete',
  async execute(guild) {
    try {
      eventLogger.info(`Left a guild '${guild.name}' (${guild.id}) with ${guild.memberCount} members`);
    } catch (e) {
      Sentry.setTag('guild_id', guild.id);
      Sentry.setTag('bot_id', guild.client.application.id);
      Sentry.captureException(e);
    }
  },
};
