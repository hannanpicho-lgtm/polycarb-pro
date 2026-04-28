import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Large 404 */}
        <div className="mb-8">
          <h1 className="text-[120px] md:text-[200px] font-bold text-white/20 leading-none">404</h1>
        </div>

        {/* Content */}
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
          The page you're looking for doesn't exist. It might have been moved or deleted, or the
          link might be incorrect.
        </p>

        {/* Helpful Links */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 mb-8">
          <h3 className="text-white text-lg font-semibold mb-6">What you can do:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold">
              <Link href="/">← Return Home</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-blue-500 text-white hover:bg-blue-600 font-bold"
            >
              <Link href="/products">Browse Products →</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-blue-500 text-white hover:bg-blue-600 font-bold"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-blue-500 text-white hover:bg-blue-600 font-bold"
            >
              <Link href="/resources">View Resources</Link>
            </Button>
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="text-blue-100">
          <p className="mb-2">Or try searching for what you need:</p>
          <form action="/products" method="GET" className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              name="search"
              placeholder="Search products..."
              className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="bg-white text-blue-600 font-bold px-6 py-2 rounded-lg hover:bg-blue-50 transition"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
