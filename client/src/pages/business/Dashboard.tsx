import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt, 
  BarChart3, 
  Plus,
  Calendar,
  Filter
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export function Dashboard() {
  const { businessId, user } = useAuthStore();
  
  // Mock data for KPIs
  const kpiData = [
    {
      title: "Total Balance",
      value: "ETB 125,430.00",
      change: "+12.5%",
      trend: "up",
      icon: Wallet,
    },
    {
      title: "Receipts",
      value: "ETB 45,230.00",
      change: "+8.2%",
      trend: "up",
      icon: Receipt,
    },
    {
      title: "Payments",
      value: "ETB 32,150.00",
      change: "-2.1%",
      trend: "down",
      icon: TrendingDown,
    },
    {
      title: "Pending Invoices",
      value: "12",
      change: "+3",
      trend: "up",
      icon: BarChart3,
    },
  ];

  // Mock recent activity data
  const recentActivity = [
    { id: 1, type: 'receipt', description: 'Payment from ABC Corp', amount: 'ETB 5,000.00', date: '2023-06-15' },
    { id: 2, type: 'payment', description: 'Office supplies', amount: 'ETB 2,300.00', date: '2023-06-14' },
    { id: 3, type: 'invoice', description: 'Invoice #1234 sent', amount: 'ETB 7,500.00', date: '2023-06-14' },
    { id: 4, type: 'receipt', description: 'Payment from XYZ Ltd', amount: 'ETB 3,200.00', date: '2023-06-13' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || 'User'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center mt-1">
                  <Badge 
                    variant={kpi.trend === 'up' ? 'default' : 'destructive'} 
                    className="text-xs"
                  >
                    {kpi.change}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cash Flow Trend</CardTitle>
            <CardDescription>
              Last 30 days income and expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Chart visualization would appear here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest transactions and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      activity.type === 'receipt' ? 'text-success' : 
                      activity.type === 'payment' ? 'text-destructive' : 'text-foreground'
                    }`}>
                      {activity.amount}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className="text-xs mt-1"
                    >
                      {activity.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              <span>New Invoice</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Receipt className="h-5 w-5" />
              <span>Record Payment</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Wallet className="h-5 w-5" />
              <span>Add Account</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}