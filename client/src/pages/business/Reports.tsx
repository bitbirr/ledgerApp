import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  BarChart3,
  Download,
  FileText
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

export function Reports() {
  const { role } = useAuthStore();
  const [dateRange, setDateRange] = useState('last30');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock report data
  const reports = [
    { id: 1, name: 'Trial Balance', description: 'Summary of all account balances', lastGenerated: '2023-06-15', format: 'PDF' },
    { id: 2, name: 'Profit & Loss', description: 'Income and expense summary', lastGenerated: '2023-06-15', format: 'Excel' },
    { id: 3, name: 'Balance Sheet', description: 'Financial position statement', lastGenerated: '2023-06-15', format: 'PDF' },
    { id: 4, name: 'Cash Flow', description: 'Cash movement report', lastGenerated: '2023-06-15', format: 'Excel' },
    { id: 5, name: 'Accounts Receivable', description: 'Customer account summary', lastGenerated: '2023-06-10', format: 'PDF' },
    { id: 6, name: 'Accounts Payable', description: 'Supplier account summary', lastGenerated: '2023-06-10', format: 'Excel' },
  ];

  const filteredReports = reports.filter(report => 
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and view financial reports</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Date Range and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <Button 
                variant={dateRange === 'last7' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setDateRange('last7')}
              >
                Last 7 Days
              </Button>
              <Button 
                variant={dateRange === 'last30' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setDateRange('last30')}
              >
                Last 30 Days
              </Button>
              <Button 
                variant={dateRange === 'last90' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setDateRange('last90')}
              >
                Last 90 Days
              </Button>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  {report.name}
                </CardTitle>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {report.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Generated</span>
                  <span>{report.lastGenerated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format</span>
                  <Badge variant="secondary">{report.format}</Badge>
                </div>
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <Button className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Report
              </Button>
            </CardContent>
          </Card>
        ))}
        {filteredReports.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No reports found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button>
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trial Balance Table Example */}
      <Card>
        <CardHeader>
          <CardTitle>Trial Balance</CardTitle>
          <CardDescription>
            Summary of all account balances as of today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b text-sm font-medium text-foreground">
              <div className="col-span-6">Account</div>
              <div className="col-span-3 text-right">Debit</div>
              <div className="col-span-3 text-right">Credit</div>
            </div>
            <div className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/30 transition-colors">
              <div className="col-span-6 font-medium text-foreground">
                Cash
              </div>
              <div className="col-span-3 text-right text-foreground">
                125,430.00
              </div>
              <div className="col-span-3 text-right text-muted-foreground">
                0.00
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/30 transition-colors">
              <div className="col-span-6 font-medium text-foreground">
                Accounts Receivable
              </div>
              <div className="col-span-3 text-right text-foreground">
                45,230.00
              </div>
              <div className="col-span-3 text-right text-muted-foreground">
                0.00
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/30 transition-colors">
              <div className="col-span-6 font-medium text-foreground">
                Accounts Payable
              </div>
              <div className="col-span-3 text-right text-muted-foreground">
                0.00
              </div>
              <div className="col-span-3 text-right text-foreground">
                32,150.00
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/20 font-medium">
              <div className="col-span-6 text-foreground">
                Total
              </div>
              <div className="col-span-3 text-right text-foreground">
                170,660.00
              </div>
              <div className="col-span-3 text-right text-foreground">
                32,150.00
              </div>
            </div>
          </div>
        </CardContent>
        <div className="p-6 pt-0 flex justify-end">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      </Card>
    </div>
  );
}