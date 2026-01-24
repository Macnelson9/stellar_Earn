import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { loggerConfig } from '../../config/logger.config';

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger(loggerConfig);
  }

  log(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.info(message, {
      context,
      ...meta,
    });
  }

  warn(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.warn(message, {
      context,
      ...meta,
    });
  }

  error(
    message: string,
    trace?: string,
    context?: string,
    meta?: Record<string, any>,
  ) {
    this.logger.error(message, {
      context,
      trace,
      ...meta,
    });
  }

  debug(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.debug(message, {
      context,
      ...meta,
    });
  }
}
