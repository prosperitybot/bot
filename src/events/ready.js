const deploy = require('../deploy-commands');
const Sentry = require('@sentry/node');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		try {
			console.log(`Ready! Logged in as ${client.user.tag}`);
			client.user.setActivity(`${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} members in ${client.guilds.cache.size} servers`, { type: 'WATCHING' });
			if (process.env.ADMIN_COMMAND_ID == '') {
				deploy();
			}
			else {
				await client.guilds.cache.get(process.env.GUILD_ID)?.commands.permissions.add({ command: process.env.ADMIN_COMMAND_ID, permissions: [
					{
						id: process.env.BOT_OWNER_ID,
						type: 'USER',
						permission: true,
					},
				] });
			}
		}
		catch (e) {
			Sentry.setTag('bot_id', client.application.id);
			Sentry.captureException(e);
		}

	},
};