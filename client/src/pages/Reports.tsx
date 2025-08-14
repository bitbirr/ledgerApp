import { useAppStore } from '@/lib/store';
import { AppBar } from '@/components/layout/AppBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Download, Printer, Calendar } from 'lucide-react';

export function Reports() {
  const { setCurrentScreen } = useAppStore();

  const handleGenerateReport = () => {
    // TODO: Generate report based on selected filters
    console.log('Generate report');
  };

  const handleExportPDF = () => {
    // TODO: Export report as PDF
    console.log('Export PDF');
  };

  const handleExportExcel = () => {
    // TODO: Export report as Excel
    console.log('Export Excel');
  };

  const handlePrint = () => {
    // TODO: Print report
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <AppBar 
        title="Reports"
        showBack={true}
        onBack={() => setCurrentScreen('dashboard')}
      />

      <main className="pb-20 p-4 space-y-4">
        {/* Report Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select>
                <SelectTrigger data-testid="select-report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account-statement">Account Statement</SelectItem>
                  <SelectItem value="cash-book">Cash Book Report</SelectItem>
                  <SelectItem value="profit-loss">Profit & Loss</SelectItem>
                  <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
                  <SelectItem value="transaction-summary">Transaction Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="period">Period</Label>
              <Select>
                <SelectTrigger data-testid="select-report-period">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from-date">From Date</Label>
                <Input
                  id="from-date"
                  type="date"
                  data-testid="input-from-date"
                />
              </div>
              <div>
                <Label htmlFor="to-date">To Date</Label>
                <Input
                  id="to-date"
                  type="date"
                  data-testid="input-to-date"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="account">Specific Account (Optional)</Label>
              <Select>
                <SelectTrigger data-testid="select-report-account">
                  <SelectValue placeholder="All accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {/* TODO: Load accounts from database */}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerateReport} 
              className="w-full"
              data-testid="button-generate-report"
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        {/* Quick Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                data-testid="button-quick-daily"
              >
                <Calendar className="h-5 w-5 mb-1" />
                <span className="text-sm">Daily Report</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                data-testid="button-quick-monthly"
              >
                <Calendar className="h-5 w-5 mb-1" />
                <span className="text-sm">Monthly Report</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                data-testid="button-quick-cashbook"
              >
                <FileText className="h-5 w-5 mb-1" />
                <span className="text-sm">Cash Book</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                data-testid="button-quick-accounts"
              >
                <FileText className="h-5 w-5 mb-1" />
                <span className="text-sm">Accounts Summary</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                className="flex flex-col items-center py-4"
                data-testid="button-export-pdf"
              >
                <FileText className="h-5 w-5 mb-1 text-red-600" />
                <span className="text-sm">PDF</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportExcel}
                className="flex flex-col items-center py-4"
                data-testid="button-export-excel"
              >
                <Download className="h-5 w-5 mb-1 text-green-600" />
                <span className="text-sm">Excel</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={handlePrint}
                className="flex flex-col items-center py-4"
                data-testid="button-print"
              >
                <Printer className="h-5 w-5 mb-1 text-blue-600" />
                <span className="text-sm">Print</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Preview Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-8 rounded-lg text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>Select filters and generate a report to see the preview here.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
