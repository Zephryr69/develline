import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { getCurrentUser } from "@/server/auth";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <>
      <Navbar userName={user?.name ?? null} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
