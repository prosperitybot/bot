import * as winston from 'winston';
import LokiTransport from 'winston-loki';

export const SqlLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new LokiTransport({
      host: process.env.LOKI_HOST!,
      labels: { type: 'sql' },
    }),
    new winston.transports.File({ filename: `${process.env.LOG_FOLDER}/sql.log`, level: 'silly' }),
  ],
});

export const CommandLogger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new LokiTransport({
      host: process.env.LOKI_HOST!,
      labels: { type: 'command' },
    }),
    new winston.transports.Console(),
    new winston.transports.File({ filename: `${process.env.LOG_FOLDER}/console.log`, level: 'silly' }),
  ],
});

export const EventLogger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new LokiTransport({
      host: process.env.LOKI_HOST!,
      labels: { type: 'event' },
    }),
    new winston.transports.Console(),
    new winston.transports.File({ filename: `${process.env.LOG_FOLDER}/events.log`, level: 'silly' }),
  ],
});
