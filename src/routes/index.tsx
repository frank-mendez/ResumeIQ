import { createFileRoute } from "@tanstack/react-router";
import { makeTitle, seo } from "~/utils/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      ...seo({
        title: makeTitle("Home"),
        description:
          "ResumeIQ helps you tighten language, improve clarity, and tailor your resume to roles.",
      }),
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main>
      <div className="relative">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/60 px-3 py-1 text-xs font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-300">
                <span
                  className="h-2 w-2 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                ResumeIQ — resume feedback that’s clear, actionable, and fast
              </div>

              <div className="space-y-3">
                <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                  Build a resume that reads well for humans — and scans well for
                  ATS
                </h1>
                <p className="text-pretty text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
                  ResumeIQ helps you find gaps, tighten language, and tailor
                  content to roles. Keep iterations organized and share polished
                  versions with confidence.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-50 dark:bg-gray-50 dark:text-gray-900"
                >
                  See features
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white/60 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-100 dark:hover:bg-gray-950"
                >
                  How it works
                </a>
              </div>

              <dl className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white/60 p-4 dark:border-gray-800 dark:bg-gray-950/40">
                  <dt className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Focus
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">
                    Clarity & impact
                  </dd>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/60 p-4 dark:border-gray-800 dark:bg-gray-950/40">
                  <dt className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Output
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">
                    Actionable changes
                  </dd>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/60 p-4 dark:border-gray-800 dark:bg-gray-950/40">
                  <dt className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Workflow
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">
                    Iterate quickly
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white/60 p-6 dark:border-gray-800 dark:bg-gray-950/40">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Example feedback
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">
                    Role alignment snapshot
                  </h2>
                </div>
                <div className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
                  Preview
                </div>
              </div>
              <div className="mt-5 space-y-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                  <p className="text-sm font-semibold">Strengths</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>
                      • Clear ownership statements with measurable outcomes
                    </li>
                    <li>• Consistent chronology and easy-to-scan structure</li>
                    <li>• Strong keyword coverage for core responsibilities</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                  <p className="text-sm font-semibold">Opportunities</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>
                      • Add scope to 2 bullets (team size, budget, or volume)
                    </li>
                    <li>• Tighten verbs for 3 bullets to reduce repetition</li>
                    <li>
                      • Tailor the summary to match the target role more
                      directly
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section
        id="features"
        className="border-t border-gray-200 dark:border-gray-800"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything you need to polish faster
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              A straightforward workflow that keeps your edits focused and your
              resume consistent.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white/60 p-6 dark:border-gray-800 dark:bg-gray-950/40">
              <h3 className="text-base font-semibold">Signal over noise</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Spot vague bullets and replace them with concrete outcomes,
                scope, and impact.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white/60 p-6 dark:border-gray-800 dark:bg-gray-950/40">
              <h3 className="text-base font-semibold">Role targeting</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Identify missing keywords and align your summary and experience
                to the job’s language.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white/60 p-6 dark:border-gray-800 dark:bg-gray-950/40">
              <h3 className="text-base font-semibold">Consistency checks</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Keep formatting, tense, and structure uniform so recruiters can
                scan confidently.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white/60 p-6 dark:border-gray-800 dark:bg-gray-950/40">
              <h3 className="text-base font-semibold">Version-friendly</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Iterate without losing your best lines—maintain clear deltas
                between drafts.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white/60 p-6 dark:border-gray-800 dark:bg-gray-950/40">
              <h3 className="text-base font-semibold">Readable feedback</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Suggestions are grouped by section so you can fix the
                highest-impact items first.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white/60 p-6 dark:border-gray-800 dark:bg-gray-950/40">
              <h3 className="text-base font-semibold">Share-ready output</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Generate a clean, professional version you can export and send
                with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-t border-gray-200 dark:border-gray-800"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                A simple loop: upload, refine, repeat
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Move from “good” to “great” with a few focused passes.
              </p>
            </div>

            <ol className="space-y-3">
              <li className="rounded-xl border border-gray-200 bg-white/60 p-5 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-gray-50 dark:bg-gray-50 dark:text-gray-900">
                    1
                  </span>
                  <div>
                    <p className="font-semibold">
                      Add your resume and a target role
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Start with the role you want so feedback stays relevant.
                    </p>
                  </div>
                </div>
              </li>
              <li className="rounded-xl border border-gray-200 bg-white/60 p-5 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-gray-50 dark:bg-gray-50 dark:text-gray-900">
                    2
                  </span>
                  <div>
                    <p className="font-semibold">
                      Apply changes in order of impact
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Address clarity, scope, and outcomes before tweaking
                      wording.
                    </p>
                  </div>
                </div>
              </li>
              <li className="rounded-xl border border-gray-200 bg-white/60 p-5 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-gray-50 dark:bg-gray-50 dark:text-gray-900">
                    3
                  </span>
                  <div>
                    <p className="font-semibold">
                      Export a clean, consistent version
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Keep one “master” resume and tailor versions per role
                      without chaos.
                    </p>
                  </div>
                </div>
              </li>
            </ol>
          </div>

          <div className="mt-10 rounded-2xl border border-gray-200 bg-white/60 p-6 dark:border-gray-800 dark:bg-gray-950/40 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">
                  Want to see it in action?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This repo includes demo routes you can explore right now.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} ResumeIQ
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Built with TanStack Start and Tailwind.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
