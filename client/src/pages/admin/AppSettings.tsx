import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings,
  Save,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AppSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    appName: 'LedgerPro Admin',
    appVersion: '1.0.0',
    maintenanceMode: false,
    emailNotifications: true,
    autoBackup: true,
    retentionPeriod: '30',
    maxFileSize: '10',
    timezone: 'Africa/Addis_Ababa',
    currency: 'ETB',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  });

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Application settings have been updated successfully.',
    });
  };

  const handleReset = () => {
    setSettings({
      appName: 'LedgerPro Admin',
      appVersion: '1.0.0',
      maintenanceMode: false,
      emailNotifications: true,
      autoBackup: true,
      retentionPeriod: '30',
      maxFileSize: '10',
      timezone: 'Africa/Addis_Ababa',
      currency: 'ETB',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
    });
    toast({
      title: 'Settings Reset',
      description: 'Application settings have been reset to default values.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">App Settings</h1>
          <p className="text-muted-foreground">Configure application-wide settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset Defaults
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Configure basic application settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appName">Application Name</Label>
              <Input
                id="appName"
                value={settings.appName}
                onChange={(e) => setSettings({...settings, appName: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appVersion">Application Version</Label>
              <Input
                id="appVersion"
                value={settings.appVersion}
                onChange={(e) => setSettings({...settings, appVersion: e.target.value})}
                readOnly
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable maintenance mode for the application
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notification Settings</CardTitle>
            <CardDescription>
              Configure notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable email notifications for system events
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Enable automatic backup of system data
                </p>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Settings */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Data Settings</CardTitle>
            <CardDescription>
              Configure data management settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="retentionPeriod">Data Retention Period (days)</Label>
              <Input
                id="retentionPeriod"
                type="number"
                value={settings.retentionPeriod}
                onChange={(e) => setSettings({...settings, retentionPeriod: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Max File Upload Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => setSettings({...settings, maxFileSize: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Localization Settings */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Localization Settings</CardTitle>
            <CardDescription>
              Configure regional and language settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                className="w-full p-2 border rounded-md"
                value={settings.timezone}
                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
              >
                <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
                <option value="Africa/Nairobi">Africa/Nairobi</option>
                <option value="Africa/Cairo">Africa/Cairo</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                className="w-full p-2 border rounded-md"
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
              >
                <option value="ETB">ETB - Ethiopian Birr</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <select
                id="dateFormat"
                className="w-full p-2 border rounded-md"
                value={settings.dateFormat}
                onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <select
                id="timeFormat"
                className="w-full p-2 border rounded-md"
                value={settings.timeFormat}
                onChange={(e) => setSettings({...settings, timeFormat: e.target.value})}
              >
                <option value="24h">24 Hour</option>
                <option value="12h">12 Hour</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}