import React from 'react';
import { VList } from 'virtua';
import { cn } from "@/renderer/lib/utils";

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  itemHeight?: number;
  className?: string;
  overscan?: number;
}

function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight = 50,
  className,
  overscan = 5
}: VirtualizedListProps<T>) {
  return (
    <div className={cn("w-full h-full overflow-auto", className)}>
      <VList
        count={items.length}
        overscan={overscan}
        itemSize={itemHeight}
        children={(index: number) => {
          const item = items[index];
          return renderItem(item, index);
        }}
      />
    </div>
  );
}

export default VirtualizedList;