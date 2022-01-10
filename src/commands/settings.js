const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { reply } = require('../utils/messages');
const { Guild } = require('../database/database');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Guild Bot Settings')
		.addSubcommand(subcommand =>
			subcommand
				.setName('notifications')
				.setDescription('Choose where the notifications are displayed for the guild')
				.addChannelOption(options =>
					options.setName('channel')
						.setDescription('The channel to set the notification to')
						.setRequired(false),
				)),
	async execute(interaction) {
		if (!interaction.member.permissions.has('ADMINISTRATOR')) {
			await reply(interaction, 'Access Denied', true);
			return;
		}
		switch (interaction.options.getSubcommand()) {
		case 'notifications': {
			if (interaction.options.getChannel('channel') != null) {
				const guild = await Guild.findByPk(interaction.guild.id);
				guild.notificationType = 'channel';
				guild.notificationChannel = interaction.options.getChannel('channel').id;
				await guild.save();
				await reply(interaction, `Successfully updated level up notifications to be sent in ${interaction.options.getChannel('channel')}`, true);
				break;
			}
			const notificationsRow = new MessageActionRow()
				.addComponents(
					new MessageSelectMenu()
						.setCustomId('guild_settings_notifications')
						.setPlaceholder('Choose type of notifications')
						.addOptions([
							{
								label: 'Reply to message',
								description: 'Send the level up message by replying to the message that triggered the level up',
								value: 'guild_settings_notifications-reply',
								emoji: '💬',
							},
							{
								label: 'Specify Channel',
								description: 'Send the level up message in a set channel',
								value: 'guild_settings_notifications-channel',
								emoji: '📃',
							},
							{
								label: 'Direct Messages',
								description: 'Send the level up message via direct messages',
								value: 'guild_settings_notifications-dm',
								emoji: '🔏',
							},
							{
								label: 'Disabled',
								description: 'Disable level up messages',
								value: 'guild_settings_notifications-disable',
								emoji: '🚫',
							},
						]),
				);
			await reply(interaction, 'Please select the type of notifications you want below...', true, [notificationsRow]);
			break;
		}
		}
	},
};
