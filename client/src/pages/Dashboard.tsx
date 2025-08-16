// src/pages/Dashboard.tsx

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db, type Account } from '@/lib/db'; // ← use UI facade types, not @shared/schema
import { useAppStore } from '@/lib/store';
import { AppBar } from '@/components/layout/AppBar';
import { BottomActionBar } from '@/components/layout/BottomActionBar';
import { AddCustomerModal } from '@/components/modals/AddCustomerModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type NormalizedSummary = {
  totalAdvance: number;
  totalDue: number;
  netBalance: number;
};

function normalizeSummary(raw: any): NormalizedSummary {
  if (raw && typeof raw === 'object') {
    if ('totalAdvance' in raw && 'totalDue' in raw && 'netBalance' in raw) {
      return {
        totalAdvance: Number(raw.totalAdvance) || 0,
        totalDue: Number(raw.totalDue) || 0,
        netBalance: Number(raw.netBalance) || 0,
      };
    }
    if ('totalCredit' in raw && 'totalDebit' in raw) {
      const net = (Number(raw.totalCredit) || 0) - (Number(raw.totalDebit) || 0);
      return {
        totalAdvance: Math.max(net, 0),
        totalDue: Math.max(-net, 0),
        netBalance: net,
      };
    }
  }
  return { totalAdvance: 0, totalDue: 0, netBalance: 0 };
}

export function Dashboard() {
  const {
    accounts,
    setAccounts,
    setAccountSummary,
    sortAccounts,
    setSelectedAccountId,
    setCurrentScreen,
  } = useAppStore();
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Fetch accounts via facade (REST-backed)
  const { data: accountsData } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const all = await db.accounts.toArray();
      return all.filter((a: Account) => a.archived !== true);
    },
  });

  // Fetch summary (can return either shape; normalize below)
  const { data: rawSummary } = useQuery<any>({
    queryKey: ['account-summary'],
    queryFn: () => db.getAccountSummary(),
    staleTime: 30_000,
  });

  const summaryData = useMemo<NormalizedSummary>(() => normalizeSummary(rawSummary), [rawSummary]);

  // Keep store in sync
  useEffect(() => {
    if (accountsData) setAccounts(accountsData);
  }, [accountsData, setAccounts]);

  useEffect(() => {
    if (summaryData) setAccountSummary(summaryData);
  }, [summaryData, setAccountSummary]);

  // Batch fetch balances once (fast + avoids N requests/work)
  const accountIds = useMemo(() => (accountsData ?? []).map((a) => a.id), [accountsData]);
  const { data: balances } = useQuery<Record<string, number>>({
    queryKey: ['account-balances', accountIds],
    enabled: accountIds.length > 0,
    staleTime: 30_000,
    queryFn: async () => {
      // Prefer facade helper if available; otherwise fall back to Promise.all
      if ('getAccountBalancesMap' in db && typeof (db as any).getAccountBalancesMap === 'function') {
        return (db as any).getAccountBalancesMap(accountIds) as Promise<Record<string, number>>;
      }
      const vals = await Promise.all(accountIds.map((id) => db.getAccountBalance(id)));
      return Object.fromEntries(accountIds.map((id, i) => [id, vals[i]]));
    },
  });

  const sortedAccounts = sortAccounts(accounts);

  const handleAccountClick = (accountId: string) => {
    startTransition(() => {
      setSelectedAccountId(accountId);
      setCurrentScreen('customer-detail');
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppBar title="Dashboard" showSort showSearch />

      <main className="pb-20">
        {/* Summary Cards */}
        <div className="p-4 grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className="text-green-600 text-sm font-medium">Total Advance</div>
            <div className="text-lg font-bold text-green-600" data-testid="text-total-advance">
              {formatCurrency(summaryData.totalAdvance)}
            </div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-red-600 text-sm font-medium">Total Due</div>
            <div className="text-lg font-bold text-red-600" data-testid="text-total-due">
              {formatCurrency(summaryData.totalDue)}
            </div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-primary text-sm font-medium">Net Balance</div>
            <div className="text-lg font-bold text-primary" data-testid="text-net-balance">
              {formatCurrency(summaryData.netBalance)}
            </div>
          </Card>
        </div>

        {/* Account Cards */}
        <div className="px-4 space-y-3">
          {sortedAccounts.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                No customers added yet. Add your first customer to get started.
              </div>
              <Button
                className="mt-4"
                onClick={() => setShowAddCustomer(true)}
                data-testid="button-add-first-customer"
              >
                Add Customer
              </Button>
            </Card>
          ) : (
            sortedAccounts.map((account: Account) => (
              <AccountCard
                key={account.id}
                account={account}
                balance={balances?.[account.id] ?? 0}
                onClick={() => handleAccountClick(account.id)}
              />
            ))
          )}
        </div>
      </main>

      <BottomActionBar />

      {/* Add Customer FAB */}
      <Button
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg"
        onClick={() => setShowAddCustomer(true)}
        data-testid="button-add-customer-fab"
        aria-label="Add customer"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddCustomerModal open={showAddCustomer} onClose={() => setShowAddCustomer(false)} />
    </div>
  );
}

function AccountCard({
  account,
  balance,
  onClick,
}: {
  account: Account;
  balance: number;
  onClick: () => void;
}) {
  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0]!)
      .join('')
      .toUpperCase();

  const isAdvance = balance > 0;
  const balanceColor = isAdvance ? 'text-green-600' : 'text-red-600';
  const balanceLabel = isAdvance ? 'Advance' : 'Due';

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
      data-testid={`card-account-${account.id}`}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary text-primary-foreground font-medium">
              {getInitials(account.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div
              className="font-medium text-foreground"
              data-testid={`text-account-name-${account.id}`}
            >
              {account.name}
            </div>
            {account.phone && (
              <div
                className="text-sm text-muted-foreground"
                data-testid={`text-account-phone-${account.id}`}
              >
                {account.phone}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Last: 2 days ago {/* TODO: derive from last transaction */}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-lg font-bold ${balanceColor}`}
            data-testid={`text-account-balance-${account.id}`}
          >
            {formatCurrency(balance)}
          </div>
          <div className="text-xs text-muted-foreground">{balanceLabel}</div>
        </div>
      </div>
    </Card>
  );
}
