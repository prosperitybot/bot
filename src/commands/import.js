const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { reply } = require('../utils/messages');
const permissions = require('../utils/permissionUtils');
const Sentry = require('@sentry/node');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('import')
		.setDescription('Import Levels from another bot'),
	async execute(interaction) {
		try {
			if (!permissions.has(interaction.member, 'ADMINISTRATOR')) {
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
		}
		catch (e) {
			const errorCode = Sentry.captureException(e);
			await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
		}
	},
};
