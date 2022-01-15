const { SlashCommandBuilder } = require('@discordjs/builders');
const { GuildUser, LevelRole } = require('../database/database');
const { getXpNeeded } = require('../utils/levelUtils');
const { reply } = require('../utils/messages');
const permissions = require('../utils/permissionUtils');
const { Op } = require('sequelize');
const Sentry = require('@sentry/node');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('xp')
		.setDescription('Provides commands to give/remove xp from a user')
		.addSubcommand(subCommand =>
			subCommand
				.setName('give')
				.setDescription('Gives xp to a user')
				.addUserOption(options =>
					options.setName('user')
						.setDescription('The user you want to give xp to')
						.setRequired(true),
				)
				.addIntegerOption(options =>
					options.setName('amount')
						.setDescription('The amount of xp to give')
						.setRequired(true),
				),
		)
		.addSubcommand(subCommand =>
			subCommand
				.setName('take')
				.setDescription('Takes xp from a user')
				.addUserOption(options =>
					options.setName('user')
						.setDescription('The user you want to take xp from')
						.setRequired(true),
				)
				.addIntegerOption(options =>
					options.setName('amount')
						.setDescription('The amount of xp to take')
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
					await reply(interaction, 'Xp to give must be a positive number', true);
					return;
				}

				guildUser.xp += amount;
				if (guildUser.xp > getXpNeeded(guildUser.level + 1)) {
					guildUser.level += 1;
					const newLevelRole = await LevelRole.findOne({ where: { level: guildUser.level, guildId: user.guild.id } });
					if (newLevelRole != null) {
						user.member.roles.add(newLevelRole.id.toString());
						const oldLevelRole = await LevelRole.findOne({ where: { level: { [Op.lt]: guildUser.level }, guildId: user.guild.id } });
						if (oldLevelRole != null) {
							user.member.roles.remove(oldLevelRole.id.toString());
						}
					}
				}

				await guildUser.save();
				await reply(interaction, `Given ${amount} xp to ${user.username}#${user.discriminator}`, false);
				break;
			}
			case 'take': {
				if (guildUser == null) {
					await reply(interaction, `${user} has not talked in chat since the bot was added`, true);
					return;
				}

				if (amount <= 0) {
					await reply(interaction, 'Xp to take must be a positive number', true);
					return;
				}

				guildUser.xp -= amount;
				if (guildUser.xp < getXpNeeded(guildUser.level)) {
					guildUser.level -= 1;
					const oldLevelRole = await LevelRole.findOne({ where: { level: guildUser.level, guildId: user.guild.id } });
					if (oldLevelRole != null) {
						user.member.roles.remove(oldLevelRole.id.toString());
						const newLevelRole = await LevelRole.findOne({ where: { level: { [Op.lt]: guildUser.level }, guildId: user.guild.id } });
						if (newLevelRole != null) {
							user.member.roles.add(newLevelRole.id.toString());
						}
					}
				}

				await guildUser.save();
				await reply(interaction, `Taken ${amount} xp from ${user.username}#${user.discriminator}`, false);
				break;
			}
			}
		}
		catch (e) {
			const errorCode = Sentry.captureException(e);
			await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
		}
	},
};
