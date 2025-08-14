import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Wallet, Calculator, MoreHorizontal } from 'lucide-react';

export function BottomActionBar() {
  const { setCurrentScreen } = useAppStore();

  const actions = [
    {
      icon: ArrowLeftRight,
      label: 'Transfer',
      action: () => console.log('Transfer'), // TODO: Implement transfer
      testId: 'button-transfer'
    },
    {
      icon: Wallet,
      label: 'Cash Book',
      action: () => setCurrentScreen('cashbook'),
      testId: 'button-cashbook'
    },
    {
      icon: Calculator,
      label: 'Calculator',
      action: () => console.log('Calculator'), // TODO: Implement calculator
      testId: 'button-calculator'
    },
    {
      icon: MoreHorizontal,
      label: 'More',
      action: () => console.log('More options'), // TODO: Implement more options
      testId: 'button-more-options'
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-20">
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="ghost"
              className="flex flex-col items-center py-2 px-3 h-auto gap-1"
              onClick={action.action}
              data-testid={action.testId}
            >
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-xs text-foreground">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
