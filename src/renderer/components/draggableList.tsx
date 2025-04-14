import React from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable, 
  arrayMove 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Item {
  id: string | number;
  name: string;
}

interface SortableItemProps {
  id: string | number;
  children: React.ReactNode;
}

interface DraggableListProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="border p-2 mb-2 rounded"
    >
      {children}
    </div>
  );
};

const DraggableList: React.FC<DraggableListProps> = ({ items, setItems }) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map(item => (
          <SortableItem key={item.id} id={item.id}>
            {item.name}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
};

export default DraggableList;