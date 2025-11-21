type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
    userId?: string;
    endpoint?: string;
    duration?: number;
    error?: any;
    [key: string]: any;
}

class Logger {
    private log(level: LogLevel, message: string, context?: LogContext) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...context,
        };

        if (process.env.NODE_ENV === 'production') {
            console.log(JSON.stringify(logEntry));
        } else {
            const colorMap = {
                info: '\x1b[36m',
                warn: '\x1b[33m',
                error: '\x1b[31m',
                debug: '\x1b[90m',
            };
            const reset = '\x1b[0m';
            const color = colorMap[level];

            console.log(
                `${color}[${timestamp}] ${level.toUpperCase()}${reset}: ${message}`,
                context ? JSON.stringify(context, null, 2) : ''
            );
        }
    }

    info(message: string, context?: LogContext) {
        this.log('info', message, context);
    }

    warn(message: string, context?: LogContext) {
        this.log('warn', message, context);
    }

    error(message: string, context?: LogContext) {
        this.log('error', message, context);
    }

    debug(message: string, context?: LogContext) {
        if (process.env.NODE_ENV !== 'production') {
            this.log('debug', message, context);
        }
    }
}

export const logger = new Logger();
