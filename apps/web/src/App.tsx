import { Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RecruiterDashboardPage from "./pages/RecruiterDashboardPage";
import CandidateProfilePage from "./pages/CandidateProfilePage";

function App() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<LandingPage />} />

      {/* Application */}
      <Route element={<AppLayout />}>
        <Route path="/jobs" element={<JobsPage />} />

        <Route
          path="/jobs/:jobId"
          element={<JobDetailsPage />}
        />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        {/* Candidate-only routes */}
        <Route element={<ProtectedRoute role="candidate" />}>
          <Route
            path="/profile"
            element={<CandidateProfilePage />}
          />
        </Route>

        {/* Recruiter-only routes */}
        <Route element={<ProtectedRoute role="recruiter" />}>
          <Route
            path="/recruiter"
            element={<RecruiterDashboardPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
