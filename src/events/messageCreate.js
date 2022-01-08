const { User, GuildUser } = require('../database/database');
const { getXpNeeded } = require('../utils/levelUtils');
module.exports = {
	name: 'messageCreate',
	async execute(message) {
		try {
			await User.upsert({
				id: message.author.id,
				username: message.author.username,
				discriminator: message.author.discriminator,
			});
			let gu = await GuildUser.findOne({ where: { userId: message.author.id, guildId: message.guild.id } });
			if (gu == null) {
				gu = await GuildUser.create({
					userId: message.author.id,
					guildId: message.guild.id,
					level: 0,
					xp: 0,
				});
			}

			gu.xp += Math.floor(Math.random() * (15 - 7 + 1) + 7);
			if (gu.xp > getXpNeeded(gu.level + 1)) {
				gu.level += 1;
				message.reply({ content: `Congratulations ${message.author} you have ranked up to level ${gu.level}` });
			}
			await gu.save();
		}
		catch (e) {
			console.log(e);
		}
	},
};