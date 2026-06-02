import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewScreen from "./pages/InterviewScreen";
import ReportScreen from "./pages/ReportScreen";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import {
  Button,
  MobileBottomNav,
  PageFrame,
  appShellClass,
  pageBackdropClass,
} from "./components/ui";

const bottomNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: "⌂" },
  { label: "Interview", path: "/interview/setup", icon: "⚡" },
  { label: "Analytics", path: "/analytics", icon: "◌" },
  { label: "Profile", path: "/profile", icon: "◍" },
];

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function ProtectedShell({ title, eyebrow, description, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className={appShellClass}>
      <div className={pageBackdropClass} />
      <PageFrame
        title={title}
        eyebrow={eyebrow}
        description={description}
        actions={
          <>
            <Button onClick={() => navigate("/interview/setup")}>
              Start interview
            </Button>
            <Button variant="secondary" onClick={() => navigate("/analytics")}>
              Analytics
            </Button>
            <Button variant="danger" onClick={logout}>
              Logout
            </Button>
          </>
        }
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </PageFrame>
      <MobileBottomNav
        items={bottomNavItems}
        currentPath={location.pathname}
        onNavigate={navigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <ProtectedShell
                title="Dashboard"
                eyebrow="Welcome back"
                description="Track readiness, streaks, and interview momentum at a glance."
              >
                <Dashboard />
              </ProtectedShell>
            </RequireAuth>
          }
        />
        <Route
          path="/interview/setup"
          element={
            <RequireAuth>
              <ProtectedShell
                title="Interview setup"
                eyebrow="Start fast"
                description="Pick a role, difficulty, and mode without slowing down the practice loop."
              >
                <InterviewSetup />
              </ProtectedShell>
            </RequireAuth>
          }
        />
        <Route
          path="/interview/:sessionId"
          element={
            <RequireAuth>
              <ProtectedShell
                title="Interview room"
                eyebrow="Live session"
                description="Manage the current question, submit answers, and get AI feedback in real time."
              >
                <InterviewScreen />
              </ProtectedShell>
            </RequireAuth>
          }
        />
        <Route
          path="/report/:sessionId"
          element={
            <RequireAuth>
              <ProtectedShell
                title="Report"
                eyebrow="Results"
                description="Inspect performance, copy findings, and start the next practice run."
              >
                <ReportScreen />
              </ProtectedShell>
            </RequireAuth>
          }
        />
        <Route
          path="/analytics"
          element={
            <RequireAuth>
              <ProtectedShell
                title="Analytics"
                eyebrow="Performance"
                description="See readiness, skill gaps, and weekly momentum in one place."
              >
                <Analytics />
              </ProtectedShell>
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProtectedShell
                title="Profile"
                eyebrow="Account"
                description="Review your practice identity, achievements, and session goals."
              >
                <Profile />
              </ProtectedShell>
            </RequireAuth>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
