const winston = require('winston');

module.exports = {
	sqlLogger: winston.createLogger({
		level: 'info',
		format: winston.format.json(),
		defaultMeta: { service: 'user-service' },
		transports: [
			new winston.transports.File({ filename: process.env.LOG_FOLDER + '/sql.log', level: 'silly' }),
		],
	}),
};