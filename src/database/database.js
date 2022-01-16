const Sequelize = require('sequelize');
const { sqlLogger } = require('../utils/loggingUtils');

const UserModel = require('./models/user.js');
const GuildModel = require('./models/guild.js');
const GuildUserModel = require('./models/guilduser.js');
const LevelRoleModel = require('./models/levelrole.js');
const IgnoredChannelModel = require('./models/ignoredchannel.js');
const IgnoredRoleModel = require('./models/ignoredrole.js');
const WhitelabelBotModel = require('./models/whitelabelbot.js');

// const { Umzug, SequelizeStorage } = require('umzug');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	dialect: 'mariadb',
	logging: msg => sqlLogger.info(msg),
});

const User = UserModel(sequelize, Sequelize);
const Guild = GuildModel(sequelize, Sequelize);
const GuildUser = GuildUserModel(sequelize, Sequelize);
const LevelRole = LevelRoleModel(sequelize, Sequelize);
const IgnoredChannel = IgnoredChannelModel(sequelize, Sequelize);
const IgnoredRole = IgnoredRoleModel(sequelize, Sequelize);
const WhitelabelBot = WhitelabelBotModel(sequelize, Sequelize);

User.belongsToMany(Guild, { through: GuildUser });
Guild.belongsToMany(User, { through: GuildUser });
User.hasMany(GuildUser);
GuildUser.belongsTo(User);
Guild.hasMany(GuildUser);
GuildUser.belongsTo(Guild);

LevelRole.belongsTo(Guild);
Guild.hasMany(LevelRole);

IgnoredChannel.belongsTo(Guild);
Guild.hasMany(IgnoredChannel);

IgnoredRole.belongsTo(Guild);
Guild.hasMany(IgnoredRole);

WhitelabelBot.belongsTo(User);

module.exports = {
	User,
	Guild,
	GuildUser,
	LevelRole,
	IgnoredChannel,
	IgnoredRole,
	WhitelabelBot,
	sequelize,
	migrate: (force = false) => {
		sequelize.sync({ force: force })
			.then(() => {
				console.log('Database & Tables Created');
			});
		// else {
		// 	console.log(__dirname);
		// 	const umzug = new Umzug({
		// 		migrations: { glob: [ 'migrations/*.js', { cwd: __dirname } ] },
		// 		context: sequelize.getQueryInterface(),
		// 		storage: new SequelizeStorage({ sequelize }),
		// 		logger: console,
		// 	});
		// 	(async () => await umzug.up())();
		// }
	},
};