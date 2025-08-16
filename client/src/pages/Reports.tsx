import { useAppStore } from '@/lib/store';
import { AppBar } from '@/components/layout/AppBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JournalViewer } from '@/components/JournalViewer';
import { TrialBalance } from '@/components/reports/TrialBalance';

export function Reports() {
  const { setCurrentScreen } = useAppStore();

  return (
    <div className="min-h-screen bg-background">
      <AppBar 
        title="Reports"
        showBack={true}
        onBack={() => setCurrentScreen('dashboard')}
      />

      <main className="pb-20 p-4">
        <Tabs defaultValue="trial-balance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
            <TabsTrigger value="journal">Journal Entries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trial-balance">
            <TrialBalance />
          </TabsContent>
          
          <TabsContent value="journal">
            <JournalViewer />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
