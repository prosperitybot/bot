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
				await client.guilds.cache.get('700059392770441216')?.commands.permissions.add({ command: process.env.ADMIN_COMMAND_ID, permissions: [
					{
						id: '126429064218017802',
						type: 'USER',
						permission: true,
					},
				] });
			}
		}
		catch (e) {
			Sentry.captureException(e);
		}

	},
};