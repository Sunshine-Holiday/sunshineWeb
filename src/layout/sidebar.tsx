import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  MapPin,
  CheckSquare,
  Image,
  Menu,
  ShieldCheck,
  ReceiptText,
  Navigation,
  X,
  Layers,
} from "lucide-react";

function SidebarHeader({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-600">
          Sunshine
        </p>
        <h2 className="text-base font-bold text-slate-900">Admin Panel</h2>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

const navigationItems = [
  {
    name: "Home Layout",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Trips",
    href: "/admin/trips",
    icon: MapPin,
  },
  {
    name: "Pickup Locations",
    href: "/admin/pickup-locations",
    icon: Navigation,
  },
  {
    name: "Special Sections",
    href: "/admin/special_sections",
    icon: Layers,
  },
  {
    name: "Booked",
    href: "/admin/booked",
    icon: CheckSquare,
  },
  {
    name: "Gallery",
    href: "/admin/gallery",
    icon: Image,
  },
  {
    name: "Terms & Conditions",
    href: "/admin/term-and-condition",
    icon: ShieldCheck,
  },
  {
    name: "About",
    href: "/admin/about",
    icon: ReceiptText,
  },
  {
    name: "Privacy Policy",
    href: "/admin/privacy-policy",
    icon: ReceiptText,
  },
];

interface NavLinkProps {
  name: string;
  href: string;
  icon: React.ElementType;
  isActive: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function NavLink({ name, href, icon: Icon, isActive, setIsOpen }: NavLinkProps) {
  return (
    <Link
      to={href}
      onClick={() => setIsOpen(false)}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
          : "text-slate-600 hover:bg-orange-50 hover:text-orange-700",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{name}</span>
    </Link>
  );
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile floating menu button */}
      <button
        type="button"
        className="fixed bottom-5 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-300 lg:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Open admin menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close sidebar"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "z-40 flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white",
          // Desktop: part of flex row, full height of admin shell
          "lg:static lg:translate-x-0",
          // Mobile: drawer
          "fixed inset-y-0 left-0 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <SidebarHeader onClose={() => setIsOpen(false)} />

        <div className="flex-1 overflow-y-auto p-3">
          <nav className="flex flex-col gap-1">
            {navigationItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/admin/dashboard" &&
                  location.pathname.startsWith(item.href));
              return (
                <NavLink
                  key={item.name}
                  {...item}
                  isActive={isActive}
                  setIsOpen={setIsOpen}
                />
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
