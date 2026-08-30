import { cn } from "@/lib/utils"

/**
 * A loading placeholder the size the caller asked for.
 *
 * The old version drew an inline `<span>` sized by its line-height, so every
 * `h-12` / `h-[280px]` bar rendered ~14px tall no matter what the caller passed,
 * and the inner span carried a `rounded-md` the caller could never reach.
 * Radius is 0 everywhere in this design, so there is none.
 */
// `bg-track` rather than `bg-muted`: muted is 96.1% on a 100% card in light
// mode, which made the whole loading state invisible there.
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-track", className)} />
)

const SVGSkeleton = ({ className }: { className?: string }) => (
  <svg className={cn("animate-pulse bg-track", className)} />
)

export { Skeleton, SVGSkeleton }
