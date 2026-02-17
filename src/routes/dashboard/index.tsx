import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { DashboardSidebar } from "~/components/dashboard/DashboardSidebar";
import { DashboardUploadSection } from "~/components/dashboard/DashboardUploadSection";
import { DashboardWelcomeCard } from "~/components/dashboard/DashboardWelcomeCard";
import { ResumeListCard } from "~/components/dashboard/ResumeListCard";
import { useResumeUpload } from "~/hooks/useResumeUpload";
import { useResumes } from "~/hooks/useResumes";
import { makeTitle, seo } from "~/utils/seo";
import { getResumeUploadMaxBytes } from "~/utils/resumeFile";
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
  const navigate = Route.useNavigate();

  const maxUploadBytes = React.useMemo(() => getResumeUploadMaxBytes(), []);
  const { resumes, isLoadingResumes, resumeLoadError, loadResumes } =
    useResumes(user?.id);

  const {
    selectedFile,
    validationError,
    uploadError,
    uploadState,
    uploadProgress,
    fileInputRef,
    openPicker,
    handleFilePicked,
    handleUpload,
    cancelUpload,
  } = useResumeUpload({
    userId: user?.id,
    maxUploadBytes,
    onUploadSuccess: async (resumeId) => {
      await loadResumes();
      await navigate({
        to: "/dashboard/$resumeId",
        params: { resumeId },
      });
    },
  });

  return (
    <main>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <DashboardSidebar />

          <div className="min-w-0 space-y-6">
            <DashboardWelcomeCard />

            <section
              id="overview"
              aria-label="Overview"
              className="grid gap-4 lg:grid-cols-1"
            >
              <ResumeListCard
                resumes={resumes}
                isLoading={isLoadingResumes}
                loadError={resumeLoadError}
              />
            </section>

            <DashboardUploadSection
              onOpenPicker={openPicker}
              onFilePicked={handleFilePicked}
              onSubmitUpload={handleUpload}
              onCancelUpload={cancelUpload}
              fileInputRef={fileInputRef}
              selectedFile={selectedFile}
              maxFileSizeBytes={maxUploadBytes}
              validationError={validationError}
              uploadError={uploadError}
              uploadState={uploadState}
              uploadProgress={uploadProgress}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
