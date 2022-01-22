const { SlashCommandBuilder } = require('@discordjs/builders');
const { GuildUser } = require('@benhdev-projects/database');
const { getXpNeeded } = require('../utils/levelUtils');
const { reply } = require('../utils/messages');
const permissions = require('../utils/permissionUtils');
const Sentry = require('@sentry/node');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('levels')
		.setDescription('Provides commands to give/remove levels from a user')
		.addSubcommand(subCommand =>
			subCommand
				.setName('give')
				.setDescription('Gives levels to a user')
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
		)
		.addSubcommand(subCommand =>
			subCommand
				.setName('take')
				.setDescription('Takes levels from a user')
				.addUserOption(options =>
					options.setName('user')
						.setDescription('The user you want to take levels from')
						.setRequired(true),
				)
				.addIntegerOption(options =>
					options.setName('amount')
						.setDescription('The amount of levels to take')
						.setRequired(true),
				),
		),
	async execute(interaction) {
		if (!permissions.has(interaction.member, 'ADMINISTRATOR')) {
			await reply(interaction, 'Access Denied', true);
			return;
		}
		try {
			const user = interaction.options.getUser('user');
			const guildUser = await GuildUser.findOne({ where: { userId: user.id, guildId: interaction.guild.id } });
			const amount = interaction.options.getInteger('amount');
			switch (interaction.options.getSubcommand()) {
			case 'give': {
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
				break;
			}
			case 'take': {
				if (guildUser == null) {
					await reply(interaction, `${user} has not talked in chat since the bot was added`, true);
					return;
				}

				if (amount <= 0) {
					await reply(interaction, 'Levels to take must be a positive number', true);
					return;
				}

				guildUser.level -= amount;
				guildUser.xp = getXpNeeded(guildUser.level);

				await guildUser.save();
				await reply(interaction, `Taken ${amount} level${amount > 1 ? 's' : ''} from ${user.username}#${user.discriminator}`, false);
				break;
			}
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
