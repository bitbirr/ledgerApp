import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Filter, 
  MapPin,
  MoreHorizontal,
  Building2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Branches() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock branch data
  const branches = [
    { id: 1, name: 'Main Branch', business: 'ABC Corporation', location: 'Addis Ababa', status: 'active', users: 8, createdAt: '2023-01-15' },
    { id: 2, name: 'Downtown Branch', business: 'XYZ Ltd', location: 'Dire Dawa', status: 'active', users: 5, createdAt: '2023-02-20' },
    { id: 3, name: 'Branch 3', business: 'ABC Corporation', location: 'Mekelle', status: 'pending', users: 0, createdAt: '2023-03-10' },
    { id: 4, name: 'Northern Branch', business: 'Global Trading', location: 'Bahirdar', status: 'active', users: 12, createdAt: '2023-04-05' },
    { id: 5, name: 'Southern Branch', business: 'Global Trading', location: 'Hawassa', status: 'suspended', users: 6, createdAt: '2023-05-12' },
  ];

  const filteredBranches = branches.filter(branch => 
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.business.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'suspended': return 'destructive';
      default: return 'secondary';
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
                <div className="col-span-2">Business</div>
                <div className="col-span-2">Location</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Users</div>
                <div className="col-span-1">Actions</div>
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
                  <div className="col-span-2 text-foreground">
                    {branch.business}
                  </div>
                  <div className="col-span-2 text-foreground">
                    {branch.location}
                  </div>
                  <div className="col-span-2">
                    <Badge variant={getStatusVariant(branch.status)}>
                      {branch.status}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-foreground">
                    {branch.users}
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredBranches.length === 0 && (
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
                <Badge variant={getStatusVariant(branch.status)}>
                  {branch.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business</span>
                  <span className="font-medium text-foreground">{branch.business}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span>{branch.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Users</span>
                  <span>{branch.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{branch.createdAt}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredBranches.length === 0 && (
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
    </div>
  );
}