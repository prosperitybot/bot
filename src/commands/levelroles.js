const { SlashCommandBuilder } = require('@discordjs/builders');
const { GuildUser, LevelRole } = require('@prosperitybot/database');
const { reply, editReply } = require('../utils/messages');
const permissions = require('../utils/permissionUtils');
const Sentry = require('@sentry/node');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('levelroles')
		.setDescription('Manages level roles')
		.addSubcommand(subCommand =>
			subCommand
				.setName('add')
				.setDescription('Adds a role that is granted when a user reaches a certain level')
				.addRoleOption(options =>
					options.setName('role')
						.setDescription('The role you want to give')
						.setRequired(true),
				).addIntegerOption(options =>
					options.setName('level')
						.setDescription('The levels to give the role at')
						.setRequired(true),
				),
		)
		.addSubcommand(subCommand =>
			subCommand
				.setName('remove')
				.setDescription('Removes a role that is granted when a user reaches a certain level')
				.addRoleOption(options =>
					options.setName('role')
						.setDescription('The role you want to remove')
						.setRequired(true),
				),
		)
		.addSubcommand(subCommand =>
			subCommand
				.setName('list')
				.setDescription('Lists all of the level roles in the server'),
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

				const nextHighestRole = await LevelRole.findOne({ where: { level: { [Op.gt]: level }, guildId: interaction.guild.id } });
				let newHighestLevel = 1000;
				if (nextHighestRole != null) {
					newHighestLevel = nextHighestRole.level;
				}

				await reply(interaction, `${role} will be granted at **Level ${level}**`, false);

				const { count: dbMemberCount, rows: dbMembers } = await GuildUser.findAndCountAll({ where: { level: { [Op.gte]: level, [Op.lt]: newHighestLevel }, guildId: interaction.guild.id } });
				await editReply(interaction, `${role} will be granted at **Level ${level}**\n\n**Status**:\nCurrently adding this role to ${dbMemberCount} members`, false);
				dbMembers.forEach(async dbMember => {
					interaction.guild.members.fetch(dbMember.userId.toString()).then(member => {
						member.roles.add(role.id.toString(), 'Level role was added');
					}).catch((e) => console.log(`Could not add role - ${e}`));
				});

				await editReply(interaction, `${role} will be granted at **Level ${level}**\n\n**Status**:\nAdded ${dbMemberCount} members to this role`, false);

				break;
			}
			case 'remove': {
				const role = interaction.options.getRole('role');
				const levelRole = await LevelRole.findOne({ where: { id: role.id } });
				if (levelRole == null) {
					await reply(interaction, 'This role is not being used for a level.', true);
				}

				await reply(interaction, `${role} will no longer be granted at level **Level ${levelRole.level}**`, false);
				await levelRole.destroy();

				interaction.guild.roles.cache.get(role.id).members.forEach(m => {
					m.roles.remove(role);
				});
				break;
			}
			case 'list': {
				const levelRoles = await LevelRole.findAll({ where: { guildId: interaction.guild.id } });
				let listMsg = 'Level Roles: \n';
				levelRoles.forEach(c => {
					listMsg = listMsg + `\n- <@&${c.id}> *(Level ${c.level})*`;
				});

				await reply(interaction, listMsg, false);
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
