import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Filter, 
  MapPin,
  MoreHorizontal,
  Building2,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import type { Branch } from '@/lib/api';

export function Branches() {
  const [searchTerm, setSearchTerm] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuthStore();
  
  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);
  
  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, you would get the businessId from the user context
      // For now, we'll use a placeholder
      const businessId = 'default-business';
      const data = await api.getBranches(businessId);
      setBranches(data);
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError('Failed to load branches. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load branches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredBranches = branches.filter(branch => 
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (branch.address && branch.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const getStatusVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'destructive';
  };
  
  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };
  
  const handleDeleteBranch = async (id: string, name: string) => {
    try {
      // In a real implementation, you would get the businessId from the user context
      const businessId = 'default-business';
      await api.deleteBranch(id, businessId);
      
      // Remove the branch from the local state
      setBranches(branches.filter(branch => branch.id !== id));
      
      toast({
        title: "Success",
        description: `Branch "${name}" has been deleted.`,
      });
    } catch (err) {
      console.error('Error deleting branch:', err);
      toast({
        title: "Error",
        description: "Failed to delete branch. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Branches</h1>
          <p className="text-muted-foreground">Manage business branches</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Branch
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="rounded-2xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-medium mb-2">Error Loading Branches</h3>
            <p className="mb-4">{error}</p>
            <Button onClick={fetchBranches} className="gap-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Branch List</CardTitle>
            <CardDescription>
              {filteredBranches.length} branches found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border">
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b text-sm font-medium text-foreground">
                <div className="col-span-3">Branch Name</div>
                <div className="col-span-3">Address</div>
                <div className="col-span-2">Contact</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Actions</div>
              </div>
              {filteredBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-teal-50/40 transition-colors"
                >
                  <div className="col-span-3 font-medium text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {branch.name}
                  </div>
                  <div className="col-span-3 text-foreground">
                    {branch.address || 'No address provided'}
                  </div>
                  <div className="col-span-2 text-foreground">
                    {branch.phone || branch.email || 'No contact info'}
                  </div>
                  <div className="col-span-2">
                    <Badge variant={getStatusVariant(branch.isActive)}>
                      {getStatusText(branch.isActive)}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteBranch(branch.id, branch.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredBranches.length === 0 && !loading && (
                <div className="p-8 text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No branches found</h3>
                  <p className="mb-4">Try adjusting your search or filter to find what you're looking for.</p>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Branch
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredBranches.map((branch) => (
          <Card key={branch.id} className="rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  {branch.name}
                </CardTitle>
                <Badge variant={getStatusVariant(branch.isActive)}>
                  {getStatusText(branch.isActive)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-medium text-foreground">{branch.address || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span>{branch.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{branch.email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(branch.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteBranch(branch.id, branch.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredBranches.length === 0 && !loading && (
          <Card className="rounded-2xl">
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No branches found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Add Branch
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer with attribution */}
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Developed by Ismail Mohamed - +251927802065</p>
      </footer>
    </div>
  );
}