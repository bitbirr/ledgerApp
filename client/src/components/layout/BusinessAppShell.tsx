import { LedgerLayout } from './LedgerLayout';

interface BusinessAppShellProps {
  children: React.ReactNode;
}

export function BusinessAppShell({ children }: BusinessAppShellProps) {
  return (
    <LedgerLayout>
      {children}
    </LedgerLayout>
  );
}