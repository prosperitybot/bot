const { SlashCommandBuilder } = require('@discordjs/builders');
const { GuildUser } = require('../database/database');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('level')
		.setDescription('See your or someone elses current level')
		.addMentionableOption(options =>
			options.setName('user')
				.setDescription('The user you want to check the level of')
				.setRequired(false),
		),
	async execute(interaction) {
		const guildUser = await GuildUser.findOne({ where: { userId: interaction.member.id, guildId: interaction.guild.id } });
		await interaction.reply(`Your level is currently: ${guildUser.level}`);
	},
};
