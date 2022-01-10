const { Guild } = require('../database/database');
const { reply } = require('../utils/messages');

module.exports = {
	name: 'guild_settings_notifications',
	async execute(interaction) {
		const guild = await Guild.findByPk(interaction.guild.id);
		switch (interaction.values[0]) {
		case 'guild_settings_notifications-reply':
			guild.notificationType = 'reply';
			guild.notificationChannel = null;
			await guild.save();
			await reply(interaction, 'Successfully updated level up notifications to be sent via **replies**', true);
			break;
		case 'guild_settings_notifications-channel': {
			guild.notificationType = 'channel';
			guild.notificationChannel = null;
			await guild.save();
			await reply(interaction, 'Please use the slash command `/settings notifications` and specify the channel', true);
			break;
		}
		case 'guild_settings_notifications-dm':
			guild.notificationType = 'dm';
			guild.notificationChannel = null;
			await guild.save();
			await reply(interaction, 'Successfully updated level up notifications to be sent via **Direct Messages**', true);
			break;
		case 'guild_settings_notifications-disable':
			guild.notificationType = 'disable';
			guild.notificationChannel = null;
			await guild.save();
			await reply(interaction, 'Successfully updated level up notifications to be disabled', true);
			break;
		}
	},
};