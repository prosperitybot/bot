const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { editReply, reply } = require('../utils/messages');
const axios = require('axios').default;
const { User, GuildUser, LevelRole } = require('../database/database');
const { getXpNeeded } = require('../utils/levelUtils');

module.exports = {
	name: 'import_from',
	async execute(interaction) {
		switch (interaction.values[0]) {
		case 'import_from-mee6': {
			const confirmMee6Row = new MessageActionRow()
				.addComponents(
					new MessageSelectMenu()
						.setCustomId('import_from')
						.setPlaceholder('Please confirm...')
						.addOptions([
							{
								label: 'Yes',
								description: 'This will import all existing members levels from Mee6 into aequum',
								value: 'import_from-mee6-confirm',
								emoji: '✅',
							},
							{
								label: 'No',
								description: 'This will cancel the pending transfer',
								value: 'import_from-mee6-cancel',
								emoji: '❎',
							},
						]),
				);
			await reply(interaction, 'Please confirm that you want the transfer to go ahead. \n**NOTE**: This will only move the data of the users that are currently in the server.', true, [confirmMee6Row]);
			break;
		}
		case 'import_from-mee6-confirm': {
			await reply(interaction, 'Currently migrating users from Mee6 to aequum', true);
			// Run MEE6 Logic
			let stillSearching = true;
			let currentPage = 0;
			let userCount = 0;
			while (stillSearching) {
				setTimeout(async () => {
					const { data } = await axios.get(`https://mee6.xyz/api/plugins/levels/leaderboard/${interaction.guild.id}?limit=1000&page=${currentPage}`);
					if (currentPage == 0) {
						const roleRewards = data.role_rewards;
						roleRewards.forEach(async role => {
							await LevelRole.create({
								id: role.role.id,
								level: role.rank,
								guildId: interaction.guild.id,
							});
						});
					}
					if (data.players.length == 0) {
						stillSearching = false;
					}
					else {
						currentPage += 1;
						userCount += data.players.length;
						data.players.forEach(async user => {
							await User.upsert({
								id: user.id,
								username: user.username,
								discriminator: user.discriminator,
							});
							let gu = await GuildUser.findOne({ where: { userId: user.id, guildId: interaction.guild.id } });
							if (gu == null) {
								gu = await GuildUser.create({
									userId: user.id,
									guildId: interaction.guild.id,
									level: user.level,
									xp: getXpNeeded(user.level),
								});
							}
							else {
								gu.level = user.level;
								gu.xp = getXpNeeded(user.level);
								await gu.save();
							}
						});
					}
				}, 2000);
			}
			await editReply(interaction, `You have successfully migrated **${userCount}** users.`, true);
			break;
		}
		case 'import_from-mee6-cancel':
			await reply(interaction, 'Transfer Cancelled', true);
			break;
		}
	},
};