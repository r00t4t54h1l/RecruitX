import { useEffect, useState } from "react";
import { Save, UserRound } from "lucide-react";

import GlassCard from "../components/GlassCard";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config/api";

type CandidateProfile = {
  id: number;
  user_id: number;
  resume_url: string | null;
  headline: string;
  summary: string;
  skills: string[];
  experience_years: number;
  education: string;
  location: string;
};


export default function CandidateProfilePage() {
  const { token, user } = useAuth();

  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("0");
  const [education, setEducation] = useState("");
  const [location, setLocation] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/candidates/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load profile",
          );
        }

        const profile: CandidateProfile | null = data.profile;

        if (profile) {
          setHeadline(profile.headline || "");
          setSummary(profile.summary || "");
          setSkills((profile.skills || []).join(", "));
          setExperience(String(profile.experience_years ?? 0));
          setEducation(profile.education || "");
          setLocation(profile.location || "");
          setResumeUrl(profile.resume_url || "");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load profile",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const saveProfile = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!token) {
      setError("You must be logged in.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const skillList = [
        ...new Set(
          skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        ),
      ];

      const response = await fetch(
        `${API_URL}/candidates/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            resume_url: resumeUrl.trim(),
            headline: headline.trim(),
            summary: summary.trim(),
            skills: skillList,
            experience_years: Number(experience),
            education: education.trim(),
            location: location.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save profile",
        );
      }

      setMessage("Profile saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save profile",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <GlassCard>
          <div className="p-10 text-center text-slate-400">
            Loading profile...
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-cyan-400">
          <UserRound size={20} />
          <span className="text-sm font-medium">
            Candidate Profile
          </span>
        </div>

        <h1 className="text-3xl font-bold text-white">
          Build your RecruitX profile
        </h1>

        <p className="mt-2 text-slate-400">
          Keep your skills and experience up to date so recruiters
          can evaluate your profile against their jobs.
        </p>

        {user && (
          <p className="mt-3 text-sm text-slate-500">
            Signed in as {user.name} · {user.email}
          </p>
        )}
      </div>

      <GlassCard>
        <form
          onSubmit={saveProfile}
          className="space-y-6 p-7"
        >
          {message && (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Professional headline
            </label>

            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Full Stack Developer"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Professional summary
            </label>

            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Briefly describe your experience and technical background..."
              rows={5}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Skills
            </label>

            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, TypeScript, Node.js, PostgreSQL"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />

            <p className="mt-2 text-xs text-slate-500">
              Separate skills with commas.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Years of experience
              </label>

              <input
                type="number"
                min="0"
                max="50"
                value={experience}
                onChange={(e) =>
                  setExperience(e.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Location
              </label>

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote / Delhi"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Education
            </label>

            <input
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. B.Tech in Electronics and Communication Engineering"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Resume URL
            </label>

            <input
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />

            <p className="mt-2 text-xs text-slate-500">
              Add a publicly accessible resume link. File upload
              will be added separately.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Saving Profile..." : "Save Profile"}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
