import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/lib/design-tokens';
import { Sun, Moon, Building2, MapPin, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function BusinessLogin() {
  const { login } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const [businessId, setBusinessId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [role, setRole] = useState<'Admin' | 'Staff'>('Admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the API
      // For now, we'll simulate a successful login
      setTimeout(() => {
        login({
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: username || 'User',
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          token: 'fake-jwt-token',
          refreshToken: 'fake-refresh-token',
          role: role,
          businessId: businessId,
          branchId: branchId,
        });
        
        toast({
          title: "Login Successful",
          description: "Welcome back to Credit Debit!",
        });
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Business Login</CardTitle>
          <CardDescription>
            Sign in to your business account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business">Business</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="business"
                  placeholder="Select your business"
                  value={businessId}
                  onChange={(e) => setBusinessId(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="branch"
                  placeholder="Select your branch"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={role === 'Admin' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setRole('Admin')}
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant={role === 'Staff' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setRole('Staff')}
                >
                  Staff
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-foreground">
                  Remember me
                </label>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button variant="link" className="text-sm text-muted-foreground">
            Forgot your password?
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}