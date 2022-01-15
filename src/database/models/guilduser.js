module.exports = (sequelize, type) => {
	return sequelize.define('guild_users', {
		level: {
			type: type.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		xp: {
			type: type.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		lastXpMessageSent: {
			type: type.DATE,
			allowNull: false,
			defaultValue: type.NOW,
		},
		messageCount: {
			type: type.INTEGER,
			allowNull: false,
			defaultValue: 1,
		},
	});
};