import fs from 'fs';
import path from 'path';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { inspect } from 'util';
import Transport from 'winston-transport';
import axios from 'axios';

const { format, transports, createLogger } = winston;

// Define log levels
const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    security: 2,
    info: 3,
    debug: 4,
    trace: 5
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    security: 'magenta',
    info: 'green',
    debug: 'blue',
    trace: 'gray'
  }
};

// Add this to fix the colorize issue
winston.addColors(logLevels.colors);

// Custom transport for external logging services
class ExternalLoggerTransport extends Transport {
  private endpoint: string;
  private apiKey?: string;
  private serviceName: string;

  constructor(opts: Transport.TransportStreamOptions & { endpoint: string; apiKey?: string; serviceName: string }) {
    super(opts);
    this.endpoint = opts.endpoint;
    this.apiKey = opts.apiKey;
    this.serviceName = opts.serviceName;
  }

  log(info: any, callback: () => void) {
    // Don't log security events to external services to avoid leaking sensitive data
    if (info.level === 'security') {
      callback();
      return;
    }

    // Format the log entry for external service
    const logEntry = {
      timestamp: info.timestamp,
      level: info.level,
      message: info.message,
      service: this.serviceName,
      metadata: info.metadata || {},
      stack: info.stack,
    };

    // Send to external service
    axios
      .post(this.endpoint, logEntry, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
      })
      .catch((error) => {
        // Silently fail to avoid breaking the application
        console.error('Failed to send log to external service:', (error as Error).message);
      })
      .finally(() => {
        callback();
      });
  }
}

// Configuration for external logging services
const externalLoggingConfig = {
  enabled: process.env.EXTERNAL_LOGGING_ENABLED === 'true',
  endpoint: process.env.EXTERNAL_LOGGING_ENDPOINT || '',
  apiKey: process.env.EXTERNAL_LOGGING_API_KEY || '',
  serviceName: process.env.SERVICE_NAME || 'credit-debit-app',
};

// Log filtering configuration
const logFilterConfig = {
  // Sample rate for debug and trace logs (0.0 to 1.0, where 1.0 means all logs)
  debugSampleRate: parseFloat(process.env.DEBUG_LOG_SAMPLE_RATE || '1.0'),
  traceSampleRate: parseFloat(process.env.TRACE_LOG_SAMPLE_RATE || '1.0'),
  
  // Filter patterns to exclude certain logs
  excludePatterns: (process.env.EXCLUDE_LOG_PATTERNS || '').split(',').filter(Boolean),
  
  // IP addresses to exclude from logging
  excludeIPs: (process.env.EXCLUDE_LOG_IPS || '').split(',').filter(Boolean),
};

// Log sampling function
const shouldLog = (level: string, message: string, ip?: string): boolean => {
  // Check if IP should be excluded
  if (ip && logFilterConfig.excludeIPs.includes(ip)) {
    return false;
  }
  
  // Check if message matches exclude patterns
  for (const pattern of logFilterConfig.excludePatterns) {
    if (message.includes(pattern)) {
      return false;
    }
  }
  
  // Apply sampling for debug and trace levels
  if (level === 'debug' && Math.random() > logFilterConfig.debugSampleRate) {
    return false;
  }
  
  if (level === 'trace' && Math.random() > logFilterConfig.traceSampleRate) {
    return false;
  }
  
  return true;
};

// Define log format
const logFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.metadata({
    fillExcept: ['message', 'level', 'timestamp', 'label']
  }),
  format.printf((info: any) => {
    const { timestamp, level, message, stack, metadata } = info;
    const metaString = Object.keys(metadata).length 
      ? ` ${inspect(metadata, { depth: 3, colors: false })}` 
      : '';
    
    return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? `\n${stack}` : ''}${metaString}`;
  })
);

// Define structured log format for JSON output
const structuredLogFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.metadata({
    fillExcept: ['message', 'level', 'timestamp', 'label']
  }),
  format.json()
);

// Get log directory
const logDir = path.join(process.cwd(), 'logs');

// Create log directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create file transports with rotation
const createFileTransport = (filename: string, level?: string) => {
  return new DailyRotateFile({
    filename: path.join(logDir, `${filename}-%DATE%.log`),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level,
    format: logFormat
  });
};

const createStructuredFileTransport = (filename: string, level?: string) => {
  return new DailyRotateFile({
    filename: path.join(logDir, `${filename}-%DATE%.json`),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level,
    format: structuredLogFormat
  });
};

// Create the logger
const logger = createLogger({
  levels: logLevels.levels,
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    // Console transport for development
    new transports.Console({
      format: format.combine(
        format.colorize(),
        logFormat
      ),
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
    }),
    
    // Application logs
    createFileTransport('application'),
    
    // Error logs (only errors and above)
    createFileTransport('error', 'error'),
    
    // Security logs
    createFileTransport('security', 'security'),
    
    // Structured JSON logs for analysis
    createStructuredFileTransport('application-structured'),
    createStructuredFileTransport('security-structured', 'security'),
    
    // External logging transport (if enabled)
    ...(externalLoggingConfig.enabled 
      ? [new ExternalLoggerTransport({
          endpoint: externalLoggingConfig.endpoint,
          apiKey: externalLoggingConfig.apiKey,
          serviceName: externalLoggingConfig.serviceName
        })]
      : [])
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join(logDir, 'exceptions.log') })
  ],
  rejectionHandlers: [
    new transports.File({ filename: path.join(logDir, 'rejections.log') })
  ]
}) as winston.Logger & {
  security: (msg: string, meta?: any) => winston.Logger;
  trace: (msg: string, meta?: any) => winston.Logger;
};

// Add security logging method
logger.security = (msg: string, meta?: any) => {
  return logger.log('security', msg, meta);
};

// Add trace logging method
logger.trace = (msg: string, meta?: any) => {
  return logger.log('trace', msg, meta);
};

// Performance monitoring
export const performanceLogger = {
  start: (operation: string, context?: any) => {
    const startTime = process.hrtime.bigint();
    return {
      end: (result?: any) => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        
        logger.debug(`Operation '${operation}' completed`, {
          operation,
          duration: `${duration.toFixed(2)}ms`,
          ...context,
          result: result ? { ...result } : undefined
        });
        
        return duration;
      }
    };
  }
};

// Security event logging
export const securityLogger = {
  loginAttempt: (email: string, success: boolean, ip: string, userAgent?: string) => {
    logger.security('Login attempt', { email, success, ip, userAgent });
  },
  
  loginSuccess: (email: string, userId: string, ip: string, userAgent?: string) => {
    logger.security('Successful login', { email, userId, ip, userAgent });
  },
  
  loginFailure: (email: string, reason: string, ip: string, userAgent?: string) => {
    logger.security('Failed login', { email, reason, ip, userAgent });
  },
  
  unauthorizedAccess: (userId: string, resource: string, action: string, ip: string) => {
    logger.security('Unauthorized access attempt', { userId, resource, action, ip });
  },
  
  passwordChange: (userId: string, email: string, ip: string) => {
    logger.security('Password changed', { userId, email, ip });
  },
  
  roleAssignment: (adminId: string, userId: string, newRole: string, businessId?: string) => {
    logger.security('Role assigned', { adminId, userId, newRole, businessId });
  }
};

// Alerting system for critical events
interface ErrorEntry {
  count: number;
  lastReset: number;
}

export const alertSystem = {
  // Critical error threshold (number of errors in a time window)
  criticalErrorThreshold: parseInt(process.env.CRITICAL_ERROR_THRESHOLD || '5', 10),
  criticalErrorWindow: parseInt(process.env.CRITICAL_ERROR_WINDOW || '300000', 10), // 5 minutes in ms
  
  // Track errors for alerting
  errorCounts: new Map<string, ErrorEntry>(),
  
  // Send alert for critical events
  sendAlert: async (level: string, message: string, metadata?: any) => {
    // In a real implementation, this would send alerts via email, Slack, etc.
    // For now, we'll log to console and external services if configured
    console.warn(`[ALERT] ${level.toUpperCase()}: ${message}`, metadata);
    
    // Also log to security log for audit trail
    logger.security(`[ALERT] ${level.toUpperCase()}: ${message}`, metadata);
    
    // If external logging is enabled, send to external service
    if (externalLoggingConfig.enabled) {
      try {
        await axios.post(externalLoggingConfig.endpoint, {
          timestamp: new Date().toISOString(),
          level: 'alert',
          message: `[ALERT] ${level.toUpperCase()}: ${message}`,
          service: externalLoggingConfig.serviceName,
          metadata: metadata || {},
        }, {
          headers: {
            'Content-Type': 'application/json',
            ...(externalLoggingConfig.apiKey && { 'Authorization': `Bearer ${externalLoggingConfig.apiKey}` }),
          },
        });
      } catch (error) {
        console.error('Failed to send alert to external service:', (error as Error).message);
      }
    }
  },
  
  // Check for critical error conditions and trigger alerts
  checkCriticalError: (error: Error | string, context?: any) => {
    const errorKey = typeof error === 'string' ? error : error.message;
    const now = Date.now();
    
    // Get or create error tracking entry
    let errorEntry = alertSystem.errorCounts.get(errorKey);
    if (!errorEntry) {
      errorEntry = {
        count: 0,
        lastReset: now
      };
      alertSystem.errorCounts.set(errorKey, errorEntry);
    }
    
    // Reset counter if window has passed
    if (now - errorEntry.lastReset > alertSystem.criticalErrorWindow) {
      errorEntry.count = 0;
      errorEntry.lastReset = now;
    }
    
    // Increment error count
    errorEntry.count++;
    alertSystem.errorCounts.set(errorKey, errorEntry);
    
    // Check if we've reached the critical threshold
    if (errorEntry.count >= alertSystem.criticalErrorThreshold) {
      alertSystem.sendAlert('critical', `Critical error threshold reached: ${errorKey}`, {
        errorCount: errorEntry.count,
        context,
        timestamp: now
      });
    }
  }
};

// Request correlation ID generator
const generateCorrelationId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Context provider for enriching logs with additional information
export const logContextProvider = {
  // Store for request context
  contextStore: new Map<string, any>(),
  
  // Set context for a request
  setContext: (correlationId: string, context: any) => {
    logContextProvider.contextStore.set(correlationId, context);
  },
  
  // Get context for a request
  getContext: (correlationId: string) => {
    return logContextProvider.contextStore.get(correlationId) || {};
  },
  
  // Clear context for a request
  clearContext: (correlationId: string) => {
    logContextProvider.contextStore.delete(correlationId);
  },
  
  // Enrich log entry with context
  enrichLog: (info: any) => {
    // Add correlation ID if not present
    if (!info.correlationId) {
      info.correlationId = generateCorrelationId();
    }
    
    // Add context information
    const context = logContextProvider.getContext(info.correlationId);
    if (context) {
      info.metadata = { ...info.metadata, ...context };
    }
    
    return info;
  }
};

// HTTP request logging middleware with correlation ID
export const httpLoggerWithCorrelation = (req: any, res: any, next: any) => {
  // Generate correlation ID for this request
  const correlationId = generateCorrelationId();
  
  // Add correlation ID to request for use in other parts of the application
  req.correlationId = correlationId;
  
  // Set context for this request
  logContextProvider.setContext(correlationId, {
    correlationId,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
  });
  
  const start = Date.now();
  
  // Log request with correlation ID
  logger.debug('Incoming request', {
    correlationId,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    headers: process.env.LOG_LEVEL === 'debug' ? req.headers : undefined
  });
  
  // Capture response data
  const originalSend = res.send;
  let responseBody: any;
  
  res.send = function(body: any) {
    responseBody = body;
    originalSend.call(this, body);
  };
  
  // Log response when it's finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      correlationId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      response: process.env.LOG_LEVEL === 'debug' ? responseBody : undefined
    });
    
    // Clear context for this request
    logContextProvider.clearContext(correlationId);
  });
  
  next();
};

// Database query logging with correlation ID
export const dbLoggerWithCorrelation = {
  query: (correlationId: string, query: string, params: any[], duration: number) => {
    logger.debug('Database query executed', {
      correlationId,
      query: query.substring(0, 1000) + (query.length > 1000 ? '...' : ''),
      params: process.env.LOG_LEVEL === 'debug' ? params : undefined,
      duration: `${duration}ms`
    });
  },
  
  transaction: (correlationId: string, operation: string, duration: number) => {
    logger.debug(`Database transaction ${operation}`, {
      correlationId,
      operation,
      duration: `${duration}ms`
    });
  }
};

// HTTP request logging middleware
export const httpLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  // Log request
  logger.debug('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    headers: process.env.LOG_LEVEL === 'debug' ? req.headers : undefined
  });
  
  // Capture response data
  const originalSend = res.send;
  let responseBody: any;
  
  res.send = function(body: any) {
    responseBody = body;
    originalSend.call(this, body);
  };
  
  // Log response when it's finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      response: process.env.LOG_LEVEL === 'debug' ? responseBody : undefined
    });
  });
  
  next();
};

// Database query logging
export const dbLogger = {
  query: (query: string, params: any[], duration: number) => {
    logger.debug('Database query executed', {
      query: query.substring(0, 1000) + (query.length > 1000 ? '...' : ''),
      params: process.env.LOG_LEVEL === 'debug' ? params : undefined,
      duration: `${duration}ms`
    });
  },
  
  transaction: (operation: string, duration: number) => {
    logger.debug(`Database transaction ${operation}`, {
      operation,
      duration: `${duration}ms`
    });
  }
};

// Export the logger
export default logger;