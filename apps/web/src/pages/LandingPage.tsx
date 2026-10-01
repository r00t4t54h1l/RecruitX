import {
  ArrowRight,
  BrainCircuit,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import GlassCard from "../components/GlassCard";

function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070a12] text-white">

      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/[0.08] blur-[120px]" />

      <div className="pointer-events-none absolute bottom-[-200px] left-[-150px] h-[400px] w-[400px] rounded-full bg-blue-600/[0.08] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-40">

        {/* Hero */}
        <section className="text-center">

          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/10 bg-cyan-300/[0.06] px-4 py-2 text-sm text-cyan-300">
            <Sparkles size={15} />
            AI-powered recruitment
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Find the right people.

            <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Without the noise.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            RecruitX helps recruiters discover relevant candidates
            faster by intelligently matching resumes with job
            requirements.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">

            <Link
              to="/jobs"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 font-semibold text-slate-950 shadow-[0_10px_35px_rgba(34,211,238,0.2)] transition hover:-translate-y-0.5 hover:bg-cyan-300"
            >
              Find a job

              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-6 py-3.5 font-semibold text-white shadow-[8px_8px_25px_rgba(0,0,0,0.25)] backdrop-blur-xl transition hover:bg-white/[0.08]"
            >
              I'm hiring
            </Link>

          </div>
        </section>

        {/* Dashboard preview */}
        <section className="mt-24">

          <GlassCard className="mx-auto max-w-5xl p-3 sm:p-5">

            <div className="rounded-2xl border border-white/5 bg-[#0b0f19] p-5 sm:p-7">

              <div className="mb-7 flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Recruiter dashboard
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    Candidate overview
                  </h2>
                </div>

                <div className="hidden items-center gap-2 rounded-xl border border-white/5 bg-white/[0.04] px-3 py-2 sm:flex">
                  <Search size={15} className="text-slate-500" />

                  <span className="text-xs text-slate-500">
                    Search candidates
                  </span>
                </div>

              </div>

              <div className="grid gap-4 md:grid-cols-3">

                <GlassCard className="p-5">
                  <Users className="text-cyan-400" size={20} />

                  <p className="mt-5 text-3xl font-bold">
                    1,248
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Applications received
                  </p>
                </GlassCard>

                <GlassCard className="p-5">
                  <BrainCircuit className="text-blue-400" size={20} />

                  <p className="mt-5 text-3xl font-bold">
                    94%
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Top candidate match
                  </p>
                </GlassCard>

                <GlassCard className="p-5">
                  <Sparkles className="text-violet-400" size={20} />

                  <p className="mt-5 text-3xl font-bold">
                    AI
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Assisted candidate analysis
                  </p>
                </GlassCard>

              </div>
            </div>

          </GlassCard>

        </section>

        {/* Features */}
        <section id="how-it-works" className="mt-28">

          <div className="text-center">

            <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400">
              One platform
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Built for both sides of hiring.
            </h2>

          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">

            <GlassCard className="p-7">
              <Search className="text-cyan-400" />

              <h3 className="mt-6 text-xl font-semibold">
                Discover jobs
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Applicants can search and discover opportunities
                posted by recruiters.
              </p>
            </GlassCard>

            <GlassCard className="p-7">
              <BrainCircuit className="text-blue-400" />

              <h3 className="mt-6 text-xl font-semibold">
                Intelligent matching
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Resumes and job requirements are analyzed to
                surface relevant matches.
              </p>
            </GlassCard>

            <GlassCard className="p-7">
              <Users className="text-violet-400" />

              <h3 className="mt-6 text-xl font-semibold">
                Better decisions
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Recruiters get structured candidate information
                instead of manually searching through thousands
                of resumes.
              </p>
            </GlassCard>

          </div>
        </section>

      </div>
    </main>
  );
}

export default LandingPage;