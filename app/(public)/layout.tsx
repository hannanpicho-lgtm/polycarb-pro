import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

// Public site layout — Navbar + Footer only for public-facing pages.
// Admin, portal, distributor and print routes live outside this group
// and therefore never inherit these components.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
