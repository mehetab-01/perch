function AdminLoading() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-100 dark:bg-stone-800" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800" />
    </div>
  )
}

export { AdminLoading as default }
