module.exports = (sequelize, type) => {
	return sequelize.define('users', {
		id: {
			type: type.BIGINT,
			primaryKey: true,
		},
		username: {
			type: type.STRING,
			allowNull: false,
		},
		whitelabel: {
			type: type.BOOLEAN,
			defaultValue: false,
		},
		discriminator: {
			type: type.STRING,
			allowNull: false,
		},
	});
};