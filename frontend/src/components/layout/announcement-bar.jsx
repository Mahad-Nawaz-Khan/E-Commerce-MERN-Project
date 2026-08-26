export function AnnouncementBar() {
  return (
    <div className="bg-[var(--color-content-inv)] text-[var(--color-paper)] text-xs sm:text-sm">
      <div className="mx-auto flex max-w-[1280px] items-center justify-center gap-2 px-4 py-2 text-center">
        <span className="font-display font-semibold text-[var(--color-primary)]">Summer Drop</span>
        <span className="opacity-80">— up to 50% off selected tech. Ends soon.</span>
      </div>
    </div>
  )
}
