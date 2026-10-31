import { AdminAuthProvider } from "@/components/admin-auth";

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
