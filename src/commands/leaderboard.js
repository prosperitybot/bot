const { SlashCommandBuilder } = require('@discordjs/builders');
const { GuildUser } = require('../database/database');
const { reply } = require('../utils/messages');
const Sentry = require('@sentry/node');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays the top users and their levels')
		.addIntegerOption(options =>
			options.setName('page')
				.setDescription('The page you want to display')
				.setRequired(false),
		),
	async execute(interaction) {
		let offset = 0;
		const pageSize = 10;
		const page = interaction.options.getInteger('page') ?? 1;
		const userCount = await GuildUser.count({ where: { guildId: interaction.guild.id } });
		try {
			offset = pageSize * (page - 1);

			const guildUsers = await GuildUser.findAll({ where: { guildId: interaction.guild.id }, offset: offset, limit: pageSize, order: [ ['xp', 'DESC'] ] });
			let leaderboardMsg = `**Top ${pageSize} members (Page ${page}/${Math.ceil(userCount / pageSize)})**: \n`;

			guildUsers.forEach(gu => {
				leaderboardMsg += `\n- <@${gu.userId}> (Level ${gu.level})`;
			});

			await reply(interaction, leaderboardMsg, false);
		}
		catch (e) {
			Sentry.setTag('guild_id', interaction.guild.id);
			Sentry.setTag('bot_id', interaction.applicationId);
			const errorCode = Sentry.captureException(e);
			await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
		}
	},
};
