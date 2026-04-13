import { createLogger, format, transports } from 'winston';

const isDev = process.env['NODE_ENV'] !== 'production';

export const logger = createLogger({
  level: isDev ? 'debug' : 'info',
  format: isDev
    ? format.combine(
        format.colorize(),
        format.timestamp({ format: 'HH:mm:ss' }),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const extras = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
          return `${timestamp} ${level}: ${message}${extras}`;
        })
      )
    : format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
});
