import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  FileText,
  Download,
  Calendar,
  User,
  Building2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Audit() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  // Mock audit data
  const auditLogs = [
    { id: 1, user: 'John Doe', action: 'Created Business', business: 'ABC Corporation', timestamp: '2023-06-15 14:30:22', ip: '192.168.1.100' },
    { id: 2, user: 'Jane Smith', action: 'Updated Settings', business: 'System', timestamp: '2023-06-15 13:45:10', ip: '192.168.1.101' },
    { id: 3, user: 'Bob Johnson', action: 'Deleted User', business: 'XYZ Ltd', timestamp: '2023-06-15 12:15:45', ip: '192.168.1.102' },
    { id: 4, user: 'Alice Brown', action: 'Added Branch', business: 'Global Trading', timestamp: '2023-06-15 11:20:33', ip: '192.168.1.103' },
    { id: 5, user: 'Charlie Wilson', action: 'Updated Role', business: 'ABC Corporation', timestamp: '2023-06-15 10:05:17', ip: '192.168.1.104' },
    { id: 6, user: 'John Doe', action: 'Created Business', business: 'Tech Solutions', timestamp: '2023-06-14 16:45:22', ip: '192.168.1.100' },
    { id: 7, user: 'Jane Smith', action: 'Updated Settings', business: 'System', timestamp: '2023-06-14 15:30:10', ip: '192.168.1.101' },
  ];

  const filteredLogs = auditLogs.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.business.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Trail</h1>
          <p className="text-muted-foreground">View system activity logs</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </Button>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Audit Log Entries</CardTitle>
            <CardDescription>
              {filteredLogs.length} log entries found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border">
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b text-sm font-medium text-foreground">
                <div className="col-span-2">Timestamp</div>
                <div className="col-span-2">User</div>
                <div className="col-span-3">Action</div>
                <div className="col-span-2">Business</div>
                <div className="col-span-2">IP Address</div>
                <div className="col-span-1">Details</div>
              </div>
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-teal-50/40 transition-colors"
                >
                  <div className="col-span-2 text-foreground">
                    {log.timestamp}
                  </div>
                  <div className="col-span-2 font-medium text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {log.user}
                  </div>
                  <div className="col-span-3 text-foreground">
                    {log.action}
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {log.business}
                  </div>
                  <div className="col-span-2 text-foreground">
                    {log.ip}
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No audit logs found</h3>
                  <p className="mb-4">Try adjusting your search or filter to find what you're looking for.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  {log.action}
                </CardTitle>
                <Badge variant="secondary">
                  {new Date(log.timestamp).toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User</span>
                  <span className="font-medium text-foreground">{log.user}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business</span>
                  <span>{log.business}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IP Address</span>
                  <span>{log.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredLogs.length === 0 && (
          <Card className="rounded-2xl">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No audit logs found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}