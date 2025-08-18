# Login Pages Implementation

## Overview
This document outlines the implementation of login pages for both Business users and SuperAdmin users in the Credit Debit financial management application.

## Login Page Requirements

### Business Login (/login)
- Business selection dropdown
- Branch selection dropdown (based on selected business)
- Role selection (based on user's assigned roles)
- Username/Password fields
- Remember me checkbox
- "Switch theme" link
- Helpful error states
- Loading states during authentication

### SuperAdmin Login (/admin/login)
- Username/Password fields
- Remember me checkbox
- "Switch theme" link
- Helpful error states
- Loading states during authentication

## Component Structure

### BusinessLogin Component
```tsx
interface BusinessLoginProps {
  onLogin: (credentials: BusinessLoginCredentials) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const BusinessLogin: React.FC<BusinessLoginProps> = ({ 
  onLogin, 
  loading, 
  error 
}) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  
  // Fetch businesses on mount
  useEffect(() => {
    fetchBusinesses().then(setBusinesses);
  }, []);
  
  // Fetch branches when business is selected
  useEffect(() => {
    if (selectedBusiness) {
      fetchBranches(selectedBusiness).then(setBranches);
    }
  }, [selectedBusiness]);
  
  // Fetch roles when branch is selected
  useEffect(() => {
    if (selectedBranch) {
      fetchRoles(selectedBusiness, selectedBranch).then(setRoles);
    }
  }, [selectedBranch]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      businessId: selectedBusiness,
      branchId: selectedBranch,
      roleId: selectedRole,
      username,
      password,
      rememberMe
    });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Credit Debit</h1>
          <p className="mt-2 text-muted-foreground">Business Login</p>
        </div>
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Select
              value={selectedBusiness}
              onValueChange={setSelectedBusiness}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Business" />
              </SelectTrigger>
              <SelectContent>
                {businesses.map(business => (
                  <SelectItem key={business.id} value={business.id}>
                    {business.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedBusiness && (
              <Select
                value={selectedBranch}
                onValueChange={setSelectedBranch}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {selectedBranch && (
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
            
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={loading}
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-foreground"
              >
                Remember me
              </label>
            </div>
            
            <Button
              variant="link"
              type="button"
              onClick={toggleTheme}
              className="text-sm"
            >
              Switch theme
            </Button>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            isLoading={loading}
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};
```

### SuperAdminLogin Component
```tsx
interface SuperAdminLoginProps {
  onLogin: (credentials: SuperAdminLoginCredentials) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const SuperAdminLogin: React.FC<SuperAdminLoginProps> = ({ 
  onLogin, 
  loading, 
  error 
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      username,
      password,
      rememberMe
    });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Credit Debit</h1>
          <p className="mt-2 text-muted-foreground">SuperAdmin Login</p>
        </div>
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
            
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={loading}
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-foreground"
              >
                Remember me
              </label>
            </div>
            
            <Button
              variant="link"
              type="button"
              onClick={toggleTheme}
              className="text-sm"
            >
              Switch theme
            </Button>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            isLoading={loading}
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};
```

## Authentication Flow

### Business Login Flow
1. User navigates to `/login`
2. User selects business from dropdown
3. System fetches branches for selected business
4. User selects branch from dropdown
5. System fetches roles available for user in selected branch
6. User selects role
7. User enters username and password
8. User can optionally select "Remember me"
9. User submits form
10. System authenticates credentials
11. On success, redirect to business app dashboard
12. On failure, show error message

### SuperAdmin Login Flow
1. User navigates to `/admin/login`
2. User enters username and password
3. User can optionally select "Remember me"
4. User submits form
5. System authenticates credentials
6. On success, redirect to SuperAdmin dashboard
7. On failure, show error message

## Error Handling

### Common Error States
- Invalid credentials
- Network errors
- Account locked
- Session expired
- Business/branch not found
- Role not available

### Error Display
- Clear, user-friendly error messages
- Specific error guidance when possible
- Visual indication of error state
- Ability to retry or reset form

## Security Considerations

### Credential Protection
- Never log passwords
- Use HTTPS for all authentication requests
- Implement rate limiting for login attempts
- Hash passwords on client-side before sending (if required)

### Session Management
- Secure token storage
- Automatic logout after inactivity
- Session refresh mechanisms
- Concurrent session handling

### Input Validation
- Client-side validation for user experience
- Server-side validation for security
- Sanitization of input data
- Prevention of injection attacks

## Implementation Plan

### Phase 1: Component Development
1. Create BusinessLogin component
2. Create SuperAdminLogin component
3. Implement form validation
4. Add loading states
5. Add error handling

### Phase 2: Authentication Integration
1. Integrate with auth store
2. Connect to API endpoints
3. Implement session management
4. Add remember me functionality
5. Add theme toggle

### Phase 3: Security Hardening
1. Implement secure credential handling
2. Add rate limiting protection
3. Implement account lockout mechanisms
4. Add security logging
5. Implement proper HTTPS enforcement

### Phase 4: Testing
1. Unit test components
2. Integration test authentication flows
3. Security testing
4. Accessibility testing
5. Cross-browser testing