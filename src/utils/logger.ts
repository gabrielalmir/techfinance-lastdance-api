import winston from 'winston';

const logFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}] : `;

    if (typeof message === 'object') {
        msg += JSON.stringify(message, null, 2);
    } else {
        msg += message;
    }

    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata, null, 2)}`;
    }

    return msg;
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
        logFormat
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            )
        }),
        new winston.transports.File({
            filename: '/app/logs/error.log',
            level: 'error',
            format: winston.format.combine(
                winston.format.uncolorize(),
                logFormat
            )
        }),
        new winston.transports.File({
            filename: '/app/logs/combined.log',
            format: winston.format.combine(
                winston.format.uncolorize(),
                logFormat
            )
        })
    ]
});

export default logger;
