const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('db')
		.setDescription('Database related changes')
		.setDefaultPermission(false),
	async execute(interaction) {
		const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('db_admin_menu')
					.setPlaceholder('Select an option...')
					.addOptions([
						{
							label: 'Run Migrations',
							description: 'This runs all migrations / syncs on teh database',
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
			components: [row],
			ephemeral: true,
		});
	},
};
