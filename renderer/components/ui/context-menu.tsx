import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ContextMenuAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface ContextMenuState {
  open: boolean;
  x: number;
  y: number;
  actions: ContextMenuAction[];
}

interface ContextMenuContextProps {
  state: ContextMenuState;
  openContextMenu: (actions: ContextMenuAction[], x: number, y: number) => void;
  closeContextMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextProps | undefined>(
  undefined
);

export const ContextMenuProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ContextMenuState>({
    open: false,
    x: 0,
    y: 0,
    actions: [],
  });

  const openContextMenu = (
    actions: ContextMenuAction[],
    x: number,
    y: number
  ) => {
    setState({ open: true, x, y, actions });
  };

  const closeContextMenu = () => setState((s) => ({ ...s, open: false }));

  return (
    <ContextMenuContext.Provider
      value={{ state, openContextMenu, closeContextMenu }}
    >
      {children}
      <GlobalContextMenu />
    </ContextMenuContext.Provider>
  );
};

export function useContextMenu() {
  const ctx = useContext(ContextMenuContext);
  if (!ctx)
    throw new Error("useContextMenu debe usarse dentro de ContextMenuProvider");
  return ctx;
}

const GlobalContextMenu = () => {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) return null;
  const { state, closeContextMenu } = ctx;
  if (!state.open) return null;

  return (
    <div
      className="fixed z-50 bg-white border border-[#D6E8EE] rounded shadow-lg min-w-[180px] py-1 animate-fade-in"
      style={{ top: state.y, left: state.x }}
      tabIndex={0}
      role="menu"
      onBlur={closeContextMenu}
      onKeyDown={(e) => e.key === "Escape" && closeContextMenu()}
    >
      {state.actions.map((action, i) => (
        <button
          key={i}
          className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-[#D6E8EE] focus:bg-[#D6E8EE] focus:outline-none ${
            action.disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => {
            if (!action.disabled) {
              action.onClick();
              closeContextMenu();
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
  );
};
