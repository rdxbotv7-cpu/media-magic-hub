import logo from "@/assets/rdx-logo.png";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="/" className="flex items-center gap-2.5">
          <img
            src={logo}
            alt="RDX Downloaders logo"
            width={40}
            height={40}
            className="h-9 w-9 drop-shadow-[0_0_12px_oklch(0.63_0.24_26/0.6)]"
          />
          <span className="font-display text-xl font-black tracking-wide">
            <span className="rdx-flame-text">RDX</span>
            <span className="ml-1 text-foreground">Downloaders</span>
          </span>
        </a>
        <div className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground sm:flex">
          <a href="#downloader" className="transition-colors hover:text-primary">
            Downloader
          </a>
          <a href="#features" className="transition-colors hover:text-primary">
            Features
          </a>
          <a href="#how" className="transition-colors hover:text-primary">
            How it works
          </a>
        </div>
      </div>
    </nav>
  );
}
