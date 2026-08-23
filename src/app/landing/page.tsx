'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Cpu,
  Share2,
  Zap,
  ShieldCheck,
  Globe,
  LayoutTemplate,
  ChevronDown,
  Terminal,
  FileCode,
  Check,
  X
} from 'lucide-react';

const Reveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6, delay, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      
      {/* --- ANIMATIONS & STYLES --- */}
      <style dangerouslySetInnerHTML={{__html: `
        .bg-grid-pattern {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          mask-image: radial-gradient(ellipse at center, black 50%, transparent 90%);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .glass-card {
            background: rgba(10, 10, 10, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
      `}} />

      {/* --- BACKGROUND BLOBS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] bg-purple-600/5 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute inset-0 bg-grid-pattern z-[1] " />
      </div>

      {/* Navbar */}
      <header className="relative z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
             <div className="size-7 text-white group-hover:text-indigo-400 transition-colors duration-300">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white font-mono">CodeWise</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
           
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/users/signin" className="text-sm font-medium text-zinc-400 hover:text-white hidden sm:block">Log in</Link>
            <Link href="/users/signup" className="text-sm font-bold bg-white text-black px-5 py-2 rounded-full hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.3)]">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="pt-24 pb-20 px-6 text-center max-w-5xl mx-auto relative">

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
          >
            Understand Code<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">in Seconds.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Upload your code. Get instant explanations, complexity scores, and auto-generated documentation. No more guessing what that legacy function does.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link href="/users/signup" className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-lg font-bold transition-all hover:scale-105 flex items-center justify-center gap-2">
              Start Analyzing <ArrowRight size={18} />
            </Link>
            <Link href="/docs" className="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-zinc-700 text-white rounded-lg font-medium transition-all hover:bg-zinc-800 flex items-center justify-center gap-2">
              View Documentation
            </Link>
          </motion.div>

          {/* Hero Visual/Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="relative rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden max-w-4xl mx-auto group">
             <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
             <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#050505]">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="mx-auto text-[10px] font-mono text-zinc-600 bg-zinc-900 px-3 py-0.5 rounded-full border border-white/5">codewise-analyzer.tsx</div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 text-left">
                {/* Code Side */}
                <div className="p-6 font-mono text-xs md:text-sm text-zinc-400 border-r border-white/5 space-y-2">
                    <p><span className="text-purple-400">function</span> <span className="text-blue-400">calculateMetric</span>(data) {'{'}</p>
                    <p className="pl-4"><span className="text-zinc-500">// Legacy logic...</span></p>
                    <p className="pl-4"><span className="text-purple-400">return</span> data.reduce((a, b) =&gt; a + b, 0);</p>
                    <p>{'}'}</p>
                </div>
                {/* AI Side */}
                <div className="p-6 bg-indigo-900/5 space-y-4">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <Zap size={12} /> AI Analysis
                    </div>
                    <p className="text-sm text-zinc-300">
                        This function calculates a sum aggregation. <br/>
                        <span className="text-emerald-400">Time Complexity: O(n)</span>
                    </p>
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded text-xs text-indigo-200">
                        Suggest renaming to <code>sumTotal</code> for clarity.
                    </div>
                </div>
             </div>
          </motion.div>
        </section>

        {/* --- PROBLEM vs SOLUTION --- */}
        <section className="py-24 px-6 max-w-6xl mx-auto">
            <Reveal>
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Manual Review Fails</h2>
                  <p className="text-zinc-500">Stop wasting hours reading spaghetti code.</p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Old Way */}
                <Reveal>
                  <div className="p-8 rounded-2xl border border-red-900/20 bg-red-900/5 relative overflow-hidden h-full">
                      <h3 className="text-xl font-bold text-red-200 mb-6">The Old Way</h3>
                      <ul className="space-y-4 text-zinc-400">
                          <li className="flex gap-3"><X className="text-red-500 shrink-0 mt-0.5" size={18} /> Spend hours tracing variable states manually.</li>
                          <li className="flex gap-3"><X className="text-red-500 shrink-0 mt-0.5" size={18} /> Outdated documentation that lies to you.</li>
                          <li className="flex gap-3"><X className="text-red-500 shrink-0 mt-0.5" size={18} /> Missed edge cases and hidden bugs.</li>
                      </ul>
                  </div>
                </Reveal>

                {/* CodeWise Way */}
                <Reveal delay={0.1}>
                  <div className="p-8 rounded-2xl border border-emerald-900/20 bg-emerald-900/5 relative overflow-hidden h-full">
                      <h3 className="text-xl font-bold text-emerald-200 mb-6">The CodeWise Way</h3>
                      <ul className="space-y-4 text-zinc-300">
                          <li className="flex gap-3"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> Instant logic breakdown in plain English.</li>
                          <li className="flex gap-3"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> Auto-generated, always up-to-date docs.</li>
                          <li className="flex gap-3"><Check className="text-emerald-500 shrink-0 mt-0.5" size={18} /> Complexity scores to identify refactoring targets.</li>
                      </ul>
                  </div>
                </Reveal>
            </div>
        </section>

        {/* --- DEEP DIVE FEATURE 1: ANALYSIS --- */}
        <section id="features" className="py-24 px-6 border-t border-white/5 bg-[#030303]">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
                <Reveal>
                <div className="flex-1 space-y-6">
                    <div className="w-12 h-12 bg-indigo-900/30 rounded-xl flex items-center justify-center border border-indigo-500/30 text-indigo-400 mb-4">
                        <Cpu size={24} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">Deep Logic Analysis</h2>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        Don't just read code, understand it. Our engine parses ASTs (Abstract Syntax Trees) combined with LLMs to explain *why* code works, not just *how*.
                    </p>
                    <ul className="space-y-3 pt-4">
                        {['Cyclomatic Complexity Score', 'Security Vulnerability Detection', 'Variable Tracking & Data Flow'].map(item => (
                            <li key={item} className="flex items-center gap-3 text-zinc-300">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
                </Reveal>
                <Reveal delay={0.15}>
                <div className="flex-1 w-full">
                    {/* Visual Card */}
                    <div className="glass-card rounded-2xl p-6 relative group">
                        <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                <span className="text-xs font-mono text-zinc-500">ANALYSIS REPORT</span>
                                <span className="px-2 py-1 bg-red-500/20 text-red-300 text-[10px] rounded font-bold">HIGH COMPLEXITY</span>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 w-3/4 bg-zinc-800 rounded animate-pulse" />
                                <div className="h-2 w-full bg-zinc-800 rounded animate-pulse delay-75" />
                                <div className="h-2 w-5/6 bg-zinc-800 rounded animate-pulse delay-150" />
                            </div>
                            <div className="p-4 bg-black/40 rounded-lg border border-white/5 mt-4">
                                <p className="text-sm text-zinc-300 italic">"This function contains nested loops resulting in O(n²) complexity. Consider using a Hash Map."</p>
                            </div>
                        </div>
                    </div>
                </div>
                </Reveal>
            </div>
        </section>

        {/* --- DEEP DIVE FEATURE 2: AUTO DOCS --- */}
        <section className="py-24 px-6">
            <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-16">
                <Reveal>
                <div className="flex-1 w-full">
                     {/* Visual Card */}
                     <div className="glass-card rounded-2xl p-1 relative overflow-hidden group">
                        <div className="bg-[#050505] rounded-xl p-6">
                            <div className="flex gap-4">
                                <div className="w-1/3 border-r border-white/10 pr-4 space-y-3">
                                    <div className="h-2 w-12 bg-zinc-800 rounded" />
                                    <div className="h-2 w-full bg-indigo-500/20 rounded" />
                                    <div className="h-2 w-3/4 bg-zinc-800 rounded" />
                                    <div className="h-2 w-5/6 bg-zinc-800 rounded" />
                                </div>
                                <div className="w-2/3 space-y-4">
                                    <div className="h-6 w-1/2 bg-zinc-800 rounded mb-4" />
                                    <div className="h-2 w-full bg-zinc-800 rounded" />
                                    <div className="h-2 w-full bg-zinc-800 rounded" />
                                    <div className="h-2 w-3/4 bg-zinc-800 rounded" />
                                    <div className="mt-4 p-3 border border-dashed border-zinc-700 rounded bg-zinc-900/50">
                                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                                            <FileCode size={12}/> generated-doc.md
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 space-y-6">
                    <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center border border-purple-500/30 text-purple-400 mb-4">
                        <LayoutTemplate size={24} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">Automated Documentation</h2>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        Never write readme.md manually again. Generate comprehensive, hierarchical documentation for your entire project with a single click.
                    </p>
                    <ul className="space-y-3 pt-4">
                        {['Project Structure Mapping', 'Export to PDF & Markdown', 'API Endpoint Documentation'].map(item => (
                            <li key={item} className="flex items-center gap-3 text-zinc-300">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
                </Reveal>
            </div>
        </section>

        {/* --- BENTO GRID (Other Features) --- */}
        <section className="py-24 px-6 border-t border-white/5 bg-[#050505]">
            <div className="max-w-6xl mx-auto">
                <Reveal>
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Everything included</h2>
                    <p className="text-zinc-500">Tools designed for the complete development lifecycle.</p>
                </div>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Share */}
                    <div className="md:col-span-2 p-8 rounded-2xl border border-white/10 bg-zinc-900/20 hover:border-emerald-500/30 transition-all group">
                        <Share2 className="text-emerald-400 mb-4" size={32} />
                        <h3 className="text-xl font-bold mb-2">One-Click Sharing</h3>
                        <p className="text-zinc-400 text-sm">Generate public, read-only links for your analyses. Perfect for sharing with teammates, attaching to PRs, or asking for help on StackOverflow.</p>
                    </div>
                    
                    {/* Security */}
                    <div className="p-8 rounded-2xl border border-white/10 bg-zinc-900/20 hover:border-red-500/30 transition-all">
                        <ShieldCheck className="text-red-400 mb-4" size={32} />
                        <h3 className="text-xl font-bold mb-2">Privacy First</h3>
                        <p className="text-zinc-400 text-sm">Code is analyzed in memory. We don't train models on your proprietary data.</p>
                    </div>

                    {/* History */}
                    <div className="p-8 rounded-2xl border border-white/10 bg-zinc-900/20 hover:border-blue-500/30 transition-all">
                        <Terminal className="text-blue-400 mb-4" size={32} />
                        <h3 className="text-xl font-bold mb-2">Project History</h3>
                        <p className="text-zinc-400 text-sm">Keep a timeline of your code's evolution. Access past analyses anytime.</p>
                    </div>

                    {/* Languages */}
                    <div className="md:col-span-2 p-8 rounded-2xl border border-white/10 bg-zinc-900/20 hover:border-yellow-500/30 transition-all">
                        <Globe className="text-yellow-400 mb-4" size={32} />
                        <h3 className="text-xl font-bold mb-2">Languages Supported</h3>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {['JS', 'TS', 'Python', 'Go', 'Rust', 'Java', 'C++', 'C#', 'PHP', 'Ruby'].map(lang => (
                                <span key={lang} className="px-2 py-1 rounded bg-black border border-white/10 text-xs text-zinc-500">{lang}</span>
                            ))}
                            <span className="px-2 py-1 rounded bg-black border border-white/10 text-xs text-zinc-500">+many more</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="py-24 px-6 max-w-4xl mx-auto">
            <Reveal>
              <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            </Reveal>
            <div className="space-y-4">
                {[
                    { q: "Is my code stored on your servers?", a: "We process code in-memory for analysis. Code associated with Projects is stored securely, but you can delete it at any time." },
                    { q: "Can I analyze private repositories?", a: "Yes. You can upload files from private repos manually. Direct GitHub integration is coming in v2.0." },
                    { q: "Is there a free tier?", a: "Absolutely. The Personal plan is free forever and includes 100 analyses per month." },
                    { q: "How accurate is the AI explanation?", a: "We use specialized models tuned for code. While highly accurate, we always recommend developer review for critical logic." }
                ].map((item, i) => (
                    <div key={i} className="border border-white/10 rounded-lg bg-zinc-900/30 overflow-hidden">
                        <details className="group">
                            <summary className="flex justify-between items-center p-6 cursor-pointer font-medium text-zinc-200">
                                {item.q}
                                <ChevronDown className="group-open:rotate-180 transition-transform text-zinc-500" size={20} />
                            </summary>
                            <div className="px-6 pb-6 text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                                {item.a}
                            </div>
                        </details>
                    </div>
                ))}
            </div>
        </section>

        {/* --- FINAL CTA --- */}
        <section className="py-32 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 to-transparent pointer-events-none" />
          <Reveal>
            <div className="max-w-3xl mx-auto relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to optimize?</h2>
              <p className="text-zinc-400 text-lg mb-10">Understand your codebase faster, one file at a time.</p>
              <Link
                href="/users/signup"
                className="inline-flex items-center gap-2 px-10 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
              >
                Get Started for Free
              </Link>
            </div>
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/5 bg-black py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="size-6 text-zinc-500">
                <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                  <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <span className="font-mono font-bold text-zinc-400">CodeWise</span>
              <span className="text-zinc-600 text-xs ml-2">© 2026 CodeWise Inc.</span>
            </div>

            <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-zinc-500">
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
              <Link href="/users/signin" className="hover:text-white transition-colors">Log in</Link>
              <Link href="/users/signup" className="hover:text-white transition-colors">Get Started</Link>
            </nav>
          </div>
        </footer>

      </main>
    </div>
  );
}