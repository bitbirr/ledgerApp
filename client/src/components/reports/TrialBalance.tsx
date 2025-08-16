import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Scale, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface TrialBalanceItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debitBalance: number;
  creditBalance: number;
}

interface TrialBalanceData {
  items: TrialBalanceItem[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  asOfDate: string;
}

export function TrialBalance() {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: trialBalance, isLoading, refetch } = useQuery({
    queryKey: ['trial-balance', asOfDate],
    queryFn: async () => {
      const response = await fetch(`/api/reports/trial-balance?asOfDate=${asOfDate}`, {
        headers: {
          'business-id': 'default-business',
          'user-id': 'default-user'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch trial balance');
      const data = (await response.json()) as TrialBalanceData;
      return data;
      /* return response.json() as TrialBalanceData;*/
    }
  });

  const exportToPDF = () => {
    // TODO: Implement PDF export
    console.log('Export to PDF');
  };

  const exportToCSV = () => {
    if (!trialBalance) return;
    
    const csvData = [
      ['Account Code', 'Account Name', 'Account Type', 'Debit Balance', 'Credit Balance'],
      ...trialBalance.items.map(item => [
        item.accountCode,
        item.accountName,
        item.accountType,
        item.debitBalance.toString(),
        item.creditBalance.toString()
      ]),
      ['', '', 'TOTALS', trialBalance.totalDebits.toString(), trialBalance.totalCredits.toString()]
    ];
    
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-balance-${asOfDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Trial Balance
            {trialBalance && (
              <Badge variant={trialBalance.isBalanced ? 'default' : 'destructive'}>
                {trialBalance.isBalanced ? 'Balanced' : 'Unbalanced'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Filter */}
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <Label htmlFor="asOfDate">As of Date</Label>
            <Input
              id="asOfDate"
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-40"
            />
          </div>
        </div>

        {/* Trial Balance Table */}
        {isLoading ? (
          <TableSkeleton rows={10} cols={5} />
        ) : trialBalance ? (
          <div className="space-y-4">
            {!trialBalance.isBalanced && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">
                  Trial Balance is not balanced! Total debits ({formatCurrency(trialBalance.totalDebits)}) 
                  do not equal total credits ({formatCurrency(trialBalance.totalCredits)}).
                </span>
              </div>
            )}
            
            <Table financial responsive>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Debit Balance</TableHead>
                  <TableHead>Credit Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trialBalance.items.map(item => (
                  <TableRow key={item.accountId}>
                    <TableCell className="font-mono">{item.accountCode}</TableCell>
                    <TableCell className="font-medium">{item.accountName}</TableCell>
                    <TableCell>
                      <Badge variant={item.accountType === 'asset' ? 'default' : 
                                     item.accountType === 'liability' ? 'secondary' :
                                     item.accountType === 'equity' ? 'outline' :
                                     item.accountType === 'revenue' ? 'default' : 'destructive'}>
                        {item.accountType.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell amount positive={item.debitBalance > 0}>
                      {item.debitBalance > 0 ? formatCurrency(item.debitBalance) : '-'}
                    </TableCell>
                    <TableCell amount positive={item.creditBalance > 0}>
                      {item.creditBalance > 0 ? formatCurrency(item.creditBalance) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Totals Row */}
                <TableRow className="font-semibold bg-muted/30">
                  <TableCell colSpan={3}>TOTALS</TableCell>
                  <TableCell amount className="font-bold">
                    {formatCurrency(trialBalance.totalDebits)}
                  </TableCell>
                  <TableCell amount className="font-bold">
                    {formatCurrency(trialBalance.totalCredits)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : (
          <TableEmpty 
            icon={Scale}
            title="No trial balance data"
            description="No account balances found for the selected date"
          />
        )}
      </CardContent>
    </Card>
  );
}