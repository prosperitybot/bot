module.exports = (sequelize, type) => {
	return sequelize.define('level_roles', {
		id: {
			type: type.BIGINT,
			primaryKey: true,
			allowNull: false,
		},
		level: {
			type: type.INTEGER,
			allowNull: false,
		},
	});
};