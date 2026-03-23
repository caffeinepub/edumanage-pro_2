import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  CalendarCheck,
  Hash,
  School,
  UserCircle,
} from "lucide-react";
import { motion } from "motion/react";

export function ProfileView() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className="border border-border shadow-sm"
          data-ocid="profile.card"
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 text-2xl font-bold">SU</span>
              </div>
              <div className="flex-1">
                <h2 className="text-foreground text-xl font-semibold leading-tight">
                  Student User
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Enrolled Student
                </p>
                <div className="mt-2">
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                    Active
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/60">
                <School className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Class</p>
                  <p className="text-sm font-semibold text-foreground">XII-A</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/60">
                <Hash className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Roll No.</p>
                  <p className="text-sm font-semibold text-foreground">
                    S-2024-042
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/60">
                <UserCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="text-sm font-semibold text-foreground">
                    Student
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <Card className="border border-border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-amber-500" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">88%</p>
            <p className="text-xs text-muted-foreground mt-1">
              Current semester
            </p>
            <div className="mt-3 w-full bg-secondary rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full"
                style={{ width: "88%" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Examination Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">5/6</p>
            <p className="text-xs text-muted-foreground mt-1">
              Subjects passed
            </p>
            <div className="mt-3 w-full bg-secondary rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(5 / 6) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
