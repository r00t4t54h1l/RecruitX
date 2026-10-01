import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Clock3,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config/api";

interface Job {
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

interface JobApplication {
  id: number;
  status: "applied" | "reviewing" | "shortlisted" | "rejected" | "hired";
  cover_letter: string;
  applied_at: string;
  updated_at: string;
  candidate_id: number;
  headline: string;
  summary: string;
  skills: string[];
  experience_years: number;
  education: string;
  location: string;
  resume_url: string;
  user_id: number;
  name: string;
  email: string;
  match_score: number | null;
  matched_skills: string[];
  missing_skills: string[];
  match_analysis: string | null;
}

interface CandidateMatch {
  id: number;
  candidate_id: number;
  user_id: number;
  candidate_name: string;
  candidate_email: string;
  headline: string;
  summary: string;
  skills: string[];
  experience_years: number;
  education: string;
  location: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  analysis: string;
  created_at: string;
}

function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { user, token } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [application, setApplication] = useState<{
    id: number;
    job_id: number;
    status: string;
    applied_at: string;
  } | null>(null);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [applicationError, setApplicationError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState("");

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState("");
  const [updatingApplicationId, setUpdatingApplicationId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/jobs/${jobId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch job");
        }

        const data = await response.json();
        setJob(data.job);
      } catch (err) {
        console.error(err);
        setError("Unable to load this job.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!jobId || !token || user?.role !== "candidate") {
        setApplication(null);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/candidates/applications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }

        const data = await response.json();

        const existingApplication = (data.applications ?? []).find(
          (item: { job_id: number }) => Number(item.job_id) === Number(jobId),
        );

        setApplication(existingApplication ?? null);
      } catch (err) {
        console.error(err);
      }
    };

    fetchApplication();
  }, [jobId, token, user?.role]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!jobId || !token || user?.role !== "recruiter") {
        setApplications([]);
        return;
      }

      try {
        setApplicationsLoading(true);
        setApplicationsError("");

        const response = await fetch(
          `${API_URL}/jobs/${jobId}/applications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch applicants");
        }

        setApplications(data.applications ?? []);
      } catch (err) {
        console.error(err);
        setApplicationsError(
          err instanceof Error
            ? err.message
            : "Unable to load applicants.",
        );
      } finally {
        setApplicationsLoading(false);
      }
    };

    fetchApplications();
  }, [jobId, token, user?.role]);

  const updateApplicationStatus = async (
    applicationId: number,
    status: JobApplication["status"],
  ) => {
    if (!token) return;

    try {
      setUpdatingApplicationId(applicationId);

      const response = await fetch(
        `${API_URL}/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update application");
      }

      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? { ...application, status: data.application.status }
            : application,
        ),
      );
    } catch (err) {
      console.error(err);
      setApplicationsError(
        err instanceof Error
          ? err.message
          : "Unable to update application.",
      );
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  const applyToJob = async () => {
    if (!jobId || !token || user?.role !== "candidate") return;

    try {
      setApplicationLoading(true);
      setApplicationError("");

      const response = await fetch(
        `${API_URL}/jobs/${jobId}/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setApplication(data.application);
    } catch (err) {
      console.error(err);
      setApplicationError(
        err instanceof Error
          ? err.message
          : "Unable to submit your application.",
      );
    } finally {
      setApplicationLoading(false);
    }
  };

  const findCandidates = async () => {
    if (!jobId) return;

    try {
      setMatching(true);
      setMatchError("");

      const matchResponse = await fetch(
        `${API_URL}/jobs/${jobId}/match`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!matchResponse.ok) {
        throw new Error("Matching failed");
      }

      const resultsResponse = await fetch(
        `${API_URL}/jobs/${jobId}/matches`,
      );

      if (!resultsResponse.ok) {
        throw new Error("Failed to load matching results");
      }

      const data = await resultsResponse.json();
      setMatches(data.matches ?? []);
    } catch (err) {
      console.error(err);
      setMatchError("Unable to find matching candidates.");
    } finally {
      setMatching(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <GlassCard>
          <div className="flex items-center gap-3 p-8 text-slate-300">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-white" />
            Loading job...
          </div>
        </GlassCard>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <GlassCard>
          <div className="p-8">
            <p className="text-red-300">{error || "Job not found."}</p>
            <Link
              to="/jobs"
              className="mt-5 inline-flex items-center gap-2 text-sm text-white hover:underline"
            >
              <ArrowLeft size={16} />
              Back to jobs
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        to="/jobs"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to jobs
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <GlassCard>
            <div className="p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <Briefcase size={26} />
              </div>

              <p className="mb-2 text-sm font-medium text-slate-400">
                {job.company}
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-white">
                {job.title}
              </h1>

              <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} />
                  {job.location}
                </span>

                <span className="inline-flex items-center gap-2">
                  <Clock3 size={16} />
                  {job.employment_type}
                </span>

                <span className="inline-flex items-center gap-2">
                  <Building2 size={16} />
                  {job.experience_min}–{job.experience_max} years
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-8">
              <h2 className="text-xl font-semibold text-white">
                About the role
              </h2>

              <p className="mt-4 whitespace-pre-line leading-7 text-slate-300">
                {job.description}
              </p>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-8">
              <div className="flex items-center gap-2">
                <Sparkles size={19} />
                <h2 className="text-xl font-semibold text-white">
                  Required skills
                </h2>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {job.required_skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          {user?.role === "candidate" && (
            <GlassCard>
              <div className="p-6">
                <p className="text-sm text-slate-400">Application</p>

                <h2 className="mt-2 text-xl font-semibold text-white">
                  {application ? "Application submitted" : "Interested in this role?"}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {application
                    ? `Your application is currently ${application.status}.`
                    : "Submit your application directly to the recruiter."}
                </p>

                <button
                  type="button"
                  onClick={applyToJob}
                  disabled={applicationLoading || Boolean(application)}
                  className="mt-6 w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {applicationLoading
                    ? "Submitting..."
                    : application
                      ? "Applied ✓"
                      : "Apply Now"}
                </button>

                {applicationError && (
                  <p className="mt-3 text-sm text-red-300">
                    {applicationError}
                  </p>
                )}
              </div>
            </GlassCard>
          )}

          {user?.role === "recruiter" && (
            <GlassCard>
              <div className="p-6">
                <p className="text-sm text-slate-400">Recruiter workspace</p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Find matching candidates
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Analyze candidate profiles against this role using RecruitX's
                matching engine.
              </p>

              <button
                type="button"
                onClick={findCandidates}
                disabled={matching}
                className="mt-6 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {matching ? "Analyzing Candidates..." : "Find Candidates"}
              </button>

              {matchError && (
                <p className="mt-3 text-sm text-red-300">{matchError}</p>
              )}
            </div>
          </GlassCard>
          )}
        </div>
      </div>

      {user?.role === "recruiter" && (
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-400">
                RecruitX applications
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white">
                Applicants
              </h2>
            </div>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">
              {applications.length}{" "}
              {applications.length === 1 ? "applicant" : "applicants"}
            </span>
          </div>

          {applicationsError && (
            <GlassCard>
              <div className="p-6 text-sm text-red-300">
                {applicationsError}
              </div>
            </GlassCard>
          )}

          {applicationsLoading ? (
            <GlassCard>
              <div className="flex items-center gap-3 p-6 text-slate-300">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-white" />
                Loading applicants...
              </div>
            </GlassCard>
          ) : applications.length === 0 && !applicationsError ? (
            <GlassCard>
              <div className="p-8 text-center">
                <p className="text-lg font-medium text-white">
                  No applications yet
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Candidates who apply to this job will appear here.
                </p>
              </div>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <GlassCard key={application.id}>
                  <div className="p-6">
                    <div className="flex flex-col justify-between gap-6 lg:flex-row">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-semibold text-white">
                            {application.name}
                          </h3>

                          {application.match_score !== null && (
                            <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-300">
                              {Number(application.match_score).toFixed(0)}% match
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-slate-400">
                          {application.headline || "Candidate"}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          {application.email}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
                          <span>{application.experience_years} years experience</span>
                          <span>•</span>
                          <span>{application.location || "Location not provided"}</span>
                          <span>•</span>
                          <span>{application.education || "Education not provided"}</span>
                        </div>

                        {application.matched_skills?.length > 0 && (
                          <div className="mt-5">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                              Matched skills
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {application.matched_skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {application.missing_skills?.length > 0 && (
                          <div className="mt-4">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                              Missing skills
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {application.missing_skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-300"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {application.match_analysis && (
                          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">
                            {application.match_analysis}
                          </p>
                        )}
                      </div>

                      <div className="w-full shrink-0 lg:w-52">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                          Application status
                        </p>

                        <select
                          value={application.status}
                          disabled={updatingApplicationId === application.id}
                          onChange={(event) =>
                            updateApplicationStatus(
                              application.id,
                              event.target.value as JobApplication["status"],
                            )
                          }
                          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="applied">Applied</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                          <option value="hired">Hired</option>
                        </select>

                        <p className="mt-3 text-xs text-slate-500">
                          Applied{" "}
                          {new Date(application.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>
      )}

      {matches.length > 0 && (
        <section className="mt-8">
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-400">
              RecruitX analysis
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              Matching Candidates
            </h2>
          </div>

          <div className="space-y-4">
            {matches.map((candidate) => (
              <GlassCard key={candidate.id}>
                <div className="p-6">
                  <div className="flex flex-col justify-between gap-5 md:flex-row">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {candidate.candidate_name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {candidate.headline}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-400">
                        <span>{candidate.experience_years} years experience</span>
                        <span>•</span>
                        <span>{candidate.location}</span>
                        <span>•</span>
                        <span>{candidate.education}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center">
                        <p className="text-2xl font-bold text-white">
                          {Number(candidate.match_score).toFixed(0)}%
                        </p>
                        <p className="text-xs text-slate-400">match score</p>
                      </div>
                    </div>
                  </div>

                  {candidate.analysis && (
                    <p className="mt-5 text-sm leading-6 text-slate-300">
                      {candidate.analysis}
                    </p>
                  )}

                  <div className="mt-5">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Matched skills
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {candidate.matched_skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {candidate.missing_skills.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                        Skill gaps
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {candidate.missing_skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default JobDetailsPage;
