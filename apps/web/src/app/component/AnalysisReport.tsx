'use client';

import dynamic from 'next/dynamic';
import {
  AlertCircle,
  BookOpen,
  Cpu,
  Layers,
  Lightbulb,
  List,
  Puzzle,
  Terminal,
} from 'lucide-react';
import { Markdown } from './ui/Markdown';
import { useTheme } from './ThemeProvider';
import { defineMonacoThemes, MONACO_DARK, MONACO_LIGHT } from '../utils/monacoTheme';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-ink-3 text-[13px] bg-surface">
      Loading editor…
    </div>
  ),
});

export interface AnalysisDoc {
  overview: string;
  logicFlow: string;
  usageExample: string;
  functionBreakdown: string;
}

export interface AnalysisData {
  id: string;
  fileName: string;
  language: string;
  originalCode: string;
  commentedCode: string;
  complexity: string;
  createdAt: string;
  explanationDoc: AnalysisDoc;
  improvements: string[];
  keyPoints: string[];
  status: string;
  aiModel?: string;
  tokensUsed?: number;
}

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={15} className="text-ink-3" />
      <h3 className="text-[13px] font-semibold text-ink">{children}</h3>
    </div>
  );
}

/**
 * The split source/report view, shared by the owner's page and the public share
 * page. Those two were previously separate copies of the same markup, so a fix
 * to one drifted from the other.
 */
export function AnalysisReport({ data }: { data: AnalysisData }) {
  const { theme } = useTheme();
  const isFailed = data.status?.toLowerCase() === 'failed';

  return (
    <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      <div className="w-full lg:w-1/2 h-1/2 lg:h-auto border-b lg:border-b-0 lg:border-r border-border flex flex-col bg-ground">
        <div className="flex-none px-4 h-9 border-b border-border bg-surface flex items-center justify-between">
          <span className="text-[12px] font-medium text-ink-3">Commented source</span>
          <span className="text-[12px] text-ink-3">{data.language}</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={data.language || 'javascript'}
            value={data.commentedCode || data.originalCode || ''}
            beforeMount={defineMonacoThemes}
            theme={theme === 'dark' ? MONACO_DARK : MONACO_LIGHT}
            options={{
              readOnly: true,
              domReadOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'var(--font-mono), monospace',
              scrollBeyondLastLine: false,
              padding: { top: 14, bottom: 14 },
              renderLineHighlight: 'none',
            }}
          />
        </div>
      </div>

      <div className="w-full lg:w-1/2 h-1/2 lg:h-auto flex flex-col bg-ground">
        <div className="flex-none px-6 h-9 border-b border-border bg-surface flex items-center">
          <span className="text-[12px] font-medium text-ink-3">Analysis</span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-7">
          {isFailed && (
            <div className="flex items-start gap-2.5 p-3 rounded-md border border-critical/30 bg-critical-soft">
              <AlertCircle size={15} className="text-critical flex-none mt-0.5" />
              <p className="text-[13px] text-critical leading-relaxed">
                This analysis failed. {data.commentedCode}
              </p>
            </div>
          )}

          <section>
            <SectionHeading icon={BookOpen}>Overview</SectionHeading>
            <div className="bg-surface border border-border rounded-md p-4">
              <Markdown>{data.explanationDoc?.overview}</Markdown>
            </div>
          </section>

          {data.keyPoints && data.keyPoints.length > 0 && (
            <section>
              <SectionHeading icon={List}>Key takeaways</SectionHeading>
              <ul className="flex flex-col gap-2">
                {data.keyPoints.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-3 bg-surface border border-border rounded-md"
                  >
                    <span className="flex-none w-5 h-5 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[11px] font-medium tabular">
                      {i + 1}
                    </span>
                    <span className="text-sm text-ink-2 leading-relaxed">
                      {point.replace(/^- /, '')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <SectionHeading icon={Layers}>Logic flow</SectionHeading>
            <div className="bg-surface border border-border rounded-md p-4">
              <Markdown>{data.explanationDoc?.logicFlow}</Markdown>
            </div>
          </section>

          <section>
            <SectionHeading icon={Puzzle}>Function breakdown</SectionHeading>
            <div className="bg-surface border border-border rounded-md p-4">
              <Markdown>{data.explanationDoc?.functionBreakdown}</Markdown>
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <section>
              <SectionHeading icon={Cpu}>Complexity</SectionHeading>
              <div className="bg-surface border border-border rounded-md p-4">
                <span className="font-mono text-[13px] text-ink-2 tabular">
                  {data.complexity || 'Not provided'}
                </span>
              </div>
            </section>

            <section>
              <SectionHeading icon={Lightbulb}>Improvements</SectionHeading>
              <ul className="flex flex-col gap-2">
                {data.improvements && data.improvements.length > 0 ? (
                  data.improvements.map((imp, i) => (
                    <li
                      key={i}
                      className="text-[13px] text-ink-2 leading-relaxed flex items-start gap-2.5 bg-surface border border-border rounded-md p-3"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-warn block flex-none" />
                      {imp}
                    </li>
                  ))
                ) : (
                  <li className="text-[13px] text-ink-3 italic">None suggested.</li>
                )}
              </ul>
            </section>
          </div>

          <section>
            <SectionHeading icon={Terminal}>Usage example</SectionHeading>
            <pre className="bg-surface border border-border rounded-md p-4 font-mono text-[12.5px] text-ink-2 leading-relaxed overflow-x-auto">
              {data.explanationDoc?.usageExample || 'No example provided'}
            </pre>
          </section>

          {/* Provenance: recorded on every analysis and previously never shown. */}
          <footer className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-4 border-t border-border text-[12px] text-ink-3">
            {data.aiModel && (
              <span>
                Model <span className="font-mono text-ink-2">{data.aiModel}</span>
              </span>
            )}
            {typeof data.tokensUsed === 'number' && (
              <span>
                Tokens{' '}
                <span className="font-mono text-ink-2 tabular">
                  {data.tokensUsed.toLocaleString()}
                </span>
              </span>
            )}
            {data.createdAt && (
              <span>
                Analyzed{' '}
                <span className="text-ink-2">
                  {new Date(data.createdAt).toLocaleString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </span>
            )}
          </footer>
        </div>
      </div>
    </main>
  );
}
