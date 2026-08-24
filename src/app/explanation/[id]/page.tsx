'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '../../utils/api';
import { exportAnalysisPdf } from '../../utils/exportPdf';
import {
  ArrowLeft,
  FileCode,
  Share2,
  Download,
  AlertCircle,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';

import { AnalysisReport, type AnalysisData } from '../../component/AnalysisReport';
import { Button } from '../../component/ui/Button';
import { Dialog } from '../../component/ui/Dialog';
import { StatusPill } from '../../component/ui/Display';
import { ThemeToggle } from '../../component/ui/ThemeToggle';

interface ExplanationData extends AnalysisData {
  projectId: string;
  isPublic: boolean;
  publicShareId?: string;
}

export default function ExplanationResult() {
  const params = useParams();
  const router = useRouter();

  const [data, setData] = useState<ExplanationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [shareLoading, setShareLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  const [isPolling, setIsPolling] = useState(true);

  const fetchExplanation = useCallback(async () => {
    try {
      // Auth lives in an httpOnly cookie, so there is nothing to check here:
      // the client refreshes on 401 and redirects to sign-in if that fails.
      const response = await api.get(`/explainations/${params.id}`);

      let responseData = response.data.explanation || response.data.data || response.data;

      if (responseData && responseData.status) {
        responseData = { ...responseData, status: responseData.status.toLowerCase() };
      }

      setData(responseData);

      const status = responseData.status;
      const isComplete = status === 'completed' || status === 'done' || status === 'success';
      const isFailed = status === 'failed';

      if (isComplete || isFailed) {
        setIsPolling(false);
        setLoading(false);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('This analysis is not available, or is not yours to view.');
        setIsPolling(false);
        setLoading(false);
      }
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) fetchExplanation();
  }, [params.id, fetchExplanation]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isPolling) {
      intervalId = setInterval(fetchExplanation, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPolling, fetchExplanation]);

  const handleShare = async () => {
    if (!data) return;
    setShareLoading(true);

    try {
      if (data.isPublic && data.publicShareId) {
        setShareLink(`${window.location.origin}/share/${data.publicShareId}`);
        setShowShareModal(true);
        setShareLoading(false);
        return;
      }

      const response = await api.patch(`/explainations/${data.id}/share`, {});
      const shareId = response.data.shareId || response.data.publicShareId;

      if (shareId) {
        setShareLink(`${window.location.origin}/share/${shareId}`);
        setShowShareModal(true);
        setData((prev) => (prev ? { ...prev, isPublic: true, publicShareId: shareId } : null));
      } else {
        toast.error('Could not create a share link.');
      }
    } catch (err: any) {
      console.error('Share error:', err);
      toast.error(err.response?.data?.message || 'Could not create a share link.');
    } finally {
      setShareLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Render states ---

  if (error) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center p-6">
        <div className="bg-surface border border-border rounded-lg p-8 max-w-sm w-full text-center">
          <AlertCircle className="text-critical mx-auto mb-4" size={28} />
          <h2 className="text-ink font-semibold text-[15px] mb-1.5">Analysis not found</h2>
          <p className="text-ink-2 text-[13px] mb-6 leading-relaxed">{error}</p>
          <Button variant="secondary" onClick={() => router.push('/')} className="w-full">
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  const status = data?.status?.toLowerCase();
  const isFinished =
    status === 'completed' || status === 'done' || status === 'success' || status === 'failed';

  if (loading || (data && !isFinished)) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center p-6">
        <div className="w-full max-w-sm border border-border rounded-lg bg-surface p-8 text-center">
          <Loader2 className="w-6 h-6 text-accent animate-spin mx-auto" />
          <h2 className="mt-4 text-[15px] font-semibold text-ink">
            {status === 'processing' ? 'Analyzing your code' : 'Queued for analysis'}
          </h2>
          <p className="mt-1.5 text-[13px] text-ink-2 leading-relaxed">
            {status === 'processing'
              ? 'The worker is reading your file. This page updates on its own.'
              : 'Waiting for a worker to pick this up. This page updates on its own.'}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-[12px] text-ink-3">
            <span>Analysis</span>
            <span className="font-mono text-ink-2">
              #{params.id ? params.id.toString().slice(-6) : '------'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="h-screen bg-ground text-ink flex flex-col overflow-hidden">
      <header className="flex-none border-b border-border bg-ground z-20">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push('/projects')}
              aria-label="Back to projects"
              className="p-1.5 rounded-md text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors duration-150"
            >
              <ArrowLeft size={17} />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <FileCode size={15} className="text-ink-3 flex-none" />
              <h1 className="text-sm font-semibold tracking-tight truncate">
                {data.fileName || 'snippet'}
              </h1>
              <StatusPill status={data.status} className="flex-none ml-1" />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-none">
            <ThemeToggle />
            <Button variant="secondary" size="sm" onClick={handleShare} loading={shareLoading}>
              <Share2 size={14} />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="primary" size="sm" onClick={() => exportAnalysisPdf(data)}>
              <Download size={14} />
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
          </div>
        </div>
      </header>

      <AnalysisReport data={data} />

      <Dialog
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share this analysis"
        description="Anyone with this link can read the report. They cannot edit it or see your other work."
      >
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            aria-label="Share link"
            value={shareLink}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 h-9 rounded-md bg-surface border border-border px-3 font-mono text-[12px] text-ink-2"
          />
          <Button variant="primary" onClick={copyToClipboard} className="flex-none">
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
