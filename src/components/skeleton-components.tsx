import { Skeleton } from "./ui/skeleton";

/**
 * Loading state for the dossier overview — the same rules, strips and captions
 * as the real page, so nothing shifts when the data lands.
 *
 * The verdict slot takes a real node (the quote) rather than being covered by a
 * blurred overlay: the skeleton is the shape of the page, so the one thing worth
 * reading while it loads belongs inside it.
 */

const Bar = ({ className }: { className?: string }) => <Skeleton className={className} />;

const SkeletonFragment = ({ verdict }: { verdict?: React.ReactNode }) => (
  <>
    {/* Masthead */}
    <div className="border-b border-rule px-5 pb-7 pt-8">
      <Bar className="mb-4 h-3 w-60" />
      <Bar className="h-8 w-[380px] max-w-full sm:h-14" />
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Bar className="h-5 w-20" />
        <Bar className="h-4 w-32" />
        <Bar className="h-4 w-24" />
      </div>
      <div className="mt-7 border-l-2 border-hair py-5 pl-6 pr-5">
        {verdict ?? (
          <>
            <Bar className="mb-3 h-3 w-24" />
            <Bar className="mb-2.5 h-5 w-full max-w-[640px]" />
            <Bar className="h-5 w-2/3 max-w-[440px]" />
          </>
        )}
      </div>
    </div>

    {/* Stat strip */}
    <div className="flex flex-wrap items-stretch border-b border-rule">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="min-w-[150px] flex-1 px-5 py-4">
          <Bar className="mb-3 h-2.5 w-20" />
          <Bar className="h-6 w-16" />
        </div>
      ))}
    </div>

    {/* Rating curve + stand meters */}
    <div className="flex flex-col border-b border-rule xl:flex-row">
      <div className="min-w-0 flex-1 xl:border-r xl:border-rule">
        <div className="flex min-h-[44px] items-center justify-between border-b border-hair px-5 py-2.5">
          <Bar className="h-3 w-52" />
          <Bar className="h-3 w-24" />
        </div>
        <Bar className="h-[280px] w-full" />
      </div>
      <div className="shrink-0 border-t border-rule xl:w-[392px] xl:border-t-0">
        <div className="flex min-h-[44px] items-center border-b border-hair px-5 py-2.5">
          <Bar className="h-3 w-36" />
        </div>
        <div className="px-5 pb-4 pt-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Bar className="h-3 w-[74px] shrink-0" />
              <Bar className="h-4 flex-1" />
              <Bar className="h-3 w-7 shrink-0" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-hair px-5 py-3">
          <Bar className="h-3 w-24" />
          <Bar className="h-3 w-28" />
        </div>
      </div>
    </div>

    {/* Coach */}
    <div>
      <div className="flex min-h-[44px] items-center justify-between border-b border-hair px-5 py-2.5">
        <Bar className="h-3 w-48" />
        <Bar className="h-3 w-28" />
      </div>
      <div className="px-5 pb-6 pt-4">
        <Bar className="h-9 w-56" />
      </div>
    </div>
  </>
);

export default SkeletonFragment;
