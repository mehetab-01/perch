function PublicLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="text-2xl font-bold tracking-tight font-display text-foreground">
        perch
      </div>
      <div className="flex gap-1">
        <span className="size-2 animate-bounce rounded-full bg-perch-primary-500 [animation-delay:0ms]" />
        <span className="size-2 animate-bounce rounded-full bg-perch-primary-500 [animation-delay:150ms]" />
        <span className="size-2 animate-bounce rounded-full bg-perch-primary-500 [animation-delay:300ms]" />
      </div>
    </div>
  )
}

export { PublicLoading as default }
