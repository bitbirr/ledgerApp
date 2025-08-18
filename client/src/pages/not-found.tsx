import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { Home, ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export default function NotFound() {
  const { role } = useAuthStore();

  // Log the 404 error
  useEffect(() => {
    console.warn("404 Page Not Found");
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-muted-foreground">404</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          Sorry, the page you're looking for doesn't exist or you don't have permission to access it.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          <Button 
            onClick={() => window.location.href = role === 'SuperAdmin' ? '/admin' : '/'}
            className="flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            {role === 'SuperAdmin' ? 'Admin Dashboard' : 'Dashboard'}
          </Button>
        </div>
      </div>
    </div>
  );
}
