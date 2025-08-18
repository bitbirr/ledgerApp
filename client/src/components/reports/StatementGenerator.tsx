import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton, TableEmpty } from '@/components/ui/loading';
import { FileText, Download, RefreshCw, Calendar } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
interface StatementItem {
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface StatementData {
  items: StatementItem[];
  openingBalance: number;
  closingBalance: number;
  startDate: string;
  endDate: string;
  accountName: string;
  accountCode: string;
}

export function StatementGenerator() {
  const { toast } = useToast();
  const [accountId, setAccountId] = useState('');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [statementType, setStatementType] = useState('customer'); // customer, supplier, account
  // Mock accounts data - in a real implementation, this would come from an API
  const accounts = [
    { id: '1', name: 'ABC Corporation', code: 'CUST-001', type: 'customer' },
    { id: '2', name: 'XYZ Ltd', code: 'CUST-002', type: 'customer' },
    { id: '3', name: 'Tech Solutions', code: 'SUPP-001', type: 'supplier' },
    { id: '4', name: 'Global Trading', code: 'SUPP-002', type: 'supplier' },
  ];

  const { data: statement, isLoading, refetch } = useQuery({
    queryKey: ['statement', accountId, startDate, endDate],
    queryFn: async () => {
      // Mock data - in a real implementation, this would call an API
      const mockData: StatementData = {
        items: [
          { date: '2023-06-01', description: 'Invoice #INV-001', debit: 5000, credit: 0, balance: 5000 },
          { date: '2023-06-05', description: 'Payment received', debit: 0, credit: 2000, balance: 3000 },
          { date: '2023-06-10', description: 'Invoice #INV-002', debit: 7500, credit: 0, balance: 10500 },
          { date: '2023-06-15', description: 'Payment received', debit: 0, credit: 5000, balance: 5500 },
          { date: '2023-06-20', description: 'Invoice #INV-003', debit: 3000, credit: 0, balance: 8500 },
        ],
        openingBalance: 0,
        closingBalance: 8500,
        startDate,
        endDate,
        accountName: accounts.find(a => a.id === accountId)?.name || 'Unknown Account',
        accountCode: accounts.find(a => a.id === accountId)?.code || 'Unknown',
      };
      return mockData;
    },
    enabled: !!accountId,
  });

  const exportToCSV = () => {
    if (!statement) return;

    const rows: (string | number)[][] = [
      ['Date', 'Description', 'Debit', 'Credit', 'Balance'],
      ...statement.items.map((item) => [
        item.date,
        item.description,
        item.debit,
        item.credit,
        item.balance,
      ]),
      ['', '', 'Opening Balance', '', statement.openingBalance],
      ['', '', 'Closing Balance', '', statement.closingBalance],
    ];

    const csv = rows
      .map((r) =>
        r
          .map((v) => {
            const s = String(v ?? '');
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(','),
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statement-${statement.accountCode}-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Show success message
    toast({
      title: 'Export Successful',
      description: 'Statement exported to CSV successfully',
    });
  };
  const exportToPDF = () => {
    // TODO: Implement PDF export
    toast({
      title: 'PDF Export',
      description: 'PDF export feature coming soon!',
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Account Statement Generator
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={async () => {
                await refetch();
                toast({
                  title: 'Refresh Successful',
                  description: 'Statement data refreshed successfully',
                });
              }}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportToCSV} variant="outline" size="sm" disabled={!statement}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={exportToPDF} variant="outline" size="sm" disabled={!statement}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="statementType">Statement Type</Label>
            <Select value={statementType} onValueChange={setStatementType}>
              <SelectTrigger>
                <SelectValue placeholder="Select statement type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer Statement</SelectItem>
                <SelectItem value="supplier">Supplier Statement</SelectItem>
                <SelectItem value="account">General Account</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="account">Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts
                  .filter(account => 
                    statementType === 'customer' && account.type === 'customer' ||
                    statementType === 'supplier' && account.type === 'supplier' ||
                    statementType === 'account'
                  )
                  .map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Statement / States */}
        {isLoading ? (
          <TableSkeleton rows={10} cols={5} />
        ) : statement ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{statement.accountName} Statement</h3>
                <p className="text-sm text-muted-foreground">
                  Period: {new Date(statement.startDate).toLocaleDateString()} to {new Date(statement.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm">Opening Balance: {formatCurrency(statement.openingBalance)}</p>
                <p className="text-lg font-semibold">Closing Balance: {formatCurrency(statement.closingBalance)}</p>
              </div>
            </div>

            <Table className="table-enhanced table-financial">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Debit</TableHead>
                  <TableHead>Credit</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statement.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell
                      className={cn(
                        'amount-cell',
                        item.debit > 0 ? 'amount-positive' : 'amount-neutral',
                      )}
                    >
                      {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'amount-cell',
                        item.credit > 0 ? 'amount-negative' : 'amount-neutral',
                      )}
                    >
                      {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                    </TableCell>
                    <TableCell className="amount-cell font-medium">
                      {formatCurrency(item.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : accountId ? (
          <TableEmpty
            icon={FileText}
            title="No statement data"
            description="No transactions found for the selected account and date range"
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">Select an account to generate statement</h3>
            <p className="text-sm">
              Choose an account and date range to view and export the account statement
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}