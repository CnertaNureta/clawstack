import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <span className="text-lg font-bold text-foreground">
                Claw<span className="text-primary">Stack</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted">
              The trusted way to discover and share OpenClaw skills.
            </p>
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
                <Link href="/collections" className="text-sm text-muted hover:text-foreground">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="text-sm text-muted hover:text-foreground">
                  Skill Quiz
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
            <h3 className="text-sm font-semibold text-foreground">About</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="https://github.com/openclaw/openclaw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted hover:text-foreground"
                >
                  OpenClaw
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
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted">
          ClawStack is an independent community project. Not affiliated with OpenClaw.
        </div>
      </div>
    </footer>
  );
}
