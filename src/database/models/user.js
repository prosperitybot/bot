module.exports = (sequelize, type) => {
	return sequelize.define('user', {
		id: {
			type: type.BIGINT,
			primaryKey: true,
		},
		username: {
			type: type.STRING,
			allowNull: false,
		},
		discriminator: {
			type: type.STRING,
			allowNull: false,
		},
	});
};