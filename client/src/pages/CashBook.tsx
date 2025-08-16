import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { AppBar } from '@/components/layout/AppBar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { CashEntryModal } from '@/components/modals/CashEntryModal';
import { ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { CashbookEntry } from '@shared/schema';

export function CashBook() {
  const { setCurrentScreen, timePeriod, setTimePeriod } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashModalType, setCashModalType] = useState<'in' | 'out'>('in');

  const { data: cashEntries } = useQuery<CashbookEntry[]>({
    queryKey: ['cashbook', timePeriod, currentDate],
    queryFn: async () => {
      // TODO: Apply date filtering based on timePeriod and currentDate
      const list = await db.cashbook.orderBy('dateTime').toArray();
      // Sort newest first
      return list.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    },
  });

  const summary = useMemo(() => {
    const entries = cashEntries || [];
    const totalIn = entries
      .filter(e => e.direction === 'in')
      .reduce((s, e) => s + Number(e.amount), 0);
    const totalOut = entries
      .filter(e => e.direction === 'out')
      .reduce((s, e) => s + Number(e.amount), 0);
    return {
      totalIn,
      totalOut,
      balance: totalIn - totalOut,
    };
  }, [cashEntries]);

  // Remove the local formatCurrency function and use the imported one
  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat('en-IN', {
  //     style: 'currency',
  //     currency: 'INR',
  //   }).format(amount);
  // };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatCurrentDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (timePeriod) {
      case 'daily':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const postCashWithJournal = async (
    direction: 'in' | 'out',
    amount: number,
    note: string,
    attachmentUrl: string | undefined,
    cashAccountId: string,
    offsetAccountId: string,
    partyId?: string
  ) => {
    try {
      const response = await fetch('/api/post/cashbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': 'default-user',
          'business-id': 'default-business',
        },
        body: JSON.stringify({
          dateTime: new Date().toISOString(),
          direction,
          amount,
          note,
          attachmentUrl,
          cashAccountId,
          offsetAccountId,
          partyId,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to post cash entry');
      }

      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      queryClient.invalidateQueries({ queryKey: ['cashbook-summary'] });
      toast({
        title: 'Success',
        description: `Cash ${direction} entry posted`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to post cash ${direction} entry`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // removed handleCashOut in favor of unified postCashWithJournal

  const onCashInClick = () => {
    setCashModalType('in');
    setShowCashModal(true);
  };
  
  const onCashOutClick = () => {
    setCashModalType('out');
    setShowCashModal(true);
  };

  const handleCashModalSubmit = async (
    amount: number,
    note: string,
    attachmentUrl: string | undefined,
    cashAccountId: string,
    offsetAccountId: string,
    partyId?: string
  ) => {
    await postCashWithJournal(cashModalType, amount, note, attachmentUrl, cashAccountId, offsetAccountId, partyId);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppBar 
        title="Cash Book"
        showBack={true}
        showMore={true}
        onBack={() => setCurrentScreen('dashboard')}
      />

      {/* Time Period Tabs */}
      <div className="bg-background border-b sticky top-14 z-20">
        <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as any)}>
          <TabsList className="w-full h-auto p-0 bg-transparent">
            <TabsTrigger value="all" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              All
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="yearly" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Yearly
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Date Navigation */}
        {timePeriod !== 'all' && (
          <div className="flex items-center justify-between px-4 py-2 bg-muted">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('prev')}
              data-testid="button-prev-date"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-sm" data-testid="text-current-date">
              {timePeriod === 'daily' ? formatCurrentDate(currentDate) : 
               timePeriod === 'weekly' ? `Week of ${formatCurrentDate(currentDate)}` :
               timePeriod === 'monthly' ? currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) :
               currentDate.getFullYear()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('next')}
              data-testid="button-next-date"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <main className="pb-32">
        {/* Cash Book Table */}
        <div className="bg-background">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 px-4 py-3 border-b bg-muted text-sm font-medium">
            <div>Date</div>
            <div>Notes</div>
            <div className="text-red-600">Cash Out</div>
            <div className="text-green-600">Cash In</div>
          </div>

          {/* Cash Entries */}
          {cashEntries && cashEntries.length > 0 ? (
            cashEntries.map((entry) => (
              <div 
                key={entry.id} 
                className="grid grid-cols-4 gap-4 px-4 py-3 border-b text-sm"
                data-testid={`row-cashbook-${entry.id}`}
              >
                <div>{formatDate(entry.dateTime)}</div>
                <div className="truncate">{entry.note || '-'}</div>
                <div className="text-red-600 font-medium">
                  {entry.direction === 'out' ? formatCurrency(entry.amount) : '-'}
                </div>
                <div className="text-green-600 font-medium">
                  {entry.direction === 'in' ? formatCurrency(entry.amount) : '-'}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground">
              No cash entries found. Add your first cash transaction below.
            </div>
          )}
        </div>

        {/* Summary Section */}
        <Card className="m-4 p-4 border-t">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Cash In</div>
              <div className="text-lg font-bold text-green-600" data-testid="text-total-cash-in">
                {formatCurrency(summary?.totalIn || 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Cash Out</div>
              <div className="text-lg font-bold text-red-600" data-testid="text-total-cash-out">
                {formatCurrency(summary?.totalOut || 0)}
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Cash Balance</div>
            <div className="text-xl font-bold text-primary" data-testid="text-cash-balance">
              {formatCurrency(summary?.balance || 0)}
            </div>
          </div>
        </Card>
      </main>

      {/* Cash Entry Buttons */}
      <div className="fixed bottom-4 left-4 right-4 flex space-x-3 z-30">
        <Button
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center shadow-lg"
          onClick={onCashInClick}
          data-testid="button-cash-in"
        >
          <Plus className="mr-2 h-5 w-5" />
          Cash In
        </Button>
        <Button
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center shadow-lg"
          onClick={onCashOutClick}
          data-testid="button-cash-out"
        >
          <Minus className="mr-2 h-5 w-5" />
          Cash Out
        </Button>
      </div>

      {/* Cash Entry Modal */}
      <CashEntryModal
        open={showCashModal}
        onClose={() => setShowCashModal(false)}
        type={cashModalType}
        onSubmit={handleCashModalSubmit}
      />
    </div>
  );
}
