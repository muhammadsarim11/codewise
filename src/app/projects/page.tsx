'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { API_BASE_URL } from '../utils/api';
import ConfirmDialog from '../component/ConfirmDialog';
import {
  Folder,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  FileCode,
  ArrowRight,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Book,
  Menu,   // Added
  LogOut  // Added
} from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
}

interface Explanation {
  id: string;
  fileName: string;
  language: string;
  createdAt: string;
  projectId?: number;
  isPublic?: boolean;
  publicShareId?: string;
}

export default function ProjectsView() {
  const router = useRouter();
  
  // User & Nav State
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Projects List State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Selected Project State (History View)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectExplanations, setProjectExplanations] = useState<Explanation[]>([]);
  const [loadingExplanations, setLoadingExplanations] = useState(false);

  // Share Modal State
  const [shareModalData, setShareModalData] = useState<{link: string, id: string} | null>(null);
  const [copied, setCopied] = useState(false);

  // Logout Confirmation State
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    // Load User for Navbar
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchProjects();
  }, []);

  // --- Navigation Handlers ---
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setShowLogoutConfirm(false);
    router.push('/');
  };

  const navTo = (path: string) => {
    router.push(path);
  };

  // --- Data Fetching ---

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      
      const res = await axios.get(`${API_BASE_URL}/projects/get`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data.projects || []);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchProjectExplanations = async (projectId: number) => {
    setLoadingExplanations(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${API_BASE_URL}/explainations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allExplanations = res.data.explanations || res.data || [];
      const filtered = allExplanations.filter((ex: any) => String(ex.projectId) === String(projectId));
      
      setProjectExplanations(filtered);
    } catch (error) {
      console.error("Failed to fetch project analyses", error);
    } finally {
      setLoadingExplanations(false);
    }
  };

  // --- Project Actions ---

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE_URL}/projects/create`, {
        name: projectName,
        description: projectDesc
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProjects(prev => [res.data.project, ...prev]);
      closeModal();
      toast.success("Project created successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create project");
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.put(`${API_BASE_URL}/projects/edit/${currentProject.id}`, {
        name: projectName,
        description: projectDesc
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProjects(prev => prev.map(p => p.id === currentProject.id ? res.data.project : p));
      closeModal();
      toast.success("Project updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update project");
    }
  };

  const openDeleteModal = (project: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setProjectToDelete(null);
    setShowDeleteModal(false);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_BASE_URL}/projects/delete/${projectToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      if (selectedProject?.id === projectToDelete.id) handleBackToProjects();
      toast.success("Project deleted");
    } catch (error: any) {
      toast.error("Failed to delete project");
    } finally {
      closeDeleteModal();
    }
  };

  const handleShare = async (e: React.MouseEvent, explanationId: string) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.patch(`${API_BASE_URL}/explainations/${explanationId}/share`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const shareId = res.data.shareId || res.data.explanation?.publicShareId || res.data.publicShareId;
      if (shareId) {
        const shareUrl = `${window.location.origin}/share/${shareId}`;
        setShareModalData({ link: shareUrl, id: explanationId });
        setProjectExplanations(prev => prev.map(ex =>
          ex.id === explanationId ? { ...ex, isPublic: true } : ex
        ));
      } else {
        toast.error("Could not generate share link.");
      }
    } catch (error: any) {
      console.error("Share failed", error);
      toast.error("Failed to share explanation");
    }
  };

  const copyToClipboard = () => {
    if (shareModalData) {
      navigator.clipboard.writeText(shareModalData.link);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --- Handlers ---

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    fetchProjectExplanations(project.id);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setProjectExplanations([]);
  };

  const handleAnalyzeNew = () => {
    if (selectedProject) {
      // Redirect to Home with query param
      window.location.href = `/?projectId=${selectedProject.id}`;
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setProjectName('');
    setProjectDesc('');
    setShowProjectModal(true);
  };

  const openEditModal = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setIsEditing(true);
    setCurrentProject(project);
    setProjectName(project.name);
    setProjectDesc(project.description);
    setShowProjectModal(true);
  };

  const closeModal = () => {
    setShowProjectModal(false);
    setCurrentProject(null);
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-[#000000] font-sans text-white flex flex-col overflow-x-hidden selection:bg-white selection:text-black">
      
      {/* Background Grid Pattern */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-20" 
        style={{
          backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* --- ADDED NAVIGATION HEADER --- */}
      <header className="relative z-20 w-full border-b border-[#333333] bg-[#000000]/80 backdrop-blur-md">
        <div className="px-6 md:px-10 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navTo('/')}>
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
              <button onClick={() => navTo('/')} className="text-xs font-mono transition-colors flex items-center gap-1 text-[#888] hover:text-white">
                /dashboard
              </button>
              <button className="text-xs font-mono transition-colors flex items-center gap-1 text-white">
                /projects
              </button>
            </nav>
            <div className="h-6 w-[1px] bg-[#333333]"></div>
            
            {user && (
                <button onClick={() => setShowLogoutConfirm(true)} className="group flex items-center gap-2 rounded-full pr-3 pl-1 py-1 bg-[#111111] border border-[#333333] hover:border-[#888888] transition-all">
                <div className="size-6 rounded-full bg-[#333] flex items-center justify-center text-[10px] font-mono">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-mono text-[#888888] group-hover:text-white">Logout</span>
                </button>
            )}
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
              <button onClick={() => navTo('/')} className="text-sm font-mono text-left px-2 text-[#888]">/dashboard</button>
              <button className="text-sm font-mono text-left px-2 text-white">/projects</button>
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

      {/* --- Main Content --- */}
      <main className="relative z-10 flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
        {selectedProject ? (
            // 1. SELECTED PROJECT VIEW (History Only)
            <div className="w-full max-w-5xl mx-auto h-full flex flex-col animate-in fade-in zoom-in duration-300 pb-10">
                
                {/* Header (Title & Actions) */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                  <div className="flex items-start md:items-center gap-3 md:gap-4 w-full">
                    <button 
                      onClick={handleBackToProjects}
                      className="p-2 rounded-full hover:bg-[#111] border border-transparent hover:border-[#333] transition-all text-[#888] hover:text-white"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Folder size={18} className="text-indigo-400" />
                        <h1 className="text-lg md:text-xl font-semibold tracking-tight text-white truncate">{selectedProject.name}</h1>
                      </div>
                      <p className="text-[#888] text-[11px] md:text-xs font-mono mt-1 line-clamp-1">{selectedProject.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                     {/* DOCS BUTTON */}
                     <button 
                        onClick={() => router.push(`/projects/${selectedProject.id}/docs`)}
                        className="flex items-center gap-2 px-4 py-2 border border-[#333] text-[#ccc] rounded-md text-sm font-medium hover:border-white hover:text-white transition-colors justify-center whitespace-nowrap"
                     >
                        <Book size={16} />
                        <span>Docs</span>
                     </button>

                     <button 
                       onClick={handleAnalyzeNew}
                       className="flex items-center gap-2 px-4 md:px-5 py-2 bg-indigo-600 text-white rounded-md text-sm md:text-sm font-medium hover:bg-indigo-500 transition-colors shadow-md md:shadow-lg shadow-indigo-500/20 flex-1 md:flex-none justify-center whitespace-nowrap"
                     >
                       <Plus size={16} />
                       <span className="hidden md:inline">New Analysis</span>
                       <span className="md:hidden">Analyze</span>
                     </button>
                  </div>
                </div>

                {/* History List */}
                <div className="w-full">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-white">Project Analysis History</h2>
                        <span className="text-xs text-[#666] font-mono">{projectExplanations.length} Reports</span>
                      </div>

                      {loadingExplanations ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#333]" /></div>
                      ) : projectExplanations.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-[#333] rounded-lg bg-[#111]/30">
                          <div className="bg-[#111] p-3 rounded-full border border-[#333] inline-block mb-3">
                            <FileCode className="text-[#444] w-6 h-6" />
                          </div>
                          <p className="text-[#888] text-sm font-medium">No analysis reports yet.</p>
                          <p className="text-[#555] text-xs mt-1 mb-4">Upload code to get started with this project.</p>
                          <button 
                            onClick={handleAnalyzeNew}
                            className="text-xs font-mono text-indigo-400 hover:text-indigo-300 hover:underline"
                          >
                            START_ANALYSIS &rarr;
                          </button>
                       </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {projectExplanations.map((item) => (
                            <div 
                              key={item.id} 
                              className="group flex flex-col bg-[#111] border border-[#333] rounded-lg p-4 hover:border-[#666] transition-all"
                            >
                                <div 
                                  className="flex items-start gap-4 cursor-pointer mb-3"
                                  onClick={() => router.push(`/explanation/${item.id}`)}
                                >
                                  <div className="p-2 bg-black rounded border border-[#333] text-indigo-400">
                                      <FileCode size={20} />
                                  </div>
                                  <div>
                                      <h4 className="text-sm font-medium text-white mb-0.5">{item.fileName || 'Untitled'}</h4>
                                      <p className="text-[10px] text-[#666] font-mono">
                                        {new Date(item.createdAt).toLocaleDateString()} • {item.language}
                                      </p>
                                  </div>
                                </div>

                                <div className="mt-auto pt-3 border-t border-[#333] flex items-center justify-between">
                                   <button 
                                     onClick={() => router.push(`/explanation/${item.id}`)}
                                     className="text-xs font-mono text-white hover:underline flex items-center gap-1"
                                   >
                                     VIEW REPORT <ArrowRight size={12} />
                                   </button>
                                   
                                   <button 
                                     onClick={(e) => handleShare(e, item.id)}
                                     className="p-1.5 text-[#666] hover:text-white hover:bg-[#222] rounded transition-colors flex items-center gap-1"
                                     title="Share"
                                   >
                                     <Share2 size={14} />
                                     {item.isPublic && <span className="text-[10px] text-indigo-400">Public</span>}
                                   </button>
                                </div>
                            </div>
                          ))}
                        </div>
                      )}
                </div>

                {/* Share Modal */}
                {shareModalData && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md p-4">
                      <div className="bg-[#111] border border-[#333] rounded-lg w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-medium">Share Analysis</h3>
                            <button onClick={() => setShareModalData(null)} className="text-[#666] hover:text-white"><X size={18} /></button>
                         </div>
                         <p className="text-xs text-[#888] mb-4">Anyone with this link can view this analysis report.</p>
                         <div className="flex gap-2">
                            <input type="text" readOnly value={shareModalData.link} className="flex-1 bg-black border border-[#333] rounded px-3 text-xs text-[#ccc] focus:outline-none" />
                            <button onClick={copyToClipboard} className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition-colors">{copied ? <Check size={16} /> : <Copy size={16} />}</button>
                         </div>
                      </div>
                  </div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && projectToDelete && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md p-4">
                    <div className="bg-[#111] border border-[#333] rounded-lg w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
                      <div className="mb-4">
                        <h3 className="text-white font-medium">Delete Project</h3>
                      </div>
                      <p className="text-sm text-[#888] mb-6">Are you sure you want to delete <strong className="text-white">{projectToDelete.name}</strong>? This action cannot be undone.</p>
                      <div className="flex justify-end gap-3">
                        <button onClick={closeDeleteModal} className="px-4 py-2 text-sm text-[#888] hover:text-white">Cancel</button>
                        <button onClick={confirmDeleteProject} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition-colors">Delete</button>
                      </div>
                    </div>
                  </div>
                )} 

            </div>
        ) : (
            // 2. PROJECT LIST VIEW (Default)
            <div className="w-full max-w-6xl mx-auto h-full flex flex-col animate-in fade-in zoom-in duration-300 pb-10">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                 <div>
                   <h1 className="text-2xl font-semibold tracking-tight text-white">Projects</h1>
                   <p className="text-[#888] text-sm font-mono mt-1">Manage your code analysis projects.</p>
                 </div>
                 <button 
                   onClick={openCreateModal}
                   className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-gray-200 transition-colors w-full sm:w-auto min-w-[120px] justify-center whitespace-nowrap"
                 >
                   <Plus size={16} />
                   <span className="hidden sm:inline">New Project</span>
                   <span className="sm:hidden">New</span>
                 </button>
               </div>

               {loadingProjects ? (
                 <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#333]" size={32} />
                 </div>
               ) : projects.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-[#333] rounded-lg bg-[#111]/50 p-10">
                    <Folder className="text-[#333] w-16 h-16 mb-4" />
                    <h3 className="text-white font-medium">No projects found</h3>
                    <p className="text-[#888] text-sm mt-1 mb-6">Create your first project to organize your snippets.</p>
                    <button 
                      onClick={openCreateModal}
                      className="w-full sm:w-auto px-4 py-2 bg-[#333] text-white rounded hover:bg-[#444] text-sm transition-colors justify-center whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">Create Project</span>
                      <span className="sm:hidden">Create</span>
                    </button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                       <div 
                         key={project.id} 
                         onClick={() => handleProjectClick(project)}
                         className="bg-[#111] border border-[#333] rounded-lg p-5 group hover:border-[#666] transition-colors relative cursor-pointer flex flex-col"
                       >
                          <div className="flex justify-between items-start mb-3">
                             <div className="p-2 bg-black rounded border border-[#333]">
                                <Folder size={20} className="text-indigo-400" />
                             </div>
                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={(e) => openEditModal(project, e)}
                                  className="p-1.5 hover:bg-[#333] rounded text-[#888] hover:text-white"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteModal(project, e);
                                  }}
                                  className="p-1.5 hover:bg-[#333] rounded text-[#888] hover:text-red-400"
                                >
                                  <Trash2 size={14} />
                                </button> 
                             </div>
                          </div>
                          <h3 className="text-white font-medium mb-1 truncate">{project.name}</h3>
                          <p className="text-[#888] text-xs line-clamp-2 h-8">{project.description}</p>
                          
                          {/* DOCS BUTTON IN FOOTER */}
                          <div className="mt-4 pt-4 border-t border-[#333] flex items-center justify-between">
                             <span className="text-[10px] font-mono text-[#666]">{new Date(project.createdAt).toLocaleDateString()}</span>
                             
                             <div className="flex items-center gap-3">
                               <button
                                  onClick={(e) => {
                                     e.stopPropagation(); 
                                     router.push(`/projects/${project.id}/docs`);
                                  }}
                                  className="flex items-center gap-1.5 text-[10px] font-mono text-[#888] hover:text-white transition-colors"
                                  title="Generate/View Documentation"
                               >
                                  <Book size={12} />
                                  DOCS
                               </button>

                               <button className="text-[10px] font-mono text-indigo-400 hover:underline">OPEN &rarr;</button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
               )}

               {/* Modals for Create/Delete */}
               {showDeleteModal && projectToDelete && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md p-4">
                   <div className="bg-[#111] border border-[#333] rounded-lg w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
                     <div className="mb-4">
                       <h3 className="text-white font-medium">Delete Project</h3>
                     </div>
                     <p className="text-sm text-[#888] mb-6">Are you sure you want to delete <strong className="text-white">{projectToDelete.name}</strong>? This action cannot be undone.</p>
                     <div className="flex justify-end gap-3">
                       <button onClick={closeDeleteModal} className="px-4 py-2 text-sm text-[#888] hover:text-white">Cancel</button>
                       <button onClick={confirmDeleteProject} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition-colors">Delete</button>
                     </div>
                   </div>
                 </div>
               )} 

               {showProjectModal && (
                   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md p-4">
                      <div className="bg-[#111] border border-[#333] rounded-lg w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                         <div className="flex items-center justify-between p-4 border-b border-[#333]">
                            <h3 className="text-white font-medium">{isEditing ? 'Edit Project' : 'New Project'}</h3>
                            <button onClick={closeModal} className="text-[#888] hover:text-white"><X size={18} /></button>
                         </div>
                         <form onSubmit={isEditing ? handleEditProject : handleCreateProject} className="p-6 space-y-4">
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <label className="text-xs font-mono text-[#888] uppercase">Name</label>
                                <input required value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Project name" className="w-full bg-black border border-[#333] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white transition-colors" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-mono text-[#888] uppercase">Description</label>
                                <textarea required value={projectDesc} onChange={e => setProjectDesc(e.target.value)} placeholder="What is this project about?" rows={3} className="w-full bg-black border border-[#333] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white transition-colors resize-none" />
                              </div>
                              <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
                                <button type="button" onClick={closeModal} className="w-full sm:w-auto px-4 py-2 text-sm text-[#888] hover:text-white text-center">Cancel</button>
                                <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-gray-200 text-center">{isEditing ? 'Save Changes' : 'Create Project'}</button>
                              </div>
                            </div>
                         </form>
                      </div>
                   </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
}