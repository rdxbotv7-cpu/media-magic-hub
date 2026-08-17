export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--color-primary) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          animation: "rdx-grid 6s linear infinite",
          maskImage: "radial-gradient(circle at 50% 20%, black, transparent 75%)",
        }}
      />
      <div
        className="rdx-float absolute -top-40 -left-24 h-[32rem] w-[32rem] rounded-full blur-3xl opacity-40"
        style={{ background: "var(--gradient-flame)" }}
      />
      <div
        className="rdx-float absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-30"
        style={{ background: "var(--gradient-flame)", animationDelay: "1.5s" }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 opacity-40"
        style={{ animation: "rdx-spin-slow 40s linear infinite" }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/20 opacity-40"
        style={{ animation: "rdx-spin-slow 26s linear infinite reverse" }}
      />
    </div>
  );
}