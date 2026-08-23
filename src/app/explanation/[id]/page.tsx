'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../utils/api';
// 1. Import Dynamic from Next.js
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, 
  Bot, 
  FileCode, 
  Share2, 
  Download, 
  CheckCircle2,
  AlertCircle,
  Cpu,
  Zap,
  BookOpen,
  Layers,
  List,
  Terminal,
  Puzzle,
  Code2,
  Check,
  X,
  Copy
} from 'lucide-react';

// 2. Dynamically Import Monaco Editor (Heavy Component)
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-500 font-mono text-sm bg-[#050505]">
      Loading Editor...
    </div>
  ),
});

// Updated Interface matching your backend JSON
interface ExplanationDoc {
  overview: string;
  logicFlow: string;
  usageExample: string;
  functionBreakdown: string;
}

interface ExplanationData {
  id: string;
  projectId: string;
  fileName: string;
  language: string;
  originalCode: string;
  aiModel: string;
  commentedCode: string;
  complexity: string;
  createdAt: string;
  explanationDoc: ExplanationDoc;
  improvements: string[];
  keyPoints: string[];
  status: string;
  isPublic: boolean;
  publicShareId?: string;
}

// 3. Move Helper Components OUTSIDE to prevent re-mounting on every render
const GlobalStyles = () => (
  <style jsx global>{`
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: #0a0a0a; }
    ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 5px; border: 2px solid #0a0a0a; }
    ::-webkit-scrollbar-thumb:hover { background: #444; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

const CodeEditorView = ({ code, language }: { code: string, language: string }) => {
  return (
    <Editor
      height="100%"
      language={language || 'javascript'}
      value={code}
      theme="vs-dark"
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: 'JetBrains Mono, monospace',
        renderLineHighlight: 'none',
        padding: { top: 20, bottom: 20 },
        scrollBeyondLastLine: false,
        domReadOnly: true
      }}
      onMount={(editor, monaco) => {
        monaco.editor.defineTheme('codewise-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [],
          colors: {
            'editor.background': '#050505',
            'editor.lineHighlightBackground': '#111111',
            'editorGutter.background': '#050505',
          }
        });
        monaco.editor.setTheme('codewise-dark');
      }}
    />
  );
};

export default function ExplanationResult() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ExplanationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Share State
  const [shareLoading, setShareLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Polling State
  const [isPolling, setIsPolling] = useState(true);

  const fetchExplanation = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/users/signin');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/explainations/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      let responseData = response.data.explanation || response.data.data || response.data;
      
      if (responseData && responseData.status) {
         responseData = {
            ...responseData,
            status: responseData.status.toLowerCase()
         };
      }

      // console.log("Poll Response:", responseData); // Optional: Remove logs for prod
      setData(responseData);

      const status = responseData.status;
      const isComplete = status === 'completed' || status === 'done' || status === 'success';
      const isFailed = status === 'failed';

      if (isComplete || isFailed) {
        setIsPolling(false);
        setLoading(false);
      } else {
        setLoading(true); 
      }

    } catch (err: any) {
      console.error("Fetch error:", err);
      if (err.response?.status === 404) {
         setError('Explanation not found.');
         setIsPolling(false);
         setLoading(false);
      }
    }
  }, [params.id, router]);

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

  // --- ACTIONS ---

  const handleExport = () => {
    if (!data) return;
    
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxLineWidth = pageWidth - (margin * 2);
      let yPos = margin;
      const lineHeight = 6;

      const checkPageBreak = (spaceNeeded: number) => {
        if (yPos + spaceNeeded >= doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPos = margin;
        }
      };

      const addSection = (title: string, body: string) => {
        checkPageBreak(15);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(40, 40, 40);
        doc.text(title, margin, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        
        const lines = doc.splitTextToSize(body || "N/A", maxLineWidth);
        checkPageBreak(lines.length * lineHeight);
        doc.text(lines, margin, yPos);
        yPos += (lines.length * lineHeight) + 10;
      };

      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Analysis Report", margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`File: ${data.fileName || 'snippet'}`, margin, yPos);
      yPos += 5;
      doc.text(`Language: ${data.language}`, margin, yPos);
      yPos += 15;

      addSection("1. Overview", data.explanationDoc.overview);
      
      const keyPointsText = data.keyPoints.map(p => `• ${p.replace(/^- /, '')}`).join('\n');
      addSection("2. Key Takeaways", keyPointsText);

      addSection("3. Logic Flow", data.explanationDoc.logicFlow);
      addSection("4. Function Breakdown", data.explanationDoc.functionBreakdown);
      addSection("5. Complexity", data.complexity);

      const improvementsText = data.improvements.map(i => `• ${i}`).join('\n');
      addSection("6. Improvements", improvementsText);
      
      doc.save(`${data.fileName ? data.fileName.split('.')[0] : 'analysis'}_report.pdf`);
      toast.success("PDF report downloaded");
    }).catch(err => {
      console.error(err);
      toast.error("Failed to load PDF generator. Please try again.");
    });
  };

  const handleShare = async () => {
    if (!data) return;
    setShareLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      if (data.isPublic && data.publicShareId) {
         const url = `${window.location.origin}/share/${data.publicShareId}`;
         setShareLink(url);
         setShowShareModal(true);
         setShareLoading(false);
         return;
      }

      const response = await axios.patch(`${API_BASE_URL}/explainations/${data.id}/share`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const shareId = response.data.shareId || response.data.publicShareId;
      if (shareId) {
        const url = `${window.location.origin}/share/${shareId}`;
        setShareLink(url);
        setShowShareModal(true);
        setData(prev => prev ? { ...prev, isPublic: true, publicShareId: shareId } : null);
      } else {
        toast.error("Failed to generate share link");
      }

    } catch (error: any) {
      console.error("Share error:", error);
      toast.error(error.response?.data?.message || "Failed to share");
    } finally {
      setShareLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // --- RENDERING STATES ---

  if (error) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6 text-white font-sans">
        <GlobalStyles />
        <div className="bg-[#111111] border border-red-900/50 p-6 rounded-md max-w-md w-full text-center">
          <AlertCircle className="text-red-500 w-12 h-12 mx-auto mb-4" />
          <h2 className="text-white font-medium mb-2">Error Loading Analysis</h2>
          <p className="text-[#888888] text-sm mb-6">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="text-xs font-mono text-white border border-[#333] px-4 py-2 rounded hover:bg-[#222] transition-colors"
          >
            RETURN_HOME
          </button>
        </div>
      </div>
    );
  }

  const status = data?.status?.toLowerCase();
  const isFinished = status === 'completed' || status === 'done' || status === 'success' || status === 'failed';
  
  if (loading || (data && !isFinished)) {
    return (
      <div className="min-h-screen bg-[#000000] font-sans flex flex-col items-center justify-center p-6">
          <GlobalStyles />
          <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="w-full max-w-[440px] bg-[#111111] border border-[#333333] rounded-md shadow-2xl overflow-hidden relative z-10">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="mb-6 relative">
                <div className="relative bg-black rounded-full p-4 border border-[#333333]">
                  <div className="animate-spin-slow"><Bot className="w-8 h-8 text-white" /></div>
                </div>
              </div>
              <h2 className="text-lg font-medium text-white mb-2 tracking-tight">
                {status === 'processing' ? 'Processing Logic...' : 'Queued for Analysis...'}
              </h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-black border border-[#333333] mb-8">
                <span className="text-[10px] uppercase font-mono text-[#888888] tracking-widest">ID</span>
                <span className="text-xs font-mono text-white">#{params.id ? params.id.toString().slice(-6) : '------'}</span>
              </div>
              <div className="w-full mb-3">
                <div className="flex justify-between items-end mb-2 px-1">
                  <span className="text-xs font-mono text-[#888888]">
                     {status === 'pending' ? 'Waiting for worker...' : 'Generating explanation...'}
                  </span>
                  <span className="text-xs font-mono text-white animate-pulse">...</span>
                </div>
                <div className="h-1 w-full bg-[#333333] rounded-full overflow-hidden">
                  <div className="h-full bg-white relative shadow-[0_0_8px_rgba(255,255,255,0.4)] w-1/3 animate-[shimmer_2s_infinite_linear]"></div>
                </div>
              </div>
              <p className="text-sm text-[#888888] mt-6 leading-relaxed max-w-xs mx-auto">
                Your code is being processed by our AI worker. This page will update automatically when finished.
              </p>
            </div>
          </div>
      </div>
    );
  }

  // --- COMPLETED VIEW ---
  return (
    <div className="h-screen bg-[#000000] font-sans text-white selection:bg-white selection:text-black flex flex-col overflow-hidden">
      <GlobalStyles />
      
      {/* Navbar */}
      <header className="flex-none border-b border-[#333333] bg-[#000000] z-20">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/projects')}
              className="text-[#888888] hover:text-white transition-colors p-1"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="h-4 w-[1px] bg-[#333]"></div>
            <div className="flex flex-col">
               <h1 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                 <FileCode size={14} className="text-indigo-400" />
                 <span className="truncate max-w-[120px] sm:max-w-xs">{data?.fileName || 'snippet.js'}</span>
               </h1>
            
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 mr-4">
               <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                   <CheckCircle2 size={10} /> COMPLETE
               </span>
             </div>
             
             <button 
                onClick={handleShare}
                disabled={shareLoading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-[#333] text-xs font-mono text-[#888888] hover:text-white hover:bg-[#111] transition-all disabled:opacity-50"
             >
                <Share2 size={14} />
                <span className="hidden sm:inline">SHARE</span>
             </button>

             <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white text-black border border-white text-xs font-mono font-medium hover:bg-gray-200 transition-all active:scale-95"
             >
                <Download size={14} />
                <span className="hidden sm:inline">PDF</span>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content - Split View */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT PANEL: CODE VIEWER (Monaco Editor) */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-auto border-b lg:border-b-0 lg:border-r border-[#333333] flex flex-col bg-[#050505] relative group">
           {/* Editor Header */}
           <div className="flex-none px-4 py-2 bg-[#050505] border-b border-[#252526] flex items-center justify-between">
              <span className="text-xs font-mono text-[#969696] uppercase tracking-wider flex items-center gap-2">
                <Code2 size={12} /> Source Code
              </span>
              <span className="text-[10px] font-mono text-[#ccc] bg-[#333] px-2 py-0.5 rounded shadow-sm">
                {data?.language}
              </span>
           </div>
           
           {/* Editor Content */}
           <div className="flex-1 overflow-hidden relative">
              <CodeEditorView 
                code={data?.commentedCode || data?.originalCode || ""} 
                language={data?.language || 'javascript'} 
              />
           </div>
        </div>

        {/* RIGHT PANEL: ANALYSIS REPORT */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-auto flex flex-col bg-[#050505]">
           <div className="flex-none px-6 py-3 border-b border-[#333333] bg-[#050505]">
              <h2 className="text-sm font-medium text-white flex items-center gap-2">
                 <Bot size={16} className="text-indigo-400" /> 
                 Analysis Report
              </h2>
           </div>
           
           <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar space-y-8 pb-20">
              
              {/* 1. Overview */}
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                 <div className="flex items-center gap-2 mb-3">
                    <BookOpen size={16} className="text-[#888888]" />
                    <h3 className="text-xs font-mono text-white uppercase tracking-wider">Overview</h3>
                 </div>
                 <p className="text-sm text-gray-300 leading-relaxed bg-[#111] p-4 rounded border border-[#333] shadow-sm">
                    {data?.explanationDoc?.overview || "No overview available."}
                 </p>
              </section>

              {/* 2. Key Takeaways */}
              {data?.keyPoints && data.keyPoints.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
                   <div className="flex items-center gap-2 mb-3">
                      <List size={16} className="text-[#888888]" />
                      <h3 className="text-xs font-mono text-white uppercase tracking-wider">Key Takeaways</h3>
                   </div>
                   <div className="grid grid-cols-1 gap-2">
                      {data.keyPoints.map((point, i) => (
                         <div key={i} className="flex items-start gap-3 p-3 bg-[#111] rounded border border-[#333] hover:border-[#555] transition-colors">
                            <span className="flex-none w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-mono border border-indigo-500/20">{i+1}</span>
                            <span className="text-sm text-gray-300">{point.replace(/^- /, '')}</span>
                         </div>
                      ))}
                   </div>
                </section>
              )}

              {/* 3. Logic Flow */}
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                 <div className="flex items-center gap-2 mb-3">
                    <Layers size={16} className="text-[#888888]" />
                    <h3 className="text-xs font-mono text-white uppercase tracking-wider">Logic Flow</h3>
                 </div>
                 <div className="space-y-3">
                   {data?.explanationDoc?.logicFlow ? (
                     data.explanationDoc.logicFlow.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                       <div key={i} className="bg-[#111] p-3 rounded border border-[#333] text-sm text-gray-300 leading-relaxed hover:border-[#444] transition-colors border-l-2 border-l-indigo-500/50">
                         {line.includes('`') ? (
                           <span>
                             {line.split('`').map((part, index) => 
                               index % 2 === 1 
                                 ? <span key={index} className="text-indigo-400 font-mono bg-indigo-500/10 px-1 py-0.5 rounded text-xs">{part}</span> 
                                 : part
                             )}
                           </span>
                         ) : (
                           line
                         )}
                       </div>
                     ))
                   ) : (
                     <div className="text-gray-500 italic text-sm">No logic flow details provided.</div>
                   )}
                 </div>
              </section>

              {/* 4. Function Breakdown */}
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                 <div className="flex items-center gap-2 mb-3">
                    <Puzzle size={16} className="text-[#888888]" />
                    <h3 className="text-xs font-mono text-white uppercase tracking-wider">Function Breakdown</h3>
                 </div>
                 <div className="space-y-3">
                   {data?.explanationDoc?.functionBreakdown ? (
                     data.explanationDoc.functionBreakdown.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                       <div key={i} className="bg-[#111] p-3 rounded border border-[#333] text-sm text-gray-300 leading-relaxed hover:border-[#444] transition-colors">
                         {line.includes('`') ? (
                           <span>
                             {line.split('`').map((part, index) => 
                               index % 2 === 1 
                                 ? <span key={index} className="text-indigo-400 font-mono bg-indigo-500/10 px-1 py-0.5 rounded text-xs">{part}</span> 
                                 : part
                             )}
                           </span>
                         ) : (
                           line
                         )}
                       </div>
                     ))
                   ) : (
                     <div className="text-gray-500 italic text-sm">No breakdown details provided.</div>
                   )}
                 </div>
              </section>

              {/* 5. Complexity & Improvements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-300">
                 {/* Improvements */}
                 <section className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                       <Zap size={16} className="text-amber-400" />
                       <h3 className="text-xs font-mono text-white uppercase tracking-wider">Improvements</h3>
                    </div>
                    <ul className="flex-1 bg-[#111] p-4 rounded border border-[#333] space-y-3">
                       {data?.improvements?.map((imp, i) => (
                          <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                             <span className="text-amber-400 mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 block flex-none"></span>
                             {imp}
                          </li>
                       ))}
                       {(!data?.improvements || data.improvements.length === 0) && <li className="text-sm text-[#555]">No specific improvements found.</li>}
                    </ul>
                 </section>

                 {/* Complexity */}
                 <section className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                       <Cpu size={16} className="text-pink-400" />
                       <h3 className="text-xs font-mono text-white uppercase tracking-wider">Complexity</h3>
                    </div>
                    <div className="flex-1 bg-[#111] p-4 rounded border border-[#333] text-sm text-gray-300 flex items-center">
                       {data?.complexity || "Analysis pending..."}
                    </div>
                 </section>
              </div>

              {/* 6. Usage Example */}
              <section className="animate-in fade-in slide-in-from-bottom-5 duration-500 delay-400">
                 <div className="flex items-center gap-2 mb-3">
                    <Terminal size={16} className="text-[#888888]" />
                    <h3 className="text-xs font-mono text-white uppercase tracking-wider">Usage Example</h3>
                 </div>
                 <div className="bg-[#0f0f0f] p-4 rounded border border-[#333] relative group">
                    <div className="absolute top-3 right-3 flex gap-1.5">
                       <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
                    </div>
                    <pre className="font-mono text-xs text-emerald-400/90 leading-relaxed overflow-x-auto pt-4">
                       {data?.explanationDoc?.usageExample || "# No example provided"}
                    </pre>
                 </div>
              </section>

           </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md p-4">
             <div className="bg-[#111] border border-[#333] rounded-lg w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-white font-medium">Share Analysis</h3>
                   <button onClick={() => setShowShareModal(false)} className="text-[#666] hover:text-white"><X size={18} /></button>
                </div>
                <p className="text-xs text-[#888] mb-4">Anyone with this link can view this analysis report.</p>
                
                <div className="flex gap-2">
                   <input 
                     type="text" 
                     readOnly 
                     value={shareLink}
                     className="flex-1 bg-black border border-[#333] rounded px-3 text-xs text-[#ccc] focus:outline-none"
                   />
                   <button 
                     onClick={copyToClipboard}
                     className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition-colors"
                   >
                     {copied ? <Check size={16} /> : <Copy size={16} />}
                   </button>
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}