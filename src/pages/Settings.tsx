import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, CreditCard, Shield, Bell, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useStore();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center sticky top-0 z-10">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors mr-4">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-12">
        <div className="space-y-12">
          {/* Profile Section */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <User className="w-4 h-4" /> Account Profile
            </h2>
            <div className="bg-white rounded-3xl border border-slate-200 p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600">
                  {user?.email?.[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{user?.email}</h3>
                  <p className="text-slate-500">Personal Account</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                  <input type="text" disabled value={user?.email || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500" />
                </div>
              </div>
            </div>
          </section>

          {/* Subscription Section */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Plan & Billing
            </h2>
            <div className="bg-white rounded-3xl border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">Current Plan: <span className="text-indigo-600 uppercase">{user?.plan}</span></h3>
                  <p className="text-slate-500">You are currently on the free tier.</p>
                </div>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all">
                  Upgrade to Pro
                </button>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">✓ 5 generations per day</li>
                  <li className="flex items-center gap-2">✓ 1 published site active</li>
                  <li className="flex items-center gap-2">✓ Community support</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-red-400 mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Danger Zone
            </h2>
            <div className="bg-red-50 rounded-3xl border border-red-100 p-8">
              <h3 className="text-lg font-bold text-red-900 mb-2">Delete Account</h3>
              <p className="text-red-700 mb-6 text-sm">Once you delete your account, there is no going back. Please be certain.</p>
              <button 
                onClick={() => toast.error('This feature is disabled in the demo.')}
                className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition-all"
              >
                Delete My Account
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
