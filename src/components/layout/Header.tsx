import Link from "next/link";
import { SearchBar } from "./SearchBar";

function ClawStackLogo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Logo mark: OpenClaw claw + shield */}
      <div className="relative flex h-9 w-9 items-center justify-center">
        {/* Shield background */}
        <svg className="h-9 w-9 text-primary" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" opacity="0.15"/>
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        {/* Claw icon inside shield */}
        <svg className="absolute h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 2C6.24 2 4 4.24 4 7v2.5c0 1.19.53 2.27 1.36 3A3.5 3.5 0 004 15.5V17c0 2.76 2.24 5 5 5h6c2.76 0 5-2.24 5-5v-1.5c0-1.19-.53-2.27-1.36-3A3.5 3.5 0 0020 9.5V7c0-2.76-2.24-5-5-5H9zm-3 5c0-1.66 1.34-3 3-3h1v3.5C10 8.88 8.88 10 7.5 10H6V7zm12 0v3h-1.5C15.12 10 14 8.88 14 7.5V4h1c1.66 0 3 1.34 3 3z"/>
        </svg>
      </div>
      {/* Wordmark */}
      <div className="flex flex-col">
        <span className="text-lg font-bold leading-tight text-foreground">
          Claw<span className="text-primary">Stack</span>
        </span>
        <span className="hidden text-[10px] leading-tight text-muted sm:block">
          for OpenClaw
        </span>
      </div>
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <ClawStackLogo />
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
