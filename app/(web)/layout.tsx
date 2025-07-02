import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-sans">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
