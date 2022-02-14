const Sentry = require('@sentry/node');
const { deploy } = require('../deploy-commands');
const clientManager = require('../clientManager');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    try {
      console.log(`Ready! Logged in as ${client.user.tag}`);

      const guildCount = clientManager.getTotalGuildCount();
      const memberCount = clientManager.getTotalMemberCount();
      client.user.setActivity(`over ${memberCount} members (${guildCount} servers)`, { type: 'WATCHING' });

      if (process.env.ADMIN_COMMAND_ID === '') {
        deploy(process.env.CLIENT_ID, process.env.DISCORD_TOKEN);
      } else {
        await client.guilds.cache.get(process.env.GUILD_ID)?.commands.permissions.add({
          command: process.env.ADMIN_COMMAND_ID,
          permissions: [
            {
              id: process.env.BOT_OWNER_ID,
              type: 'USER',
              permission: true,
            },
          ],
        });
      }
    } catch (e) {
      Sentry.setTag('bot_id', client.application.id);
      Sentry.captureException(e);
    }
  },
};
