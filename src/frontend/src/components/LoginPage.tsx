import { BookOpen, Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";
import type { Role } from "../hooks/useAuth";

interface LoginPageProps {
  onLogin: (username: string, role: Role) => void;
}

const CREDENTIALS: Record<string, { password: string; role: Role }> = {
  admin: { password: "1234", role: "admin" },
  teacher: { password: "1234", role: "teacher" },
  student: { password: "1234", role: "student" },
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const cred = CREDENTIALS[username.toLowerCase()];
      if (cred && password === cred.password) {
        onLogin(username.toLowerCase(), cred.role);
      } else {
        setError("Invalid username or password.");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">
            EduManage Pro
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            Education Management Portal
          </p>
          <p className="text-blue-300/70 text-xs mt-1">
            Govt. Senior Secondary School
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-gray-800 text-lg font-semibold mb-1">Sign In</h2>
          <p className="text-gray-500 text-sm mb-6">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
                htmlFor="username"
              >
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  autoComplete="username"
                  data-ocid="login.input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-5">
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  autoComplete="current-password"
                  data-ocid="login.password_input"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm"
                data-ocid="login.error_state"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
              data-ocid="login.submit_button"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Credential hints */}
          <div className="mt-5 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-1.5">
              Demo Credentials
            </p>
            <div className="space-y-1">
              {Object.entries(CREDENTIALS).map(([user, { role }]) => (
                <p key={user} className="text-xs text-gray-400">
                  <span className="font-medium text-gray-500">{user}</span> /
                  1234
                  <span className="ml-1.5 text-gray-300">—</span>
                  <span className="ml-1.5 capitalize">{role}</span>
                </p>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Academic Year 2025–26
          </p>
        </div>
      </div>
    </div>
  );
}
