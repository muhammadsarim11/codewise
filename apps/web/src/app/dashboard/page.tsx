'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import api, { clearLocalSession, logout as endSession, readCachedUser } from '../utils/api';
import dynamic from 'next/dynamic';
import {
  Upload,
  FileCode,
  X,
  Code2,
  ArrowRight,
  LogOut,
  Folder,
  Loader2,
} from 'lucide-react';

import ConfirmDialog from '../component/ConfirmDialog';
import { Button } from '../component/ui/Button';
import { Select } from '../component/ui/Field';
import { ThemeToggle } from '../component/ui/ThemeToggle';
import { useTheme } from '../component/ThemeProvider';
import { cn } from '../utils/cn';
import { defineMonacoThemes, MONACO_DARK, MONACO_LIGHT } from '../utils/monacoTheme';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-surface text-ink-3 gap-2">
      <Loader2 className="animate-spin w-5 h-5" />
      <span className="text-[12px]">Loading editor…</span>
    </div>
  ),
});

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', ext: 'js' },
  { id: 'typescript', name: 'TypeScript', ext: 'ts' },
  { id: 'python', name: 'Python', ext: 'py' },
  { id: 'java', name: 'Java', ext: 'java' },
  { id: 'cpp', name: 'C++', ext: 'cpp' },
  { id: 'csharp', name: 'C#', ext: 'cs' },
  { id: 'go', name: 'Go', ext: 'go' },
  { id: 'rust', name: 'Rust', ext: 'rs' },
  { id: 'php', name: 'PHP', ext: 'php' },
  { id: 'ruby', name: 'Ruby', ext: 'rb' },
  { id: 'swift', name: 'Swift', ext: 'swift' },
  { id: 'kotlin', name: 'Kotlin', ext: 'kt' },
];

export default function Dashboard() {
  const router = useRouter();
  const { theme } = useTheme();

  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  // 'checking' only ever shows for a visitor with no cached session; anyone
  // returning to their own device goes straight to the workspace.
  const [status, setStatus] = useState<'checking' | 'ready'>('checking');

  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [analyzing, setAnalyzing] = useState(false);

  const [linkedProjectId, setLinkedProjectId] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;

    const resolveSession = async () => {
      const paramProjectId = new URLSearchParams(window.location.search).get('projectId');
      if (paramProjectId) {
        setLinkedProjectId(paramProjectId);
      }

      // Show the cached user straight away. The probe below is the authority,
      // but the API cold-starts on demand and can take tens of seconds, and
      // blocking on it left this page empty for that whole time. The cache is
      // not a security boundary — every request is authorised server-side.
      const cached = readCachedUser();
      if (cached) {
        setUser(cached);
        setStatus('ready');
      }

      try {
        const res = await api.get('/profile', { skipAuthRedirect: true });
        if (cancelled) return;

        const profile = res.data.user;
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
        setStatus('ready');
      } catch (error) {
        if (cancelled) return;

        // Only a verdict from the server ends the session. A timeout or a dead
        // connection means we simply do not know yet, and wiping the session on
        // those logged people out every time the API was slow to wake up.
        const code = axios.isAxiosError(error) ? error.response?.status : undefined;
        const rejected = code === 401 || code === 403;

        if (rejected) {
          clearLocalSession();
          setUser(null);
          router.replace('/users/signin');
          return;
        }

        if (!cached) {
          // Unreachable API and nothing cached: there is no workspace to show.
          toast.error('Could not reach the server. Check your connection and retry.');
          setStatus('ready');
        }
      }
    };

    resolveSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // --- Handlers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const generateRandomFilename = (ext: string) => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 6);
    return `snippet_${timestamp}_${randomPart}.${ext}`;
  };

  const handleAnalyze = async () => {
    let fileToSend: File | null = null;

    if (activeTab === 'upload') {
      if (!file) return;
      fileToSend = file;
    } else {
      if (!code.trim()) {
        toast.error('Add some code first.');
        return;
      }
      const filename = generateRandomFilename(selectedLanguage.ext);
      const blob = new Blob([code], { type: 'text/plain' });
      fileToSend = new File([blob], filename, { type: 'text/plain' });
    }

    setAnalyzing(true);

    const formData = new FormData();
    formData.append('file', fileToSend);

    if (linkedProjectId) {
      formData.append('projectId', linkedProjectId);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await api.post('/explainations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: controller.signal,
      });

      const newId = response.data.explanation?.id || response.data.id || response.data.data?.id;

      if (newId) {
        router.push(`/explanation/${newId}`);
      } else {
        toast.error('The analysis was accepted but returned no ID.');
        setAnalyzing(false);
      }
    } catch (error: any) {
      if (axios.isCancel(error)) return;
      console.error('Analysis failed:', error);
      toast.error(error.response?.data?.message || 'Could not start the analysis.');
      setAnalyzing(false);
    }
  };

  const handleCancelAnalyze = () => {
    abortControllerRef.current?.abort();
    setAnalyzing(false);
  };

  const handleLogout = async () => {
    await endSession();
    setUser(null);
    setShowLogoutConfirm(false);
    router.push('/');
  };

  // --- Render ---

  if (!user) {
    // Either the probe is still out (no cached session to show meanwhile) or it
    // came back rejected and the redirect to sign-in is already on its way.
    return (
      <div className="min-h-screen bg-ground text-ink flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-accent animate-spin" />
        <p className="text-[13px] text-ink-2">
          {status === 'checking' ? 'Signing you in…' : 'Redirecting…'}
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <div className="min-h-screen bg-ground text-ink flex flex-col">
        <header className="w-full border-b border-border bg-ground sticky top-0 z-20">
          <div className="px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2.5">
                <div className="size-5 text-accent">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                    <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                  </svg>
                </div>
                <span className="text-[15px] font-semibold tracking-tight text-accent">CodeWise</span>
              </button>

              <nav className="hidden md:flex items-center gap-1">
                <button
                  aria-current="page"
                  className="px-3 py-1.5 rounded-md text-[13px] font-medium bg-accent-soft text-accent"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/projects')}
                  className="px-3 py-1.5 rounded-md text-[13px] font-medium text-ink-2 hover:text-ink hover:bg-surface-2 transition-colors duration-150"
                >
                  Projects
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setShowLogoutConfirm(true)}
                aria-label="Sign out"
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-md border border-border hover:border-border-strong transition-colors duration-150"
              >
                <span className="size-6 rounded-full bg-surface-2 flex items-center justify-center text-[11px] font-semibold text-ink-2">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
                <LogOut size={13} className="text-ink-3" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center px-6 py-12">
          {!analyzing ? (
            <div className="w-full max-w-xl">
              <div className="mb-6">
                <h1 className="text-xl font-semibold tracking-tight">New analysis</h1>
                {linkedProjectId ? (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-accent">
                    <Folder size={13} />
                    Saving to project {linkedProjectId}
                  </p>
                ) : (
                  <p className="mt-1 text-[13px] text-ink-2">
                    Upload a file or paste code to generate an explanation.
                  </p>
                )}
              </div>

              <div className="border border-border rounded-lg bg-ground overflow-hidden">
                <div role="tablist" className="flex border-b border-border bg-surface">
                  {(
                    [
                      { id: 'upload', label: 'Upload file', icon: Upload },
                      { id: 'paste', label: 'Paste code', icon: Code2 },
                    ] as const
                  ).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      role="tab"
                      aria-selected={activeTab === id}
                      onClick={() => setActiveTab(id)}
                      className={cn(
                        'flex-1 h-11 text-[13px] font-medium flex items-center justify-center gap-2',
                        'transition-colors duration-150 border-b-2 -mb-px',
                        activeTab === id
                          ? 'bg-ground text-ink border-accent'
                          : 'text-ink-2 border-transparent hover:text-ink'
                      )}
                    >
                      <Icon size={15} /> {label}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === 'upload' ? (
                    <div className="flex flex-col">
                      <div
                        className="relative group"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          onChange={handleFileChange}
                          aria-label="Choose a code file"
                          className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                        />
                        <div
                          className={cn(
                            'border border-dashed rounded-md h-40 flex flex-col items-center justify-center gap-2 text-center px-6',
                            'transition-colors duration-150',
                            file
                              ? 'border-accent bg-accent-soft'
                              : 'border-border-strong bg-surface group-hover:border-ink-3'
                          )}
                        >
                          {file ? (
                            <>
                              <FileCode className="text-accent" size={22} />
                              <span className="text-[13px] font-medium text-ink break-all">
                                {file.name}
                              </span>
                              <span className="text-[12px] text-ink-3 tabular">
                                {(file.size / 1024).toFixed(1)} KB
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload className="text-ink-3" size={22} />
                              <span className="text-[13px] text-ink-2">
                                Drag a file here, or click to browse
                              </span>
                              <span className="text-[12px] text-ink-3">
                                Up to 200KB · 32 file types
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        onClick={handleAnalyze}
                        disabled={!file}
                        className="w-full mt-5 h-10"
                      >
                        Analyze file <ArrowRight size={15} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <Select
                        label="Language"
                        value={selectedLanguage.id}
                        onChange={(e) =>
                          setSelectedLanguage(
                            LANGUAGES.find((l) => l.id === e.target.value) || LANGUAGES[0]
                          )
                        }
                        wrapperClassName="mb-4"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.id} value={lang.id}>
                            {lang.name}
                          </option>
                        ))}
                      </Select>

                      <div className="border border-border rounded-md overflow-hidden h-[340px]">
                        <Editor
                          height="100%"
                          defaultLanguage="javascript"
                          language={selectedLanguage.id}
                          value={code}
                          onChange={(value) => setCode(value || '')}
                          beforeMount={defineMonacoThemes}
                          theme={theme === 'dark' ? MONACO_DARK : MONACO_LIGHT}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            fontFamily: 'var(--font-mono), monospace',
                            scrollBeyondLastLine: false,
                            padding: { top: 14, bottom: 14 },
                            renderLineHighlight: 'none',
                          }}
                        />
                      </div>

                      <Button
                        variant="primary"
                        onClick={handleAnalyze}
                        disabled={!code.trim()}
                        className="w-full mt-5 h-10"
                      >
                        Analyze code <ArrowRight size={15} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Deliberately minimal: this covers only the upload request. Once the
               server accepts the job we navigate to /explanation/[id], which owns
               the single source of truth for queue and processing status. */
            <div className="w-full max-w-sm mt-16 border border-border rounded-lg bg-ground p-8 text-center">
              <Loader2 className="w-6 h-6 text-accent animate-spin mx-auto" />
              <h2 className="mt-4 text-[15px] font-semibold text-ink">Uploading</h2>
              <p className="mt-1.5 text-[13px] text-ink-2 leading-relaxed">
                Sending your code to the analysis queue. You&apos;ll be redirected as soon as
                it&apos;s accepted.
              </p>
              <Button variant="secondary" onClick={handleCancelAnalyze} className="w-full mt-6">
                <X size={15} /> Cancel
              </Button>
            </div>
          )}
        </main>

        <ConfirmDialog
          open={showLogoutConfirm}
          title="Sign out?"
          message="You'll need to sign in again to reach your projects and analyses."
          confirmLabel="Sign out"
          danger
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      </div>
    </Suspense>
  );
}
