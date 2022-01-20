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
		notificationType: {
			type: type.STRING,
			allowNull: false,
			defaultValue: 'reply',
		},
		notificationChannel: {
			type: type.BIGINT,
			allowNull: true,
		},
		xpRate: {
			type: type.INTEGER,
			allowNull: false,
			defaultValue: 1,
		},
		roleAssignType: {
			type: type.STRING,
			allowNull: false,
			defaultValue: 'single',
		},
	});
};