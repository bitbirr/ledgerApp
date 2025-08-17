import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppBar } from '@/components/layout/AppBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Trees,
  Plus,
  Edit,
  Trash2,
  Lock,
  ChevronRight,
  ChevronDown,
  Building2
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import type { GLAccount } from '@shared/schema';

/* =========================
   Schema & Types
========================= */

const accountFormSchema = z.object({
  code: z.string().min(1, 'Account code is required'),
  name: z.string().min(1, 'Account name is required'),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  parentId: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true)
});

type AccountFormData = z.infer<typeof accountFormSchema>;

/* =========================
   Component
========================= */

export function ChartOfAccounts() {
  const { setCurrentScreen } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<GLAccount | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      code: '',
      name: '',
      type: 'asset',
      parentId: '',
      description: '',
      isActive: true
    }
  });

  /* ====== Queries ====== */

  const { data: glAccounts, isLoading } = useQuery({
    queryKey: ['gl-accounts'],
    queryFn: async () => {
      const response = await fetch('/api/gl-accounts', {
        headers: {
          'business-id': 'default-business',
          'user-id': 'default-user'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch accounts');
      return (await response.json()) as GLAccount[];
    }
  });

  /* ====== Mutations ====== */

  const createAccountMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      const response = await fetch('/api/gl-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'business-id': 'default-business',
          'user-id': 'default-user'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create account');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gl-accounts'] });
      setShowAddAccount(false);
      form.reset();
      toast({ title: 'Account created successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating account',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string;
      data: Partial<AccountFormData>;
    }) => {
      const response = await fetch(`/api/gl-accounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'business-id': 'default-business',
          'user-id': 'default-user'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update account');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gl-accounts'] });
      setEditingAccount(null);
      form.reset();
      toast({ title: 'Account updated successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating account',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/gl-accounts/${id}`, {
        method: 'DELETE',
        headers: {
          'business-id': 'default-business',
          'user-id': 'default-user'
        }
      });
      if (!response.ok) throw new Error('Failed to delete account');
      // Support 204 No Content
      try {
        return await response.json();
      } catch {
        return null;
      }
    },
    onSuccess: () => {
      // ✅ Correct usage for TanStack Query v4
      queryClient.invalidateQueries({ queryKey: ['gl-accounts'] });
      toast({ title: 'Account deleted successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting account',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  /* ====== Helpers ====== */

  const buildAccountTree = (accounts: GLAccount[]) => {
    const rootAccounts: GLAccount[] = [];
    const childrenMap = new Map<string, GLAccount[]>();

    accounts.forEach((account) => {
      if (!account.parentId) {
        rootAccounts.push(account);
      } else {
        if (!childrenMap.has(account.parentId)) {
          childrenMap.set(account.parentId, []);
        }
        childrenMap.get(account.parentId)!.push(account);
      }
    });

    return { rootAccounts, childrenMap };
  };

  const toggleNode = (nodeId: string) => {
    const next = new Set(expandedNodes);
    if (next.has(nodeId)) next.delete(nodeId);
    else next.add(nodeId);
    setExpandedNodes(next);
  };

  const renderAccountNode = (
    account: GLAccount,
    level: number,
    childrenMap: Map<string, GLAccount[]>
  ) => {
    const children = childrenMap.get(account.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(account.id);
    const isSystemAccount = account.systemFlag;

    return (
      <Fragment key={account.id}>
        <TableRow className={level > 0 ? 'bg-muted/30' : ''}>
          <TableCell className="font-medium">
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${level * 20}px` }}
            >
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => toggleNode(account.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              ) : (
                <div className="w-4" />
              )}
              <span className="font-mono text-sm">{account.code}</span>
              {isSystemAccount && (
                <Lock className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </TableCell>

          <TableCell>{account.name}</TableCell>

          <TableCell>
            <Badge
              variant={
                account.type === 'expense'
                  ? 'destructive'
                  : account.type === 'equity'
                  ? 'outline'
                  : account.type === 'asset'
                  ? 'default'
                  : 'secondary'
              }
            >
              {account.type.toUpperCase()}
            </Badge>
          </TableCell>

          <TableCell>
            <Badge variant={account.isLeaf ? 'default' : 'secondary'}>
              {account.isLeaf ? 'Leaf' : 'Parent'}
            </Badge>
          </TableCell>

          <TableCell>
            <Badge variant={account.isActive ? 'default' : 'secondary'}>
              {account.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </TableCell>

          <TableCell>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingAccount(account);
                  form.reset({
                    code: account.code,
                    name: account.name,
                    type: account.type,
                    parentId: account.parentId || '',
                    description: account.description || '',
                    isActive: account.isActive
                  });
                }}
                disabled={isSystemAccount}
              >
                <Edit className="h-4 w-4" />
              </Button>

              {!isSystemAccount && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{account.name}"? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          deleteAccountMutation.mutate(account.id)
                        }
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </TableCell>
        </TableRow>

        {hasChildren &&
          isExpanded &&
          children.map((child) =>
            renderAccountNode(child, level + 1, childrenMap)
          )}
      </Fragment>
    );
  };

  const onSubmit = (data: AccountFormData) => {
    // Normalize empty string for parentId
    const payload: AccountFormData = {
      ...data,
      parentId: data.parentId || undefined
    };
    if (editingAccount) {
      updateAccountMutation.mutate({ id: editingAccount.id, data: payload });
    } else {
      createAccountMutation.mutate(payload);
    }
  };

  const { rootAccounts, childrenMap } = glAccounts
    ? buildAccountTree(glAccounts)
    : { rootAccounts: [], childrenMap: new Map() };

  /* ====== Render ====== */

  return (
    <div className="min-h-screen bg-background">
      <AppBar
        title="Chart of Accounts"
        showBack={true}
        onBack={() => setCurrentScreen('dashboard')}
      />

      <main className="pb-20 p-4 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trees className="h-5 w-5" />
              GL Accounts
            </CardTitle>
            <Button
              onClick={() => {
                setShowAddAccount(true);
                setEditingAccount(null);
                form.reset();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    {Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <TableHead key={i}>
                          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        {Array(6)
                          .fill(0)
                          .map((_, j) => (
                            <TableCell key={j}>
                              <div className="h-4 w-full animate-pulse rounded bg-muted" />
                            </TableCell>
                          ))}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : rootAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center gap-3">
                <Trees className="h-8 w-8 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No accounts found</h3>
                <p className="text-sm text-muted-foreground">
                  Create your first GL account to get started
                </p>
                <Button
                  onClick={() => {
                    setShowAddAccount(true);
                    setEditingAccount(null);
                    form.reset();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rootAccounts.map((account) =>
                    renderAccountNode(account, 0, childrenMap)
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Account Dialog */}
        <Dialog
          open={showAddAccount || !!editingAccount}
          onOpenChange={(open) => {
            if (!open) {
              setShowAddAccount(false);
              setEditingAccount(null);
              form.reset();
            }
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {editingAccount ? 'Edit Account' : 'Add New Account'}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cash in Hand" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      {/* RHF + shadcn Select must be controlled */}
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="asset">Asset</SelectItem>
                          <SelectItem value="liability">Liability</SelectItem>
                          <SelectItem value="equity">Equity</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Account (Optional)</FormLabel>
                      {/* Controlled Select: use value, not defaultValue */}
                      <Select
                        value={field.value ?? ''}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No Parent</SelectItem>
                          {glAccounts
                            ?.filter((acc) => !acc.isLeaf)
                            .map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.code} - {account.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Account description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Account</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Inactive accounts cannot be used for posting
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddAccount(false);
                      setEditingAccount(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createAccountMutation.isPending ||
                      updateAccountMutation.isPending
                    }
                  >
                    {editingAccount ? 'Update' : 'Create'} Account
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
