import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLoggerService } from '../logger/logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'];
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;

      this.logger.log('HTTP Request', 'HTTP', {
        method,
        url: originalUrl,
        statusCode: res.statusCode,
        durationMs: duration,
        ip,
        userAgent,
      });
    });

    next();
  }
}
