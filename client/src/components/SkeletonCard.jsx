function Bone({ className = '' }) {
  return (
    <div className={`animate-pulse rounded bg-slate-800 ${className}`} />
  )
}

export default function SkeletonCard() {
  return (
    <div className="rounded-xl border border-edge-subtle bg-pitch-900 p-4 space-y-3">
      {/* Header row: league badge + time */}
      <div className="flex items-center justify-between">
        <Bone className="h-4 w-10" />
        <Bone className="h-4 w-16" />
      </div>

      {/* Away team row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bone className="h-5 w-5 rounded-full" />
          <Bone className="h-4 w-24" />
        </div>
        <Bone className="h-5 w-6" />
      </div>

      {/* Home team row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bone className="h-5 w-5 rounded-full" />
          <Bone className="h-4 w-28" />
        </div>
        <Bone className="h-5 w-6" />
      </div>

      {/* Status row */}
      <div className="flex items-center gap-2 pt-1">
        <Bone className="h-3 w-3 rounded-full" />
        <Bone className="h-3 w-20" />
      </div>
    </div>
  )
}
