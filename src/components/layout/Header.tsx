import Link from "next/link";
import { SearchBar } from "./SearchBar";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          <span className="text-xl font-bold text-foreground">
            Claw<span className="text-primary">Stack</span>
          </span>
        </Link>

        {/* Search - hidden on mobile, shown on sm+ */}
        <div className="hidden flex-1 px-8 sm:block md:max-w-md lg:max-w-lg">
          <SearchBar />
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-4">
          <Link
            href="/skills"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-card-hover hover:text-foreground"
          >
            Skills
          </Link>
          <Link
            href="/trending"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-card-hover hover:text-foreground"
          >
            Trending
          </Link>
          <Link
            href="/security"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 sm:block"
          >
            Security
          </Link>
          <Link
            href="/collections"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-card-hover hover:text-foreground sm:block"
          >
            Collections
          </Link>
          <a
            href="/api/auth/callback?provider=github"
            className="ml-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Sign In
          </a>
        </nav>
      </div>

      {/* Mobile search */}
      <div className="border-t border-border px-4 py-2 sm:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
