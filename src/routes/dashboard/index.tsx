import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { DashboardSidebar } from "~/components/dashboard/DashboardSidebar";
import { DashboardUploadSection } from "~/components/dashboard/DashboardUploadSection";
import { DashboardWelcomeCard } from "~/components/dashboard/DashboardWelcomeCard";
import { QuickActionsCard } from "~/components/dashboard/QuickActionsCard";
import { ResumeListCard } from "~/components/dashboard/ResumeListCard";
import type { ResumeListItem } from "~/components/dashboard/types";
import { makeTitle, seo } from "~/utils/seo";
import { getSupabaseBrowserClient } from "~/utils/supabase.browser";
import { requireDashboardAuth } from "~/utils/routeAuth";

export const Route = createFileRoute("/dashboard/")({
  beforeLoad: async ({ context, location }) => {
    await requireDashboardAuth({
      location,
      hasKnownUser: Boolean(context.user),
    });
  },
  head: () => ({
    meta: [
      ...seo({
        title: makeTitle("Dashboard"),
        description: "Your ResumeIQ dashboard.",
      }),
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const [pickedFileName, setPickedFileName] = React.useState<string | null>(
    null,
  );
  const [resumes, setResumes] = React.useState<Array<ResumeListItem>>([]);
  const [isLoadingResumes, setIsLoadingResumes] = React.useState(true);
  const [resumeLoadError, setResumeLoadError] = React.useState<string | null>(
    null,
  );
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const openPicker = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const loadResumes = async () => {
      if (!user?.id) {
        if (!cancelled) {
          setResumes([]);
          setIsLoadingResumes(false);
        }
        return;
      }

      setIsLoadingResumes(true);
      setResumeLoadError(null);

      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("resumes")
          .select("id, original_filename, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setResumes((data ?? []) as Array<ResumeListItem>);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load resumes right now.";
          setResumeLoadError(message);
          setResumes([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingResumes(false);
        }
      }
    };

    loadResumes();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <main>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <DashboardSidebar />

          <div className="min-w-0 space-y-6">
            <DashboardWelcomeCard
              pickedFileName={pickedFileName}
              onUpload={openPicker}
              fileInputRef={fileInputRef}
              onFileChange={(event) => {
                const file = event.currentTarget.files?.[0] ?? null;
                setPickedFileName(file ? file.name : null);
                event.currentTarget.value = "";
              }}
            />

            <section
              id="overview"
              aria-label="Overview"
              className="grid gap-4 lg:grid-cols-2"
            >
              <ResumeListCard
                resumes={resumes}
                isLoading={isLoadingResumes}
                loadError={resumeLoadError}
              />
              <QuickActionsCard onUpload={openPicker} />
            </section>

            <DashboardUploadSection onUpload={openPicker} />
          </div>
        </div>
      </div>
    </main>
  );
}
