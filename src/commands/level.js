const { SlashCommandBuilder } = require('@discordjs/builders');
const { GuildUser } = require('@prosperitybot/database');
const { getXpNeeded } = require('../utils/levelUtils');
const { reply } = require('../utils/messages');
const Sentry = require('@sentry/node');

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
		try {
			if (interaction.options.getUser('user') == null) {
				const guildUser = await GuildUser.findOne({ where: { userId: interaction.member.id, guildId: interaction.guild.id } });
				if (guildUser == null) {
					await reply(interaction, 'You have not spoken where the bot can see you yet', true);
					return;
				}
				await reply(interaction, `Your level is currently: ${guildUser.level}\nYou need ${getXpNeeded(guildUser.level + 1) - guildUser.xp} xp to get to the next level`, false);
			}
			else {
				const user = interaction.options.getUser('user');
				const guildUser = await GuildUser.findOne({ where: { userId: interaction.options.getUser('user').id, guildId: interaction.guild.id } });
				if (guildUser == null) {
					await reply(interaction, `${user.username}#${user.discriminator} has never talked before`, true);
					return;
				}
				await reply(interaction, `${user.username}#${user.discriminator}'s level is currently: ${guildUser.level}\nThey need ${getXpNeeded(guildUser.level + 1) - guildUser.xp} xp to get to the next level`, false);
			}
		}
		catch (e) {
			Sentry.setTag('guild_id', interaction.guild.id);
			Sentry.setTag('bot_id', interaction.applicationId);
			const errorCode = Sentry.captureException(e);
			await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
		}
	},
};
