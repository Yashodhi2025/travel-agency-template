import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="lux-section">
      <div className="lux-container flex min-h-[55vh] max-w-xl flex-col items-center justify-center text-center">
        <span
          data-preview-static="not-found-eyebrow"
          className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]"
        >
          404 · Page Not Found
        </span>
        <h1
          data-preview-static="not-found-heading"
          className="font-editorial m-0 mb-4 text-4xl font-medium text-[var(--lux-text)] sm:text-5xl"
        >
          This Path Leads Beyond the Map.
        </h1>
        <p
          data-preview-static="not-found-body"
          className="m-0 mb-8 text-sm leading-relaxed text-[var(--lux-text-muted)]"
        >
          The page you are looking for may have moved or no longer exists. Return to the homepage to continue exploring curated journeys.
        </p>
        <Link
          href="/"
          data-preview-static="not-found-home-link"
          className="lux-btn-primary"
        >
          Return Home
        </Link>
      </div>
    </section>
  );
}
