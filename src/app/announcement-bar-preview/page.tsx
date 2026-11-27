export default function AnnouncementBarPreviewPage() {
  return (
    <section
      id="preview-details"
      data-preview-page-key="announcement_bar_preview"
      className="lux-section"
    >
      <div className="lux-container max-w-3xl text-center">
        <p
          data-preview-static="announcement-preview-eyebrow"
          className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]"
        >
          Seasonal Travel Notice Preview
        </p>
        <h1
          data-preview-static="announcement-preview-heading"
          className="font-editorial m-0 mb-5 text-4xl font-medium leading-[1.12] text-[var(--lux-text)] sm:text-5xl"
        >
          Refined Announcements for Every Season.
        </h1>
        <p
          data-preview-static="announcement-preview-description"
          className="mx-auto max-w-xl text-base leading-relaxed text-[var(--lux-text-muted)]"
        >
          Use the ribbon above in Fivora to highlight dry-season travel windows, east or south coast recommendations, or bespoke planning notices.
        </p>
      </div>
    </section>
  );
}
