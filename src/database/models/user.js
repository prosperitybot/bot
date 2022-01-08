module.exports = (sequelize, type) => {
	return sequelize.define('user', {
		id: {
			type: type.BIGINT,
			primaryKey: true,
		},
	});
};