import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Filter, 
  Building2,
  MoreHorizontal
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Businesses() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock business data
  const businesses = [
    { id: 1, name: 'ABC Corporation', industry: 'Manufacturing', status: 'active', branches: 3, users: 12, createdAt: '2023-01-15' },
    { id: 2, name: 'XYZ Ltd', industry: 'Retail', status: 'active', branches: 1, users: 5, createdAt: '2023-02-20' },
    { id: 3, name: 'Tech Solutions', industry: 'Technology', status: 'pending', branches: 0, users: 0, createdAt: '2023-03-10' },
    { id: 4, name: 'Global Trading', industry: 'Wholesale', status: 'active', branches: 5, users: 22, createdAt: '2023-04-05' },
    { id: 5, name: 'Office Supplies Inc', industry: 'Retail', status: 'suspended', branches: 2, users: 8, createdAt: '2023-05-12' },
  ];

  const filteredBusinesses = businesses.filter(business => 
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.industry.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-foreground">Businesses</h1>
          <p className="text-muted-foreground">Manage business accounts and subscriptions</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Business
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
                placeholder="Search businesses..."
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
            <CardTitle>Business List</CardTitle>
            <CardDescription>
              {filteredBusinesses.length} businesses found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b text-sm font-medium text-foreground">
                <div className="col-span-3">Business Name</div>
                <div className="col-span-2">Industry</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Branches</div>
                <div className="col-span-2">Users</div>
                <div className="col-span-1">Actions</div>
              </div>
              {filteredBusinesses.map((business) => (
                <div 
                  key={business.id} 
                  className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/30 transition-colors"
                >
                  <div className="col-span-3 font-medium text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {business.name}
                  </div>
                  <div className="col-span-2 text-foreground">
                    {business.industry}
                  </div>
                  <div className="col-span-2">
                    <Badge variant={getStatusVariant(business.status)}>
                      {business.status}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-foreground">
                    {business.branches}
                  </div>
                  <div className="col-span-2 text-foreground">
                    {business.users}
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredBusinesses.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No businesses found</h3>
                  <p className="mb-4">Try adjusting your search or filter to find what you're looking for.</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Business
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredBusinesses.map((business) => (
          <Card key={business.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  {business.name}
                </CardTitle>
                <Badge variant={getStatusVariant(business.status)}>
                  {business.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Industry</span>
                  <span className="font-medium text-foreground">{business.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branches</span>
                  <span>{business.branches}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Users</span>
                  <span>{business.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{business.createdAt}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredBusinesses.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No businesses found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Business
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}