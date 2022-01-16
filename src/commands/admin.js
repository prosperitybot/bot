const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { reply } = require('../utils/messages');
const Sentry = require('@sentry/node');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('admin')
		.setDescription('Admin bot settings')
		.setDefaultPermission(false),
	async execute(interaction) {
		try {
			if (!interaction.user.id == '126429064218017802') {
				await reply(interaction, 'Access Denied', true);
				return;
			}
			const adminRow = new MessageActionRow()
				.addComponents(
					new MessageSelectMenu()
						.setCustomId('admin_menu')
						.setPlaceholder('Admin Menu')
						.addOptions([
							{
								label: 'Deploy Commands',
								description: 'This will deploy all of the commands in case anything has changed',
								value: 'admin_deploy_commands',
								emoji: '💾',
							},
						]),
				);
			const databaseAdminRow = new MessageActionRow()
				.addComponents(
					new MessageSelectMenu()
						.setCustomId('db_admin_menu')
						.setPlaceholder('Database Menu')
						.addOptions([
							{
								label: 'Run Migrations',
								description: 'This runs all migrations / syncs on the database',
								value: 'db_run_migrations',
								emoji: '📜',
							},
							{
								label: 'Run Migrations (Force)',
								description: 'This runs all migrations / syncs on the database - THIS WILL NUKE THE DATABASE',
								value: 'db_run_migrations_force',
								emoji: '⚠️',
							},
							{
								label: 'Seed Database',
								description: 'This will add all of the cached guilds into the database',
								value: 'db_seed',
								emoji: '🌱',
							},
						]),
				);

			await interaction.reply({
				content: 'Please select an action from the below...',
				components: [adminRow, databaseAdminRow],
				ephemeral: true,
			});
		}
		catch (e) {
			Sentry.setTag('guild_id', interaction.guild.id);
			Sentry.setTag('bot_id', interaction.applicationId);
			const errorCode = Sentry.captureException(e);
			await reply(interaction, `There was an error while executing this interaction!\nPlease provide the error code ${errorCode} to the support team`, true);
		}
	},
};
