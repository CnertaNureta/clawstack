import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative flex h-8 w-8 items-center justify-center">
                <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" opacity="0.15"/>
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <svg className="absolute h-3.5 w-3.5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 2C6.24 2 4 4.24 4 7v2.5c0 1.19.53 2.27 1.36 3A3.5 3.5 0 004 15.5V17c0 2.76 2.24 5 5 5h6c2.76 0 5-2.24 5-5v-1.5c0-1.19-.53-2.27-1.36-3A3.5 3.5 0 0020 9.5V7c0-2.76-2.24-5-5-5H9zm-3 5c0-1.66 1.34-3 3-3h1v3.5C10 8.88 8.88 10 7.5 10H6V7zm12 0v3h-1.5C15.12 10 14 8.88 14 7.5V4h1c1.66 0 3 1.34 3 3z"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-foreground">
                Claw<span className="text-primary">Stack</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted">
              The trusted way to discover and share OpenClaw skills.
            </p>
            {/* Powered by OpenClaw badge */}
            <a
              href="https://openclaw.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted hover:border-red-300 hover:text-foreground"
            >
              <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 2C6.24 2 4 4.24 4 7v2.5c0 1.19.53 2.27 1.36 3A3.5 3.5 0 004 15.5V17c0 2.76 2.24 5 5 5h6c2.76 0 5-2.24 5-5v-1.5c0-1.19-.53-2.27-1.36-3A3.5 3.5 0 0020 9.5V7c0-2.76-2.24-5-5-5H9zm-3 5c0-1.66 1.34-3 3-3h1v3.5C10 8.88 8.88 10 7.5 10H6V7zm12 0v3h-1.5C15.12 10 14 8.88 14 7.5V4h1c1.66 0 3 1.34 3 3z"/>
              </svg>
              Built for the OpenClaw ecosystem
            </a>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Discover</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/skills" className="text-sm text-muted hover:text-foreground">
                  All Skills
                </Link>
              </li>
              <li>
                <Link href="/trending" className="text-sm text-muted hover:text-foreground">
                  Trending
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-sm text-muted hover:text-foreground">
                  Security Report
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-sm text-muted hover:text-foreground">
                  Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Categories</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/skills?category=communication" className="text-sm text-muted hover:text-foreground">
                  Communication
                </Link>
              </li>
              <li>
                <Link href="/skills?category=dev-tools" className="text-sm text-muted hover:text-foreground">
                  Dev Tools
                </Link>
              </li>
              <li>
                <Link href="/skills?category=productivity" className="text-sm text-muted hover:text-foreground">
                  Productivity
                </Link>
              </li>
              <li>
                <Link href="/skills?category=ai-models" className="text-sm text-muted hover:text-foreground">
                  AI Models
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">OpenClaw</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="https://openclaw.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted hover:text-foreground"
                >
                  OpenClaw Official
                </a>
              </li>
              <li>
                <a
                  href="https://clawhub.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted hover:text-foreground"
                >
                  ClawHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/openclaw/openclaw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted hover:text-foreground"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-8 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted">
            ClawStack is an independent community project. Not affiliated with OpenClaw.
          </p>
          <a
            href="https://openclaw.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground"
          >
            Powered by
            <svg className="h-3.5 w-3.5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 2C6.24 2 4 4.24 4 7v2.5c0 1.19.53 2.27 1.36 3A3.5 3.5 0 004 15.5V17c0 2.76 2.24 5 5 5h6c2.76 0 5-2.24 5-5v-1.5c0-1.19-.53-2.27-1.36-3A3.5 3.5 0 0020 9.5V7c0-2.76-2.24-5-5-5H9zm-3 5c0-1.66 1.34-3 3-3h1v3.5C10 8.88 8.88 10 7.5 10H6V7zm12 0v3h-1.5C15.12 10 14 8.88 14 7.5V4h1c1.66 0 3 1.34 3 3z"/>
            </svg>
            <span className="font-medium">OpenClaw</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
