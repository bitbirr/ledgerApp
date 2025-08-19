import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  Users, 
  FileText, 
  BarChart3, 
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export function SuperAdminDashboard() {
  // Mock data for KPIs
  const kpiData = [
    {
      title: "Total Businesses",
      value: "24",
      change: "+3 this month",
      icon: Building2,
    },
    {
      title: "Total Branches",
      value: "87",
      change: "+12 this month",
      icon: MapPin,
    },
    {
      title: "Total Users",
      value: "142",
      change: "+24 this month",
      icon: Users,
    },
    {
      title: "Active Businesses",
      value: "22",
      change: "92% uptime",
      icon: CheckCircle,
    },
  ];

  // Mock recent activity data
  const recentActivity = [
    { id: 1, type: 'business', description: 'New business registered: Tech Solutions Ltd', time: '2 hours ago' },
    { id: 2, type: 'user', description: 'User account created: John Doe', time: '4 hours ago' },
    { id: 3, type: 'branch', description: 'New branch added: Addis Ababa Branch', time: '1 day ago' },
    { id: 4, type: 'report', description: 'Monthly report generated', time: '1 day ago' },
  ];

  // Mock system status
  const systemStatus = [
    { service: 'Database', status: 'operational', uptime: '99.9%' },
    { service: 'API Gateway', status: 'operational', uptime: '99.95%' },
    { service: 'Authentication', status: 'operational', uptime: '99.8%' },
    { service: 'File Storage', status: 'degraded', uptime: '95.2%' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and management</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpi.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <Card className="lg:col-span-2 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">System Status</CardTitle>
            <CardDescription>
              Current system health and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemStatus.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      service.status === 'operational' ? 'bg-success' : 'bg-warning'
                    }`}></div>
                    <div>
                      <p className="font-medium text-foreground">{service.service}</p>
                      <p className="text-xs text-muted-foreground">{service.uptime} uptime</p>
                    </div>
                  </div>
                  <Badge variant={service.status === 'operational' ? 'default' : 'secondary'}>
                    {service.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>
              Latest system events and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    {activity.type === 'business' && <Building2 className="h-4 w-4 text-muted-foreground" />}
                    {activity.type === 'user' && <Users className="h-4 w-4 text-muted-foreground" />}
                    {activity.type === 'branch' && <MapPin className="h-4 w-4 text-muted-foreground" />}
                    {activity.type === 'report' && <FileText className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-sm text-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Building2 className="h-5 w-5" />
              <span>Add Business</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>Add Branch</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Users className="h-5 w-5" />
              <span>Create User</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail Preview */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Audit Trail</CardTitle>
          <CardDescription>
            Recent system changes and user actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b text-sm font-medium text-foreground">
              <div className="col-span-3">User</div>
              <div className="col-span-3">Action</div>
              <div className="col-span-3">Resource</div>
              <div className="col-span-3">Timestamp</div>
            </div>
            <div className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/30 transition-colors">
              <div className="col-span-3 font-medium text-foreground">
                admin@example.com
              </div>
              <div className="col-span-3 text-foreground">
                Created Business
              </div>
              <div className="col-span-3 text-muted-foreground">
                Tech Solutions Ltd
              </div>
              <div className="col-span-3 text-muted-foreground">
                2023-06-15 14:30
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/30 transition-colors">
              <div className="col-span-3 font-medium text-foreground">
                admin@example.com
              </div>
              <div className="col-span-3 text-foreground">
                Added User
              </div>
              <div className="col-span-3 text-muted-foreground">
                John Doe
              </div>
              <div className="col-span-3 text-muted-foreground">
                2023-06-15 10:15
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/30 transition-colors">
              <div className="col-span-3 font-medium text-foreground">
                admin@example.com
              </div>
              <div className="col-span-3 text-foreground">
                Updated Settings
              </div>
              <div className="col-span-3 text-muted-foreground">
                System Configuration
              </div>
              <div className="col-span-3 text-muted-foreground">
                2023-06-14 16:45
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              View Full Audit Trail
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}