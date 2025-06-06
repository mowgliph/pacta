import { useState, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import type { CommandMenuGroup, CommandMenuItem } from './command-menu';

export const useCommandMenu = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(0);

  useHotkeys('cmd+k,ctrl+k', () => {
    setOpen(true);
    setQuery('');
    setSelectedIndex(0);
    setSelectedGroup(0);
  });

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, groups: CommandMenuGroup[]) => {
      const currentGroup = groups[selectedGroup];
      const items = currentGroup.items;

      switch (event.key) {
        case 'Escape':
          setOpen(false);
          break;

        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev === 0 ? items.length - 1 : prev - 1
          );
          break;

        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev === items.length - 1 ? 0 : prev + 1
          );
          break;

        case 'Tab':
          event.preventDefault();
          setSelectedGroup((prev) =>
            prev === groups.length - 1 ? 0 : prev + 1
          );
          setSelectedIndex(0);
          break;

        case 'Enter':
          event.preventDefault();
          const selectedItem = items[selectedIndex];
          if (selectedItem && !selectedItem.disabled) {
            selectedItem.action();
            setOpen(false);
          }
          break;

        case 'Backspace':
          if (query.length > 0) {
            setQuery(query.slice(0, -1));
          }
          break;

        default:
          if (event.key.length === 1) {
            setQuery(query + event.key);
          }
      }
    },
    [open, query, selectedIndex, selectedGroup]
  );

  // Filtrar items basado en la búsqueda
  const filterItems = useCallback(
    (items: CommandMenuItem[], query: string) => {
      const lowerQuery = query.toLowerCase();
      return items.filter(item =>
        item.label.toLowerCase().includes(lowerQuery) ||
        (item.shortcut?.some(shortcut => shortcut.toLowerCase().includes(lowerQuery)) ?? false)
      );
    },
    []
  );

  return {
    open,
    setOpen,
    query,
    setQuery,
    selectedGroup,
    setSelectedGroup,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
    filterItems,
  };
}
