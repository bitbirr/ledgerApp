import LedgerLayout from "./LedgerLayout";
export default function BusinessAppShell({ children }: { children: React.ReactNode }) {
  return <LedgerLayout>{children}</LedgerLayout>;
}
