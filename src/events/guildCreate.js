const { Guild } = require('@prosperitybot/database');
const Sentry = require('@sentry/node');
const { eventLogger } = require('../utils/loggingUtils');
const clientManager = require('../clientManager');

module.exports = {
  name: 'guildCreate',
  async execute(guild) {
    try {
      let dbGuild = await Guild.findByPk(guild.id);
      if (dbGuild != null) {
        dbGuild.active = true;
        await dbGuild.save();
      } else {
        dbGuild = await Guild.create({
          id: guild.id,
          name: guild.name,
          premium: false,
        });
      }

      const guildCount = clientManager.getTotalGuildCount();
      const memberCount = clientManager.getTotalMemberCount();
      guild.client.user.setActivity(`over ${memberCount} members (${guildCount} servers)`, { type: 'WATCHING' });

      eventLogger.info(`Joined a new guild '${guild.name}' (${guild.id}) with ${guild.memberCount} members`);
    } catch (e) {
      Sentry.setTag('guild_id', guild.id);
      Sentry.setTag('bot_id', guild.client.application.id);
      Sentry.captureException(e);
    }
  },
};
