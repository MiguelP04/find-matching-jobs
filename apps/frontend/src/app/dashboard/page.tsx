"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import ProfileCard from "@/components/dashboard/ProfileCard";
import SkillsCard from "@/components/dashboard/SkillsCard";
import JobsCard from "@/components/dashboard/JobsCard";
import MatchesCard from "@/components/dashboard/MatchesCard";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const { user, profile, skills, jobs, loading, errors } = useDashboard();
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <WelcomeHeader />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ProfileCard profile={profile} loading={loading} error={errors.profile} />
          <SkillsCard skills={skills} loading={loading} error={errors.skills} />
        </div>

        <div className="mt-4">
          <JobsCard jobs={jobs} loading={loading} error={errors.jobs} />
        </div>

        <div className="mt-4">
          <MatchesCard />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
