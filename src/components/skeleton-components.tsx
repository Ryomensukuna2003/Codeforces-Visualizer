import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "./ui/skeleton";


export const UserCardSkeleton = () => (
  <Card className="border-0 px-6">
    <CardContent className="p-4">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton className="h-32 w-32 rounded-full shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="hidden sm:flex flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="border-x-0 border-y-0 border-l-4 border-muted bg-muted/20 rounded-r-lg rounded-l-none"
          >
            <CardHeader className="p-3 space-y-0 pb-2">
              <Skeleton className="h-3 w-20" />
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <Skeleton className="h-6 w-10" />
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const UpcomingContestSkeleton = () => (
  <Card className="border-0 h-full">
    <CardHeader>
      <CardTitle className="text-lg">
        <Skeleton className="h-6 w-40" />
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </CardContent>
  </Card>
);

export const MainContentSkeleton = () => (
  <div className="border-y border-neutral-600 p-6">
    <Skeleton className="h-48 w-full rounded-lg" />
  </div>
);

const ChartCardSkeleton = () => (
  <Card className="border-0 border-l border-neutral-600">
    <CardHeader className="border-b p-4">
      <Skeleton className="h-5 w-32 mb-1" />
      <Skeleton className="h-4 w-48" />
    </CardHeader>
    <CardContent className="p-4">
      <Skeleton className="h-64 w-full rounded" />
    </CardContent>
  </Card>
);

export const SubmissionsSkeleton = () => (
  <Card className="w-full max-w-full border-0 border-y border-neutral-600 px-6">
    <CardHeader>
      <CardTitle className="text-lg md:text-xl">Recent submissions</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col sm:flex-row gap-4">
        <ul className="flex-1 min-w-0 space-y-2">
          {[...Array(5)].map((_, i) => (
            <li key={i}>
              <Skeleton className="h-8 w-full max-w-md" />
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-3 gap-2 sm:w-48">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded" />
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

const SkeletonFragment = () => {
  return (
    <>
      <div className="border-neutral-600 bg-card">
        <div className="flex flex-col border-b border-neutral-600 md:flex-row">
          <CardContent className="min-w-0 flex-1 p-0 border-r border-neutral-600">
            <UserCardSkeleton />
          </CardContent>
          <CardContent className="min-w-0 flex-1 p-0">
            <UpcomingContestSkeleton />
          </CardContent>
        </div>

        <MainContentSkeleton />

        <div className="flex flex-col border-y border-neutral-600 md:flex-row">
          <CardContent className="min-w-0 flex-1 p-0">
            <ChartCardSkeleton />
          </CardContent>
          <CardContent className="min-w-0 flex-1 p-0">
            <ChartCardSkeleton />
          </CardContent>
        </div>

        <SubmissionsSkeleton />
      </div>
    </>
  );
};

export default SkeletonFragment;
