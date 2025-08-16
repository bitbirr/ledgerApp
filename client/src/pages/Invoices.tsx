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
import { AddItemModal } from '@/components/modals/AddItemModal';

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
      // return await db.accounts.where('archived').equals(false).toArray();
      const all = await db.accounts.toArray();
      return all.filter((a) => a.archived === false);
    },
  });

  const { data: items } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      return await db.items.toArray();
    },
  });

  // Add VAT calculation state and logic
  const [vatRate, setVatRate] = useState<number>(0.15); // 15% VAT
  const [showVatBreakdown, setShowVatBreakdown] = useState<boolean>(true);
  
  // Enhanced calculation functions
  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };
  
  const calculateVatAmount = () => {
    const subtotal = calculateSubtotal() + additionalCharges;
    return subtotal * vatRate; // VAT exclusive calculation
  };
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const vatAmount = calculateVatAmount();
    return subtotal + additionalCharges + vatAmount - discount;
  };

  // Remove the local formatCurrency function and use the imported one
  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat('en-IN', {
  //     style: 'currency',
  //     currency: 'INR',
  //   }).format(amount);
  // };

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  
  const handleAddItem = () => {
    setShowAddItemModal(true);
  };
  
  const handleAddItemToInvoice = (item: any) => {
    setInvoiceItems(prev => [...prev, {
      ...item,
      quantity: item.qty,
      rate: item.rate,
      discount: item.discountPct,
      total: item.total
    }]);
    setShowAddItemModal(false);
  };

  const handleSaveInvoice = async () => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'business-id': 'default-business', // Get from context
        },
        body: JSON.stringify({
          businessId: 'default-business',
          userId: 'current-user', // Get from auth context
          invoiceType,
          selectedAccount,
          issueDate,
          dueDate,
          invoiceItems,
          additionalCharges,
          discount,
          notes,
          vatRate,
        }),
      });
      
      const result = await response.json();
      console.log('Invoice saved:', result);
      
      // Optionally post the invoice immediately
      await handlePostInvoice(result.invoiceId);
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };
  
  const handlePostInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'business-id': 'default-business',
        },
        body: JSON.stringify({
          businessId: 'default-business',
          userId: 'current-user',
        }),
      });
      
      const result = await response.json();
      console.log('Invoice posted:', result);
    } catch (error) {
      console.error('Error posting invoice:', error);
    }
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
                <span>{formatCurrency(calculateSubtotal())}</span>
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
                  />
                </Label>
                <span>{formatCurrency(additionalCharges)}</span>
              </div>
              
              {/* VAT Breakdown */}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>VAT ({(vatRate * 100).toFixed(0)}%)</span>
                <span>{formatCurrency(calculateVatAmount())}</span>
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
                  />
                </Label>
                <span className="text-red-600">-{formatCurrency(discount)}</span>
              </div>
              
              <hr />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total (Incl. VAT)</span>
                <span>{formatCurrency(calculateTotal())}</span>
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
      <AddItemModal
        open={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onAddItem={handleAddItemToInvoice}
        invoiceType={invoiceType}
      />
    </div>
  );
}
