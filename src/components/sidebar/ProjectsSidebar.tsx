import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Trash2, LogOut } from 'lucide-react';
import { projectsApi } from '@/functions/projects';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Project } from '@/functions/projects';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ProjectCard } from './ProjectCard';
import { Loader2 } from 'lucide-react';

interface ProjectsSidebarProps {
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  userId: string;
  disabled?: boolean;
  onProjectsLoadingChange?: (isLoading: boolean) => void; // New callback prop
}

export const ProjectsSidebar = ({
  selectedProjectId,
  onSelectProject,
  userId,
  disabled = false,
  onProjectsLoadingChange,
}: ProjectsSidebarProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false); // New loading state

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    if (!userId) {
      toast.error('User ID not found. Please log in.');
      return;
    }

    setIsProjectsLoading(true);
    onProjectsLoadingChange?.(true); // Notify parent of loading start
    try {
      const data = await projectsApi.getAll(userId);
      console.log('Projects loaded:', data);
      setProjects(data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setIsProjectsLoading(false);
      onProjectsLoadingChange?.(false); // Notify parent of loading end
    }
  };

  const handleCreateProject = async () => {
    if (disabled) {
      toast.error('Please wait until the upload is complete');
      return;
    }

    if (!newProjectName.trim()) {
      toast.error('Project name is required');
      return;
    }

    if (!userId) {
      toast.error('User ID not found. Please log in.');
      return;
    }

    setIsCreating(true);
    try {
      const response = await projectsApi.create(newProjectName, userId);
      await loadProjects();
      setNewProjectName('');
      setIsCreateDialogOpen(false);
      onSelectProject(response.project_id);
      toast.success('Project created successfully');
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (disabled) {
      toast.error('Please wait until the upload is complete');
      return;
    }

    setDeletingProjectId(projectId);
    try {
      await projectsApi.delete(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
      if (selectedProjectId === projectId) {
        onSelectProject('');
      }
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
    } finally {
      setDeletingProjectId(null);
    }
  };

  const handleLogout = () => {
    if (disabled) {
      toast.error('Please wait until the upload is complete');
      return;
    }
    try {
      localStorage.clear();
      window.location.href = '/';
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <>
      <div className="w-64 border-r bg-sidebar flex flex-col h-screen">
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold gradient-text">Projects</h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsCreateDialogOpen(true)}
                aria-label="Create new project"
                className="hover:bg-gradient-hover"
                disabled={disabled || isCreating}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {projects.length === 0 && !isProjectsLoading ? (
                <p className="text-center text-muted-foreground">No projects found</p>
              ) : (
                projects.map((project, index) => (
                  <div
                    key={project.id}
                    className="group relative"
                    tabIndex={disabled ? -1 : 0}
                    role="button"
                    aria-label={`Open project ${project.project_name}`}
                    onKeyDown={(e) => {
                      if (disabled || deletingProjectId === project.id) return;
                      if (e.key === 'Enter') {
                        onSelectProject(project.id);
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const next = document.querySelector(
                          `[data-project-index="${index + 1}"]`
                        ) as HTMLElement;
                        next?.focus();
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prev = document.querySelector(
                          `[data-project-index="${index - 1}"]`
                        ) as HTMLElement;
                        prev?.focus();
                      }
                    }}
                    data-project-index={index}
                  >
                    <ProjectCard
                      project={project}
                      isSelected={selectedProjectId === project.id}
                      onClick={() => {
                        if (!disabled && deletingProjectId !== project.id) {
                          onSelectProject(project.id);
                        }
                      }}
                      disabled={disabled || deletingProjectId === project.id}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => e.stopPropagation()}
                            disabled={disabled || deletingProjectId === project.id}
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-destructive"
                            disabled={disabled || deletingProjectId === project.id}
                          >
                            {deletingProjectId === project.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="p-4 border-t shrink-0">
          <Button
            variant="outline"
            className="w-full justify-start gradient-primary"
            onClick={handleLogout}
            disabled={disabled}
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Photo Project"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isCreating && !disabled) {
                    handleCreateProject();
                  }
                }}
                autoFocus
                disabled={isCreating || disabled}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreating || disabled}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              className="gradient-primary"
              disabled={isCreating || disabled}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};