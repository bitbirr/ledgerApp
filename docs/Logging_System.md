# Comprehensive Logging System

This document describes the comprehensive logging system implemented for the application, which provides detailed application insights including informational events, error conditions, debug traces, warning messages, and critical system alerts.

## Features

### 1. Configurable Log Levels
The logging system supports the following log levels:
- `error` - Critical errors that require immediate attention
- `warn` - Warning messages that indicate potential issues
- `security` - Security-related events and audit trails
- `info` - General informational messages
- `debug` - Detailed debug information for troubleshooting
- `trace` - Fine-grained trace information for deep analysis

### 2. Structured Data Formatting
Logs are formatted in both human-readable and structured JSON formats for easy parsing and analysis.

### 3. Real-time Monitoring Capabilities
The system provides real-time logging capabilities with immediate output to console during development.

### 4. Log Rotation Management
Log files are automatically rotated daily and compressed to save disk space. Old logs are automatically deleted after 14 days.

### 5. Multi-destination Output Support
Logs are written to multiple destinations:
- Console (development only)
- File logs with rotation
- Structured JSON logs for analysis
- Separate files for errors and security events
- External logging services (when configured)

### 6. Performance Metrics Tracking
The system tracks operation durations and performance metrics.

### 7. Security Event Auditing
Comprehensive security event logging including login attempts, unauthorized access attempts, password changes, and role assignments.

### 8. Centralized Log Aggregation
All logs are stored in a centralized `logs` directory for easy access and analysis. Additionally, logs can be sent to external services for centralized aggregation.

### 9. Log Filtering and Sampling
The system supports filtering and sampling of logs to reduce noise and storage requirements.

### 10. Alerting Mechanisms
Critical events can trigger alerts for immediate attention.

### 11. Request Correlation and Tracing
Logs can be correlated with request IDs for end-to-end tracing.

## Log File Structure

The logging system creates the following log files:

1. `application-%DATE%.log` - General application logs
2. `error-%DATE%.log` - Error logs only
3. `security-%DATE%.log` - Security-related logs
4. `application-structured-%DATE%.json` - Structured JSON logs for analysis
5. `security-structured-%DATE%.json` - Structured security logs
6. `exceptions.log` - Unhandled exceptions
7. `rejections.log` - Unhandled promise rejections

## Usage

### Basic Logging

```typescript
import logger from './services/logger';

// Info level logging
logger.info('User logged in', { userId: '123', ip: '192.168.1.1' });

// Error level logging
logger.error('Database connection failed', { 
  error: 'Connection timeout', 
  host: 'db.example.com' 
});

// Debug level logging
logger.debug('Processing transaction', { 
  transactionId: 'txn_123', 
  amount: 100.00 
});

// Warning level logging
logger.warn('Low disk space', { 
  available: '2.5GB', 
  threshold: '5GB' 
});
```

### Security Logging

```typescript
import { securityLogger } from './services/logger';

// Login attempt
securityLogger.loginAttempt('user@example.com', true, '192.168.1.1');

// Successful login
securityLogger.loginSuccess('user@example.com', 'user123', '192.168.1.1');

// Failed login
securityLogger.loginFailure('user@example.com', 'Invalid password', '192.168.1.1');

// Unauthorized access
securityLogger.unauthorizedAccess('user123', '/admin/users', 'DELETE', '192.168.1.1');

// Password change
securityLogger.passwordChange('user123', 'user@example.com', '192.168.1.1');

// Role assignment
securityLogger.roleAssignment('admin123', 'user456', 'Admin', 'biz_789');
```

### Performance Monitoring

```typescript
import { performanceLogger } from './services/logger';

// Track operation performance
const operation = performanceLogger.start('database-query', { 
  query: 'SELECT * FROM users' 
});

// ... perform operation ...

operation.end({ resultCount: 42 });
```

### HTTP Request Logging

The HTTP logger middleware automatically logs all incoming requests and responses:

```typescript
import { httpLogger } from './services/logger';

// Add to Express app
app.use(httpLogger);
```

For enhanced logging with correlation IDs:

```typescript
import { httpLoggerWithCorrelation } from './services/logger';

// Add to Express app
app.use(httpLoggerWithCorrelation);
```

### Database Query Logging

Database queries are automatically logged through the database service:

```typescript
import { dbLogger } from './services/logger';

// Log database query
dbLogger.query('SELECT * FROM users WHERE id = ?', ['123'], 15.2);
```

For enhanced logging with correlation IDs:

```typescript
import { dbLoggerWithCorrelation } from './services/logger';

// Log database query with correlation ID
dbLoggerWithCorrelation.query('req_123456789', 'SELECT * FROM users WHERE id = ?', ['123'], 15.2);
```

### Alerting System

The alerting system can be used to send notifications for critical events:

```typescript
import { alertSystem } from './services/logger';

// Check for critical errors
alertSystem.checkCriticalError(new Error('Database connection failed'), { 
  database: 'primary-db',
  host: 'db.example.com'
});
```

## Configuration

The logging system can be configured through environment variables:

- `LOG_LEVEL` - Set the minimum log level (default: 'info')
- `NODE_ENV` - When set to 'development', debug logs are shown in console
- `EXTERNAL_LOGGING_ENABLED` - Enable external logging (default: false)
- `EXTERNAL_LOGGING_ENDPOINT` - Endpoint for external logging service
- `EXTERNAL_LOGGING_API_KEY` - API key for external logging service
- `SERVICE_NAME` - Name of the service for external logging (default: 'credit-debit-app')
- `DEBUG_LOG_SAMPLE_RATE` - Sample rate for debug logs (0.0 to 1.0, default: 1.0)
- `TRACE_LOG_SAMPLE_RATE` - Sample rate for trace logs (0.0 to 1.0, default: 1.0)
- `EXCLUDE_LOG_PATTERNS` - Comma-separated list of patterns to exclude from logging
- `EXCLUDE_LOG_IPS` - Comma-separated list of IP addresses to exclude from logging
- `CRITICAL_ERROR_THRESHOLD` - Number of errors to trigger an alert (default: 5)
- `CRITICAL_ERROR_WINDOW` - Time window for critical error threshold in milliseconds (default: 300000)

## Log Format

### Human-readable Format
```
2023-05-15T10:30:45.123Z [INFO]: User logged in { userId: '123', ip: '192.168.1.1' }
```

### Structured JSON Format
```json
{
  "timestamp": "2023-05-15T10:30:45.123Z",
  "level": "info",
  "message": "User logged in",
  "metadata": {
    "userId": "123",
    "ip": "192.168.1.1"
  }
}
```

## Best Practices

1. Use appropriate log levels for different types of messages
2. Include relevant context information in log metadata
3. Avoid logging sensitive information like passwords or tokens
4. Use structured logging for complex data that may need analysis
5. Log security events immediately when they occur
6. Monitor error logs regularly for application issues
7. Use performance logging for long-running operations
8. Keep log messages clear and descriptive
9. Use correlation IDs for request tracing
10. Configure appropriate sampling rates for high-volume logs

## Log Analysis

The structured JSON logs can be easily parsed and analyzed using log analysis tools. The consistent format makes it simple to create dashboards and alerts based on log data.

## Troubleshooting

If you encounter issues with the logging system:

1. Check that the `logs` directory is writable
2. Verify environment variable settings
3. Ensure sufficient disk space for log files
4. Check file permissions on the log directory
5. Review log file rotation settings if disk space is an issue
6. Verify external logging service configuration if using external services