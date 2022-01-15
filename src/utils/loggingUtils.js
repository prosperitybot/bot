const winston = require('winston');
const LokiTransport = require('winston-loki');

module.exports = {
	sqlLogger: winston.createLogger({
		level: 'info',
		format: winston.format.json(),
		transports: [
			new LokiTransport({
				host: process.env.LOKI_HOST,
				labels: { 'type': 'sql' },
			}),
			new winston.transports.File({ filename: process.env.LOG_FOLDER + '/sql.log', level: 'silly' }),
		],
	}),
	commandLogger: winston.createLogger({
		level: 'info',
		format: winston.format.simple(),
		transports: [
			new LokiTransport({
				host: process.env.LOKI_HOST,
				labels: { 'type': 'command' },
			}),
			new winston.transports.Console({ 'timestamp':true }),
			new winston.transports.File({ filename: process.env.LOG_FOLDER + '/console.log', level: 'silly' }),
		],
	}),
	eventLogger: winston.createLogger({
		level: 'info',
		format: winston.format.simple(),
		transports: [
			new LokiTransport({
				host: process.env.LOKI_HOST,
				labels: { 'type': 'event' },
			}),
			new winston.transports.Console({ 'timestamp':true }),
			new winston.transports.File({ filename: process.env.LOG_FOLDER + '/events.log', level: 'silly' }),
		],
	}),
};