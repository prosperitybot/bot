const { SlashCommandBuilder } = require('@discordjs/builders');
const { IgnoredRole } = require('@benhdev-projects/database');
const { reply } = require('../utils/messages');
const permissions = require('../utils/permissionUtils');
const Sentry = require('@sentry/node');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ignoredroles')
		.setDescription('Adds a role that is ignored from gaining levels')
		.addSubcommand(subCommand =>
			subCommand
				.setName('add')
				.setDescription('Adds an ignored role')
				.addRoleOption(role =>
					role
						.setName('role')
						.setDescription('The role to ignore'),
				),
		)
		.addSubcommand(subCommand =>
			subCommand
				.setName('remove')
				.setDescription('Removes an ignored role')
				.addRoleOption(role =>
					role
						.setName('role')
						.setDescription('The role to remove from the ignored list'),
				),
		)
		.addSubcommand(subCommand =>
			subCommand
				.setName('list')
				.setDescription('Lists all of the ignored roles in the server'),
		),
	async execute(interaction) {
		if (!permissions.has(interaction.member, 'ADMINISTRATOR')) {
			await reply(interaction, 'Access Denied', true);
			return;
		}
		try {
			switch (interaction.options.getSubcommand()) {
			case 'add': {
				const role = interaction.options.getRole('role');
				const ignoredRole = await IgnoredRole.findOne({ where: { id: role.id } });
				if (ignoredRole != null) {
					await reply(interaction, 'This role is already being ignored.', true);
					break;
				}

				await IgnoredRole.create({
					id: role.id,
					guildId: interaction.guild.id,
				});

				await reply(interaction, `${role} will be ignored from gaining xp`, false);
				break;
			}
			case 'remove': {
				const role = interaction.options.getRole('role');
				const ignoredRole = await IgnoredRole.findOne({ where: { id: role.id } });
				if (ignoredRole == null) {
					await reply(interaction, 'This role is not being ignored.', true);
					break;
				}

				await ignoredRole.destroy();

				await reply(interaction, `${role} will not be ignored from gaining xp`, false);
				break;
			}
			case 'list': {
				const ignoredRoles = await IgnoredRole.findAll({ where: { guildId: interaction.guild.id } });
				let listMsg = 'Ignored Roles: \n';
				ignoredRoles.forEach(c => {
					listMsg = listMsg + `\n- <#${c.id}>`;
				});

				await reply(interaction, listMsg, false);
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
