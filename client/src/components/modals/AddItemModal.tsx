import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (item: InvoiceItemData) => void;
  invoiceType: 'sale' | 'purchase';
}

interface InvoiceItemData {
  itemId: string;
  name: string;
  qty: number;
  rate: number;
  discountPct: number;
  total: number;
  currentStock?: number;
  unitCost?: number;
}

export function AddItemModal({ open, onClose, onAddItem, invoiceType }: AddItemModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [rate, setRate] = useState<number>(0);
  const [discountPct, setDiscountPct] = useState<number>(0);

  const { data: items } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      return await db.items.toArray();
    },
  });

  const selectedItem = items?.find(item => item.id === selectedItemId);
  
  const calculateItemTotal = () => {
    const subtotal = qty * rate;
    const discountAmount = subtotal * (discountPct / 100);
    return subtotal - discountAmount;
  };

  const handleAddItem = () => {
    if (!selectedItem) return;
    
    const itemData: InvoiceItemData = {
      itemId: selectedItem.id,
      name: selectedItem.name,
      qty,
      rate,
      discountPct,
      total: calculateItemTotal(),
      currentStock: selectedItem.openingStock, // TODO: Calculate actual current stock
      unitCost: selectedItem.rate, // TODO: Get weighted-average cost
    };
    
    onAddItem(itemData);
    onClose();
    
    // Reset form
    setSelectedItemId('');
    setQty(1);
    setRate(0);
    setDiscountPct(0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Item to {invoiceType === 'sale' ? 'Sale' : 'Purchase'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="item-select">Select Item</Label>
            <Select value={selectedItemId} onValueChange={(value) => {
              setSelectedItemId(value);
              const item = items?.find(i => i.id === value);
              if (item) {
                setRate(item.rate);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an item" />
              </SelectTrigger>
              <SelectContent>
                {items?.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    <div className="flex justify-between w-full">
                      <span>{item.name}</span>
                      <span className="text-muted-foreground ml-2">
                        Stock: {item.openingStock} {item.uom}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedItem && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qty">Quantity</Label>
                  <Input
                    id="qty"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={qty}
                    onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Unit: {selectedItem.uom}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="rate">Rate</Label>
                  <Input
                    id="rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="discount">Discount %</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="bg-muted p-3 rounded">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(qty * rate)}</span>
                </div>
                {discountPct > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount ({discountPct}%):</span>
                    <span>-{formatCurrency((qty * rate) * (discountPct / 100))}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateItemTotal())}</span>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddItem}
            disabled={!selectedItem || qty <= 0 || rate <= 0}
          >
            Add Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}