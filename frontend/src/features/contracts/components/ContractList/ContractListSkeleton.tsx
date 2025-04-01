import { Skeleton } from '@/components/ui/skeleton'

type ContractListSkeletonProps = {
  count?: number
}

export function ContractListSkeleton({ count = 6 }: ContractListSkeletonProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}