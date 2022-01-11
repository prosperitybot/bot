const { SlashCommandBuilder } = require('@discordjs/builders');
const { GuildUser } = require('../database/database');
const { getXpNeeded } = require('../utils/levelUtils');
const { reply } = require('../utils/messages');
const Sentry = require('@sentry/node');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('givelevels')
		.setDescription('Add levels to a user')
		.addUserOption(options =>
			options.setName('user')
				.setDescription('The user you want to give levels to')
				.setRequired(true),
		)
		.addIntegerOption(options =>
			options.setName('amount')
				.setDescription('The amount of levels to give')
				.setRequired(true),
		),
	async execute(interaction) {
		try {
			if (!interaction.member.permissions.has('ADMINISTRATOR')) {
				await reply(interaction, 'Access Denied', true);
				return;
			}
			const user = interaction.options.getUser('user');
			const guildUser = await GuildUser.findOne({ where: { userId: user.id, guildId: interaction.guild.id } });
			const amount = interaction.options.getInteger('amount');

			if (guildUser == null) {
				await reply(interaction, `${user} has not talked in chat since the bot was added`, true);
				return;
			}

			if (amount <= 0) {
				await reply(interaction, 'Levels to give must be a positive number', true);
				return;
			}

			guildUser.level += amount;
			guildUser.xp = getXpNeeded(guildUser.level);

			await guildUser.save();
			await reply(interaction, `Given ${amount} level${amount > 1 ? 's' : ''} to ${user.username}#${user.discriminator}`, false);
		}
		catch (e) {
			const errorCode = Sentry.captureException(e);
			await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
		}
	},
};
