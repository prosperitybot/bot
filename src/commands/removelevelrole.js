const { SlashCommandBuilder } = require('@discordjs/builders');
const { LevelRole } = require('../database/database');
const { reply } = require('../utils/messages');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removelevelrole')
		.setDescription('Removes a role that is granted when a user reaches a certain level')
		.addRoleOption(options =>
			options.setName('role')
				.setDescription('The role you want to remove')
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
			if (levelRole == null) {
				await reply(interaction, 'This role is not being used for a level.', true);
			}

			await reply(interaction, `${role} will no longer be granted at level **Level ${levelRole.level}**`, false);
			await levelRole.destroy();

			interaction.guild.roles.cache.get(role.id).members.forEach(m => {
				m.roles.remove(role);
			});
		}
		catch (e) {
			console.error(e);
		}
	},
};
