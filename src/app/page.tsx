'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { API_BASE_URL } from './utils/api';
import dynamic from 'next/dynamic';
import {
  Upload,
  FileCode,
  X,
  Code2,
  ArrowRight,
  LogOut,
  Folder,
  Menu,
  Loader2
} from 'lucide-react';

// Import Components
import ProjectsView from './projects/page';
import LandingPage from './landing/page';
import ConfirmDialog from './component/ConfirmDialog';

// Editor Import
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#1e1e1e] text-[#888] gap-2">
      <Loader2 className="animate-spin w-6 h-6" />
      <span className="text-xs font-mono">Loading Editor...</span>
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

export default function Home() {
  const router = useRouter();
  
  // Auth & User State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  
  // Navigation State
  const [activePage, setActivePage] = useState('dashboard'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dashboard Input State
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [analyzing, setAnalyzing] = useState(false);

  // Project Context State
  const [linkedProjectId, setLinkedProjectId] = useState<string | null>(null);

  // Logout Confirmation State
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // --- Auth Check & Initialization ---
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);

      if (typeof window !== 'undefined') {
          const paramProjectId = new URLSearchParams(window.location.search).get('projectId');
          if (paramProjectId) {
            setLinkedProjectId(paramProjectId);
            setActivePage('dashboard'); 
          }
      }
    } else {
      setIsAuthenticated(false);
    }
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
        toast.error("Please enter some code first.");
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
      const token = localStorage.getItem('accessToken');

      const response = await axios.post(`${API_BASE_URL}/explainations`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });

      const newId = response.data.explanation?.id || response.data.id || response.data.data?.id;

      if (newId) {
        router.push(`/explanation/${newId}`);
      } else {
        toast.error("Analysis finished, but no ID was returned.");
        setAnalyzing(false);
      }

    } catch (error: any) {
      if (axios.isCancel(error)) return;
      console.error('Analysis failed:', error);
      toast.error(error.response?.data?.message || 'Analysis failed. Please try again.');
      setAnalyzing(false);
    }
  };

  const handleCancelAnalyze = () => {
    abortControllerRef.current?.abort();
    setAnalyzing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setShowLogoutConfirm(false);
    router.push('/');
  };

  const navTo = (page: string) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
    if (page === 'dashboard') router.push('/');
  };

  // --- RENDER LOGIC ---

  if (isAuthenticated === null) return null; 
  if (!isAuthenticated) return <LandingPage />;
  if (!user) return null; 

  return (
    <Suspense fallback={null}>
    <div className="min-h-screen bg-[#000000] font-sans text-white flex flex-col overflow-x-hidden selection:bg-white selection:text-black">
      
      {/* Background Grid Pattern */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-20" 
        style={{
          backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* --- HEADER (Updated to match Projects Page Design) --- */}
      <header className="relative z-20 w-full border-b border-[#333333] bg-[#000000]/80 backdrop-blur-md">
        <div className="px-6 md:px-10 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="size-6 text-white">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h1 className="text-sm font-semibold tracking-tight text-white font-mono">CodeWise</h1>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-6">
              <button 
                onClick={() => navTo('dashboard')} 
                className="text-xs font-mono text-white flex items-center gap-1 cursor-default"
              >
                /dashboard
              </button>
              
              <button 
                onClick={() => router.push('/projects')} 
                className="text-xs font-mono text-[#888] hover:text-white transition-colors flex items-center gap-1"
              >
                /projects
              </button>
            </nav>
            
            <div className="h-6 w-[1px] bg-[#333333]"></div>
            
            {/* UPDATED LOGOUT BUTTON (Styled Pill) */}
            <button onClick={() => setShowLogoutConfirm(true)} className="group flex items-center gap-2 rounded-full pr-3 pl-1 py-1 bg-[#111111] border border-[#333333] hover:border-[#888888] transition-all">
              <div className="size-6 rounded-full bg-[#333] flex items-center justify-center text-[10px] font-mono">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-mono text-[#888888] group-hover:text-white">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#050505] border-b border-[#333] animate-in slide-in-from-top-2">
            <nav className="flex flex-col p-4 space-y-4">
              <button onClick={() => navTo('dashboard')} className="text-sm font-mono text-left px-2 text-white">/dashboard</button>
              <button onClick={() => router.push('/projects')} className="text-sm font-mono text-left px-2 text-[#888]">/projects</button>
              <div className="h-[1px] bg-[#333] w-full my-2"></div>
              <button onClick={() => setShowLogoutConfirm(true)} className="text-sm font-mono text-left text-red-400 px-2 flex items-center gap-2">
                <LogOut size={14} /> Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Log out?"
        message="You'll need to sign in again to access your projects and analyses."
        confirmLabel="Log Out"
        danger
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
        
        {/* VIEW: DASHBOARD (Home) */}
        {activePage === 'dashboard' && (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
            
            {!analyzing ? (
              <>
                <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">Ready to Optimize?</h1>
                    
                    {linkedProjectId ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#111] border border-indigo-500/50 text-indigo-400 text-xs font-mono mb-2 animate-in zoom-in">
                        <Folder size={12} />
                        Linked to Project #{linkedProjectId}
                      </div>
                    ) : (
                      <p className="text-[#888] text-sm font-mono">Upload a file or paste code to generate an AI explanation.</p>
                    )}
                </div>

                {/* --- DASHBOARD INPUT UI --- */}
                <div className="w-full max-w-full sm:max-w-[600px] bg-[#111111] border border-[#333333] rounded-lg shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
                  
                  {/* Tab Navigation */}
                  <div className="flex border-b border-[#333333]">
                    <button 
                      onClick={() => setActiveTab('upload')}
                      className={`flex-1 py-3 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'upload' ? 'bg-[#111] text-white border-b-2 border-white' : 'bg-black text-[#666] hover:text-[#999]'}`}
                    >
                      <Upload size={14} /> Upload File
                    </button>
                    <button 
                      onClick={() => setActiveTab('paste')}
                      className={`flex-1 py-3 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'paste' ? 'bg-[#111] text-white border-b-2 border-white' : 'bg-black text-[#666] hover:text-[#999]'}`}
                    >
                      <Code2 size={14} /> Paste Code
                    </button>
                  </div>

                  <div className="p-6 sm:p-8">
                      {activeTab === 'upload' ? (
                        // UPLOAD VIEW
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 relative">
                              <div className="relative bg-black rounded-full p-4 border border-[#333333] group hover:border-white/20 transition-colors">
                                <Upload className="text-white w-8 h-8" strokeWidth={1.5} />
                              </div>
                            </div>
                            
                            <div 
                              className={`w-full mb-8 relative group cursor-pointer`}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={handleDrop}
                            >
                              <input 
                                type="file" 
                                onChange={handleFileChange} 
                                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" 
                              />
                              <div className={`
                                border border-dashed rounded-md p-8 flex flex-col items-center justify-center gap-3 transition-all h-32 sm:h-40
                                ${file ? 'border-white/40 bg-white/5' : 'border-[#333333] bg-black group-hover:border-[#555]'}
                              `}>
                                {file ? (
                                  <>
                                    <FileCode className="text-white w-8 h-8" />
                                    <span className="text-sm font-mono text-white break-all">{file.name}</span>
                                    <span className="text-xs font-mono text-[#888888]">{(file.size / 1024).toFixed(2)} KB</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-xs font-mono text-[#888888]">Drag & drop or click to browse</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <button 
                              onClick={handleAnalyze}
                              disabled={!file}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded bg-white text-black hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-mono font-bold tracking-wider"
                            >
                              ANALYZE FILE <ArrowRight size={14} />
                            </button>
                        </div>
                      ) : (
                        // PASTE CODE VIEW
                        <div className="flex flex-col h-[350px] sm:h-[420px]">
                          <div className="flex justify-between items-center mb-4">
                            <label className="text-xs font-mono text-[#888888] uppercase">Language</label>
                            <div className="relative">
                              <select 
                                value={selectedLanguage.id}
                                onChange={(e) => setSelectedLanguage(LANGUAGES.find(l => l.id === e.target.value) || LANGUAGES[0])}
                                className="appearance-none bg-[#0a0a0a] border border-[#333] text-white text-xs font-mono rounded px-3 py-1.5 pr-8 focus:outline-none focus:border-white cursor-pointer"
                              >
                                {LANGUAGES.map(lang => (
                                  <option key={lang.id} value={lang.id}>{lang.name} (.{lang.ext})</option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#888]">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 border border-[#333333] rounded-md overflow-hidden mb-6 relative">
                              {/* 3. Using the Dynamically Imported Editor */}
                              <Editor
                                height="100%"
                                defaultLanguage="javascript"
                                language={selectedLanguage.id}
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                theme="vs-dark"
                                options={{
                                  minimap: { enabled: false },
                                  fontSize: 13,
                                  fontFamily: 'JetBrains Mono, monospace',
                                  scrollBeyondLastLine: false,
                                  padding: { top: 16, bottom: 16 },
                                  renderLineHighlight: 'none'
                                }}
                              />
                          </div>

                          <button 
                              onClick={handleAnalyze}
                              disabled={!code.trim()}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded bg-white text-black hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-mono font-bold tracking-wider"
                            >
                              ANALYZE CODE <ArrowRight size={14} />
                            </button>
                        </div>
                      )}
                  </div>
                </div>
              </>
            ) : (
              // --- UPLOAD STATE ---
              // Intentionally minimal: this only covers the brief upload request.
              // Once the server accepts the job we navigate to /explanation/[id],
              // which owns the single source of truth for queue/processing status.
              <div className="w-full max-w-[440px] bg-[#111111] border border-[#333333] rounded-md shadow-2xl overflow-hidden relative mx-4">
                <div className="p-8 flex flex-col items-center text-center">
                  <div className="mb-6 relative">
                    <div className="relative bg-black rounded-full p-4 border border-[#333333]">
                      <Loader2 className="w-8 h-8 text-white animate-spin" strokeWidth={1.5} />
                    </div>
                  </div>

                  <h2 className="text-lg font-medium text-white mb-2 tracking-tight">Uploading...</h2>

                  <p className="text-sm text-[#888888] mt-2 leading-relaxed max-w-xs mx-auto">
                    Sending your code to the analysis queue. You&apos;ll be redirected automatically.
                  </p>

                  <div className="mt-8 w-full pt-6 border-t border-[#333333]">
                    <button
                      onClick={handleCancelAnalyze}
                      className="group w-full flex items-center justify-center gap-2 px-4 py-2 rounded bg-transparent border border-[#333333] text-[#888888] hover:text-white hover:border-[#888888] hover:bg-white/5 transition-all focus:outline-none focus:ring-1 focus:ring-white"
                    >
                      <X size={16} />
                      <span className="text-xs font-mono font-medium">CANCEL</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
    </Suspense>
  );
}