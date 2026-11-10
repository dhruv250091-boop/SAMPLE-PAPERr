'use client';

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Globe,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Save
} from 'lucide-react';

interface ApiHealth {
  nvidiaConfigured: boolean;
  nvidiaModel: string;
  status: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [apiHealth, setApiHealth] = useState<ApiHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [websiteTitle, setWebsiteTitle] = useState('');
  const [websiteIntro, setWebsiteIntro] = useState('');
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [chatbotModel, setChatbotModel] = useState('');
  const [chatbotPrompt, setChatbotPrompt] = useState('');
  const [rateLimit, setRateLimit] = useState('20');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        setSettings(data.settings || {});
        setApiHealth(data.apiHealth || null);

        setWebsiteTitle(data.settings?.website_title || 'Class 12 Commerce – AI Powered Sample Paper & Study Platform');
        setWebsiteIntro(
          data.settings?.website_intro ||
            'Explore sample papers, understand important questions and prepare smarter with AI-powered learning.'
        );
        setChatbotEnabled(data.settings?.chatbot_enabled !== 'false');
        setChatbotModel(data.settings?.chatbot_model || 'nvidia/llama-3.1-nemotron-70b-instruct');
        setChatbotPrompt(
          data.settings?.chatbot_system_prompt ||
            'You are Study Chat Bot, an elite AI academic tutor exclusively focused on Class 12 Commerce subjects.'
        );
        setRateLimit(data.settings?.rate_limit_per_minute || '20');
        setMaintenanceMode(data.settings?.maintenance_mode === 'true');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website_title: websiteTitle,
          website_intro: websiteIntro,
          chatbot_enabled: chatbotEnabled ? 'true' : 'false',
          chatbot_model: chatbotModel,
          chatbot_system_prompt: chatbotPrompt,
          rate_limit_per_minute: rateLimit,
          maintenance_mode: maintenanceMode ? 'true' : 'false'
        })
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert('Failed to save settings');
      }
    } catch {
      alert('Error updating configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center space-x-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#315E9E]" />
        <span>Loading configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] font-heading tracking-tight">
          Platform Configuration & AI Parameters
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Adjust website metadata, NVIDIA Nemotron AI behavior, rate limiting, and emergency maintenance mode.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Configuration saved and applied in database successfully.</span>
        </div>
      )}

      {/* API Health & NVIDIA Status Card */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#315E9E]" />
            <h2 className="text-sm font-bold text-[var(--text-primary)] font-heading">NVIDIA AI Engine Health</h2>
          </div>
          <span className="text-[11px] font-mono text-[var(--text-secondary)]">NIM Endpoint</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
            <p className="text-[11px] text-[var(--text-secondary)]">Status</p>
            <p className="font-bold text-[var(--text-primary)] flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${apiHealth?.nvidiaConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{apiHealth?.status || 'Active & Operational'}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
            <p className="text-[11px] text-[var(--text-secondary)]">Active Model Identifier</p>
            <p className="font-mono font-semibold text-[var(--text-primary)] truncate">
              {chatbotModel}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
            <p className="text-[11px] text-[var(--text-secondary)]">API Key Privacy</p>
            <p className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              Protected (Never exposed in UI)
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Chatbot Configuration */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm space-y-5 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-[#315E9E]" />
              <h2 className="text-sm font-bold text-[var(--text-primary)] font-heading">Study Chat Bot Parameters</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
              <div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">Enable Study Chat Bot</p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Allow students to interact with AI tutoring and automated sample paper searches.
                </p>
              </div>
              <input
                type="checkbox"
                checked={chatbotEnabled}
                onChange={(e) => setChatbotEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-[#315E9E] bg-[var(--bg-surface)] border-[var(--border-color)] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                NVIDIA Model Identifier
              </label>
              <input
                type="text"
                value={chatbotModel}
                onChange={(e) => setChatbotModel(e.target.value)}
                placeholder="nvidia/llama-3.1-nemotron-70b-instruct"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-[#315E9E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Rate Limit (Queries per minute per IP / User)
              </label>
              <input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
                min={5}
                max={60}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-[#315E9E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                System Prompt (AI Behavioral Directive)
              </label>
              <textarea
                value={chatbotPrompt}
                onChange={(e) => setChatbotPrompt(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono leading-relaxed focus:outline-none focus:border-[#315E9E]"
              />
            </div>
          </div>
        </div>

        {/* Website Content Settings */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm space-y-5 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-[var(--text-primary)] font-heading">Homepage & Website Content</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Platform Title
              </label>
              <input
                type="text"
                value={websiteTitle}
                onChange={(e) => setWebsiteTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:border-[#315E9E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Homepage Hero Subheading
              </label>
              <textarea
                value={websiteIntro}
                onChange={(e) => setWebsiteIntro(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#315E9E]"
              />
            </div>

            {/* Maintenance Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Maintenance Mode</span>
                </p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-200/80">
                  When enabled, non-admin visitors will see a scheduled maintenance notice.
                </p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 rounded text-amber-600 bg-[var(--bg-surface)] border-amber-500/40 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#315E9E] hover:bg-[#24487D] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
