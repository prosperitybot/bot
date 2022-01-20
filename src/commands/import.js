const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { reply } = require('../utils/messages');
const Sentry = require('@sentry/node');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('import')
		.setDescription('Import Levels from another bot'),
	async execute(interaction) {
		try {
			if (interaction.user.id != '126429064218017802') {
				await reply(interaction, 'Please message Ben#2028 to get your levels migrated', true);
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
							{
								label: 'Piggy',
								description: 'Import existing levels from Piggy',
								value: 'import_from-piggy',
								emoji: '🐷',
							},
						]),
				);
			await reply(interaction, 'Please select where you would like to import your data from...', true, [importRow]);
		}
		catch (e) {
			Sentry.setTag('guild_id', interaction.guild.id);
			Sentry.setTag('bot_id', interaction.applicationId);
			const errorCode = Sentry.captureException(e);
			await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
		}
	},
};
