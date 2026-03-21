function WorkerLoading() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800"
          />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800"
          />
        ))}
      </div>
    </div>
  )
}

export { WorkerLoading as default }
