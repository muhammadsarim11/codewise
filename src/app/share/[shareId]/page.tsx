'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../utils/api';
import Editor from '@monaco-editor/react';
import { 
  Bot, 
  FileCode, 
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
  Globe,
  Share2,
  Check,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

// Interface matching the backend response
interface ExplanationDoc {
  overview: string;
  logicFlow: string;
  usageExample: string;
  functionBreakdown: string;
}

interface ExplanationData {
  id: string;
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
}

export default function PublicSharePage() {
  const params = useParams();
  const [data, setData] = useState<ExplanationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPublicExplanation = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/share/${params.shareId}`);
        
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError('Failed to load shared analysis.');
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || 'This link may be invalid or expired.');
      } finally {
        setLoading(false);
      }
    };

    if (params.shareId) {
      fetchPublicExplanation();
    }
  }, [params.shareId]);

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
      addSection("2. Key Takeaways", data.keyPoints.map(p => `• ${p.replace(/^- /, '')}`).join('\n'));
      addSection("3. Logic Flow", data.explanationDoc.logicFlow);
      addSection("4. Function Breakdown", data.explanationDoc.functionBreakdown);
      addSection("5. Complexity", data.complexity);
      addSection("6. Improvements", data.improvements.map(i => `• ${i}`).join('\n'));
      
      doc.save(`${data.fileName ? data.fileName.split('.')[0] : 'analysis'}_report.pdf`);
      toast.success("PDF report downloaded");
    }).catch(() => toast.error("Failed to export PDF."));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // --- RENDERING HELPERS ---

  const GlobalStyles = () => (
    <style jsx global>{`
      ::-webkit-scrollbar { width: 10px; height: 10px; }
      ::-webkit-scrollbar-track { background: #0a0a0a; }
      ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 5px; border: 2px solid #0a0a0a; }
      ::-webkit-scrollbar-thumb:hover { background: #444; }
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
          padding: { top: 20, bottom: 20 },
          scrollBeyondLastLine: false,
          domReadOnly: true,
          renderLineHighlight: 'none'
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
        loading={
            <div className="flex items-center justify-center h-full text-gray-500 font-mono text-sm">
                Loading Editor...
            </div>
        }
      />
    );
  };

  // --- STATES ---

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center gap-4 text-white font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white border-r-2 border-r-transparent"></div>
        <p className="text-[#888] text-sm font-mono animate-pulse">Loading shared analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6 text-white font-sans">
        <div className="bg-[#111111] border border-red-900/50 p-8 rounded-lg max-w-md w-full text-center shadow-2xl">
          <AlertCircle className="text-red-500 w-12 h-12 mx-auto mb-4" />
          <h2 className="text-white font-medium mb-2 text-lg">Unable to View Report</h2>
          <p className="text-[#888] text-sm mb-8 leading-relaxed">{error}</p>
          <Link 
            href="/"
            className="text-xs font-mono font-bold bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition-colors"
          >
            GO TO HOME
          </Link>
        </div>
      </div>
    );
  }

  // --- SUCCESS VIEW ---
  return (
    <div className="h-screen bg-[#000000] font-sans text-white selection:bg-white selection:text-black flex flex-col overflow-hidden">
      <GlobalStyles />
      
      {/* Public Header */}
      <header className="flex-none border-b border-[#333333] bg-[#000000] z-20">
        <div className="px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
               <div className="size-6 text-white">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                    <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                  </svg>
               </div>
               <span className="font-mono font-semibold tracking-tight text-sm hidden sm:inline">CodeWise</span>
            </Link>
            <div className="h-4 w-[1px] bg-[#333] hidden sm:block"></div>
            <div className="flex flex-col">
               <h1 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                 <Globe size={14} className="text-indigo-400" />
                 Public Report
               </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
             <div className="hidden md:flex items-center gap-2 mr-4">
               <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                   <CheckCircle2 size={10} /> VERIFIED
               </span>
             </div>
             
             <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-[#333] text-xs font-mono text-[#888888] hover:text-white hover:bg-[#111] transition-all"
             >
                {copied ? <Check size={14} /> : <Share2 size={14} />}
                <span className="hidden sm:inline">{copied ? 'COPIED' : 'SHARE'}</span>
             </button>

             <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-[#333] text-xs font-mono text-[#888] hover:text-white hover:bg-[#111] transition-all"
             >
                <Download size={14} />
                <span className="hidden sm:inline">PDF</span>
             </button>

             <Link 
               href="/users/signup"
               className="flex items-center gap-2 px-4 py-1.5 rounded-sm bg-white text-black border border-white text-xs font-mono font-bold hover:bg-gray-200 transition-all shadow-lg shadow-white/10"
             >
                TRY IT
             </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive Split View */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* LEFT PANEL: CODE VIEWER */}
        {/* Mobile: Top half. Desktop: Left half. */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-auto border-b lg:border-b-0 lg:border-r border-[#333333] flex flex-col bg-[#050505] relative group">
           <div className="flex-none px-4 py-2 bg-[#050505] border-b border-[#252526] flex items-center justify-between">
              <span className="text-xs font-mono text-[#969696] uppercase tracking-wider flex items-center gap-2">
                <Code2 size={12} /> Source Code
              </span>
              <span className="text-[10px] font-mono text-[#ccc] bg-[#333] px-2 py-0.5 rounded shadow-sm">
                {data?.language}
              </span>
           </div>
           
           <div className="flex-1 overflow-hidden relative">
              <CodeEditorView 
                code={data?.commentedCode || data?.originalCode || ""} 
                language={data?.language || 'javascript'} 
              />
           </div>
        </div>

        {/* RIGHT PANEL: ANALYSIS REPORT */}
        {/* Mobile: Bottom half. Desktop: Right half. */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-auto flex flex-col bg-[#050505]">
           <div className="flex-none px-6 py-3 border-b border-[#333333] bg-[#050505]">
              <h2 className="text-sm font-medium text-white flex items-center gap-2">
                 <Bot size={16} className="text-indigo-400" /> 
                 Analysis Report
              </h2>
           </div>
           
           <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar space-y-8 pb-20">
              
              {/* 1. Overview */}
              <section>
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
                <section>
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
              <section>
                 <div className="flex items-center gap-2 mb-3">
                    <Layers size={16} className="text-[#888888]" />
                    <h3 className="text-xs font-mono text-white uppercase tracking-wider">Logic Flow</h3>
                 </div>
                 <div className="space-y-3">
                   {data?.explanationDoc?.logicFlow ? (
                     data.explanationDoc.logicFlow.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                       <div key={i} className="bg-[#111] p-3 rounded border border-[#333] text-sm text-gray-300 leading-relaxed hover:border-[#444] transition-colors border-l-2 border-l-indigo-500/50">
                         {line}
                       </div>
                     ))
                   ) : (
                     <div className="text-gray-500 italic text-sm">No logic flow details provided.</div>
                   )}
                 </div>
              </section>

              {/* 4. Function Breakdown */}
              <section>
                 <div className="flex items-center gap-2 mb-3">
                    <Puzzle size={16} className="text-[#888888]" />
                    <h3 className="text-xs font-mono text-white uppercase tracking-wider">Function Breakdown</h3>
                 </div>
                 <div className="space-y-3">
                   {data?.explanationDoc?.functionBreakdown ? (
                     data.explanationDoc.functionBreakdown.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                       <div key={i} className="bg-[#111] p-3 rounded border border-[#333] text-sm text-gray-300 leading-relaxed hover:border-[#444] transition-colors">
                         {line}
                       </div>
                     ))
                   ) : (
                     <div className="text-gray-500 italic text-sm">No breakdown details provided.</div>
                   )}
                 </div>
              </section>

              {/* 5. Complexity & Improvements Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
              <section>
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

      </main>
    </div>
  );
}