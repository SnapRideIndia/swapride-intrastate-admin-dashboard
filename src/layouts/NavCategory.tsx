import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  permission: string | null;
}

interface NavCategoryProps {
  id: string;
  label: string;
  icon: React.ElementType;
  items: NavItem[];
  isExpanded: boolean;
  onToggle: (id: string) => void;
  collapsed: boolean; // sidebar collapsed state
  hasPermission: (permission: string | null) => boolean;
}

export function NavCategory({
  id,
  label,
  icon: Icon,
  items,
  isExpanded,
  onToggle,
  collapsed,
  hasPermission,
}: NavCategoryProps) {
  const location = useLocation();

  // Filter items by permission
  const filteredItems = items.filter((item) => !item.permission || hasPermission(item.permission));

  // Don't render if no items after filtering
  if (filteredItems.length === 0) return null;

  const toggleCategory = () => {
    onToggle(id);
  };

  // In collapsed sidebar mode, show tooltip
  if (collapsed) {
    return (
      <div className="relative group">
        <button className={cn("nav-item nav-item-inactive justify-center px-2 w-full")} title={label}>
          <Icon className="h-5 w-5" />
        </button>
        {/* Flyout menu on hover - simplified for now */}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Category Header */}
      <button
        onClick={toggleCategory}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors",
          "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span>{label}</span>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform duration-200", isExpanded ? "rotate-0" : "-rotate-90")}
        />
      </button>

      {/* Category Items */}
      {isExpanded && (
        <div className="ml-3 pl-3 border-l border-sidebar-border space-y-1">
          {filteredItems.map((item) => {
            const isActive =
              location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href + "/"));
            const ItemIcon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn("nav-item", isActive ? "nav-item-active" : "nav-item-inactive")}
              >
                <ItemIcon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
