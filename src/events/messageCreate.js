const { User, GuildUser } = require('../database/database');

module.exports = {
	name: 'messageCreate',
	async execute(message) {
		try {
			await User.upsert({ id: message.author.id });
			const gu = await GuildUser.findOne({ where: { userId: message.author.id, guildId: message.guild.id } });
			if (gu == null) {
				await GuildUser.create({
					userId: message.author.id,
					guildId: message.guild.id,
					level: 1,
					xp: 0,
				});
			}
		}
		catch (e) {
			console.log(e);
		}
	},
};