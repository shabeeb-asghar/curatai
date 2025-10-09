"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ProjectCard } from "@/components/ProjectCard"
import { CreateProjectModal } from "@/components/CreateProjectModal"
import { projectsApi } from "@/lib/api"
import { toast } from "sonner"
import { Loader2, Search, ArrowUpDown, FolderPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Project {
  id: string
  project_name: string
  image_count: number
  created_at: string
}

type SortKey = "recent" | "name" | "images"

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("recent")

  const navigate = useNavigate()

  const storedUser = localStorage.getItem("user")
  const userId = storedUser ? JSON.parse(storedUser).id : null

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const data = await projectsApi.getAll(userId)
      console.log("Fetched projects:", data)
      setProjects(data)
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast.error("Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (name: string) => {
    try {
      await projectsApi.create(name, userId)
      toast.success("Project created successfully!")
      fetchProjects()
    } catch (error) {
      console.error("Error creating project:", error)
      toast.error("Failed to create project")
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectsApi.delete(projectId)
      toast.success("Project deleted successfully")
      fetchProjects()
    } catch (error) {
      console.error("Error deleting project:", error)
      toast.error("Failed to delete project")
    }
  }

  const handleOpenProject = (projectId: string) => {
    navigate(`/projects/${projectId}`)
  }

  const totalImages = useMemo(() => projects.reduce((sum, p) => sum + (p.image_count || 0), 0), [projects])

  const filteredAndSorted = useMemo(() => {
    const filtered = projects.filter((p) => p.project_name.toLowerCase().includes(query.toLowerCase()))

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (sortBy === "name") {
        return a.project_name.localeCompare(b.project_name)
      }
      // images
      return (b.image_count || 0) - (a.image_count || 0)
    })

    return sorted
  }, [projects, query, sortBy])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" aria-live="polite" aria-busy="true">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-balance">
              Your Projects
            </h1>
            <p className="text-muted-foreground mt-2">Organize and curate your photo collections</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 w-56 sm:w-64"
                  aria-label="Search projects"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="sr-only">
                  Sort projects
                </label>
                <div className="relative">
                  <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                    className="appearance-none pl-9 pr-8 py-2 rounded-md border border-border/60 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth text-sm"
                    aria-label="Sort projects"
                  >
                    <option value="recent">Recent</option>
                    <option value="name">Name (A–Z)</option>
                    <option value="images">Most images</option>
                  </select>
                </div>
              </div>
            </div>

            <CreateProjectModal onCreateProject={handleCreateProject} />
          </div>
        </div>

        {projects.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-border/50 p-3">
              <p className="text-xs text-muted-foreground">Projects</p>
              <p className="text-lg font-semibold">{projects.length}</p>
            </div>
            <div className="rounded-lg border border-border/50 p-3">
              <p className="text-xs text-muted-foreground">Total images</p>
              <p className="text-lg font-semibold">{totalImages}</p>
            </div>
            <div className="hidden sm:block rounded-lg border border-border/50 p-3">
              <p className="text-xs text-muted-foreground">Last updated</p>
              <p className="text-lg font-semibold">
                {projects.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
                  ?.created_at
                  ? new Date(
                      projects
                        .slice()
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
                        .created_at,
                    ).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        )}

        {filteredAndSorted.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="gradient-card border border-border/50 rounded-2xl shadow-soft p-10 max-w-md mx-auto">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border/60">
                <FolderPlus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No matching projects</h2>
              <p className="text-muted-foreground mb-6">
                {projects.length === 0
                  ? "Create your first project to start organizing your photos."
                  : "Try adjusting your search or create a new project."}
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" onClick={() => setQuery("")} aria-label="Clear search">
                  Clear search
                </Button>
                <CreateProjectModal onCreateProject={handleCreateProject} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSorted.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.project_name}
                imageCount={project.image_count}
                createdAt={project.created_at}
                onOpen={() => handleOpenProject(project.id)}
                onDelete={() => handleDeleteProject(project.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Projects
