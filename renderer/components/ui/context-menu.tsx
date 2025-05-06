import React, { useRef, useState, useEffect } from "react";

export interface ContextMenuAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface ContextMenuProps {
  actions: ContextMenuAction[];
  children: React.ReactNode;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  actions,
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };
    if (visible) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [visible]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
    setVisible(true);
  };

  return (
    <div style={{ display: "inline-block" }} onContextMenu={handleContextMenu}>
      {children}
      {visible && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white border border-[#D6E8EE] rounded shadow-lg min-w-[180px] py-1 animate-fade-in"
          style={{ left: pos.x, top: pos.y }}
          role="menu"
        >
          {actions.map((action, idx) => (
            <button
              key={idx}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-[#D6E8EE] focus:bg-[#D6E8EE] focus:outline-none ${
                action.disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => {
                if (!action.disabled) {
                  action.onClick();
                  setVisible(false);
                }
              }}
              disabled={action.disabled}
              tabIndex={0}
              role="menuitem"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
