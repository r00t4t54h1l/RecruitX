import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BriefcaseBusiness, Plus, Users, Target, X } from "lucide-react";

import GlassCard from "../components/GlassCard";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config/api";

type Job = {
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
};

type Match = {
  candidate_id: number;
  candidate_name: string;
  match_score: number;
};


export default function RecruiterDashboardPage() {
  const { token } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [matches, setMatches] = useState<Record<number, Match[]>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Remote");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [skills, setSkills] = useState("");
  const [experienceMin, setExperienceMin] = useState("0");
  const [experienceMax, setExperienceMax] = useState("2");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadJobs = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/jobs`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load jobs");
      }

      setJobs(data.jobs || []);

      const matchEntries = await Promise.all(
        (data.jobs || []).map(async (job: Job) => {
          const matchResponse = await fetch(
            `${API_URL}/jobs/${job.id}/matches`,
          );

          if (!matchResponse.ok) {
            return [job.id, []] as const;
          }

          const matchData = await matchResponse.json();

          return [
            job.id,
            (matchData.matches || []).map((match: any) => ({
              candidate_id: match.candidate_id,
              candidate_name: match.name,
              match_score: Number(match.match_score),
            })),
          ] as const;
        }),
      );

      setMatches(Object.fromEntries(matchEntries));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const resetForm = () => {
    setTitle("");
    setCompany("");
    setDescription("");
    setLocation("Remote");
    setEmploymentType("Full-time");
    setSkills("");
    setExperienceMin("0");
    setExperienceMax("2");
    setError("");
  };

  const createJob = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      setError("You must be logged in as a recruiter.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const requiredSkills = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const response = await fetch(`${API_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          company,
          description,
          location,
          employment_type: employmentType,
          required_skills: requiredSkills,
          experience_min: Number(experienceMin),
          experience_max: Number(experienceMax),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create job");
      }

      resetForm();
      setShowCreateForm(false);
      await loadJobs();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create job",
      );
    } finally {
      setCreating(false);
    }
  };

  const totalCandidates = Object.values(matches).reduce(
    (total, jobMatches) => total + jobMatches.length,
    0,
  );

  const strongMatches = Object.values(matches)
    .flat()
    .filter((match) => match.match_score >= 80).length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-cyan-400">
            RecruitX Talent Intelligence
          </p>

          <h1 className="text-3xl font-bold text-white">
            Recruiter Dashboard
          </h1>

          <p className="mt-2 text-slate-400">
            Create jobs and discover candidates based on measurable skill
            matches.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setShowCreateForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          <Plus size={18} />
          Create Job
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
          <GlassCard>
            <form
              onSubmit={createJob}
              className="w-full max-w-2xl space-y-5 p-7"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Create Job
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Add the role RecruitX should match candidates against.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Job title"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                />

                <input
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>

              <textarea
                required
                minLength={20}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Job description"
                rows={5}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                />

                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>

              <input
                required
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Required skills — JavaScript, React, Node.js"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={experienceMin}
                  onChange={(e) => setExperienceMin(e.target.value)}
                  placeholder="Minimum experience"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />

                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={experienceMax}
                  onChange={(e) => setExperienceMax(e.target.value)}
                  placeholder="Maximum experience"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? "Creating Job..." : "Create Job"}
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <GlassCard>
          <div className="flex items-center gap-4 p-6">
            <BriefcaseBusiness className="text-cyan-400" />
            <div>
              <p className="text-sm text-slate-400">Active Jobs</p>
              <p className="text-2xl font-bold text-white">
                {jobs.length}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4 p-6">
            <Users className="text-cyan-400" />
            <div>
              <p className="text-sm text-slate-400">
                Candidates Matched
              </p>
              <p className="text-2xl font-bold text-white">
                {totalCandidates}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4 p-6">
            <Target className="text-cyan-400" />
            <div>
              <p className="text-sm text-slate-400">80%+ Matches</p>
              <p className="text-2xl font-bold text-white">
                {strongMatches}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-5">
        {loading ? (
          <GlassCard>
            <div className="p-8 text-center text-slate-400">
              Loading jobs...
            </div>
          </GlassCard>
        ) : jobs.length === 0 ? (
          <GlassCard>
            <div className="p-10 text-center">
              <BriefcaseBusiness className="mx-auto mb-4 text-slate-500" />
              <h2 className="text-xl font-semibold text-white">
                No jobs yet
              </h2>
              <p className="mt-2 text-slate-400">
                Create your first job to start matching candidates.
              </p>
            </div>
          </GlassCard>
        ) : (
          jobs.map((job) => {
            const jobMatches = matches[job.id] || [];
            const topMatch = jobMatches[0];

            return (
              <GlassCard key={job.id}>
                <div className="p-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {job.title}
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        {job.company} · {job.location} ·{" "}
                        {job.employment_type}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.required_skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-sm font-medium text-cyan-400 hover:underline"
                    >
                      View Job
                    </Link>
                  </div>

                  <div className="mt-6 grid gap-4 border-t border-white/10 pt-5 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-500">
                        Experience
                      </p>
                      <p className="mt-1 text-sm text-slate-200">
                        {job.experience_min}–{job.experience_max} years
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Candidates analyzed
                      </p>
                      <p className="mt-1 text-sm text-slate-200">
                        {jobMatches.length}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Top match
                      </p>
                      <p className="mt-1 text-sm text-slate-200">
                        {topMatch
                          ? `${topMatch.candidate_name} · ${topMatch.match_score}%`
                          : "Run matching from job details"}
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}
