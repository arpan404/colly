import { ProtectedLayout } from "@/components/protected-layout";
import { PageLayout } from "@/components/PageLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout>
      <PageLayout>{children}</PageLayout>
    </ProtectedLayout>
  );
}