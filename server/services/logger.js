"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbLogger = exports.httpLogger = exports.dbLoggerWithCorrelation = exports.httpLoggerWithCorrelation = exports.logContextProvider = exports.alertSystem = exports.securityLogger = exports.performanceLogger = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var winston = require("winston");
var winston_daily_rotate_file_1 = require("winston-daily-rotate-file");
var util_1 = require("util");
var winston_transport_1 = require("winston-transport");
var axios_1 = require("axios");
var format = winston.format, transports = winston.transports, createLogger = winston.createLogger;
// Define log levels
var logLevels = {
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
var ExternalLoggerTransport = /** @class */ (function (_super) {
    __extends(ExternalLoggerTransport, _super);
    function ExternalLoggerTransport(opts) {
        var _this = _super.call(this, opts) || this;
        _this.endpoint = opts.endpoint;
        _this.apiKey = opts.apiKey;
        _this.serviceName = opts.serviceName;
        return _this;
    }
    ExternalLoggerTransport.prototype.log = function (info, callback) {
        // Don't log security events to external services to avoid leaking sensitive data
        if (info.level === 'security') {
            callback();
            return;
        }
        // Format the log entry for external service
        var logEntry = {
            timestamp: info.timestamp,
            level: info.level,
            message: info.message,
            service: this.serviceName,
            metadata: info.metadata || {},
            stack: info.stack,
        };
        // Send to external service
        axios_1.default
            .post(this.endpoint, logEntry, {
            headers: __assign({ 'Content-Type': 'application/json' }, (this.apiKey && { 'Authorization': "Bearer ".concat(this.apiKey) })),
        })
            .catch(function (error) {
            // Silently fail to avoid breaking the application
            console.error('Failed to send log to external service:', error.message);
        })
            .finally(function () {
            callback();
        });
    };
    return ExternalLoggerTransport;
}(winston_transport_1.default));
// Configuration for external logging services
var externalLoggingConfig = {
    enabled: process.env.EXTERNAL_LOGGING_ENABLED === 'true',
    endpoint: process.env.EXTERNAL_LOGGING_ENDPOINT || '',
    apiKey: process.env.EXTERNAL_LOGGING_API_KEY || '',
    serviceName: process.env.SERVICE_NAME || 'credit-debit-app',
};
// Log filtering configuration
var logFilterConfig = {
    // Sample rate for debug and trace logs (0.0 to 1.0, where 1.0 means all logs)
    debugSampleRate: parseFloat(process.env.DEBUG_LOG_SAMPLE_RATE || '1.0'),
    traceSampleRate: parseFloat(process.env.TRACE_LOG_SAMPLE_RATE || '1.0'),
    // Filter patterns to exclude certain logs
    excludePatterns: (process.env.EXCLUDE_LOG_PATTERNS || '').split(',').filter(Boolean),
    // IP addresses to exclude from logging
    excludeIPs: (process.env.EXCLUDE_LOG_IPS || '').split(',').filter(Boolean),
};
// Log sampling function
var shouldLog = function (level, message, ip) {
    // Check if IP should be excluded
    if (ip && logFilterConfig.excludeIPs.includes(ip)) {
        return false;
    }
    // Check if message matches exclude patterns
    for (var _i = 0, _a = logFilterConfig.excludePatterns; _i < _a.length; _i++) {
        var pattern = _a[_i];
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
var logFormat = format.combine(format.timestamp(), format.errors({ stack: true }), format.metadata({
    fillExcept: ['message', 'level', 'timestamp', 'label']
}), format.printf(function (info) {
    var timestamp = info.timestamp, level = info.level, message = info.message, stack = info.stack, metadata = info.metadata;
    var metaString = Object.keys(metadata).length
        ? " ".concat((0, util_1.inspect)(metadata, { depth: 3, colors: false }))
        : '';
    return "".concat(timestamp, " [").concat(level.toUpperCase(), "]: ").concat(message).concat(stack ? "\n".concat(stack) : '').concat(metaString);
}));
// Define structured log format for JSON output
var structuredLogFormat = format.combine(format.timestamp(), format.errors({ stack: true }), format.metadata({
    fillExcept: ['message', 'level', 'timestamp', 'label']
}), format.json());
// Get log directory
var logDir = path_1.default.join(process.cwd(), 'logs');
// Create log directory if it doesn't exist
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
// Create file transports with rotation
var createFileTransport = function (filename, level) {
    return new winston_daily_rotate_file_1.default({
        filename: path_1.default.join(logDir, "".concat(filename, "-%DATE%.log")),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: level,
        format: logFormat
    });
};
var createStructuredFileTransport = function (filename, level) {
    return new winston_daily_rotate_file_1.default({
        filename: path_1.default.join(logDir, "".concat(filename, "-%DATE%.json")),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: level,
        format: structuredLogFormat
    });
};
// Create the logger
var logger = createLogger({
    levels: logLevels.levels,
    level: process.env.LOG_LEVEL || 'info',
    transports: __spreadArray([
        // Console transport for development
        new transports.Console({
            format: format.combine(format.colorize(), logFormat),
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
        createStructuredFileTransport('security-structured', 'security')
    ], (externalLoggingConfig.enabled
        ? [new ExternalLoggerTransport({
                endpoint: externalLoggingConfig.endpoint,
                apiKey: externalLoggingConfig.apiKey,
                serviceName: externalLoggingConfig.serviceName
            })]
        : []), true),
    exceptionHandlers: [
        new transports.File({ filename: path_1.default.join(logDir, 'exceptions.log') })
    ],
    rejectionHandlers: [
        new transports.File({ filename: path_1.default.join(logDir, 'rejections.log') })
    ]
});
// Add security logging method
logger.security = function (msg, meta) {
    return logger.log('security', msg, meta);
};
// Add trace logging method
logger.trace = function (msg, meta) {
    return logger.log('trace', msg, meta);
};
// Performance monitoring
exports.performanceLogger = {
    start: function (operation, context) {
        var startTime = process.hrtime.bigint();
        return {
            end: function (result) {
                var endTime = process.hrtime.bigint();
                var duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
                logger.debug("Operation '".concat(operation, "' completed"), __assign(__assign({ operation: operation, duration: "".concat(duration.toFixed(2), "ms") }, context), { result: result ? __assign({}, result) : undefined }));
                return duration;
            }
        };
    }
};
// Security event logging
exports.securityLogger = {
    loginAttempt: function (email, success, ip, userAgent) {
        logger.security('Login attempt', { email: email, success: success, ip: ip, userAgent: userAgent });
    },
    loginSuccess: function (email, userId, ip, userAgent) {
        logger.security('Successful login', { email: email, userId: userId, ip: ip, userAgent: userAgent });
    },
    loginFailure: function (email, reason, ip, userAgent) {
        logger.security('Failed login', { email: email, reason: reason, ip: ip, userAgent: userAgent });
    },
    unauthorizedAccess: function (userId, resource, action, ip) {
        logger.security('Unauthorized access attempt', { userId: userId, resource: resource, action: action, ip: ip });
    },
    passwordChange: function (userId, email, ip) {
        logger.security('Password changed', { userId: userId, email: email, ip: ip });
    },
    roleAssignment: function (adminId, userId, newRole, businessId) {
        logger.security('Role assigned', { adminId: adminId, userId: userId, newRole: newRole, businessId: businessId });
    }
};
exports.alertSystem = {
    // Critical error threshold (number of errors in a time window)
    criticalErrorThreshold: parseInt(process.env.CRITICAL_ERROR_THRESHOLD || '5', 10),
    criticalErrorWindow: parseInt(process.env.CRITICAL_ERROR_WINDOW || '300000', 10), // 5 minutes in ms
    // Track errors for alerting
    errorCounts: new Map(),
    // Send alert for critical events
    sendAlert: function (level, message, metadata) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // In a real implementation, this would send alerts via email, Slack, etc.
                    // For now, we'll log to console and external services if configured
                    console.warn("[ALERT] ".concat(level.toUpperCase(), ": ").concat(message), metadata);
                    // Also log to security log for audit trail
                    logger.security("[ALERT] ".concat(level.toUpperCase(), ": ").concat(message), metadata);
                    if (!externalLoggingConfig.enabled) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.post(externalLoggingConfig.endpoint, {
                            timestamp: new Date().toISOString(),
                            level: 'alert',
                            message: "[ALERT] ".concat(level.toUpperCase(), ": ").concat(message),
                            service: externalLoggingConfig.serviceName,
                            metadata: metadata || {},
                        }, {
                            headers: __assign({ 'Content-Type': 'application/json' }, (externalLoggingConfig.apiKey && { 'Authorization': "Bearer ".concat(externalLoggingConfig.apiKey) })),
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Failed to send alert to external service:', error_1.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    // Check for critical error conditions and trigger alerts
    checkCriticalError: function (error, context) {
        var errorKey = typeof error === 'string' ? error : error.message;
        var now = Date.now();
        // Get or create error tracking entry
        var errorEntry = exports.alertSystem.errorCounts.get(errorKey);
        if (!errorEntry) {
            errorEntry = {
                count: 0,
                lastReset: now
            };
            exports.alertSystem.errorCounts.set(errorKey, errorEntry);
        }
        // Reset counter if window has passed
        if (now - errorEntry.lastReset > exports.alertSystem.criticalErrorWindow) {
            errorEntry.count = 0;
            errorEntry.lastReset = now;
        }
        // Increment error count
        errorEntry.count++;
        exports.alertSystem.errorCounts.set(errorKey, errorEntry);
        // Check if we've reached the critical threshold
        if (errorEntry.count >= exports.alertSystem.criticalErrorThreshold) {
            exports.alertSystem.sendAlert('critical', "Critical error threshold reached: ".concat(errorKey), {
                errorCount: errorEntry.count,
                context: context,
                timestamp: now
            });
        }
    }
};
// Request correlation ID generator
var generateCorrelationId = function () {
    return "req_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
};
// Context provider for enriching logs with additional information
exports.logContextProvider = {
    // Store for request context
    contextStore: new Map(),
    // Set context for a request
    setContext: function (correlationId, context) {
        exports.logContextProvider.contextStore.set(correlationId, context);
    },
    // Get context for a request
    getContext: function (correlationId) {
        return exports.logContextProvider.contextStore.get(correlationId) || {};
    },
    // Clear context for a request
    clearContext: function (correlationId) {
        exports.logContextProvider.contextStore.delete(correlationId);
    },
    // Enrich log entry with context
    enrichLog: function (info) {
        // Add correlation ID if not present
        if (!info.correlationId) {
            info.correlationId = generateCorrelationId();
        }
        // Add context information
        var context = exports.logContextProvider.getContext(info.correlationId);
        if (context) {
            info.metadata = __assign(__assign({}, info.metadata), context);
        }
        return info;
    }
};
// HTTP request logging middleware with correlation ID
var httpLoggerWithCorrelation = function (req, res, next) {
    // Generate correlation ID for this request
    var correlationId = generateCorrelationId();
    // Add correlation ID to request for use in other parts of the application
    req.correlationId = correlationId;
    // Set context for this request
    exports.logContextProvider.setContext(correlationId, {
        correlationId: correlationId,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
    });
    var start = Date.now();
    // Log request with correlation ID
    logger.debug('Incoming request', {
        correlationId: correlationId,
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        headers: process.env.LOG_LEVEL === 'debug' ? req.headers : undefined
    });
    // Capture response data
    var originalSend = res.send;
    var responseBody;
    res.send = function (body) {
        responseBody = body;
        originalSend.call(this, body);
    };
    // Log response when it's finished
    res.on('finish', function () {
        var duration = Date.now() - start;
        logger.info('Request completed', {
            correlationId: correlationId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: "".concat(duration, "ms"),
            ip: req.ip || req.connection.remoteAddress,
            response: process.env.LOG_LEVEL === 'debug' ? responseBody : undefined
        });
        // Clear context for this request
        exports.logContextProvider.clearContext(correlationId);
    });
    next();
};
exports.httpLoggerWithCorrelation = httpLoggerWithCorrelation;
// Database query logging with correlation ID
exports.dbLoggerWithCorrelation = {
    query: function (correlationId, query, params, duration) {
        logger.debug('Database query executed', {
            correlationId: correlationId,
            query: query.substring(0, 1000) + (query.length > 1000 ? '...' : ''),
            params: process.env.LOG_LEVEL === 'debug' ? params : undefined,
            duration: "".concat(duration, "ms")
        });
    },
    transaction: function (correlationId, operation, duration) {
        logger.debug("Database transaction ".concat(operation), {
            correlationId: correlationId,
            operation: operation,
            duration: "".concat(duration, "ms")
        });
    }
};
// HTTP request logging middleware
var httpLogger = function (req, res, next) {
    var start = Date.now();
    // Log request
    logger.debug('Incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        headers: process.env.LOG_LEVEL === 'debug' ? req.headers : undefined
    });
    // Capture response data
    var originalSend = res.send;
    var responseBody;
    res.send = function (body) {
        responseBody = body;
        originalSend.call(this, body);
    };
    // Log response when it's finished
    res.on('finish', function () {
        var duration = Date.now() - start;
        logger.info('Request completed', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: "".concat(duration, "ms"),
            ip: req.ip || req.connection.remoteAddress,
            response: process.env.LOG_LEVEL === 'debug' ? responseBody : undefined
        });
    });
    next();
};
exports.httpLogger = httpLogger;
// Database query logging
exports.dbLogger = {
    query: function (query, params, duration) {
        logger.debug('Database query executed', {
            query: query.substring(0, 1000) + (query.length > 1000 ? '...' : ''),
            params: process.env.LOG_LEVEL === 'debug' ? params : undefined,
            duration: "".concat(duration, "ms")
        });
    },
    transaction: function (operation, duration) {
        logger.debug("Database transaction ".concat(operation), {
            operation: operation,
            duration: "".concat(duration, "ms")
        });
    }
};
// Export the logger
exports.default = logger;
