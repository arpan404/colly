import { ProtectedLayout } from "@/components/protected-layout";

export default function ProtectedRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}