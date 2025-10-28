import * as winston from 'winston';
import * as path from 'path';

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(info => {
        const module = info['label'] || 'APP';
        return `[${info['timestamp']}] [${module}] ${info.level}: ${info.message}`;
    })
);

const transports = [
    new winston.transports.Console({
        format: consoleFormat,
    }),
    new winston.transports.File({
        filename: 'error.log',
        level: 'error'
    }),
];

/**
 * Factory logger per module
 * @param modulePath 
 * @returns 
 */
export function getLogger(modulePath: string): winston.Logger {
    const moduleName = path.basename(modulePath);

    return winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.label({ label: moduleName }),
            winston.format.errors({stack: true})
        ),
        transports: transports,
    });
}