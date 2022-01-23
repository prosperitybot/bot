const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { reply } = require('../utils/messages');
const { Guild } = require('@prosperitybot/database');
const permissions = require('../utils/permissionUtils');
const Sentry = require('@sentry/node');

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
				))
		.addSubcommand(subcommand =>
			subcommand
				.setName('roles')
				.setDescription('Choose the type of logic to apply on the role (Whether to stack or only assign one role)')
				.addStringOption(options =>
					options.setName('type')
						.setDescription('The type of logic to apply to the role')
						.setRequired(true)
						.addChoice('Single (Only apply one at a time and remove the previous role)', 'single')
						.addChoice('Stack (Stack all previous roles and never remove old ones)', 'stack'),
				)),
	async execute(interaction) {
		try {
			if (!permissions.has(interaction.member, 'ADMINISTRATOR')) {
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
			case 'roles': {
				const type = interaction.options.getString('type');
				const guild = await Guild.findByPk(interaction.guild.id);
				guild.roleAssignType = type;
				await guild.save();
				if (type == 'stack') {
					await reply(interaction, 'Users will now have stacked roles and their previous roles will not be removed', true);
				}
				else {
					await reply(interaction, 'Users will now have single roles and their previous roles will be removed', true);
				}
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
