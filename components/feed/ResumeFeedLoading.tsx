import { Skeleton } from '@/components/ui/skeleton';

export function ResumeFeedLoading() {
  return (
    <div className="flex flex-col gap-5">
      {[0, 1].map((item) => (
        <div key={item} className="overflow-hidden rounded-xl border p-4">
          <Skeleton className="mb-4 h-9 w-44" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="mt-4 h-5 w-52" />
        </div>
      ))}
    </div>
  );
}
