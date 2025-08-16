import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { AppBar } from '@/components/layout/AppBar';
import { QuickEntryForm } from '@/components/forms/QuickEntryForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone } from 'lucide-react';
import type { Account, Transaction } from '@shared/schema';
import { formatCurrency } from '@/lib/utils';

export function CustomerDetail() {
  const { selectedAccountId, setCurrentScreen, timePeriod, setTimePeriod } = useAppStore();
  const [account, setAccount] = useState<Account | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch the account (via adapter, no direct Dexie table)
  const { data: accountData } = useQuery<Account | null>({
    queryKey: ['account', selectedAccountId],
    enabled: !!selectedAccountId,
    queryFn: async () => {
      if (!selectedAccountId) return null;
      const all = await db.accounts.toArray(); // get all accounts
      return all.find(a => a.id === selectedAccountId) ?? null;
    },
  });

  // Fetch transactions for the account (adapter handles server fetch)
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['transactions', selectedAccountId],
    enabled: !!selectedAccountId,
    queryFn: async () => {
      if (!selectedAccountId) return [];
      const list = await db.transactions.where('accountId').equals(selectedAccountId).toArray();
      // Ensure not-deleted and sort ASC by date for proper running balance
      const filtered = list.filter(t => !t.deleted);
      filtered.sort(
        (a, b) =>
          new Date(a.dateTime as unknown as Date).getTime() -
          new Date(b.dateTime as unknown as Date).getTime()
      );
      return filtered;
    },
  });

  // Current account balance
  const { data: balance } = useQuery<number>({
    queryKey: ['account-balance', selectedAccountId],
    enabled: !!selectedAccountId,
    queryFn: async () => {
      if (!selectedAccountId) return 0;
      return db.getAccountBalance(selectedAccountId);
    },
  });

  useEffect(() => {
    if (accountData) setAccount(accountData);
  }, [accountData]);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
    }).format(d);
  };

  const calculateRunningBalance = (txns: Transaction[], index: number) => {
    let bal = 0;
    for (let i = 0; i <= index; i++) {
      const t = txns[i];
      bal += t.kind === 'credit' ? t.amount : -t.amount;
    }
    return bal;
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-background">
        <AppBar
          title="Customer not found"
          showBack
          onBack={() => setCurrentScreen('dashboard')}
        />
      </div>
    );
  }

  const rightActions = (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="p-2 hover:bg-white hover:bg-opacity-10"
        data-testid="button-call-customer"
      >
        <Phone className="h-5 w-5" />
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <AppBar
        title={account.name}
        subtitle={account.phone}
        showBack
        showMore
        onBack={() => setCurrentScreen('dashboard')}
        rightActions={rightActions}
      />

      {/* Balance Section */}
      <div className="bg-primary text-primary-foreground px-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold" data-testid="text-customer-balance">
              {formatCurrency(balance || 0)}
            </div>
            <div className="text-sm opacity-90">Current Balance</div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            data-testid="button-toggle-balance-details"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>
      </div>

      {/* Time Period Tabs */}
      <div className="bg-background border-b sticky top-14 z-20">
        <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as any)}>
          <TabsList className="w-full h-auto p-0 bg-transparent">
            <TabsTrigger
              value="all"
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="daily"
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Daily
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Weekly
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger
              value="yearly"
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Yearly
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <main className="pb-20">
        {/* Previous Balance (TODO: compute for selected period) */}
        <div className="bg-muted px-4 py-2 text-sm">
          <div className="flex justify-between">
            <span>Previous Balance</span>
            <span className="font-medium text-green-600">
              {formatCurrency(1800)}
            </span>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-background">
          <div className="grid grid-cols-4 gap-4 px-4 py-3 border-b bg-muted text-sm font-medium">
            <div>Date</div>
            <div className="text-green-600">Received</div>
            <div className="text-red-600">Paid</div>
            <div>Balance</div>
          </div>

          {transactions && transactions.length > 0 ? (
            transactions.map((txn: Transaction, index: number) => {
              const runningBalance = calculateRunningBalance(transactions, index);
              return (
                <div
                  key={txn.id}
                  className="grid grid-cols-4 gap-4 px-4 py-3 border-b text-sm"
                  data-testid={`row-transaction-${txn.id}`}
                >
                  <div>{formatDate(txn.dateTime)}</div>
                  <div className="text-green-600 font-medium">
                    {txn.kind === 'credit' ? formatCurrency(txn.amount) : '-'}
                  </div>
                  <div className="text-red-600 font-medium">
                    {txn.kind === 'debit' ? formatCurrency(txn.amount) : '-'}
                  </div>
                  <div className="font-medium">{formatCurrency(runningBalance)}</div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground">
              No transactions found. Add the first transaction below.
            </div>
          )}
        </div>

        {/* Quick Entry */}
        {selectedAccountId && (
          <div className="p-4 space-y-4">
            <QuickEntryForm accountId={selectedAccountId} type="received" />
            <QuickEntryForm accountId={selectedAccountId} type="paid" />
          </div>
        )}
      </main>
    </div>
  );
}
