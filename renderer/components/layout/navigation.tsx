import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { NAVIGATION_ITEMS, Route } from "../../lib/routes";
import { useNavigation } from "../../hooks/use-navigation";
import { Icons } from "../ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";

interface NavigationItemProps {
  item: Route;
  isCollapsed: boolean;
}

const NavigationItem = ({ item, isCollapsed }: NavigationItemProps) => {
  const { currentPath, canAccess } = useNavigation();
  const [isOpen, setIsOpen] = useState(false);

  // Si el usuario no tiene acceso, no renderizar el ítem
  if (!canAccess(item.path, item.roles)) {
    return null;
  }

  const isActive = currentPath.startsWith(item.path);
  const Icon = item.icon ? Icons[item.icon] : Icons.Circle;

  // Si tiene subítems, renderizar como menú desplegable
  if (item.children?.length) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
            isActive ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
          )}
        >
          <Icon className="h-5 w-5" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <Icons.ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "transform rotate-180"
                )}
              />
            </>
          )}
        </button>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pl-4 mt-1 space-y-1"
          >
            {item.children.map((child) => (
              <NavigationItem
                key={child.path}
                item={child}
                isCollapsed={isCollapsed}
              />
            ))}
          </motion.div>
        )}
      </div>
    );
  }

  // Si es un ítem simple, renderizar como enlace
  const content = (
    <Link
      href={item.path}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
        isActive ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
      )}
    >
      <Icon className="h-5 w-5" />
      {!isCollapsed && <span>{item.label}</span>}
    </Link>
  );

  // Si está colapsado, envolver en tooltip
  return isCollapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  ) : (
    content
  );
};

export function Navigation() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <nav className="relative h-full w-full">
      <div className="space-y-1 py-2">
        {NAVIGATION_ITEMS.map((item) => (
          <NavigationItem
            key={item.path}
            item={item}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute bottom-4 right-4 p-2 rounded-md hover:bg-primary/5"
      >
        <Icons.PanelLeftClose
          className={cn(
            "h-5 w-5 transition-transform",
            isCollapsed && "transform rotate-180"
          )}
        />
      </button>
    </nav>
  );
} 