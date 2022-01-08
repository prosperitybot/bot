const { SlashCommandBuilder } = require('@discordjs/builders');
const { GuildUser } = require('../database/database');
const { getXpNeeded } = require('../utils/levelUtils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('level')
		.setDescription('See your or someone elses current level')
		.addUserOption(options =>
			options.setName('user')
				.setDescription('The user you want to check the level of')
				.setRequired(false),
		),
	async execute(interaction) {
		if (interaction.options.getUser('user') == null) {
			const guildUser = await GuildUser.findOne({ where: { userId: interaction.member.id, guildId: interaction.guild.id } });
			await interaction.reply(`Your level is currently: ${guildUser.level}\nYou need ${getXpNeeded(guildUser.level + 1) - guildUser.xp} xp to get to the next level`);
		}
		else {
			const user = interaction.options.getUser('user');
			const guildUser = await GuildUser.findOne({ where: { userId: interaction.options.getUser('user').id, guildId: interaction.guild.id } });
			if (guildUser == null) {
				await interaction.reply(`${user.username}#${user.discriminator} has never talked before`);
			}
			else {
				await interaction.reply(`${user.username}#${user.discriminator}'s level is currently: ${guildUser.level}\nThey need ${getXpNeeded(guildUser.level + 1) - guildUser.xp} xp to get to the next level`);
			}
		}
	},
};
