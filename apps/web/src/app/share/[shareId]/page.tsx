'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Download, FileCode, Globe, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import { exportAnalysisPdf } from '../../utils/exportPdf';
import { AnalysisReport, type AnalysisData } from '../../component/AnalysisReport';
import { Button } from '../../component/ui/Button';
import { ThemeToggle } from '../../component/ui/ThemeToggle';

export default function PublicSharePage() {
  const params = useParams();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicExplanation = async () => {
      try {
        const response = await api.get(`/share/${params.shareId}`);

        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError('This report could not be loaded.');
        }
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(
          err.response?.status === 404
            ? 'This report is private or no longer exists.'
            : 'This report could not be loaded.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.shareId) fetchPublicExplanation();
  }, [params.shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ground flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
        <p className="text-ink-3 text-[13px]">Loading report…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center p-6">
        <div className="bg-surface border border-border rounded-lg p-8 max-w-sm w-full text-center">
          <AlertCircle className="text-critical mx-auto mb-4" size={28} />
          <h2 className="text-ink font-semibold text-[15px] mb-1.5">Report unavailable</h2>
          <p className="text-ink-2 text-[13px] mb-6 leading-relaxed">{error}</p>
          <Link href="/">
            <Button variant="secondary" className="w-full">
              Go to CodeWise
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-ground text-ink flex flex-col overflow-hidden">
      <header className="flex-none border-b border-border bg-ground z-20">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 flex-none">
              <div className="size-5 text-accent">
                <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                  <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <span className="text-[15px] font-semibold tracking-tight hidden sm:inline text-accent">
                CodeWise
              </span>
            </Link>

            <span className="h-4 w-px bg-border flex-none hidden sm:block" />

            <div className="flex items-center gap-2 min-w-0">
              <FileCode size={15} className="text-ink-3 flex-none" />
              <h1 className="text-sm font-semibold tracking-tight truncate">
                {data.fileName || 'snippet'}
              </h1>
              <span className="flex-none inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-2">
                <Globe size={10} /> Public
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-none">
            <ThemeToggle />
            <Button variant="secondary" size="sm" onClick={() => exportAnalysisPdf(data)}>
              <Download size={14} />
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
            <Link href="/users/signup" className="hidden sm:block">
              <Button variant="primary" size="sm">
                Try CodeWise
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <AnalysisReport data={data} />
    </div>
  );
}
