import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter, BookOpen, Search, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { GLJournalEntry, GLJournalLine, GLAccount } from '@shared/schema';

interface JournalEntryWithLines extends GLJournalEntry {
  lines: GLJournalLine[];
}

export function JournalViewer() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: glAccounts } = useQuery({
    queryKey: ['gl-accounts'],
    queryFn: async () => {
      const response = await fetch('/api/gl-accounts', {
        headers: {
          'business-id': 'default-business',
          'user-id': 'default-user'
        }
      });
      const data = (await response.json()) as GLAccount[];
      return data;
      /* return response.json() as GLAccount[];*/
    }
  });

  const { data: journalEntries, isLoading } = useQuery({
    queryKey: ['journal-entries', dateFrom, dateTo, accountFilter, sourceFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (accountFilter) params.append('accountId', accountFilter);
      if (sourceFilter) params.append('sourceModule', sourceFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/journal-entries?${params}`, {
        headers: {
          'business-id': 'default-business',
          'user-id': 'default-user'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch journal entries');
      const data = (await response.json()) as JournalEntryWithLines[];
      return data;
      /* return response.json() as JournalEntryWithLines[];*/
    }
  });

  const getAccountName = (accountId: string) => {
    const account = glAccounts?.find(acc => acc.id === accountId);
    return account ? `${account.code} - ${account.name}` : accountId;
  };

  const exportToCSV = () => {
    if (!journalEntries) return;
    
    const csvData = journalEntries.flatMap(entry => 
      entry.lines.map(line => ({
        'Entry Date': entry.entryDate,
        'Entry ID': entry.id,
        'Source': entry.sourceModule,
        'Memo': entry.memo || '',
        'Account': getAccountName(line.accountId),
        'Debit': line.debit || 0,
        'Credit': line.credit || 0,
        'Notes': line.notes || ''
      }))
    );
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-entries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Journal Entries
          </div>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="dateFrom">From Date</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateTo">To Date</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account">Account</Label>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All accounts</SelectItem>
                {glAccounts?.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All sources</SelectItem>
                <SelectItem value="cashbook">Cashbook</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="opening_balance">Opening Balance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search memo or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Journal Entries Table */}
        {isLoading ? (
          <div className="text-center py-8">Loading journal entries...</div>
        ) : (
          <div className="space-y-4">
            {journalEntries?.map(entry => (
              <Card key={entry.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-semibold">Entry #{entry.id.slice(-8)}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(entry.entryDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {entry.sourceModule.toUpperCase()}
                      </Badge>
                      {entry.locked && (
                        <Badge variant="secondary">Locked</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Posted by: {entry.postedBy}
                    </div>
                  </div>
                  {entry.memo && (
                    <div className="text-sm text-muted-foreground mt-2">
                      {entry.memo}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entry.lines.map(line => (
                        <TableRow key={line.id}>
                          <TableCell className="font-medium">
                            {getAccountName(line.accountId)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {line.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-2 pt-2 border-t flex justify-end">
                    <div className="text-sm font-medium">
                      Total: {formatCurrency(entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {journalEntries?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No journal entries found matching your criteria.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}