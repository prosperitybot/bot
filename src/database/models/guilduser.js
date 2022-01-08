module.exports = (sequelize, type) => {
	return sequelize.define('guilduser', {
		level: {
			type: type.INTEGER,
			allowNull: false,
			default: 1,
		},
		xp: {
			type: type.INTEGER,
			allowNull: false,
			default: 0,
		},
	});
};