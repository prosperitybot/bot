const { Guild } = require('../database/database');
const Sentry = require('@sentry/node');

module.exports = {
	name: 'guildCreate',
	async execute(guild) {
		try {
			await Guild.create({
				id: guild.id,
				name: guild.name,
				premium: false,
			});
			guild.client.user.setActivity(`${guild.client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} members in ${guild.client.guilds.cache.size} servers`, { type: 'WATCHING' });
			console.log(`Joined a new guild with the name of '${guild.name} (${guild.id})'`);
		}
		catch (e) {
			Sentry.captureException(e);
		}
	},
};