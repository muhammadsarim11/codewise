'use client';

import Link from 'next/link';
import {
  Book,
  Folder,
  Share2,
  ArrowLeft,
  Zap,
  LayoutTemplate,
  CheckCircle2,
  FileDown,
} from 'lucide-react';
import { ThemeToggle } from '../component/ui/ThemeToggle';

const NAV = [
  {
    label: 'Start here',
    items: [
      { href: '#introduction', label: 'Introduction', icon: Book },
      { href: '#quickstart', label: 'Quick start', icon: Zap },
    ],
  },
  {
    label: 'Core concepts',
    items: [
      { href: '#projects', label: 'Projects', icon: Folder },
      { href: '#autodocs', label: 'Documentation', icon: LayoutTemplate },
      { href: '#sharing', label: 'Sharing', icon: Share2 },
      { href: '#exports', label: 'Exports', icon: FileDown },
    ],
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Create an account',
    desc: 'Sign up so your analyses are saved and grouped into projects.',
    href: '/users/signup',
    cta: 'Sign up',
  },
  {
    step: '02',
    title: 'Add a file',
    desc: 'Upload a file up to 200KB, or paste a snippet into the editor.',
    href: '/',
    cta: 'Open dashboard',
  },
  {
    step: '03',
    title: 'Read the report',
    desc: 'Commented source, logic flow, complexity, and improvements.',
    href: '/',
    cta: 'Open dashboard',
  },
];

export default function Documentation() {
  return (
    <div className="min-h-screen bg-ground text-ink flex">
      <aside className="w-64 border-r border-border bg-surface hidden md:flex flex-col fixed inset-y-0 z-20">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="size-5 text-accent">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <div className="leading-none">
              <p className="text-[14px] font-semibold tracking-tight text-accent">CodeWise</p>
              <span className="text-[11px] text-ink-3">Documentation</span>
            </div>
          </Link>
          <ThemeToggle />
        </div>

        <nav className="p-3 flex flex-col gap-5 overflow-y-auto flex-1">
          {NAV.map((group) => (
            <div key={group.label}>
              <p className="px-2 text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-2">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map(({ href, label, icon: Icon }) => (
                  <a
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium text-ink-2 hover:text-ink hover:bg-surface-2 rounded-md transition-colors duration-150"
                  >
                    <Icon size={15} className="text-ink-3" /> {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-2 px-2.5 py-2 text-[13px] text-ink-2 hover:text-ink hover:bg-surface-2 rounded-md transition-colors duration-150"
          >
            <ArrowLeft size={14} /> Back to app
          </Link>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 min-w-0">
        <div className="md:hidden sticky top-0 bg-ground border-b border-border px-4 h-14 flex items-center justify-between z-30">
          <Link
            href="/"
            className="flex items-center gap-2 text-[13px] font-medium text-ink-2 hover:text-ink"
          >
            <ArrowLeft size={15} /> Back to app
          </Link>
          <ThemeToggle />
        </div>

        <div className="max-w-3xl mx-auto px-6 md:px-10 py-12 md:py-16 flex flex-col gap-20 pb-28">
          <section id="introduction" className="scroll-mt-8">
            <h1 className="text-[38px] font-semibold tracking-tight leading-[1.1] text-balance">
              CodeWise documentation
            </h1>
            <p className="mt-5 text-lg text-ink-2 leading-relaxed">
              CodeWise reads a source file and returns a commented version of it alongside a
              plain-English explanation, its time and space complexity, and concrete suggestions for
              improving it. This page covers how the pieces fit together.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-7">
              <a
                href="#quickstart"
                className="inline-flex items-center h-9 px-4 bg-accent text-accent-fg text-sm font-medium rounded-md hover:bg-accent-hover transition-colors duration-150"
              >
                Quick start
              </a>
              <Link
                href="/"
                className="inline-flex items-center h-9 px-4 border border-border-strong text-sm font-medium rounded-md hover:bg-surface-2 transition-colors duration-150"
              >
                Open the dashboard
              </Link>
            </div>
          </section>

          <section id="quickstart" className="scroll-mt-8">
            <h2 className="text-[26px] font-semibold tracking-tight">Quick start</h2>
            <p className="mt-2 text-ink-2">Three steps from signing up to a finished report.</p>

            <div className="mt-7 flex flex-col gap-px bg-border border border-border rounded-lg overflow-hidden">
              {STEPS.map((item) => (
                <div
                  key={item.step}
                  className="bg-ground p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <span className="font-mono text-[12px] text-accent tabular flex-none w-8">
                    {item.step}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1 text-[13px] text-ink-2 leading-relaxed">{item.desc}</p>
                  </div>
                  <Link
                    href={item.href}
                    className="flex-none text-[13px] font-medium text-accent hover:underline underline-offset-2"
                  >
                    {item.cta} →
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section id="projects" className="scroll-mt-8">
            <h2 className="text-[26px] font-semibold tracking-tight flex items-center gap-2.5">
              <Folder size={22} className="text-ink-3" /> Projects
            </h2>
            <p className="mt-3 text-ink-2 leading-relaxed">
              A project is a container for related analyses. Grouping files this way is what makes
              project-wide documentation possible, since CodeWise reads every analyzed file in the
              project when it assembles the docs.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  title: 'Analyses are saved',
                  body: 'Every report stays in your account until you remove it.',
                },
                {
                  title: 'Grouped by project',
                  body: 'Files analyzed without a project land in a dated catch-all.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-2.5 bg-surface border border-border p-4 rounded-lg"
                >
                  <CheckCircle2 size={17} className="text-good mt-0.5 flex-none" />
                  <div>
                    <h4 className="text-[14px] font-medium text-ink">{item.title}</h4>
                    <p className="text-[13px] text-ink-2 mt-0.5 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="autodocs" className="scroll-mt-8">
            <h2 className="text-[26px] font-semibold tracking-tight flex items-center gap-2.5">
              <LayoutTemplate size={22} className="text-ink-3" /> Project documentation
            </h2>
            <p className="mt-3 text-ink-2 leading-relaxed">
              From a project, CodeWise assembles sectioned documentation covering every file it has
              analyzed. Re-run it after adding files and the structure is rebuilt to include them.
            </p>

            <ul className="mt-5 flex flex-col gap-2.5">
              {[
                'Sections and pages generated from your analyzed files',
                'Markdown content per file, rendered as a documentation site',
                'Rebuild at any time to pick up newly analyzed files',
              ].map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-[14px] text-ink-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent flex-none" />
                  {feat}
                </li>
              ))}
            </ul>

            <p className="mt-6 inline-flex items-center gap-1.5 bg-surface border border-border rounded-md px-3 py-2 text-[12px] font-mono text-ink-2">
              Projects <span className="text-ink-3">›</span> pick a project{' '}
              <span className="text-ink-3">›</span>{' '}
              <span className="text-ink">Documentation</span>
            </p>
          </section>

          <section id="sharing" className="scroll-mt-8">
            <h2 className="text-[26px] font-semibold tracking-tight flex items-center gap-2.5">
              <Share2 size={22} className="text-ink-3" /> Sharing
            </h2>
            <p className="mt-3 text-ink-2 leading-relaxed">
              Any analysis can be published as a read-only link. Anyone holding it can read that one
              report; they cannot edit it, and they cannot see anything else in your account.
              Analyses are private until you create a link.
            </p>

            <div className="mt-5 bg-surface border border-border rounded-lg p-4 flex items-center justify-between gap-4">
              <code className="text-[12px] font-mono text-ink-2 truncate">
                https://thecodewise.vercel.app/share/x9s8d…
              </code>
              <Share2 size={14} className="text-ink-3 flex-none" />
            </div>
          </section>

          <section id="exports" className="scroll-mt-8">
            <h2 className="text-[26px] font-semibold tracking-tight flex items-center gap-2.5">
              <FileDown size={22} className="text-ink-3" /> Exports
            </h2>
            <p className="mt-3 text-ink-2 leading-relaxed">
              Individual analyses export as PDF. Project documentation exports as either PDF or a
              single Markdown file, which is the easier one to commit back into a repository.
            </p>
          </section>
        </div>

        <footer className="border-t border-border py-10 px-6 text-center">
          <p className="text-[13px] text-ink-3">CodeWise © 2026</p>
        </footer>
      </main>
    </div>
  );
}
