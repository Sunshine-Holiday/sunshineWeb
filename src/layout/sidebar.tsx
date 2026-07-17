import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  FileImage,
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
    name: "Brochures",
    href: "/admin/brochures",
    icon: FileImage,
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
  onNavigate: () => void;
}

function NavLink({ name, href, icon: Icon, isActive, onNavigate }: NavLinkProps) {
  return (
    <Link
      to={href}
      onClick={onNavigate}
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

function NavList({
  onNavigate,
}: {
  onNavigate: () => void;
}) {
  const location = useLocation();

  return (
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
            onNavigate={onNavigate}
          />
        );
      })}
    </nav>
  );
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, setIsOpen]);

  const close = () => setIsOpen(false);

  const desktopAside = (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <SidebarHeader />
      <div className="flex-1 overflow-y-auto p-3">
        <NavList onNavigate={() => undefined} />
      </div>
    </aside>
  );

  // Portal mobile drawer to body so it isn't clipped by layout overflow / stacking
  const mobileDrawer =
    mounted &&
    createPortal(
      <>
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={close}
          className={cn(
            "fixed inset-0 z-[80] bg-black/50 transition-opacity duration-300 lg:hidden",
            isOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
        />

        {/* Drawer panel — above site navbar (z-50) */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-[90] flex w-[min(18rem,85vw)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
          aria-hidden={!isOpen}
        >
          <SidebarHeader onClose={close} />
          <div className="flex-1 overflow-y-auto overscroll-contain p-3">
            <NavList onNavigate={close} />
          </div>
        </aside>
      </>,
      document.body,
    );

  return (
    <>
      {desktopAside}
      {mobileDrawer}
    </>
  );
}

/** Sticky mobile bar so the admin menu is always reachable */
export function AdminMobileBar({
  onOpen,
}: {
  onOpen: () => void;
}) {
  const location = useLocation();
  const active = navigationItems.find(
    (item) =>
      location.pathname === item.href ||
      (item.href !== "/admin/dashboard" &&
        location.pathname.startsWith(item.href)),
  );

  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-white/90 lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm shadow-orange-200 active:scale-95"
        aria-label="Open admin menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-600">
          Admin
        </p>
        <p className="truncate text-sm font-semibold text-slate-900">
          {active?.name ?? "Menu"}
        </p>
      </div>
    </div>
  );
}
