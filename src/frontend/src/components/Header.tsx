import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, ChevronDown, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import type { Role } from "../hooks/useAuth";
import type { NavItem } from "./Sidebar";

const pageTitles: Record<NavItem, string> = {
  dashboard: "Dashboard",
  students: "Student Management",
  teachers: "Teacher Management",
  attendance: "Attendance Register",
  results: "Examination Results",
  markEntry: "Mark Entry",
  profile: "My Profile",
  reportCard: "Samagra Pragati Patrak",
};

const roleLabels: Record<Role, string> = {
  admin: "Administrator",
  teacher: "Teacher",
  student: "Student",
};

interface HeaderProps {
  activeItem: NavItem;
  onMenuOpen: () => void;
  onLogout: () => void;
  username: string;
  role: Role;
}

export function Header({
  activeItem,
  onMenuOpen,
  onLogout,
  username,
  role,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const displayName = `${username.charAt(0).toUpperCase() + username.slice(1)} User`;
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          {/* MP Board Logo */}
          <img
            src="/assets/uploads/download-019d1f1a-928b-7508-b27d-197b82228018-1.png"
            alt="MP Board Logo"
            width={52}
            height={52}
            style={{ objectFit: "contain", flexShrink: 0 }}
          />
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors"
            onClick={onMenuOpen}
            aria-label="Open menu"
            data-ocid="header.menu_button"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-foreground font-semibold text-base leading-tight">
              {pageTitles[activeItem] ?? activeItem}
            </h1>
            <p className="text-muted-foreground text-xs hidden sm:block">
              Govt. Senior Secondary School — Academic Year 2025–26
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="relative p-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors"
            aria-label="Notifications"
            data-ocid="header.notifications_button"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-md hover:bg-secondary transition-colors cursor-pointer"
              data-ocid="header.user_menu"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-foreground text-xs font-semibold leading-tight">
                  {displayName}
                </p>
                <p className="text-muted-foreground text-xs leading-tight">
                  {roleLabels[role]}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default bg-transparent border-0"
                  onClick={closeMenu}
                  onKeyDown={(e) => e.key === "Escape" && closeMenu()}
                  aria-label="Close menu"
                  tabIndex={-1}
                />
                <div className="absolute right-0 mt-1 w-44 bg-white border border-border rounded-lg shadow-lg z-20 py-1">
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => {
                      closeMenu();
                      onLogout();
                    }}
                    data-ocid="header.logout_button"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
