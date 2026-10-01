import { useEffect, useState } from "react";

import {
  ArrowUpRight,
  Briefcase,
  Clock3,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";

import GlassCard from "../components/GlassCard";
import API_URL from "../config/api";


interface ApiJob {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  employment_type: string;
  required_skills: string[];
  experience_min: number;
  experience_max: number;
  created_at: string;
}

function JobsPage() {
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/jobs`);

        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }

        const data: { jobs: ApiJob[] } = await response.json();

        setJobs(data.jobs);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setError("Unable to load jobs right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const formatExperience = (min: number, max: number) => {
    if (min === max) {
      return `${min} years`;
    }

    return `${min}-${max} years`;
  };

  const formatPostedDate = (date: string) => {
    const created = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;

    return created.toLocaleDateString();
  };

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/[0.07] blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-16">

          <div className="max-w-3xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-400/[0.06] px-3 py-1.5 text-xs font-medium text-cyan-300">
              <Sparkles size={14} />
              AI-assisted job discovery
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Find work that
              <span className="text-cyan-400">
                {" "}fits you.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
              Explore opportunities posted by recruiters and
              discover roles that match your skills and experience.
            </p>

          </div>

          {/* Search */}
          <GlassCard className="mt-9 p-3">

            <div className="flex flex-col gap-3 md:flex-row">

              <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3">
                <Search
                  size={19}
                  className="text-slate-500"
                />

                <input
                  type="text"
                  placeholder="Search jobs, skills or companies..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 md:w-56">
                <MapPin
                  size={18}
                  className="text-slate-500"
                />

                <input
                  type="text"
                  placeholder="Location"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />
              </div>

              <button className="rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                Search
              </button>

            </div>

          </GlassCard>

        </div>
      </section>

      {/* Jobs */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-7 flex items-end justify-between">

          <div>
            <p className="text-sm text-slate-500">
              Opportunities
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Latest jobs
            </h2>
          </div>

          <p className="text-sm text-slate-500">
            {jobs.length} jobs
          </p>

        </div>

        {loading && (
      <div className="py-10 text-center text-sm text-slate-400">
        Loading jobs...
      </div>
    )}

    {error && (
      <div className="py-10 text-center text-sm text-red-400">
        {error}
      </div>
    )}

    {!loading && !error && jobs.length === 0 && (
      <div className="py-10 text-center text-sm text-slate-400">
        No jobs available yet.
      </div>
    )}

    <div className="grid gap-5 lg:grid-cols-2">

          {jobs.map((job) => (
            <GlassCard
              key={job.id}
              className="group p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20"
            >

              <div className="flex items-start justify-between gap-4">

                <div className="flex gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                    <Briefcase
                      size={21}
                      className="text-cyan-400"
                    />
                  </div>

                  <div>

                    <h3 className="font-semibold text-white">
                      {job.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {job.company}
                    </p>

                  </div>

                </div>

                <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.06] px-2.5 py-1 text-xs font-medium text-emerald-300">
                  Skills-based matching
                </div>

              </div>

              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">

                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {job.location}
                </span>

                <span className="flex items-center gap-1.5">
                  <Briefcase size={14} />
                  {job.employment_type}
                </span>

                <span className="flex items-center gap-1.5">
                  <Clock3 size={14} />
                  {formatExperience(job.experience_min, job.experience_max)}
                </span>

              </div>

              <p className="mt-5 text-sm leading-6 text-slate-400">
                {job.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">

                {job.required_skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-white/5 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-400"
                  >
                    {skill}
                  </span>
                ))}

              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5">

                <span className="text-xs text-slate-600">
                  Posted {formatPostedDate(job.created_at)}
                </span>

                <a
                  href={`/jobs/${job.id}`}
                  className="flex items-center gap-2 text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
                >
                  View job
                  <ArrowUpRight
                    size={16}
                    className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>

              </div>

            </GlassCard>
          ))}

        </div>

      </section>

    </div>
  );
}

export default JobsPage;