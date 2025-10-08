import { useState, useCallback } from 'react';

interface Project {
  id: string;
  name: string;
  data: any;
  createdAt: Date;
  modifiedAt: Date;
}

export const useProjectManager = () => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const createProject = useCallback((name: string, data: any) => {
    const project: Project = {
      id: `project-${Date.now()}`,
      name,
      data,
      createdAt: new Date(),
      modifiedAt: new Date()
    };
    setCurrentProject(project);
    setIsDirty(false);
    return project;
  }, []);

  const loadProject = useCallback((project: Project) => {
    setCurrentProject(project);
    setIsDirty(false);
  }, []);

  const saveProject = useCallback((data: any) => {
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        data,
        modifiedAt: new Date()
      };
      setCurrentProject(updatedProject);
      setIsDirty(false);
      return updatedProject;
    }
    return null;
  }, [currentProject]);

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  return {
    currentProject,
    isDirty,
    createProject,
    loadProject,
    saveProject,
    markDirty
  };
};
