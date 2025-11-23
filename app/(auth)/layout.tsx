import { AuthLayout } from "@/components/auth-layout";

export default function AuthRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}