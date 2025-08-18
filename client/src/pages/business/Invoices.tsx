import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Filter, 
  Receipt,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/auth-store';

export function Invoices() {
  const { role } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock invoice data
  const invoices = [
    { id: 1, number: 'INV-2023-001', customer: 'ABC Corporation', date: '2023-06-15', dueDate: '2023-07-15', amount: 15000, status: 'paid' },
    { id: 2, number: 'INV-2023-002', customer: 'XYZ Ltd', date: '2023-06-10', dueDate: '2023-07-10', amount: 7500, status: 'sent' },
    { id: 3, number: 'INV-2023-003', customer: 'Tech Solutions', date: '2023-06-05', dueDate: '2023-07-05', amount: 32000, status: 'overdue' },
    { id: 4, number: 'INV-2023-004', customer: 'Global Trading', date: '2023-06-01', dueDate: '2023-07-01', amount: 8500, status: 'draft' },
    { id: 5, number: 'INV-2023-005', customer: 'Office Supplies', date: '2023-05-28', dueDate: '2023-06-28', amount: 12000, status: 'paid' },
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          invoice.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle;
      case 'sent': return Clock;
      case 'overdue': return XCircle;
      case 'draft': return Receipt;
      default: return Receipt;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'sent': return 'secondary';
      case 'overdue': return 'destructive';
      case 'draft': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Manage your invoices and payments</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={statusFilter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button 
                variant={statusFilter === 'paid' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('paid')}
              >
                Paid
              </Button>
              <Button 
                variant={statusFilter === 'sent' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('sent')}
              >
                Sent
              </Button>
              <Button 
                variant={statusFilter === 'overdue' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('overdue')}
              >
                Overdue
              </Button>
              <Button 
                variant={statusFilter === 'draft' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('draft')}
              >
                Draft
              </Button>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>Invoice List</CardTitle>
            <CardDescription>
              {filteredInvoices.length} invoices found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b text-sm font-medium text-foreground">
                <div className="col-span-2">Invoice #</div>
                <div className="col-span-3">Customer</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-1">Status</div>
              </div>
              {filteredInvoices.map((invoice) => {
                const StatusIcon = getStatusIcon(invoice.status);
                return (
                  <div 
                    key={invoice.id} 
                    className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/30 transition-colors"
                  >
                    <div className="col-span-2 font-medium text-foreground">
                      {invoice.number}
                    </div>
                    <div className="col-span-3 text-foreground">
                      {invoice.customer}
                    </div>
                    <div className="col-span-2 text-muted-foreground">
                      {invoice.date}
                    </div>
                    <div className="col-span-2 text-muted-foreground">
                      {invoice.dueDate}
                    </div>
                    <div className="col-span-2 font-medium text-foreground">
                      {invoice.amount.toLocaleString()} ETB
                    </div>
                    <div className="col-span-1">
                      <Badge variant={getStatusVariant(invoice.status)} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {filteredInvoices.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No invoices found</h3>
                  <p className="mb-4">Try adjusting your search or filter to find what you're looking for.</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredInvoices.map((invoice) => {
          const StatusIcon = getStatusIcon(invoice.status);
          return (
            <Card key={invoice.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{invoice.number}</CardTitle>
                  <Badge variant={getStatusVariant(invoice.status)} className="flex items-center gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="font-medium text-foreground">{invoice.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span>{invoice.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date</span>
                    <span>{invoice.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium text-foreground">
                      {invoice.amount.toLocaleString()} ETB
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredInvoices.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No invoices found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}