// src/pages/Dashboard.tsx

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db, type Account } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { AddCustomerModal } from '@/components/modals/AddCustomerModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, TrendingUp, Users } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { DashboardSkeleton, LoadingSpinner } from '@/components/ui/loading';

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

  // Fetch accounts via facade (REST/Dexie-backed)
  const { data: accountsData, isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const all = await db.accounts.toArray();
      return all.filter((a: Account) => a.archived !== true);
    },
  });

  // Fetch summary (can return either shape; normalize below)
  const { data: rawSummary, isLoading: summaryLoading } = useQuery<any>({
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

  // Batch fetch balances once (fast + avoids N requests)
  const accountIds = useMemo(() => (accountsData ?? []).map((a) => a.id), [accountsData]);
  const { data: balances, isLoading: balancesLoading } = useQuery<Record<string, number>>({
    queryKey: ['account-balances', accountIds],
    enabled: accountIds.length > 0,
    staleTime: 30_000,
    queryFn: async () => {
      if ('getAccountBalancesMap' in db && typeof (db as any).getAccountBalancesMap === 'function') {
        return (db as any).getAccountBalancesMap(accountIds) as Promise<Record<string, number>>;
      }
      const vals = await Promise.all(accountIds.map((id) => db.getAccountBalance(id)));
      return Object.fromEntries(accountIds.map((id, i) => [id, vals[i] ?? 0]));
    },
  });

  const sortedAccounts = sortAccounts(accounts);
  const isLoading = accountsLoading || summaryLoading || balancesLoading;

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="container-responsive py-6">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="container-responsive py-6">
      {/* Summary Cards */}
      <div className="grid-responsive gap-4 mb-6">
        <Card className="financial-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Advance</CardTitle>
              <TrendingUp className="h-4 w-4 text-profit" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-profit">
              {formatCurrency(summaryData.totalAdvance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Money given</p>
          </CardContent>
        </Card>

        {/* You can add more summary cards here similarly */}
      </div>

      {/* Customers List */}
      <Card className="financial-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customers
              {isPending && <LoadingSpinner size="sm" />}
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowAddCustomer(true)}
              className="btn-primary"
              disabled={isPending}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sortedAccounts.length === 0 ? (
            <EmptyState onAddCustomer={() => setShowAddCustomer(true)} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sortedAccounts.map((a) => (
                <AccountCard
                  key={a.id}
                  account={a}
                  balance={balances?.[a.id] ?? 0}
                  onClick={() => {
                    startTransition(() => {
                      setSelectedAccountId(a.id);
                      setCurrentScreen('account-detail');
                    });
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile FAB */}
      <Button
        className="mobile-only fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg z-10"
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

function SummaryCard({
  title,
  amount,
  icon: Icon,
  variant,
  isLoading,
}: {
  title: string;
  amount: number;
  icon: any;
  variant: 'profit' | 'loss';
  isLoading: boolean;
}) {
  return (
    <Card className="financial-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div
          className={cn(
            'p-2 rounded-lg',
            variant === 'profit' ? 'bg-profit/10' : 'bg-loss/10'
          )}
        >
          <Icon
            className={cn('h-4 w-4', variant === 'profit' ? 'text-profit' : 'text-loss')}
          />
        </div>
      </div>
      <div className="space-y-1">
        <p className="caption-financial">{title}</p>
        {isLoading ? (
          <div className="skeleton h-8 w-24" />
        ) : (
          <p
            className={cn(
              'amount-large',
              variant === 'profit' ? 'text-profit' : 'text-loss'
            )}
          >
            {formatCurrency(amount)}
          </p>
        )}
      </div>
    </Card>
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
  const balanceColor = isAdvance ? 'text-profit' : 'text-loss';
  const balanceLabel = isAdvance ? 'Advance' : 'Due';

  return (
    <Card
      className="financial-card p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
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
          <div className="min-w-0 flex-1">
            <div
              className="body-financial font-semibold truncate"
              data-testid={`text-account-name-${account.id}`}
            >
              {account.name}
            </div>
            {account.phone && (
              <div
                className="caption-financial truncate"
                data-testid={`text-account-phone-${account.id}`}
              >
                {account.phone}
              </div>
            )}
            <div className="caption-financial">
              Last: 2 days ago {/* TODO: derive from last transaction */}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={cn('amount-medium', balanceColor)} data-testid={`text-account-balance-${account.id}`}>
            {formatCurrency(Math.abs(balance))}
          </div>
          <div className="caption-financial">{balanceLabel}</div>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ onAddCustomer }: { onAddCustomer: () => void }) {
  return (
    <Card className="financial-card p-8 text-center">
      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="subheading-financial mb-2">No customers yet</h3>
      <p className="body-financial text-muted-foreground mb-4">
        Add your first customer to start managing accounts and transactions.
      </p>
      <Button onClick={onAddCustomer} data-testid="button-add-first-customer" className="touch-target">
        <Plus className="h-4 w-4 mr-2" />
        Add Customer
      </Button>
    </Card>
  );
}
