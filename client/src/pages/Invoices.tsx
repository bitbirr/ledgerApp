import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { AppBar } from '@/components/layout/AppBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function Invoices() {
  const { setCurrentScreen } = useAppStore();
  const [invoiceType, setInvoiceType] = useState<'sale' | 'purchase'>('sale');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>('');
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      return await db.accounts.where('archived').equals(false).toArray();
    },
  });

  const { data: items } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      return await db.items.toArray();
    },
  });

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + additionalCharges - discount;
  };

  // Remove the local formatCurrency function and use the imported one
  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat('en-IN', {
  //     style: 'currency',
  //     currency: 'INR',
  //   }).format(amount);
  // };

  const handleAddItem = () => {
    // TODO: Show add item modal
    console.log('Add item to invoice');
  };

  const handleSaveInvoice = () => {
    // TODO: Save invoice to database
    console.log('Save invoice');
  };

  const handleGenerateInvoice = () => {
    // TODO: Generate PDF invoice
    console.log('Generate PDF');
  };

  const handleClearList = () => {
    setInvoiceItems([]);
    setAdditionalCharges(0);
    setDiscount(0);
    setNotes('');
  };

  const rightActions = (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSaveInvoice}
      className="p-2 hover:bg-white hover:bg-opacity-10"
      data-testid="button-save-invoice"
    >
      <Save className="h-5 w-5" />
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      <AppBar 
        title="Create Invoice"
        showBack={true}
        onBack={() => setCurrentScreen('dashboard')}
        rightActions={rightActions}
      />

      <main className="pb-20 p-4 space-y-4">
        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger data-testid="select-invoice-account">
                <SelectValue placeholder="Select Customer/Supplier" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Invoice Type and Dates */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Label className="font-medium">Invoice Type</Label>
              <Tabs value={invoiceType} onValueChange={(value) => setInvoiceType(value as any)}>
                <TabsList className="grid w-40 grid-cols-2">
                  <TabsTrigger value="sale">Sale</TabsTrigger>
                  <TabsTrigger value="purchase">Purchase</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issue-date">Issue Date</Label>
                <Input
                  id="issue-date"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  data-testid="input-issue-date"
                />
              </div>
              <div>
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  data-testid="input-due-date"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Items</CardTitle>
              <Button 
                variant="link" 
                size="sm" 
                onClick={handleAddItem}
                data-testid="button-add-item-link"
              >
                + Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Items Table Header */}
            <div className="grid grid-cols-5 gap-2 mb-3 text-xs font-medium text-muted-foreground pb-2 border-b">
              <div>Item</div>
              <div>Qty</div>
              <div>Rate</div>
              <div>Disc%</div>
              <div>Total</div>
            </div>

            {/* Items List */}
            {invoiceItems.length > 0 ? (
              invoiceItems.map((item, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 mb-2 text-sm">
                  <div>{item.name}</div>
                  <div>{item.quantity}</div>
                  <div>{formatCurrency(item.rate)}</div>
                  <div>{item.discount}%</div>
                  <div className="font-medium">{formatCurrency(item.total)}</div>
                </div>
              ))
            ) : (
              <Button
                variant="outline"
                className="w-full py-8 border-dashed"
                onClick={handleAddItem}
                data-testid="button-add-first-item"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item to List
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Invoice Totals */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span data-testid="text-subtotal">{formatCurrency(calculateSubtotal())}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <Label htmlFor="additional-charges" className="flex items-center">
                  Additional Charges
                  <Input
                    id="additional-charges"
                    type="number"
                    placeholder="0"
                    className="ml-2 w-20 h-8 text-xs"
                    value={additionalCharges || ''}
                    onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
                    data-testid="input-additional-charges"
                  />
                </Label>
                <span data-testid="text-additional-charges">{formatCurrency(additionalCharges)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <Label htmlFor="discount" className="flex items-center">
                  Discount/Payment
                  <Input
                    id="discount"
                    type="number"
                    placeholder="0"
                    className="ml-2 w-20 h-8 text-xs"
                    value={discount || ''}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    data-testid="input-discount"
                  />
                </Label>
                <span className="text-red-600" data-testid="text-discount">
                  -{formatCurrency(discount)}
                </span>
              </div>
              
              <hr />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span data-testid="text-invoice-total">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                className="resize-none"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                data-testid="textarea-notes"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClearList}
            data-testid="button-clear-list"
          >
            Clear List
          </Button>
          <Button
            className="flex-1"
            onClick={handleGenerateInvoice}
            disabled={!selectedAccount || invoiceItems.length === 0}
            data-testid="button-generate-invoice"
          >
            Generate Invoice
          </Button>
        </div>
      </main>
    </div>
  );
}
