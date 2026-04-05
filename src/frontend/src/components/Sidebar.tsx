import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  Building2,
  CalendarCheck,
  ClipboardList,
  ClipboardPen,
  FileText,
  GraduationCap,
  LayoutDashboard,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Role } from "../hooks/useAuth";

export type NavItem =
  | "dashboard"
  | "students"
  | "teachers"
  | "attendance"
  | "results"
  | "markEntry"
  | "reportCard"
  | "admissionForm"
  | "schoolProfile"
  | "profile";

const allNavItems: { id: NavItem; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: GraduationCap },
  { id: "teachers", label: "Teachers", icon: Users },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "results", label: "Results", icon: BarChart3 },
  { id: "markEntry", label: "Mark Entry", icon: ClipboardList },
  { id: "reportCard", label: "Report Card", icon: FileText },
  { id: "admissionForm", label: "Admission Form", icon: ClipboardPen },
  { id: "schoolProfile", label: "School Profile", icon: Building2 },
  { id: "profile", label: "My Profile", icon: UserCircle },
];

const roleItems: Record<Role, NavItem[]> = {
  admin: [
    "dashboard",
    "students",
    "teachers",
    "attendance",
    "results",
    "markEntry",
    "reportCard",
    "admissionForm",
    "schoolProfile",
  ],
  teacher: [
    "dashboard",
    "students",
    "attendance",
    "results",
    "markEntry",
    "reportCard",
    "admissionForm",
  ],
  student: ["dashboard", "results", "profile"],
};

interface SidebarProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
  isOpen: boolean;
  onClose: () => void;
  role: Role;
}

export function Sidebar({
  activeItem,
  onNavigate,
  isOpen,
  onClose,
  role,
}: SidebarProps) {
  const visibleIds = roleItems[role];
  const navItems = allNavItems.filter((item) => visibleIds.includes(item.id));

  const content = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-gray-800 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sidebar-foreground font-semibold text-sm leading-tight">
              EduManage Pro
            </p>
            <p className="text-sidebar-foreground/50 text-xs">
              Education Portal
            </p>
          </div>
        </div>
        <button
          type="button"
          className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
          onClick={onClose}
          aria-label="Close sidebar"
          data-ocid="sidebar.close_button"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        <p className="text-sidebar-foreground/40 text-xs font-semibold uppercase tracking-widest px-2 mb-3">
          Main Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-primary text-sidebar-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-foreground/40" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-sidebar-foreground/30 text-xs">
          Academic Year 2025–26
        </p>
        <p className="text-sidebar-foreground/30 text-xs">
          Govt. Senior Secondary School
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:left-0 shadow-lg z-30">
        {content}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />
            <motion.aside
              key="sidebar"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 z-50 shadow-xl"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
