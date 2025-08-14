import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { AppBar } from '@/components/layout/AppBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CloudUpload, 
  CloudDownload, 
  FileDown, 
  Palette,
  Shield,
  FileText,
  Database
} from 'lucide-react';

export function Settings() {
  const { setCurrentScreen } = useAppStore();
  const queryClient = useQueryClient();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { data: preferences } = useQuery({
    queryKey: ['preferences'],
    queryFn: async () => {
      return await db.preferences.get(1);
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<typeof preferences>) => {
      await db.preferences.update(1, updates);
      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });

  useEffect(() => {
    if (preferences) {
      setIsDarkMode(preferences.darkMode);
      // Apply dark mode to document
      if (preferences.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [preferences]);

  const handleDarkModeToggle = (enabled: boolean) => {
    setIsDarkMode(enabled);
    updatePreferencesMutation.mutate({ darkMode: enabled });
    
    // Apply immediately to DOM
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleBackupToGoogleDrive = () => {
    // TODO: Implement Google Drive backup
    console.log('Backup to Google Drive');
  };

  const handleRestoreFromGoogleDrive = () => {
    // TODO: Implement Google Drive restore
    console.log('Restore from Google Drive');
  };

  const handleExportData = () => {
    // TODO: Implement data export
    console.log('Export data');
  };

  return (
    <div className="min-h-screen bg-background">
      <AppBar 
        title="Settings"
        showBack={true}
        onBack={() => setCurrentScreen('dashboard')}
      />

      <main className="pb-20 p-4 space-y-4">
        {/* Date & Time Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="date-format">Date Format</Label>
              <Select 
                value={preferences?.dateFormat || 'DD/MM/YYYY'}
                onValueChange={(value) => updatePreferencesMutation.mutate({ dateFormat: value })}
              >
                <SelectTrigger data-testid="select-date-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="time-format">Time Format</Label>
              <Select 
                value={preferences?.timeFormat || '12'}
                onValueChange={(value) => updatePreferencesMutation.mutate({ timeFormat: value })}
              >
                <SelectTrigger data-testid="select-time-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 Hour (AM/PM)</SelectItem>
                  <SelectItem value="24">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Currency & Language */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Currency & Language
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={preferences?.currency || 'INR'}
                onValueChange={(value) => updatePreferencesMutation.mutate({ currency: value })}
              >
                <SelectTrigger data-testid="select-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                  <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                  <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="language">Language</Label>
              <Select 
                value={preferences?.language || 'en'}
                onValueChange={(value) => updatePreferencesMutation.mutate({ language: value })}
              >
                <SelectTrigger data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Dark Mode</div>
                <div className="text-sm text-muted-foreground">Switch to dark theme</div>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={handleDarkModeToggle}
                data-testid="switch-dark-mode"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">App Lock</div>
                <div className="text-sm text-muted-foreground">Secure with PIN</div>
              </div>
              <Switch data-testid="switch-app-lock" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Biometric Unlock</div>
                <div className="text-sm text-muted-foreground">Use fingerprint/face unlock</div>
              </div>
              <Switch 
                checked={preferences?.biometricEnabled || false}
                onCheckedChange={(value) => updatePreferencesMutation.mutate({ biometricEnabled: value })}
                data-testid="switch-biometric"
              />
            </div>
          </CardContent>
        </Card>

        {/* Reports Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Show Time in Reports</div>
                <div className="text-sm text-muted-foreground">Include timestamps</div>
              </div>
              <Switch 
                checked={preferences?.showTimeInReports || false}
                onCheckedChange={(value) => updatePreferencesMutation.mutate({ showTimeInReports: value })}
                data-testid="switch-show-time"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Show Previous Balance</div>
                <div className="text-sm text-muted-foreground">Display opening balance</div>
              </div>
              <Switch 
                checked={preferences?.showPreviousBalance || false}
                onCheckedChange={(value) => updatePreferencesMutation.mutate({ showPreviousBalance: value })}
                data-testid="switch-show-previous-balance"
              />
            </div>
          </CardContent>
        </Card>

        {/* Backup & Restore */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              <CloudUpload className="mr-2 h-5 w-5" />
              Backup & Restore
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleBackupToGoogleDrive}
              data-testid="button-backup-google-drive"
            >
              <CloudUpload className="mr-3 h-4 w-4 text-primary" />
              <span>Backup to Google Drive</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleRestoreFromGoogleDrive}
              data-testid="button-restore-google-drive"
            >
              <CloudDownload className="mr-3 h-4 w-4 text-primary" />
              <span>Restore from Google Drive</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleExportData}
              data-testid="button-export-data"
            >
              <FileDown className="mr-3 h-4 w-4 text-primary" />
              <span>Export Data</span>
            </Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div data-testid="text-app-version">Version 1.0.0</div>
            <div data-testid="text-build-date">Build 2024.12.15</div>
            <div>© 2024 Credit Debit App</div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
