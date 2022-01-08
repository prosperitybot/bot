const Sequelize = require('sequelize');
const UserModel = require('./models/user.js');
const GuildModel = require('./models/guild.js');
const GuildUserModel = require('./models/guilduser.js');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	dialect: 'mariadb',
});

const User = UserModel(sequelize, Sequelize);
const Guild = GuildModel(sequelize, Sequelize);
const GuildUser = GuildUserModel(sequelize, Sequelize);

User.belongsToMany(Guild, { through: GuildUser });
Guild.belongsToMany(User, { through: GuildUser });
User.hasMany(GuildUser);
GuildUser.belongsTo(User);
Guild.hasMany(GuildUser);
GuildUser.belongsTo(Guild);


module.exports = {
	User,
	Guild,
	GuildUser,
	migrate: (force) => {
		sequelize.sync({ force: force })
			.then(() => {
				console.log('Database & Tables Created');
			});
	},
};