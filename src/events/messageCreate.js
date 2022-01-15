const { User, GuildUser, Guild, LevelRole, IgnoredChannel, IgnoredRole } = require('../database/database');
const { getXpNeeded } = require('../utils/levelUtils');
const { reply, send } = require('../utils/messages');
const { Op, fn } = require('sequelize');
const Sentry = require('@sentry/node');

module.exports = {
	name: 'messageCreate',
	async execute(message) {
		if (message.author.bot) return;

		try {
			await User.upsert({
				id: message.author.id,
				username: message.author.username,
				discriminator: message.author.discriminator,
			});
			console.log('Updated User #1');
			let gu = await GuildUser.findOne({ where: { userId: message.author.id, guildId: message.guild.id } });
			if (gu == null) {
				gu = await GuildUser.create({
					userId: message.author.id,
					guildId: message.guild.id,
					level: 0,
					xp: 0,
					lastXpMessageSent: fn('NOW'),
				});
				console.log('Updated User #2');
			}
			console.log('Updated User #3');

			if ((Date.now() - gu.lastXpMessageSent) / 1000 >= 60) {
				console.log('Updated User #4');

				const ignoredChannel = await IgnoredChannel.findByPk(message.channel.id);
				const ignoredRole = await IgnoredRole.findAll({ where: { id: message.member.roles.cache.map(mr => mr.id) } });
				console.log('Updated User #5');

				if (ignoredChannel == null && ignoredRole == null) {
					console.log('Updated User #6');
					console.log(ignoredRole);
					console.log(ignoredChannel);

					gu.xp += Math.floor(Math.random() * (15 - 7 + 1) + 7);
					gu.lastXpMessageSent = fn('NOW');
					console.log('Updated User #7');
					if (gu.xp > getXpNeeded(gu.level + 1)) {
						gu.level += 1;
						const newLevelRole = await LevelRole.findOne({ where: { level: gu.level, guildId: message.guild.id } });
						if (newLevelRole != null) {
							message.member.roles.add(newLevelRole.id.toString());
							const oldLevelRole = await LevelRole.findOne({ where: { level: { [Op.lt]: gu.level }, guildId: message.guild.id } });
							if (oldLevelRole != null) {
								message.member.roles.remove(oldLevelRole.id.toString());
							}
						}
						await gu.save();
						const guild = await Guild.findByPk(message.guild.id);
						switch (guild.notificationType) {
						case 'reply':
							await reply(message, `Congratulations ${message.author} you have ranked up to level ${gu.level}`);
							break;
						case 'channel': {
							const channel = await message.guild.channels.fetch(guild.notificationChannel);
							await send(channel, `Congratulations ${message.author} you have ranked up to level ${gu.level}`);
							break;
						}
						case 'dm':
							message.author.createDM().then((c) => {
								c.send(`Congratulations ${message.author} you have ranked up to level ${gu.level}`);
							});
							break;
						}
					}
					else {
						await gu.save();
					}
				}
			}
		}
		catch (e) {
			Sentry.captureException(e);
		}
	},
};