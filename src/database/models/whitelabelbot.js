module.exports = (sequelize, type) => {
	return sequelize.define('whitelabel_bots', {
		botId: {
			type: type.BIGINT,
			primaryKey: true,
			allowNull: false,
		},
		token: {
			type: type.STRING,
			allowNull: false,
		},
	});
};