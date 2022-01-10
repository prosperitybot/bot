module.exports = (sequelize, type) => {
	return sequelize.define('guilds', {
		id: {
			type: type.BIGINT,
			primaryKey: true,
			allowNull: false,
		},
		name: {
			type: type.STRING,
			allowNull: false,
		},
		premium: {
			type: type.BOOLEAN,
			defaultValue: false,
		},
		notificationType: {
			type: type.STRING,
			allowNull: false,
			defaultValue: 'reply',
		},
		notificationChannel: {
			type: type.BIGINT,
			allowNull: true,
		},
	});
};