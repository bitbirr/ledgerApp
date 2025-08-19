import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity,
  Database,
  Server,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Diagnostics() {
  const [isRunning, setIsRunning] = useState(false);
  
  // Mock system status data
  const systemStatus = {
    database: { status: 'healthy', message: 'Connected and responsive' },
    server: { status: 'warning', message: 'High memory usage' },
    network: { status: 'healthy', message: 'Stable connection' },
    storage: { status: 'critical', message: 'Low disk space' },
  };
  
  // Mock performance metrics
  const performanceMetrics = [
    { name: 'CPU Usage', value: 65, unit: '%', status: 'warning' },
    { name: 'Memory Usage', value: 82, unit: '%', status: 'warning' },
    { name: 'Disk I/O', value: 45, unit: 'MB/s', status: 'healthy' },
    { name: 'Network Latency', value: 28, unit: 'ms', status: 'healthy' },
    { name: 'Active Users', value: 124, unit: 'users', status: 'healthy' },
    { name: 'API Response Time', value: 142, unit: 'ms', status: 'warning' },
  ];
  
  // Mock recent logs
  const recentLogs = [
    { id: 1, level: 'info', message: 'User login successful', timestamp: '2023-06-15 14:30:22' },
    { id: 2, level: 'warning', message: 'High memory usage detected', timestamp: '2023-06-15 14:25:10' },
    { id: 3, level: 'info', message: 'Database backup completed', timestamp: '2023-06-15 14:15:45' },
    { id: 4, level: 'error', message: 'Failed login attempt', timestamp: '2023-06-15 14:10:33' },
    { id: 5, level: 'info', message: 'Scheduled maintenance completed', timestamp: '2023-06-15 14:05:17' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'default';
    }
  };

  const getLogLevelVariant = (level: string) => {
    switch (level) {
      case 'info': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'default';
    }
  };

  const runDiagnostics = () => {
    setIsRunning(true);
    // Simulate diagnostic process
    setTimeout(() => {
      setIsRunning(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Diagnostics</h1>
          <p className="text-muted-foreground">Monitor system health and performance</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" onClick={runDiagnostics} disabled={isRunning}>
            <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running...' : 'Run Diagnostics'}
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-5 w-5 text-muted-foreground" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {getStatusIcon(systemStatus.database.status)}
            </div>
            <p className="text-sm mt-2">{systemStatus.database.message}</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-5 w-5 text-muted-foreground" />
              Server
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {getStatusIcon(systemStatus.server.status)}
            </div>
            <p className="text-sm mt-2">{systemStatus.server.message}</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wifi className="h-5 w-5 text-muted-foreground" />
              Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {getStatusIcon(systemStatus.network.status)}
            </div>
            <p className="text-sm mt-2">{systemStatus.network.message}</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="h-5 w-5 text-muted-foreground" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {getStatusIcon(systemStatus.storage.status)}
            </div>
            <p className="text-sm mt-2">{systemStatus.storage.message}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Real-time system performance data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <span className="text-sm">{metric.value} {metric.unit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metric.status === 'healthy' ? 'bg-green-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Logs</CardTitle>
            <CardDescription>
              System activity and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Badge variant={getLogLevelVariant(log.level)}>
                    {log.level.toUpperCase()}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{log.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Cpu className="h-5 w-5" />
            System Information
          </CardTitle>
          <CardDescription>
            Detailed system specifications and configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Server className="h-4 w-4" />
                Server
              </h4>
              <p className="text-sm text-muted-foreground">LedgerPro Admin Server v2.1.4</p>
              <p className="text-sm text-muted-foreground">Ubuntu 22.04 LTS</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <MemoryStick className="h-4 w-4" />
                Resources
              </h4>
              <p className="text-sm text-muted-foreground">CPU: 8 cores @ 3.2GHz</p>
              <p className="text-sm text-muted-foreground">Memory: 32GB RAM</p>
              <p className="text-sm text-muted-foreground">Storage: 1TB SSD</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database
              </h4>
              <p className="text-sm text-muted-foreground">MySQL 8.0.28</p>
              <p className="text-sm text-muted-foreground">1.2TB used of 2TB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}