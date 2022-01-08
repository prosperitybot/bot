module.exports = (sequelize, type) => {
	return sequelize.define('guild', {
		id: {
			type: type.BIGINT,
			primaryKey: true,
			allowNull: false,
		},
		name: {
			type: type.STRING,
			allowNull: false,
		},
		premium: {
			type: type.BOOLEAN,
			default: false,
		},
	});
};