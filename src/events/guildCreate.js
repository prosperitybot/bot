const { Guild } = require('../database/database');

module.exports = {
	name: 'guildCreate',
	async execute(guild) {
		await Guild.create({
			id: guild.id,
			name: guild.name,
			premium: false,
		});
		guild.client.user.setActivity(`${guild.client.guilds.cache.size} servers`, { type: 'WATCHING' });
		console.log(`Joined a new guild with the name of '${guild.name} (${guild.id})'`);
	},
};