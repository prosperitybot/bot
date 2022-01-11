const { SlashCommandBuilder } = require('@discordjs/builders');
const { LevelRole } = require('../database/database');
const { reply } = require('../utils/messages');
const Sentry = require('@sentry/node');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addlevelrole')
		.setDescription('Adds a role that is granted when a user reaches a certain level')
		.addRoleOption(options =>
			options.setName('role')
				.setDescription('The role you want to give')
				.setRequired(true),
		)
		.addIntegerOption(options =>
			options.setName('level')
				.setDescription('The levels to give the role at')
				.setRequired(true),
		),
	async execute(interaction) {
		if (!interaction.member.permissions.has('ADMINISTRATOR')) {
			await reply(interaction, 'Access Denied', true);
			return;
		}
		try {
			const role = interaction.options.getRole('role');
			const levelRole = await LevelRole.findOne({ where: { id: role.id } });
			const level = interaction.options.getInteger('level');

			if (levelRole != null) {
				await reply(interaction, 'This role is already being used for a level.', true);
				return;
			}

			if (level <= 0) {
				await reply(interaction, 'Level must be a positive number.', true);
				return;
			}

			await LevelRole.create({
				id: role.id,
				guildId: interaction.guild.id,
				level: level,
			});

			await reply(interaction, `${role} will be granted at **Level ${level}**`, false);
		}
		catch (e) {
			const errorCode = Sentry.captureException(e);
			await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
		}
	},
};
