module.exports = (sequelize, type) => {
	return sequelize.define('ignored_channels', {
		id: {
			type: type.BIGINT,
			primaryKey: true,
			allowNull: false,
		},
	});
};