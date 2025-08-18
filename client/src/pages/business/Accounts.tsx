import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Filter, 
  Users, 
  Building,
  MoreHorizontal
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/auth-store';

export function Accounts() {
  const { role } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock account data
  const accounts = [
    { id: 1, name: 'ABC Corporation', type: 'customer', balance: 15000, phone: '+251 911 123 456', lastTransaction: '2023-06-15' },
    { id: 2, name: 'XYZ Suppliers', type: 'supplier', balance: -7500, phone: '+251 911 654 321', lastTransaction: '2023-06-14' },
    { id: 3, name: 'Tech Solutions Ltd', type: 'customer', balance: 32000, phone: '+251 911 456 789', lastTransaction: '2023-06-12' },
    { id: 4, name: 'Office Supplies Inc', type: 'supplier', balance: -12000, phone: '+251 911 321 654', lastTransaction: '2023-06-10' },
    { id: 5, name: 'Global Trading', type: 'customer', balance: 8500, phone: '+251 911 789 123', lastTransaction: '2023-06-08' },
  ];

  const filteredAccounts = accounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Accounts</h1>
          <p className="text-muted-foreground">Manage your customer and supplier accounts</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
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

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>Account List</CardTitle>
            <CardDescription>
              {filteredAccounts.length} accounts found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b text-sm font-medium text-foreground">
                <div className="col-span-3">Name</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Phone</div>
                <div className="col-span-2">Balance</div>
                <div className="col-span-2">Last Transaction</div>
                <div className="col-span-1">Actions</div>
              </div>
              {filteredAccounts.map((account) => (
                <div 
                  key={account.id} 
                  className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/30 transition-colors"
                >
                  <div className="col-span-3 font-medium text-foreground">
                    {account.name}
                  </div>
                  <div className="col-span-2">
                    <Badge variant={account.type === 'customer' ? 'default' : 'secondary'}>
                      {account.type}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-muted-foreground">
                    {account.phone}
                  </div>
                  <div className={`col-span-2 font-medium ${
                    account.balance >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {account.balance >= 0 ? '+' : ''}{account.balance.toLocaleString()} ETB
                  </div>
                  <div className="col-span-2 text-muted-foreground">
                    {account.lastTransaction}
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredAccounts.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No accounts found</h3>
                  <p className="mb-4">Try adjusting your search or filter to find what you're looking for.</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Account
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredAccounts.map((account) => (
          <Card key={account.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{account.name}</CardTitle>
                <Badge variant={account.type === 'customer' ? 'default' : 'secondary'}>
                  {account.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span>{account.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance</span>
                  <span className={`font-medium ${
                    account.balance >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {account.balance >= 0 ? '+' : ''}{account.balance.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Transaction</span>
                  <span>{account.lastTransaction}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredAccounts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No accounts found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}