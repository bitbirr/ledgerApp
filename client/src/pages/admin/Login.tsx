import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/lib/design-tokens';
import { Sun, Moon, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

export function SuperAdminLogin() {
  const { login } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Call the real API admin login function
      const loginResponse = await api.adminLogin({
              email,
              password,
            });
      
      // Login successful
      login({
        user: loginResponse.user,
        token: loginResponse.token,
        refreshToken: loginResponse.refreshToken,
        role: loginResponse.user.role,
        businessId: undefined,
        branchId: undefined,
      });
      
      toast({
        title: "Login Successful",
        description: "Welcome back, Super Admin!",
      });
      
      setIsLoading(false);
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
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
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Super Admin Login</CardTitle>
          <CardDescription>
            Access the administration panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your admin email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your admin password"
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
            This portal is for authorized personnel only.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}