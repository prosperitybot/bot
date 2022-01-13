module.exports = (sequelize, type) => {
	return sequelize.define('ignored_roles', {
		id: {
			type: type.BIGINT,
			primaryKey: true,
			allowNull: false,
		},
	});
};