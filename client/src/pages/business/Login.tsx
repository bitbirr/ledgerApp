import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/lib/design-tokens';
import { Sun, Moon, Building2, MapPin, User, Lock, Check, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocation } from 'wouter';

export function BusinessLogin() {
  const { 
    login, 
    setPreloginData, 
    setSelectedBusiness, 
    setBusinessBranchData,
    setSelectedBranch,
    completeLogin 
  } = useAuthStore();
  
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Step management
  const [step, setStep] = useState<0|1|2|3>(0); // 0 Business, 1 Branch, 2 Credentials, 3 Success
  
  // Form data
  const [businessId, setBusinessId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Loading states
  const [isFetchingBusinesses, setIsFetchingBusinesses] = useState(false);
  const [isFetchingBranches, setIsFetchingBranches] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Error states
  const [businessError, setBusinessError] = useState('');
  const [branchError, setBranchError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  
  // Data for businesses and branches
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  
  // Get branches for selected business
  const branchesForBiz = useMemo(() => {
    // If businessId is not set, return all branches
    if (!businessId) return branches;
    // Filter branches by businessId if they have this property
    // If branches don't have businessId property, return all branches
    const filtered = branches.filter(b => b.businessId === businessId);
    // If no branches match the businessId, return all branches as fallback
    return filtered.length > 0 ? filtered : branches;
  }, [businessId, branches]);
  
  const selectedBusiness = businesses.find(b => b.id === businessId);
  
  // Fetch businesses on component mount
  useEffect(() => {
    const fetchBusinesses = async () => {
      setIsFetchingBusinesses(true);
      try {
        // Use the new loginStart API endpoint
        const response = await api.loginStart();
        setPreloginData({
          token: response.token,
          businesses: response.businesses
        });
        setBusinesses(response.businesses);
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Failed to fetch businesses: ${error.message || 'Please try again.'}`,
          variant: "destructive",
        });
      } finally {
        setIsFetchingBusinesses(false);
      }
    };

    fetchBusinesses();
  }, []);
  
  // Fetch branches when business is selected
  useEffect(() => {
    const fetchBranches = async () => {
      if (businessId) {
        setIsFetchingBranches(true);
        try {
          // Use the new selectBusiness API endpoint
          const { token, branches: branchData } = await api.selectBusiness(
            useAuthStore.getState().preloginToken || '',
            businessId
          );
          
          setBusinessBranchData({
            token,
            branches: branchData
          });
          
          // Ensure each branch has the businessId property
          const branchesWithBusinessId = branchData.map(branch => ({
            ...branch,
            businessId: branch.businessId || businessId
          }));
          setBranches(branchesWithBusinessId);
          // Reset branch selection when business changes
          setBranchId('');
        } catch (error: any) {
          toast({
            title: "Error",
            description: `Failed to fetch branches: ${error.message || 'Please try again.'}`,
            variant: "destructive",
          });
        } finally {
          setIsFetchingBranches(false);
        }
      } else {
        setBranches([]);
        setBranchId('');
      }
    };

    fetchBranches();
  }, [businessId]);
  
  // Validate form fields
  const validateBusinessStep = () => {
    let isValid = true;
    
    // Reset errors
    setBusinessError('');
    
    // Business validation
    if (!businessId) {
      setBusinessError('Please select a business');
      isValid = false;
    }
    
    return isValid;
  };
  
  const validateBranchStep = () => {
    let isValid = true;
    
    // Reset errors
    setBranchError('');
    
    // Branch validation
    if (!branchId) {
      setBranchError('Please choose a branch');
      isValid = false;
    }
    
    return isValid;
  };
  
  const validateCredentialsStep = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    
    // Email validation
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleNextFromBusiness = () => {
    if (validateBusinessStep()) {
      setSelectedBusiness(businessId);
      setStep(1);
    }
  };
  
  const handleNextFromBranch = () => {
    if (validateBranchStep()) {
      setSelectedBranch(branchId);
      setStep(2);
    }
  };
  
  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setServerError('');
    
    // Validate form
    if (!validateCredentialsStep()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use the new selectBranch API endpoint instead of the old login
      const response = await api.selectBranch(
        useAuthStore.getState().preloginToken || '',
        branchId
      );
      
      // Complete login with the new auth store method
      completeLogin({
        token: response.token,
        refreshToken: '', // Not provided in the new API, will need to be handled differently
        user: response.user,
        role: response.user.role || 'Admin', // Default to Admin if not provided
        expiresIn: response.expiresIn,
        businessId: businessId,
        branchId: branchId,
      });
      
      toast({
        title: "Login Successful",
        description: "Welcome back to Credit Debit!",
      });
      
      // Navigate to dashboard after successful login
      setLocation('/dashboard');
    } catch (error: any) {
      // Handle login errors
      const errorMessage = error.message || 'Invalid credentials. Please try again.';
      setServerError(errorMessage);
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setStep(0);
    setBusinessId('');
    setBranchId('');
    setEmail('');
    setPassword('');
    setServerError('');
  };
  
  // Handle keyboard navigation for business selection
  const handleBusinessKeyDown = (e: React.KeyboardEvent, bizId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setBusinessId(bizId);
    }
  };
  
  // Handle keyboard navigation for branch selection
  const handleBranchKeyDown = (e: React.KeyboardEvent, branchId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setBranchId(branchId);
    }
  };
  
  // Step 0: Business Selection
  if (step === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-4">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[conic-gradient(at_20%_10%,#14b8a6_0deg,#059669_140deg,#1e3a8a_260deg,#f59e0b_340deg)]"/>
          <div className="absolute inset-0 mix-blend-overlay opacity-60 [mask-image:radial-gradient(90%_70%_at_50%_40%,#000,transparent_70%)]" style={{
            backgroundImage:
              "radial-gradient(40rem_30rem_at_20%_10%,rgba(255,255,255,.08),transparent),radial-gradient(50rem_40rem_at_80%_30%,rgba(255,255,255,.08),transparent),radial-gradient(60rem_40rem_at_50%_80%,rgba(255,255,255,.10),transparent)",
          }}/>
        </div>
        
        <Card className="w-full max-w-md border-0 bg-white/90 backdrop-blur-sm shadow-xl" role="region" aria-labelledby="business-login-title">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-emerald-600/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                <Building2 className="w-8 h-8 text-emerald-700" />
              </div>
            </div>
            <CardTitle id="business-login-title" className="text-2xl font-bold text-emerald-900">Select Your Business</CardTitle>
            <CardDescription className="text-emerald-700">
              Choose the tenant you belong to
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {isFetchingBusinesses ? (
                [...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))
              ) : (
                businesses.map((biz: any) => (
                  <button
                    key={biz.id}
                    onClick={() => setBusinessId(biz.id)}
                    onKeyDown={(e) => handleBusinessKeyDown(e, biz.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                      businessId === biz.id
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-slate-200"
                    }`}
                    aria-selected={businessId === biz.id}
                    role="radio"
                    tabIndex={0}
                  >
                    <div>
                      <div className="font-medium text-emerald-900">{biz.name}</div>
                      <div className="text-xs text-slate-500">ID: {biz.id}</div>
                    </div>
                    {businessId === biz.id && (
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">Selected</span>
                    )}
                  </button>
                ))
              )}
              
              {businessError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{businessError}</AlertDescription>
                </Alert>
              )}
              
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-600">Step 1 of 3</span>
                <Button 
                  onClick={handleNextFromBusiness} 
                  disabled={!businessId || isFetchingBusinesses}
                  className="min-w-[120px] bg-emerald-600 hover:bg-emerald-700"
                  aria-describedby={businessError ? "business-error" : undefined}
                >
                  Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Step 1: Branch Selection
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-4">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[conic-gradient(at_20%_10%,#14b8a6_0deg,#059669_140deg,#1e3a8a_260deg,#f59e0b_340deg)]"/>
          <div className="absolute inset-0 mix-blend-overlay opacity-60 [mask-image:radial-gradient(90%_70%_at_50%_40%,#000,transparent_70%)]" style={{
            backgroundImage:
              "radial-gradient(40rem_30rem_at_20%_10%,rgba(255,255,255,.08),transparent),radial-gradient(50rem_40rem_at_80%_30%,rgba(255,255,255,.08),transparent),radial-gradient(60rem_40rem_at_50%_80%,rgba(255,255,255,.10),transparent)",
          }}/>
        </div>
        
        <Card className="w-full max-w-md border-0 bg-white/90 backdrop-blur-sm shadow-xl" role="region" aria-labelledby="branch-selection-title">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-emerald-600/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                <MapPin className="w-8 h-8 text-emerald-700" />
              </div>
            </div>
            <CardTitle id="branch-selection-title" className="text-2xl font-bold text-emerald-900">Select Branch</CardTitle>
            <CardDescription className="text-emerald-700">
              {selectedBusiness ? selectedBusiness.name : "Choose a business first"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {isFetchingBranches ? (
                [...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))
              ) : branchesForBiz.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500 text-center">
                  No branches found for this business.
                </div>
              ) : (
                branchesForBiz.map((br: any) => (
                  <button
                    key={br.id}
                    onClick={() => setBranchId(br.id)}
                    onKeyDown={(e) => handleBranchKeyDown(e, br.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                      branchId === br.id
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-slate-200"
                    }`}
                    aria-selected={branchId === br.id}
                    role="radio"
                    tabIndex={0}
                  >
                    <div>
                      <div className="font-medium text-emerald-900">{br.name}</div>
                      <div className="text-xs text-slate-500">ID: {br.id}</div>
                    </div>
                    {branchId === br.id && (
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">Selected</span>
                    )}
                  </button>
                ))
              )}
              
              {branchError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{branchError}</AlertDescription>
                </Alert>
              )}
              
              <div className="mt-4 flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(0)} 
                  className="text-emerald-700"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleNextFromBranch} 
                  disabled={!branchId || isFetchingBranches}
                  className="min-w-[120px] bg-emerald-600 hover:bg-emerald-700"
                  aria-describedby={branchError ? "branch-error" : undefined}
                >
                  Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Step 2: Credentials
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-4">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[conic-gradient(at_20%_10%,#14b8a6_0deg,#059669_140deg,#1e3a8a_260deg,#f59e0b_340deg)]"/>
          <div className="absolute inset-0 mix-blend-overlay opacity-60 [mask-image:radial-gradient(90%_70%_at_50%_40%,#000,transparent_70%)]" style={{
            backgroundImage:
              "radial-gradient(40rem_30rem_at_20%_10%,rgba(255,255,255,.08),transparent),radial-gradient(50rem_40rem_at_80%_30%,rgba(255,255,255,.08),transparent),radial-gradient(60rem_40rem_at_50%_80%,rgba(255,255,255,.10),transparent)",
          }}/>
        </div>
        
        <Card className="w-full max-w-md border-0 bg-white/90 backdrop-blur-sm shadow-xl" role="region" aria-labelledby="sign-in-title">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-emerald-600/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                <Lock className="w-8 h-8 text-emerald-700" />
              </div>
            </div>
            <CardTitle id="sign-in-title" className="text-2xl font-bold text-emerald-900">Sign In</CardTitle>
            <CardDescription className="text-emerald-700">
              Enter your credentials
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmitCredentials} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-emerald-900">Email</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" aria-hidden="true" />
                  <Input
                    id="email"
                    placeholder="admin@hajjelec.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    className="pl-10"
                    autoComplete="email"
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                  />
                </div>
                {emailError && (
                  <p id="email-error" className="mt-1 text-sm text-red-500">{emailError}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="password" className="text-emerald-900">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  className="mt-1"
                  autoComplete="current-password"
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? "password-error" : undefined}
                />
                <div className="mt-1 text-xs text-slate-500">
                  Business: <span className="font-medium text-emerald-800">{selectedBusiness?.name}</span> ·
                  Branch: <span className="font-medium text-emerald-800">{branches.find(b=>b.id===branchId)?.name || "Not selected"}</span>
                </div>
                {passwordError && (
                  <p id="password-error" className="mt-1 text-sm text-red-500">{passwordError}</p>
                )}
              </div>
              
              {serverError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}
              
              <div className="mt-4 flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(1)} 
                  className="text-emerald-700"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="min-w-[120px] bg-emerald-600 hover:bg-emerald-700"
                  aria-describedby={serverError ? "server-error" : undefined}
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Step 3: Success
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[conic-gradient(at_20%_10%,#14b8a6_0deg,#059669_140deg,#1e3a8a_260deg,#f59e0b_340deg)]"/>
        <div className="absolute inset-0 mix-blend-overlay opacity-60 [mask-image:radial-gradient(90%_70%_at_50%_40%,#000,transparent_70%)]" style={{
          backgroundImage:
            "radial-gradient(40rem_30rem_at_20%_10%,rgba(255,255,255,.08),transparent),radial-gradient(50rem_40rem_at_80%_30%,rgba(255,255,255,.08),transparent),radial-gradient(60rem_40rem_at_50%_80%,rgba(255,255,255,.10),transparent)",
        }}/>
      </div>
      
      <Card className="w-full max-w-md border-0 bg-white/90 backdrop-blur-sm shadow-xl" role="region" aria-labelledby="authenticated-title">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-emerald-600/10 rounded-lg flex items-center justify-center" aria-hidden="true">
              <Check className="w-8 h-8 text-emerald-700" />
            </div>
          </div>
          <CardTitle id="authenticated-title" className="text-2xl font-bold text-emerald-900">Authenticated</CardTitle>
          <CardDescription className="text-emerald-700">
            Tenant checks passed
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-xl border bg-emerald-50 p-4 text-sm">
              <div className="font-medium text-emerald-800">JWT (demo):</div>
              <code className="block break-all text-xs text-emerald-800/90">
                {`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LTEiLCJyb2xlIjoiYWRtaW4iLCJiaXN1c2VJZCI6ImJpcy0xIiwiYnJhbmNoSWQiOiJicm0tMSIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`}
              </code>
            </div>
            
            <ul className="list-inside list-disc text-sm text-slate-700 space-y-1">
              <li>All API calls must include this token. Server validates <b>businessId</b> and <b>branchId</b> in claims.</li>
              <li>Queries are always scoped by <b>businessId</b> (and <b>branchId</b> where relevant).</li>
            </ul>
            
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={resetForm}
                className="text-emerald-700"
              >
                Restart
              </Button>
              <Button
                onClick={() => {
                  setLocation('/dashboard');
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Continue to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}