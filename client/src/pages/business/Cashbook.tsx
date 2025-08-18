import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Filter, 
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/auth-store';

export function Cashbook() {
  const { role } = useAuthStore();
  const [dateRange, setDateRange] = useState('last30');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock cashbook data
  const cashbookEntries = [
    { id: 1, date: '2023-06-15', description: 'Payment from ABC Corp', type: 'in', amount: 5000, balance: 125000 },
    { id: 2, date: '2023-06-14', description: 'Office supplies purchase', type: 'out', amount: 2300, balance: 120000 },
    { id: 3, date: '2023-06-14', description: 'Invoice payment to XYZ Ltd', type: 'out', amount: 7500, balance: 122300 },
    { id: 4, date: '2023-06-13', description: 'Payment from XYZ Ltd', type: 'in', amount: 3200, balance: 129800 },
    { id: 5, date: '2023-06-12', description: 'Bank transfer fee', type: 'out', amount: 50, balance: 126600 },
  ];

  const totals = {
    totalIn: 8200,
    totalOut: 9850,
    net: -1650
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cashbook</h1>
          <p className="text-muted-foreground">Track your cash transactions</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
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
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Totals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total In
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">+{totals.totalIn.toLocaleString()} ETB</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Out
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">-{totals.totalOut.toLocaleString()} ETB</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Net
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              totals.net >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {totals.net >= 0 ? '+' : ''}{totals.net.toLocaleString()} ETB
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>Cashbook Entries</CardTitle>
            <CardDescription>
              {cashbookEntries.length} transactions found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b text-sm font-medium text-foreground">
                <div className="col-span-2">Date</div>
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-1">Balance</div>
              </div>
              {cashbookEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/30 transition-colors"
                >
                  <div className="col-span-2 text-foreground">
                    {entry.date}
                  </div>
                  <div className="col-span-5 font-medium text-foreground">
                    {entry.description}
                  </div>
                  <div className="col-span-2">
                    <Badge variant={entry.type === 'in' ? 'default' : 'destructive'}>
                      {entry.type === 'in' ? 'In' : 'Out'}
                    </Badge>
                  </div>
                  <div className={`col-span-2 font-medium ${
                    entry.type === 'in' ? 'text-success' : 'text-destructive'
                  }`}>
                    {entry.type === 'in' ? '+' : '-'}{entry.amount.toLocaleString()} ETB
                  </div>
                  <div className="col-span-1 text-foreground">
                    {entry.balance.toLocaleString()} ETB
                  </div>
                </div>
              ))}
              {cashbookEntries.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                  <p className="mb-4">Try adjusting your date range or search to find what you're looking for.</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {cashbookEntries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{entry.date}</CardTitle>
                <Badge variant={entry.type === 'in' ? 'default' : 'destructive'}>
                  {entry.type === 'in' ? 'In' : 'Out'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-medium text-foreground">
                  {entry.description}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className={`font-medium ${
                    entry.type === 'in' ? 'text-success' : 'text-destructive'
                  }`}>
                    {entry.type === 'in' ? '+' : '-'}{entry.amount.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-medium text-foreground">
                    {entry.balance.toLocaleString()} ETB
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {cashbookEntries.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No transactions found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your date range or search to find what you're looking for.
              </p>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}