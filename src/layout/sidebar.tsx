import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils"; // Assuming cn is a utility for conditional classNames

// Importing Icons from lucide-react
import {
  LayoutDashboard,
  Users,
  MapPin,
  CheckSquare,
  Image,
  FileText,
  Menu,
  ShieldCheck,
  ReceiptText,
  CopyX,
} from "lucide-react"; // Updated icons

// SidebarHeader Component
function SidebarHeader() {
  return <div className="p-4 text-xl font-bold">Admin Panel</div>;
}

// Navigation items (Admin Routes)
const navigationItems = [
  {
    name: "Home Layout",
    href: "/admin/dashboard",
    icon: LayoutDashboard, // Represents the dashboard
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users, // Represents user management
  },
  {
    name: "Trips",
    href: "/admin/trips",
    icon: MapPin, // Represents trips or destinations
  },
  {
    name: "special-sections",
    href: "/admin/special_sections",
    icon: MapPin, // Represents trips or destinations
  },
  {
    name: "Booked",
    href: "/admin/booked",
    icon: CheckSquare, // Represents booked items
  },

  {
    name: "Gallery",
    href: "/admin/gallery",
    icon: Image, // Represents a photo gallery
  },
  // {
  //   name: "Blogs",
  //   href: "/admin/blog",
  //   icon: FileText, // Represents blog posts or text content
  // },
  {
    name: "Terms and Condition",
    href: "/admin/term-and-condition",
    icon: ShieldCheck, // terms 
  },
  {
    name: "About",
    href: "/admin/about",
    icon: ReceiptText, // about 
  },
  {
    name: "privacy-policy",
    href: "/admin/privacy-policy",
    icon: ReceiptText, // about 
  },
];

// NavLink Component
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
      onClick={() => setIsOpen(false)} // Close the sidebar on link click
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
      )}
    >
      <Icon className="h-4 w-4" />
      {name}
    </Link>
  );
}

// Sidebar Component
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // Track sidebar visibility on mobile
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Mobile Sidebar Toggle Button */}
      <button
        className={cn(
          "lg:hidden p-4 absolute top-0 left-0 z-20 mt-2", // Set higher z-index for the menu button
          isOpen ? "hidden" : "" // Hide the menu button when sidebar is open
        )}
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" /> {/* Using lucide-react Menu icon */}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "lg:flex h-full w-64 flex-col border-r bg-white lg:static fixed top-0 left-0 transition-transform duration-300 z-30", // Set higher z-index for the sidebar
          isOpen ? "transform-none" : "-translate-x-full", // Slide-in effect for mobile
          "lg:translate-x-0" // Ensure the sidebar is always visible on large screens
        )}
      >
        <SidebarHeader />

        <div className="flex-1 overflow-y-auto p-4 pt-12">
          <nav className="flex flex-col gap-2">
            {navigationItems.map((item) => {
              const isActive =
                location.pathname === item.href || location.pathname.startsWith(item.href);
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
      </div>
    </div>
  );
}
