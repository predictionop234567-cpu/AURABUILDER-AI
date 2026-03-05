import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Rocket, Zap, Globe, Layout, Shield, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">N</div>
          <span className="text-xl font-bold tracking-tight">NEBULA FORGE AI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium hover:text-indigo-600 transition-colors">Login</Link>
          <Link to="/signup" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">Get Started</Link>
        </div>
      </nav>

      <main>
        <section className="px-8 pt-20 pb-32 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-[0.9]">
              Nebula Forge AI.<br />
              <span className="text-indigo-600">Build Instantly.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
              The next-gen AI website builder. Generate professional, production-ready websites in seconds with Gemini.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group">
                Start Building Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all">
                View Demo
              </button>
            </div>
          </motion.div>
        </section>

        <section className="bg-slate-50 py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <FeatureCard 
                icon={<Zap className="w-8 h-8 text-amber-500" />}
                title="AI Generation"
                description="Describe your business and watch Gemini build a complete, responsive website in seconds."
              />
              <FeatureCard 
                icon={<Layout className="w-8 h-8 text-indigo-500" />}
                title="Visual Editor"
                description="Customize every detail with our intuitive visual editor. No coding required, but code-ready."
              />
              <FeatureCard 
                icon={<Globe className="w-8 h-8 text-emerald-500" />}
                title="One-Click Publish"
                description="Host your site on our high-performance edge network with a single click."
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
