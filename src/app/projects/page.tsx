'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api, { logout as endSession } from '../utils/api';
import ConfirmDialog from '../component/ConfirmDialog';
import { Button } from '../component/ui/Button';
import { Dialog } from '../component/ui/Dialog';
import { Input, Textarea } from '../component/ui/Field';
import { EmptyState, SkeletonRows, StatusPill } from '../component/ui/Display';
import { Table, THead, TBody, TR, TH, TD } from '../component/ui/Table';
import { ThemeToggle } from '../component/ui/ThemeToggle';
import {
  Folder,
  Plus,
  Pencil,
  Trash2,
  FileCode,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Book,
  LogOut,
  AlertCircle,
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
  status?: string;
  createdAt: string;
  projectId?: number;
  isPublic?: boolean;
  publicShareId?: string;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default function ProjectsView() {
  const router = useRouter();

  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectExplanations, setProjectExplanations] = useState<Explanation[]>([]);
  const [loadingExplanations, setLoadingExplanations] = useState(false);

  const [shareModalData, setShareModalData] = useState<{ link: string; id: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchProjects();
  }, []);

  const handleLogout = async () => {
    await endSession();
    setShowLogoutConfirm(false);
    router.push('/');
  };

  const navTo = (path: string) => router.push(path);

  // --- Data ---

  const fetchProjects = async () => {
    setLoadingProjects(true);
    setProjectsError('');
    try {
      const res = await api.get('/projects/get');
      setProjects(res.data.projects || []);
    } catch (error) {
      // A failed load used to fall through to the empty state, so an unreachable
      // API was indistinguishable from an account with no projects — it looked
      // like the projects had been deleted.
      console.error('Failed to fetch projects', error);
      setProjectsError('Could not load your projects.');
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchProjectExplanations = async (projectId: number) => {
    setLoadingExplanations(true);
    try {
      const res = await api.get('/explainations');
      const allExplanations = res.data.explanations || res.data || [];
      const filtered = allExplanations.filter(
        (ex: Explanation) => String(ex.projectId) === String(projectId)
      );
      setProjectExplanations(filtered);
    } catch (error) {
      console.error('Failed to fetch project analyses', error);
    } finally {
      setLoadingExplanations(false);
    }
  };

  // --- Project actions ---

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/projects/create', {
        name: projectName,
        description: projectDesc,
      });
      setProjects((prev) => [res.data.project, ...prev]);
      closeModal();
      toast.success('Project created');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not create the project');
    } finally {
      setSaving(false);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;

    setSaving(true);
    try {
      const res = await api.put(`/projects/edit/${currentProject.id}`, {
        name: projectName,
        description: projectDesc,
      });
      setProjects((prev) =>
        prev.map((p) => (p.id === currentProject.id ? res.data.project : p))
      );
      closeModal();
      toast.success('Project updated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not update the project');
    } finally {
      setSaving(false);
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
      await api.delete(`/projects/delete/${projectToDelete.id}`);
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      if (selectedProject?.id === projectToDelete.id) handleBackToProjects();
      toast.success('Project deleted');
    } catch {
      toast.error('Could not delete the project');
    } finally {
      closeDeleteModal();
    }
  };

  const handleShare = async (e: React.MouseEvent, explanationId: string) => {
    e.stopPropagation();
    try {
      const res = await api.patch(`/explainations/${explanationId}/share`, {});
      const shareId =
        res.data.shareId || res.data.explanation?.publicShareId || res.data.publicShareId;

      if (shareId) {
        const shareUrl = `${window.location.origin}/share/${shareId}`;
        setShareModalData({ link: shareUrl, id: explanationId });
        setProjectExplanations((prev) =>
          prev.map((ex) => (ex.id === explanationId ? { ...ex, isPublic: true } : ex))
        );
      }
    } catch {
      toast.error('Could not create a share link');
    }
  };

  const copyToClipboard = () => {
    if (!shareModalData) return;
    navigator.clipboard.writeText(shareModalData.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Navigation ---

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
      window.location.href = `/dashboard?projectId=${selectedProject.id}`;
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

  return (
    <div className="min-h-screen bg-ground text-ink flex flex-col">
      <header className="w-full border-b border-border bg-ground sticky top-0 z-20">
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => navTo('/dashboard')} className="flex items-center gap-2.5">
              <div className="size-5 text-accent">
                <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                  <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <span className="text-[15px] font-semibold tracking-tight">CodeWise</span>
            </button>

            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navTo('/dashboard')}
                className="px-3 py-1.5 rounded-md text-[13px] font-medium text-ink-2 hover:text-ink hover:bg-surface-2 transition-colors duration-150"
              >
                Dashboard
              </button>
              <button
                aria-current="page"
                className="px-3 py-1.5 rounded-md text-[13px] font-medium bg-accent-soft text-accent"
              >
                Projects
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                aria-label="Sign out"
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-md border border-border hover:border-border-strong transition-colors duration-150"
              >
                <span className="size-6 rounded-full bg-surface-2 flex items-center justify-center text-[11px] font-semibold text-ink-2">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
                <LogOut size={13} className="text-ink-3" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        {selectedProject ? (
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
              <div className="flex items-start gap-3 min-w-0">
                <button
                  onClick={handleBackToProjects}
                  aria-label="Back to projects"
                  className="p-1.5 rounded-md text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors duration-150 mt-0.5"
                >
                  <ArrowLeft size={17} />
                </button>
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold tracking-tight truncate">
                    {selectedProject.name}
                  </h1>
                  <p className="text-[13px] text-ink-2 mt-0.5 line-clamp-1">
                    {selectedProject.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-none">
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/projects/${selectedProject.id}/docs`)}
                >
                  <Book size={15} /> Documentation
                </Button>
                <Button variant="primary" onClick={handleAnalyzeNew}>
                  <Plus size={15} /> New analysis
                </Button>
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-ink">Analyses</h2>
              <span className="text-[13px] text-ink-3 tabular">
                {projectExplanations.length}{' '}
                {projectExplanations.length === 1 ? 'report' : 'reports'}
              </span>
            </div>

            {loadingExplanations ? (
              <SkeletonRows rows={4} />
            ) : projectExplanations.length === 0 ? (
              <EmptyState
                icon={<FileCode size={22} />}
                title="No analyses in this project yet"
                body="Upload or paste a file to produce the first report."
                action={
                  <Button variant="primary" onClick={handleAnalyzeNew}>
                    <Plus size={15} /> Analyze a file
                  </Button>
                }
              />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>File</TH>
                    <TH>Language</TH>
                    <TH>Status</TH>
                    <TH>Analyzed</TH>
                    <TH className="text-right">Share</TH>
                  </TR>
                </THead>
                <TBody>
                  {projectExplanations.map((item) => (
                    <TR key={item.id} onClick={() => router.push(`/explanation/${item.id}`)}>
                      <TD>
                        <div className="flex items-center gap-2.5">
                          <FileCode size={15} className="text-ink-3 flex-none" />
                          <span className="font-medium text-ink truncate">
                            {item.fileName || 'Untitled'}
                          </span>
                        </div>
                      </TD>
                      <TD className="text-ink-3">{item.language}</TD>
                      <TD>
                        <StatusPill status={item.status} />
                      </TD>
                      <TD className="text-ink-3 tabular whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </TD>
                      <TD className="text-right">
                        <button
                          onClick={(e) => handleShare(e, item.id)}
                          title={item.isPublic ? 'Shared publicly' : 'Create share link'}
                          className="inline-flex items-center gap-1.5 text-ink-3 hover:text-ink transition-colors duration-150"
                        >
                          <Share2 size={14} />
                          {item.isPublic && <span className="text-[12px] text-accent">Public</span>}
                        </button>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </div>
        ) : (
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
                <p className="text-[13px] text-ink-2 mt-0.5">
                  Group related analyses and generate documentation across them.
                </p>
              </div>
              <Button variant="primary" onClick={openCreateModal} className="flex-none">
                <Plus size={15} /> New project
              </Button>
            </div>

            {loadingProjects ? (
              <SkeletonRows rows={4} />
            ) : projectsError ? (
              <EmptyState
                icon={<AlertCircle size={22} />}
                title={projectsError}
                body="Your projects are safe — this page just could not reach the server. The API sleeps when idle and can take a moment to wake up."
                action={
                  <Button variant="secondary" onClick={fetchProjects}>
                    Try again
                  </Button>
                }
              />
            ) : projects.length === 0 ? (
              <EmptyState
                icon={<Folder size={22} />}
                title="No projects yet"
                body="Projects group your analyses so documentation can be generated across a whole codebase."
                action={
                  <Button variant="primary" onClick={openCreateModal}>
                    <Plus size={15} /> Create a project
                  </Button>
                }
              />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Name</TH>
                    <TH>Description</TH>
                    <TH>Created</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {projects.map((project) => (
                    <TR key={project.id} onClick={() => handleProjectClick(project)}>
                      <TD>
                        <div className="flex items-center gap-2.5">
                          <Folder size={15} className="text-ink-3 flex-none" />
                          <span className="font-medium text-ink">{project.name}</span>
                        </div>
                      </TD>
                      <TD className="max-w-xs">
                        <span className="line-clamp-1 text-ink-2">{project.description}</span>
                      </TD>
                      <TD className="text-ink-3 tabular whitespace-nowrap">
                        {formatDate(project.createdAt)}
                      </TD>
                      <TD className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={(e) => openEditModal(project, e)}
                            aria-label={`Rename ${project.name}`}
                            className="p-1.5 rounded text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors duration-150"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={(e) => openDeleteModal(project, e)}
                            aria-label={`Delete ${project.name}`}
                            className="p-1.5 rounded text-ink-3 hover:text-critical hover:bg-critical-soft transition-colors duration-150"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </div>
        )}
      </main>

      {/* ---------------------------------------------------------- dialogs */}

      <Dialog
        open={showProjectModal}
        onClose={closeModal}
        title={isEditing ? 'Rename project' : 'New project'}
        description={
          isEditing
            ? 'Update the name and description for this project.'
            : 'Projects group related analyses so you can document them together.'
        }
      >
        <form
          onSubmit={isEditing ? handleEditProject : handleCreateProject}
          className="flex flex-col gap-4"
        >
          <Input
            label="Name"
            required
            minLength={3}
            placeholder="Payments service"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <Textarea
            label="Description"
            required
            rows={3}
            placeholder="What this codebase is responsible for."
            value={projectDesc}
            onChange={(e) => setProjectDesc(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>
              {isEditing ? 'Save changes' : 'Create project'}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={Boolean(shareModalData)}
        onClose={() => setShareModalData(null)}
        title="Share this analysis"
        description="Anyone with this link can read the report. They cannot edit it or see your other work."
      >
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            aria-label="Share link"
            value={shareModalData?.link ?? ''}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 h-9 rounded-md bg-surface border border-border px-3 font-mono text-[12px] text-ink-2"
          />
          <Button variant="primary" onClick={copyToClipboard} className="flex-none">
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </Dialog>

      <ConfirmDialog
        open={showDeleteModal}
        title="Delete this project?"
        message={
          projectToDelete
            ? `"${projectToDelete.name}" and its analyses will be removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete project"
        danger
        onConfirm={confirmDeleteProject}
        onCancel={closeDeleteModal}
      />

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
  );
}
