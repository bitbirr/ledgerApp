// src/pages/Dashboard.tsx

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db, type Account } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { AddCustomerModal } from '@/components/modals/AddCustomerModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, TrendingUp, TrendingDown, Users, Activity } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

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

  // Batch fetch balances once (fast + avoids N requests/work)
  const accountIds = useMemo(() => (accountsData ?? []).map((a) => a.id), [accountsData]);
  const { data: balances, isLoading: balancesLoading } = useQuery<Record<string, number>>({
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
  const isLoading = accountsLoading || summaryLoading || balancesLoading;

  const handleAccountClick = (accountId: string) => {
    startTransition(() => {
      setSelectedAccountId(accountId);
      setCurrentScreen('customer-detail');
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Financial Summary Cards */}
      <div className="grid-responsive mb-6">
        <SummaryCard
          title="Total Advance"
          amount={summaryData.totalAdvance}
          icon={TrendingUp}
          variant="profit"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Total Due"
          amount={summaryData.totalDue}
          icon={TrendingDown}
          variant="loss"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Net Balance"
          amount={summaryData.netBalance}
          icon={Activity}
          variant={summaryData.netBalance >= 0 ? 'profit' : 'loss'}
          isLoading={isLoading}
        />
      </div>

      {/* Customers Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h2 className="heading-financial">Customers</h2>
            <span className="caption-financial bg-muted px-2 py-1 rounded-full">
              {sortedAccounts.length}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddCustomer(true)}
            className="desktop-only"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* Customer Cards */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="financial-card p-4">
                <div className="flex items-center space-x-3">
                  <div className="skeleton w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-3 w-24" />
                  </div>
                  <div className="skeleton h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedAccounts.length === 0 ? (
          <EmptyState onAddCustomer={() => setShowAddCustomer(true)} />
        ) : (
          <div className="space-y-3">
            {sortedAccounts.map((account: Account) => (
              <AccountCard
                key={account.id}
                account={account}
                balance={balances?.[account.id] ?? 0}
                onClick={() => handleAccountClick(account.id)}
              />
            ))}
          </div>
        )}
      </div>

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
        <div className={cn(
          "p-2 rounded-lg",
          variant === 'profit' ? "bg-profit/10" : "bg-loss/10"
        )}>
          <Icon className={cn(
            "h-4 w-4",
            variant === 'profit' ? "text-profit" : "text-loss"
          )} />
        </div>
      </div>
      <div className="space-y-1">
        <p className="caption-financial">{title}</p>
        {isLoading ? (
          <div className="skeleton h-8 w-24" />
        ) : (
          <p className={cn(
            "amount-large",
            variant === 'profit' ? "text-profit" : "text-loss"
          )}>
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
          <div
            className={cn("amount-medium", balanceColor)}
            data-testid={`text-account-balance-${account.id}`}
          >
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
      <Button
        onClick={onAddCustomer}
        data-testid="button-add-first-customer"
        className="touch-target"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Customer
      </Button>
    </Card>
  );
}
