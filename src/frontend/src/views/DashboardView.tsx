import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { announcements, recentActivity } from "@/data/mockData";
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  Clock,
  GraduationCap,
  Megaphone,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import type { Role } from "../hooks/useAuth";

const stats = [
  {
    id: "total-students",
    label: "Total Students",
    value: "1,240",
    delta: "+24 this month",
    trend: "up",
    icon: GraduationCap,
    color: "text-chart-1",
    bg: "bg-blue-50",
  },
  {
    id: "total-teachers",
    label: "Total Teachers",
    value: "86",
    delta: "+2 this term",
    trend: "up",
    icon: Users,
    color: "text-chart-2",
    bg: "bg-emerald-50",
  },
  {
    id: "attendance",
    label: "Avg. Attendance",
    value: "92.4%",
    delta: "-1.2% vs last month",
    trend: "down",
    icon: CalendarCheck,
    color: "text-chart-3",
    bg: "bg-amber-50",
  },
  {
    id: "results-passed",
    label: "Results Passed",
    value: "78%",
    delta: "+5% vs last term",
    trend: "up",
    icon: Trophy,
    color: "text-chart-5",
    bg: "bg-cyan-50",
  },
];

const activityTypeColors: Record<string, string> = {
  student: "bg-blue-100 text-blue-700",
  teacher: "bg-emerald-100 text-emerald-700",
  result: "bg-purple-100 text-purple-700",
  attendance: "bg-amber-100 text-amber-700",
};

const welcomeBanners: Record<
  Role,
  { icon: React.ElementType; title: string; message: string }
> = {
  admin: {
    icon: ShieldCheck,
    title: "Welcome back, Administrator!",
    message: "You have full access to all modules.",
  },
  teacher: {
    icon: BookOpen,
    title: "Welcome!",
    message: "You can manage Students, Attendance, and Results.",
  },
  student: {
    icon: BarChart3,
    title: "Welcome!",
    message: "You can view your Results and Profile.",
  },
};

interface DashboardViewProps {
  role: Role;
}

export function DashboardView({ role }: DashboardViewProps) {
  const banner = welcomeBanners[role];
  const BannerIcon = banner.icon;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        data-ocid="dashboard.panel"
        className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 flex items-center gap-4 shadow-md"
      >
        <div className="w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
          <BannerIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-base leading-tight">
            {banner.title}
          </p>
          <p className="text-blue-100 text-sm mt-0.5">{banner.message}</p>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <motion.div
              key={stat.id}
              data-ocid={`dashboard.${stat.id}.card`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="border border-border shadow-xs hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
                        {stat.label}
                      </p>
                      <p className="text-foreground text-2xl font-bold tracking-tight">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`w-11 h-11 rounded-lg ${stat.bg} flex items-center justify-center`}
                    >
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    <TrendIcon
                      className={`w-3.5 h-3.5 ${
                        stat.trend === "up"
                          ? "text-emerald-500"
                          : "text-red-400"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {stat.delta}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Two column: activity + announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul>
                {recentActivity.map((item, idx) => (
                  <li
                    key={item.id}
                    data-ocid={`activity.item.${idx + 1}`}
                    className="flex items-start gap-3 px-5 py-3.5 border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors"
                  >
                    <span
                      className={`mt-0.5 px-2 py-0.5 rounded text-xs font-semibold capitalize flex-shrink-0 ${
                        activityTypeColors[item.type]
                      }`}
                    >
                      {item.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">
                        {item.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
        >
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-primary" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul>
                {announcements.map((item, idx) => (
                  <li
                    key={item.id}
                    data-ocid={`announcement.item.${idx + 1}`}
                    className="px-5 py-4 border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        {item.title}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs flex-shrink-0"
                      >
                        {item.date}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
