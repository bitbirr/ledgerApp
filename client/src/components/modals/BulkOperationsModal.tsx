import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Upload, 
  Download, 
  X, 
  CheckCircle, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkOperation {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function BulkOperationsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [operationType, setOperationType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: number; failed: number; total: number } | null>(null);

  const bulkOperations: BulkOperation[] = [
    {
      id: 'import-invoices',
      name: 'Import Invoices',
      description: 'Import multiple invoices from a CSV file',
      icon: FileSpreadsheet,
    },
    {
      id: 'import-payments',
      name: 'Import Payments',
      description: 'Import multiple payments from a CSV file',
      icon: FileSpreadsheet,
    },
    {
      id: 'export-data',
      name: 'Export Data',
      description: 'Export selected data to CSV file',
      icon: Download,
    },
    {
      id: 'update-accounts',
      name: 'Update Accounts',
      description: 'Bulk update account information',
      icon: Upload,
    },
    {
      id: 'delete-transactions',
      name: 'Delete Transactions',
      description: 'Delete multiple transactions at once',
      icon: X,
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleProcess = async () => {
    if (!operationType || !file) {
      toast({
        title: 'Error',
        description: 'Please select an operation type and file',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate processing with progress updates
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress(i);
      }

      // Mock result
      setResult({
        success: 95,
        failed: 5,
        total: 100,
      });

      toast({
        title: 'Bulk Operation Completed',
        description: 'Successfully processed bulk operation',
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process bulk operation',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setOperationType('');
    setFile(null);
    setProgress(0);
    setResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Bulk Operations
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-muted-foreground">
            Perform bulk operations on your data. Select an operation type, upload a file, and process.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Select Operation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bulkOperations.map((operation) => {
                  const Icon = operation.icon;
                  return (
                    <Button
                      key={operation.id}
                      variant={operationType === operation.id ? 'default' : 'outline'}
                      className="h-auto p-4 flex flex-col items-center justify-center gap-2 text-center"
                      onClick={() => setOperationType(operation.id)}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{operation.name}</span>
                      <span className="text-xs text-muted-foreground">{operation.description}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {operationType && (
            <Card>
              <CardHeader>
                <CardTitle>Upload File</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Select CSV File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      disabled={isProcessing}
                    />
                    {file && (
                      <Badge variant="secondary">
                        {file.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Please upload a CSV file with the correct format for the selected operation.
                  </p>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                {result && (
                  <div className="space-y-2 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      {result.failed === 0 ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-warning" />
                      )}
                      <span className="font-medium">Operation Complete</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center p-2 bg-success/10 rounded">
                        <div className="font-medium">{result.success}</div>
                        <div className="text-xs text-muted-foreground">Success</div>
                      </div>
                      <div className="text-center p-2 bg-warning/10 rounded">
                        <div className="font-medium">{result.failed}</div>
                        <div className="text-xs text-muted-foreground">Failed</div>
                      </div>
                      <div className="text-center p-2 bg-primary/10 rounded">
                        <div className="font-medium">{result.total}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={isProcessing}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleProcess}
                    disabled={!file || isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Process'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}