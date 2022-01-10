const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { reply } = require('../utils/messages');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('import')
		.setDescription('Import Levels from another bot'),
	async execute(interaction) {
		if (!interaction.member.permissions.has('ADMINISTRATOR')) {
			await reply(interaction, 'Access Denied', true);
			return;
		}
		const importRow = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('import_from')
					.setPlaceholder('Choose service to import from')
					.addOptions([
						{
							label: 'MEE6',
							description: 'Import existing levels from MEE6',
							value: 'import_from-mee6',
							emoji: '👽',
						},
					]),
			);
		await reply(interaction, 'Please select where you would like to import your data from...', true, [importRow]);
	},
};
