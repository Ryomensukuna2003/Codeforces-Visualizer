// components/skeleton-components.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "./ui/skeleton";
export const UserCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center gap-4">
      <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse" />
      <div className="space-y-2">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-12 w-12 rounded-full" />
    </CardContent>

    <CardContent className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

export const ChartSkeleton = () => (
  <>
    <div className="h-64 bg-gray-200 rounded animate-pulse" />
    <div className="h-64 bg-gray-200 rounded animate-pulse" />
  </>
);

export const SubmissionsSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle>Recent submissions</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {[...Array(5)].map((_, index) => (
          <li key={index} className="flex justify-between items-center">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);


const SkeletonFragment = () => {
  return (
    <div className="mx-2 p-4 space-y-6">
      <UserCardSkeleton />
      <ChartSkeleton />
      <SubmissionsSkeleton />
    </div>
  );
}

export default SkeletonFragment;
