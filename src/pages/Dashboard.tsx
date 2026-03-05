import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Layout, Globe, MoreVertical, Trash2, ExternalLink, Settings as SettingsIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { db } from '../firebase/config';
import { ref, push, remove } from 'firebase/database';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, projects, fetchProjects, logout } = useStore();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async () => {
    if (!user) return;
    setIsCreating(true);
    try {
      const projectsRef = ref(db, 'projects');
      const newProjectRef = await push(projectsRef, {
        userId: user.id,
        name: 'Untitled Website',
        prompt: '',
        html: '<html><body><h1>New Website</h1></body></html>',
        settings_json: {},
        pages_json: [],
        updated_at: new Date().toISOString(),
        createdAt: Date.now()
      });
      navigate(`/builder/${newProjectRef.key}`);
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await remove(ref(db, `projects/${id}`));
      toast.success('Project deleted');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-bottom border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="font-bold tracking-tight">AURABUILDER</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/settings" className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
            <SettingsIcon className="w-5 h-5" />
          </Link>
          <button onClick={logout} className="text-sm font-medium text-slate-500 hover:text-slate-900">Logout</button>
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
            {user?.email?.[0].toUpperCase()}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
            <p className="text-slate-500">Manage and edit your AI-generated websites.</p>
          </div>
          <button 
            onClick={handleCreateProject}
            disabled={isCreating}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" /> New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Layout className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">Start by creating your first AI-powered website. It only takes a few seconds.</p>
            <button 
              onClick={handleCreateProject}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                <div className="aspect-video bg-slate-100 relative overflow-hidden border-b border-slate-100">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <Layout className="w-12 h-12" />
                  </div>
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button 
                      onClick={() => navigate(`/builder/${project.id}`)}
                      className="bg-white text-slate-900 px-6 py-2 rounded-xl font-bold shadow-lg"
                    >
                      Open Builder
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg truncate pr-4">{project.name}</h3>
                    <div className="relative group/menu">
                      <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-slate-400" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all z-20 overflow-hidden">
                        <button 
                          onClick={() => handleDeleteProject(project.id)}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Project
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-medium uppercase tracking-wider">
                    <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
