import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Zap, Save, Globe, Smartphone, Monitor, Tablet, RefreshCw, 
  ChevronLeft, Code, Layout, Type, Palette, History, Download,
  Play, Sparkles, AlertCircle
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useStore } from '../store/useStore';
import { db } from '../firebase/config';
import { ref, get, update } from 'firebase/database';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export default function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, currentProject, setCurrentProject } = useStore();
  
  const [prompt, setPrompt] = useState('');
  const [html, setHtml] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'content'>('visual');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        const projectRef = ref(db, `projects/${id}`);
        const snapshot = await get(projectRef);
        
        if (snapshot.exists()) {
          const data = { id: snapshot.key, ...snapshot.val() } as any;
          setCurrentProject(data);
          setHtml(data.html || '');
          setPrompt(data.prompt || '');
        } else {
          toast.error('Project not found');
          navigate('/dashboard');
        }
      } catch (error) {
        toast.error('Error fetching project');
        navigate('/dashboard');
      }
    };
    fetchProject();
  }, [id, navigate, setCurrentProject]);

  const handleGenerate = async () => {
    if (!prompt) return toast.error('Please enter a prompt');
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, options: { brandName: currentProject?.name } })
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Server returned invalid JSON:", text);
        throw new Error("Server returned invalid response. Please try again.");
      }

      if (!data.success) {
        throw new Error(data.error || 'AI generation failed');
      }

      setHtml(data.data.html);
      toast.success('Website generated!');
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      const projectRef = ref(db, `projects/${id}`);
      await update(projectRef, { 
        html, 
        prompt, 
        updated_at: new Date().toISOString() 
      });
      toast.success('Project saved');
    } catch (error) {
      console.error("Save error:", error);
      toast.error('Failed to save');
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId: id, 
          html, 
          name: currentProject?.name,
          userId: user?.id 
        })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Server returned invalid JSON:", text);
        throw new Error("Server returned invalid response. Please try again.");
      }

      if (!data.success) {
        throw new Error(data.error || 'Publishing failed');
      }

      setPublishedUrl(data.data.url);
      toast.success('Website published!');
    } catch (error: any) {
      console.error("Publish error:", error);
      toast.error(error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
            <span className="font-bold tracking-tight hidden md:block">{currentProject?.name || 'Untitled Website'}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setViewport('desktop')}
              className={`p-2 rounded-lg transition-all ${viewport === 'desktop' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewport('tablet')}
              className={`p-2 rounded-lg transition-all ${viewport === 'tablet' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewport('mobile')}
              className={`p-2 rounded-lg transition-all ${viewport === 'mobile' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="h-8 w-px bg-slate-800 mx-2" />

          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all text-sm"
          >
            <Save className="w-4 h-4" /> Save
          </button>
          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all text-sm shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />} 
            Publish
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Prompt */}
        <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/50">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">AI Generator</h2>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your dream website..."
              className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none mb-4"
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {isGenerating ? 'Generating...' : 'Generate Site'}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Settings</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Website Type</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm">
                  <option>Landing Page</option>
                  <option>Portfolio</option>
                  <option>SaaS</option>
                  <option>Business</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Design Style</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm">
                  <option>Modern</option>
                  <option>Minimal</option>
                  <option>Dark</option>
                  <option>Glassmorphism</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: Preview */}
        <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-8 overflow-hidden relative">
          <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ${
            viewport === 'desktop' ? 'w-full h-full' : 
            viewport === 'tablet' ? 'w-[768px] h-full' : 
            'w-[390px] h-full'
          }`}>
            <iframe 
              ref={iframeRef}
              srcDoc={html}
              className="w-full h-full border-none"
              title="Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>

          {/* Published Modal */}
          <AnimatePresence>
            {publishedUrl && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6"
              >
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-6">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-2">Site Published!</h3>
                  <p className="text-slate-400 text-center mb-6">Your website is now live and accessible to the world.</p>
                  <div className="bg-slate-800 p-4 rounded-xl flex items-center justify-between mb-6">
                    <span className="text-sm truncate mr-4 text-slate-300">{publishedUrl}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(publishedUrl);
                        toast.success('URL copied!');
                      }}
                      className="text-indigo-400 font-bold text-sm hover:text-indigo-300"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setPublishedUrl(null)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold transition-all"
                    >
                      Close
                    </button>
                    <a 
                      href={publishedUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold text-center transition-all"
                    >
                      Visit Site
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel: Editor Tabs */}
        <div className="w-96 border-l border-slate-800 flex flex-col bg-slate-900/50">
          <div className="flex border-b border-slate-800">
            <button 
              onClick={() => setActiveTab('visual')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'visual' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Layout className="w-4 h-4 mx-auto mb-1" /> Visual
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'code' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Code className="w-4 h-4 mx-auto mb-1" /> Code
            </button>
            <button 
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'content' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Type className="w-4 h-4 mx-auto mb-1" /> Content
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'code' ? (
              <Editor
                height="100%"
                defaultLanguage="html"
                theme="vs-dark"
                value={html}
                onChange={(value) => setHtml(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  wordWrap: 'on',
                  padding: { top: 20 }
                }}
              />
            ) : activeTab === 'visual' ? (
              <div className="p-6 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Styles</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Primary Color</label>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 border border-slate-700 cursor-pointer" />
                        <input type="text" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 text-xs" defaultValue="#4f46e5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Font Family</label>
                      <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs">
                        <option>Inter</option>
                        <option>Playfair Display</option>
                        <option>Space Grotesk</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sections</h3>
                  <div className="space-y-2">
                    {['Hero', 'Features', 'About', 'Contact', 'Footer'].map((section) => (
                      <div key={section} className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-xl group">
                        <span className="text-sm font-medium">{section}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-1 hover:bg-slate-700 rounded text-slate-400"><Layout className="w-3 h-3" /></button>
                          <button className="p-1 hover:bg-slate-700 rounded text-slate-400"><RefreshCw className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <p className="text-sm text-slate-500 text-center py-20 italic">Select an element in the preview to edit its content.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
