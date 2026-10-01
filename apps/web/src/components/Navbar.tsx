import { Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-6 py-5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
            <Sparkles size={18} />
          </div>

          <span className="text-lg font-semibold text-white">
            Recruit<span className="text-cyan-400">X</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/jobs"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            Find Jobs
          </Link>

          <a
            href="/#how-it-works"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            How it works
          </a>

          <a
            href="/#recruiters"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            For Recruiters
          </a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-slate-400 sm:block">
                {user.name}
              </span>

              {user.role === "recruiter" ? (
                <Link
                  to="/recruiter"
                  className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/20"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/profile"
                  className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/20"
                >
                  Profile
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden px-4 py-2 text-sm text-slate-300 transition hover:text-white sm:block"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/20"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
