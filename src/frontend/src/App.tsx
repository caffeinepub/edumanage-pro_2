import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Header } from "./components/Header";
import { LoginPage } from "./components/LoginPage";
import { type NavItem, Sidebar } from "./components/Sidebar";
import { useAuth } from "./hooks/useAuth";
import { AdmissionFormView } from "./views/AdmissionFormView";
import { AttendanceView } from "./views/AttendanceView";
import { DashboardView } from "./views/DashboardView";
import { DocumentUploadView } from "./views/DocumentUploadView";
import { MarkEntryView } from "./views/MarkEntryView";
import { ProfileView } from "./views/ProfileView";
import { ReportCardView } from "./views/ReportCardView";
import { ResultsView } from "./views/ResultsView";
import { SchoolProfileView } from "./views/SchoolProfileView";
import { StudentDetailView } from "./views/StudentDetailView";
import { StudentsView } from "./views/StudentsView";
import { TeachersView } from "./views/TeachersView";

function App() {
  const auth = useAuth();
  const [activeItem, setActiveItem] = useState<NavItem>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );

  if (!auth.user) {
    return (
      <LoginPage onLogin={(username, role) => auth.login(username, role)} />
    );
  }

  const { username, role } = auth.user;

  return (
    <div className="min-h-screen bg-background flex">
      <Toaster />
      <Sidebar
        activeItem={activeItem}
        onNavigate={(item) => {
          setActiveItem(item);
          if (item !== ("studentDetail" as NavItem)) setSelectedStudentId(null);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={role}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
        <Header
          activeItem={activeItem}
          onMenuOpen={() => setSidebarOpen(true)}
          onLogout={auth.logout}
          username={username}
          role={role}
        />

        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem + (selectedStudentId ?? "")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeItem === "dashboard" && <DashboardView role={role} />}
              {activeItem === "students" && (
                <StudentsView
                  onViewDetail={(id) => {
                    setSelectedStudentId(id);
                    setActiveItem("studentDetail" as NavItem);
                  }}
                  role={role}
                  username={username}
                />
              )}
              {activeItem === ("studentDetail" as NavItem) &&
                selectedStudentId !== null && (
                  <StudentDetailView
                    studentId={selectedStudentId}
                    onBack={() => setActiveItem("students")}
                    role={role}
                    username={username}
                  />
                )}
              {activeItem === "teachers" && <TeachersView />}
              {activeItem === "attendance" && <AttendanceView />}
              {activeItem === "results" && <ResultsView />}
              {activeItem === "markEntry" && <MarkEntryView role={role} />}
              {activeItem === "reportCard" && <ReportCardView role={role} />}
              {activeItem === "admissionForm" && <AdmissionFormView />}
              {activeItem === "documentUpload" && <DocumentUploadView />}
              {activeItem === "schoolProfile" && <SchoolProfileView />}
              {activeItem === "profile" && <ProfileView />}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="no-print py-4 px-6 border-t border-border bg-card">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
