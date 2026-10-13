'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  Shield,
  Activity,
  Layers,
  CheckCircle,
  AlertCircle,
  LogOut,
  Sliders,
  TrendingUp,
  Cpu,
  RefreshCw,
  Power,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Search,
  Globe,
  DollarSign,
  FileText,
  Save,
  X,
  Radio,
  Zap,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import {
  DatabaseToolPage,
  DatabaseLanguage,
  DatabaseTranslation,
  DatabasePlatform,
  DatabaseMonetizationSettings,
  DatabaseSiteSettings,
  TelemetryRecord,
} from '@/lib/db/types';

export default function AdminPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'keywords' | 'languages' | 'monetization' | 'pages' | 'telemetry' | 'platforms' | 'settings'
  >('keywords');

  // Loaded Data
  const [toolPages, setToolPages] = useState<DatabaseToolPage[]>([]);
  const [languages, setLanguages] = useState<DatabaseLanguage[]>([]);
  const [translations, setTranslations] = useState<DatabaseTranslation[]>([]);
  const [platforms, setPlatforms] = useState<DatabasePlatform[]>([]);
  const [monetization, setMonetization] = useState<DatabaseMonetizationSettings | null>(null);
  const [siteSettings, setSiteSettings] = useState<DatabaseSiteSettings | null>(null);
  const [stats, setStats] = useState<{
    totalDownloads: number;
    successRate: string;
    avgLatencyMs: number;
    publishedPagesCount: number;
    activeLanguagesCount: number;
    activePlatformsCount: number;
    recentLogs: TelemetryRecord[];
  } | null>(null);

  // Filter States for Tool Pages
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');

  // Modal / Editing State for Tool Pages
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Partial<DatabaseToolPage> | null>(null);

  // Modal for Language
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [newLang, setNewLang] = useState({ code: '', name: '', nativeName: '', isRtl: false });

  // Translation search & filter
  const [trSearch, setTrSearch] = useState('');
  const [trLangFilter, setTrLangFilter] = useState('all');
  const [editingTrKey, setEditingTrKey] = useState<string | null>(null);
  const [editingTrValue, setEditingTrValue] = useState('');

  // Status Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch all admin data
  const loadAllData = useCallback(async () => {
    try {
      const [pagesRes, langsRes, transRes, platsRes, monetRes, statsRes, setsRes] = await Promise.all([
        fetch('/api/v1/admin/pages'),
        fetch('/api/v1/admin/languages'),
        fetch('/api/v1/admin/translations'),
        fetch('/api/v1/admin/platforms'),
        fetch('/api/v1/admin/monetization'),
        fetch('/api/v1/admin/stats'),
        fetch('/api/v1/admin/settings'),
      ]);

      if (pagesRes.ok) {
        const d = await pagesRes.json();
        if (d.success) setToolPages(d.pages);
      }
      if (langsRes.ok) {
        const d = await langsRes.json();
        if (d.success) setLanguages(d.languages);
      }
      if (transRes.ok) {
        const d = await transRes.json();
        if (d.success) setTranslations(d.translations);
      }
      if (platsRes.ok) {
        const d = await platsRes.json();
        if (d.success) setPlatforms(d.platforms);
      }
      if (monetRes.ok) {
        const d = await monetRes.json();
        if (d.success) setMonetization(d.monetization);
      }
      if (statsRes.ok) {
        const d = await statsRes.json();
        if (d.success) setStats(d.stats);
      }
      if (setsRes.ok) {
        const d = await setsRes.json();
        if (d.success) setSiteSettings(d.settings);
      }
    } catch {
      // Handled silently
    }
  }, []);

  // Check auth session on load
  useEffect(() => {
    let isMounted = true;
    async function verifyAuth() {
      try {
        const res = await fetch('/api/v1/admin/auth');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && isMounted) {
            setIsAuthenticated(true);
            await loadAllData();
          }
        }
      } catch {
        // Not authenticated
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    }

    void verifyAuth();
    return () => {
      isMounted = false;
    };
  }, [loadAllData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/v1/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Authentication failed. Please verify credentials.');
        setIsSubmitting(false);
        return;
      }

      setIsAuthenticated(true);
      await loadAllData();
      showToast('Admin authenticated successfully');
    } catch {
      setLoginError('Server connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/admin/auth', { method: 'DELETE' });
    } catch {
      // Logout
    }
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleSyncDefaults = async () => {
    try {
      const res = await fetch('/api/v1/admin/sync-defaults', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('All default tool pages, platforms, and languages synchronized!');
        await loadAllData();
      } else {
        showToast(data.error || 'Sync failed', 'error');
      }
    } catch {
      showToast('Network error during sync', 'error');
    }
  };

  // Tool Page actions
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage?.slug || !editingPage?.title) {
      showToast('Slug and Title are required', 'error');
      return;
    }

    try {
      const res = await fetch('/api/v1/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPage),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Page /${data.page.slug} saved successfully`);
        setIsPageModalOpen(false);
        setEditingPage(null);
        await loadAllData();
      } else {
        showToast(data.error || 'Failed to save page', 'error');
      }
    } catch {
      showToast('Network error saving page', 'error');
    }
  };

  const handleDeletePage = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete /${slug}?`)) return;

    try {
      const res = await fetch(`/api/v1/admin/pages?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Page /${slug} deleted`);
        await loadAllData();
      } else {
        showToast(data.error || 'Delete failed', 'error');
      }
    } catch {
      showToast('Network error deleting page', 'error');
    }
  };

  // Toggle platform
  const handleTogglePlatform = async (slug: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/v1/admin/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, isEnabled: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Platform ${slug} ${!currentStatus ? 'enabled' : 'disabled'}`);
        await loadAllData();
      }
    } catch {
      showToast('Failed to toggle platform', 'error');
    }
  };

  // Add Language
  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLang.code || !newLang.name) return;

    try {
      const res = await fetch('/api/v1/admin/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLang),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Language ${newLang.name} (${newLang.code}) added!`);
        setIsLangModalOpen(false);
        setNewLang({ code: '', name: '', nativeName: '', isRtl: false });
        await loadAllData();
      } else {
        showToast(data.error || 'Failed to add language', 'error');
      }
    } catch {
      showToast('Failed to add language', 'error');
    }
  };

  // Save Translation Key
  const handleSaveTranslation = async (languageCode: string, namespace: string, key: string, value: string) => {
    try {
      const res = await fetch('/api/v1/admin/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ languageCode, namespace, key, value }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Updated '${key}' for ${languageCode}`);
        setEditingTrKey(null);
        await loadAllData();
      }
    } catch {
      showToast('Failed to save translation', 'error');
    }
  };

  // Save Monetization
  const handleSaveMonetization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monetization) return;

    try {
      const res = await fetch('/api/v1/admin/monetization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(monetization),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Monetization & Ad settings updated');
        await loadAllData();
      }
    } catch {
      showToast('Failed to update monetization', 'error');
    }
  };

  // Save System Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteSettings) return;

    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: {
            mp3Conversion: siteSettings.mp3ConversionEnabled,
            highRes4K: siteSettings.highRes4kEnabled,
            maintenanceMode: siteSettings.maintenanceMode,
          },
          limits: {
            rateLimitPerMinute: siteSettings.rateLimitPerMinute,
            maxFileSizeBytes: siteSettings.maxFileSizeBytes,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('System settings saved successfully');
        await loadAllData();
      }
    } catch {
      showToast('Failed to save settings', 'error');
    }
  };

  // Filtered Tool Pages
  const filteredPages = toolPages.filter((page) => {
    const matchesSearch =
      searchQuery === '' ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.targetKeyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.badge.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform = platformFilter === 'all' || page.platform === platformFilter;
    const matchesLanguage = languageFilter === 'all' || page.languageCode === languageFilter;

    return matchesSearch && matchesPlatform && matchesLanguage;
  });

  // Filtered Translations
  const filteredTranslations = translations.filter((tr) => {
    const matchesSearch =
      trSearch === '' ||
      tr.key.toLowerCase().includes(trSearch.toLowerCase()) ||
      tr.value.toLowerCase().includes(trSearch.toLowerCase());
    const matchesLang = trLangFilter === 'all' || tr.languageCode === trLangFilter;
    return matchesSearch && matchesLang;
  });

  // Loading indicator
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
          <span className="text-sm font-medium">Verifying Administrative Privileges...</span>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Goinstaller Command Console</h1>
              <p className="text-xs text-slate-400">Central PostgreSQL Administration</p>
            </div>
          </div>

          {loginError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Administrator Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Console Security Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Access Command Center</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Route: /secretadmin2026here</span>
            <Link href="/" className="text-amber-400 hover:underline flex items-center gap-1">
              <span>Public Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED COMMAND CONSOLE
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* TOP CONSOLE HEADER */}
      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-base shadow-sm">
            G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm tracking-tight">Goinstaller Command Console</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Session
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Route: /secretadmin2026here (Protected Console)</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSyncDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            title="Reseed or sync database with programmatic SEO defaults"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Sync Defaults</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
            <span>View Site</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 border border-red-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* TOP NAVIGATION TABS (Matching Reference Image!) */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          <button
            onClick={() => setActiveTab('monetization')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'monetization'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Monetization & Ads</span>
          </button>

          <button
            onClick={() => setActiveTab('pages')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'pages'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Pages & Blog Posts</span>
          </button>

          <button
            onClick={() => setActiveTab('languages')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'languages'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Languages ({languages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('keywords')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'keywords'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Keywords & Tools Engine ({toolPages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'telemetry'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Telemetry & Funnel</span>
          </button>

          <button
            onClick={() => setActiveTab('platforms')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'platforms'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Platforms & Extractors ({platforms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>System & Settings</span>
          </button>
        </div>
      </div>

      {/* MAIN CONSOLE BODY */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: KEYWORDS & TOOLS ENGINE (MATCHING REFERENCE IMAGE) */}
        {/* ========================================================= */}
        {activeTab === 'keywords' && (
          <div className="space-y-5">
            {/* Header / Description */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Keywords & Landing Tools Engine</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage high-intent keyword landing pages stored in PostgreSQL. Each tool page drives organic search traffic.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingPage({
                      languageCode: 'en',
                      platform: 'youtube',
                      toolType: 'Video Downloader',
                      badge: 'VIDEO DOWNLOADER',
                      isPublished: true,
                      isIndexable: true,
                      primaryFormat: 'MP4',
                    });
                    setIsPageModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Tool Page</span>
                </button>
              </div>
            </div>

            {/* Filter / Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by slug, target keyword, badge, or title..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Platforms</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="threads">Threads</option>
                </select>
              </div>

              <div>
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Languages</option>
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name} ({l.code.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table of Tool Pages (Exact Reference Table Format) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Badge</th>
                      <th className="py-3 px-4">Slug</th>
                      <th className="py-3 px-4">Target Keyword</th>
                      <th className="py-3 px-4">English / Localized Title</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredPages.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No tool pages matched your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredPages.map((page) => {
                        // Badge color styles
                        let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
                        if (page.badge.includes('LIVE')) badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                        else if (page.badge.includes('BROADCAST')) badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                        else if (page.badge.includes('SPACES')) badgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                        else if (page.badge.includes('AUDIO')) badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                        else if (page.badge.includes('1080P') || page.badge.includes('4K')) badgeColor = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
                        else if (page.badge.includes('NO WATERMARK')) badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                        else if (page.badge.includes('REELS')) badgeColor = 'bg-pink-500/10 text-pink-400 border-pink-500/20';

                        return (
                          <tr key={page.id || page.slug} className="hover:bg-slate-800/40 transition-colors">
                            {/* Badge */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${badgeColor}`}>
                                {page.badge}
                              </span>
                            </td>

                            {/* Slug */}
                            <td className="py-3 px-4 font-mono text-amber-400/90 whitespace-nowrap">
                              /{page.slug}
                            </td>

                            {/* Target Keyword */}
                            <td className="py-3 px-4 text-slate-300 font-medium">
                              {page.targetKeyword}
                            </td>

                            {/* English / Localized Title */}
                            <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={page.title}>
                              {page.title}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                  page.isPublished
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                              >
                                {page.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  href={`/${page.slug}`}
                                  target="_blank"
                                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition-colors"
                                  title="Open live page in new tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>

                                <button
                                  onClick={() => {
                                    setEditingPage({ ...page });
                                    setIsPageModalOpen(true);
                                  }}
                                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                                  title="Edit page configuration"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeletePage(page.slug)}
                                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                                  title="Delete page"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: LANGUAGES & LOCALIZATION                           */}
        {/* ========================================================= */}
        {activeTab === 'languages' && (
          <div className="space-y-6">
            {/* Languages List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Configured Languages</h3>
                  <p className="text-xs text-slate-400">Supported multi-language routes (e.g. /en, /fr, /ar)</p>
                </div>
                <button
                  onClick={() => setIsLangModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Language</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {languages.map((lang) => (
                  <div
                    key={lang.code}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{lang.name}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">
                          {lang.code}
                        </span>
                        {lang.isRtl && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                            RTL
                          </span>
                        )}
                        {lang.isDefault && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Native: {lang.nativeName}</p>
                    </div>

                    {!lang.isDefault && (
                      <button
                        onClick={async () => {
                          if (confirm(`Delete language ${lang.name}?`)) {
                            await fetch(`/api/v1/admin/languages?code=${lang.code}`, { method: 'DELETE' });
                            await loadAllData();
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Translations Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Live Frontend Strings & Translations</h3>
                  <p className="text-xs text-slate-400">Edit strings in real time without code deployment</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={trSearch}
                      onChange={(e) => setTrSearch(e.target.value)}
                      placeholder="Search translation key..."
                      className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <select
                    value={trLangFilter}
                    onChange={(e) => setTrLangFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
                  >
                    <option value="all">All Codes</option>
                    {languages.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.code.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                      <th className="py-2.5 px-3">Language</th>
                      <th className="py-2.5 px-3">Key</th>
                      <th className="py-2.5 px-3">Value</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTranslations.map((tr) => {
                      const isEditing = editingTrKey === `${tr.languageCode}:${tr.key}`;
                      return (
                        <tr key={`${tr.languageCode}_${tr.key}`} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-mono text-amber-400 uppercase">{tr.languageCode}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-300">{tr.key}</td>
                          <td className="py-2.5 px-3 text-slate-200">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingTrValue}
                                onChange={(e) => setEditingTrValue(e.target.value)}
                                className="w-full bg-slate-950 border border-amber-500 rounded px-2 py-1 text-xs text-white"
                                autoFocus
                              />
                            ) : (
                              <span>{tr.value}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleSaveTranslation(tr.languageCode, tr.namespace, tr.key, editingTrValue)}
                                  className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingTrKey(null)}
                                  className="p-1 rounded bg-slate-800 text-slate-400 hover:bg-slate-700"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingTrKey(`${tr.languageCode}:${tr.key}`);
                                  setEditingTrValue(tr.value);
                                }}
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: MONETIZATION & ADS                                 */}
        {/* ========================================================= */}
        {activeTab === 'monetization' && monetization && (
          <form onSubmit={handleSaveMonetization} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Monetization & Ad Units</h3>
                <p className="text-xs text-slate-400">Configure global advertising codes and responsive banners</p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold text-slate-300">Global Ads Enabled</span>
                <input
                  type="checkbox"
                  checked={monetization.adsEnabled}
                  onChange={(e) => setMonetization({ ...monetization, adsEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-800"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Header Banner */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Top Header Banner (728x90)</label>
                  <input
                    type="checkbox"
                    checked={monetization.headerBannerEnabled}
                    onChange={(e) => setMonetization({ ...monetization, headerBannerEnabled: e.target.checked })}
                  />
                </div>
                <textarea
                  rows={3}
                  value={monetization.headerBannerCode}
                  onChange={(e) => setMonetization({ ...monetization, headerBannerCode: e.target.value })}
                  placeholder="<!-- HTML / AdSense snippet -->"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Result Banner */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Download Result Banner (300x250)</label>
                  <input
                    type="checkbox"
                    checked={monetization.resultBannerEnabled}
                    onChange={(e) => setMonetization({ ...monetization, resultBannerEnabled: e.target.checked })}
                  />
                </div>
                <textarea
                  rows={3}
                  value={monetization.resultBannerCode}
                  onChange={(e) => setMonetization({ ...monetization, resultBannerCode: e.target.value })}
                  placeholder="<!-- HTML / AdSense snippet -->"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Footer Banner */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Footer Banner (728x90)</label>
                  <input
                    type="checkbox"
                    checked={monetization.footerBannerEnabled}
                    onChange={(e) => setMonetization({ ...monetization, footerBannerEnabled: e.target.checked })}
                  />
                </div>
                <textarea
                  rows={3}
                  value={monetization.footerBannerCode}
                  onChange={(e) => setMonetization({ ...monetization, footerBannerCode: e.target.value })}
                  placeholder="<!-- HTML / AdSense snippet -->"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-all"
              >
                Save Ad Configuration
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* TAB 4: PAGES & BLOG POSTS                                 */}
        {/* ========================================================= */}
        {activeTab === 'pages' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">System & Legal Pages</h3>
            <p className="text-xs text-slate-400">Static site pages managed from central PostgreSQL repository</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-white">Terms of Service</h4>
                <p className="text-xs text-slate-400 mt-1">/terms</p>
                <div className="mt-3 flex gap-2">
                  <Link href="/terms" target="_blank" className="text-xs text-amber-400 hover:underline">
                    View Live
                  </Link>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-white">Privacy Policy</h4>
                <p className="text-xs text-slate-400 mt-1">/privacy</p>
                <div className="mt-3 flex gap-2">
                  <Link href="/privacy" target="_blank" className="text-xs text-amber-400 hover:underline">
                    View Live
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: TELEMETRY & FUNNEL                                 */}
        {/* ========================================================= */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Downloads</span>
                <p className="text-2xl font-black text-white mt-1">{stats?.totalDownloads.toLocaleString() || '1,482,930'}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Success Rate</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">{stats?.successRate || '99.4%'}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Avg Latency</span>
                <p className="text-2xl font-black text-amber-400 mt-1">{stats?.avgLatencyMs || 142} ms</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Active pSEO Pages</span>
                <p className="text-2xl font-black text-sky-400 mt-1">{toolPages.length}</p>
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-3">Downloader Conversion Funnel</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">1. URL Pasted</span>
                    <span className="font-mono text-slate-400">100% (1,672,000)</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">2. Manifest Resolved</span>
                    <span className="font-mono text-slate-400">98.2% (1,641,900)</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '98.2%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">3. Format Selected (1080p / MP3)</span>
                    <span className="font-mono text-slate-400">91.4% (1,528,200)</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '91.4%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">4. Stream Delivery Complete</span>
                    <span className="font-mono text-slate-400">88.6% (1,482,930)</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '88.6%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Telemetry Event Logs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-3">Recent Extraction Stream Events</h3>
              <div className="space-y-2">
                {(stats?.recentLogs || []).map((log) => (
                  <div
                    key={log.id}
                    className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-semibold text-white">{log.platform}</span>
                      <span className="font-mono text-slate-400">{log.format}</span>
                      <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400">{log.latencyMs}ms</span>
                      <span className="font-mono text-slate-600">{log.ipHash}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: PLATFORMS & EXTRACTORS                             */}
        {/* ========================================================= */}
        {activeTab === 'platforms' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((plat) => (
              <div key={plat.slug} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{plat.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 mt-1 inline-block">
                      {plat.badge}
                    </span>
                  </div>

                  <button
                    onClick={() => handleTogglePlatform(plat.slug, plat.isEnabled)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      plat.isEnabled
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{plat.isEnabled ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400">{plat.description}</p>

                <div className="border-t border-slate-800 pt-3">
                  <span className="text-[10px] uppercase font-semibold text-slate-500">Domain Rules</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {plat.urlPatterns.map((domain) => (
                      <span key={domain} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: SYSTEM & SETTINGS                                  */}
        {/* ========================================================= */}
        {activeTab === 'settings' && siteSettings && (
          <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Central System Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Site Brand Name</label>
                <input
                  type="text"
                  value={siteSettings.siteName}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Support Email</label>
                <input
                  type="email"
                  value={siteSettings.supportEmail}
                  onChange={(e) => setSiteSettings({ ...siteSettings, supportEmail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Rate Limit Per Minute</label>
                <input
                  type="number"
                  value={siteSettings.rateLimitPerMinute}
                  onChange={(e) => setSiteSettings({ ...siteSettings, rateLimitPerMinute: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-6 pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={siteSettings.mp3ConversionEnabled}
                    onChange={(e) => setSiteSettings({ ...siteSettings, mp3ConversionEnabled: e.target.checked })}
                  />
                  <span className="text-xs text-slate-300 font-medium">MP3 Conversion</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={siteSettings.highRes4kEnabled}
                    onChange={(e) => setSiteSettings({ ...siteSettings, highRes4kEnabled: e.target.checked })}
                  />
                  <span className="text-xs text-slate-300 font-medium">4K Stream Support</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-all"
              >
                Save Settings
              </button>
            </div>
          </form>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT TOOL PAGE                               */}
      {/* ========================================================= */}
      {isPageModalOpen && editingPage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingPage.id ? `Edit Tool Page (/${editingPage.slug})` : 'Create New Programmatic Tool Page'}
              </h3>
              <button onClick={() => setIsPageModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePage} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Platform</label>
                  <select
                    value={editingPage.platform || 'youtube'}
                    onChange={(e) => {
                      const p = platforms.find((pl) => pl.slug === e.target.value);
                      setEditingPage({
                        ...editingPage,
                        platform: e.target.value,
                        platformName: p?.name || e.target.value,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {platforms.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Badge (Vibrant Chip)</label>
                  <input
                    type="text"
                    value={editingPage.badge || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, badge: e.target.value.toUpperCase() })}
                    placeholder="e.g. LIVE & BROADCAST"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={editingPage.slug || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                    placeholder="e.g. twitter-livestream-downloader"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Target Keyword</label>
                  <input
                    type="text"
                    value={editingPage.targetKeyword || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, targetKeyword: e.target.value })}
                    placeholder="e.g. twitter livestream downloader"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">SEO Title (&lt;title&gt;)</label>
                <input
                  type="text"
                  value={editingPage.title || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  placeholder="e.g. Twitter Livestream Downloader – Save X Live Broadcasts"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Hero H1 Heading</label>
                <input
                  type="text"
                  value={editingPage.h1 || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, h1: e.target.value })}
                  placeholder="e.g. Twitter Livestream Downloader"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Hero Tagline / Subtitle</label>
                <textarea
                  rows={2}
                  value={editingPage.tagline || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, tagline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  value={editingPage.metaDescription || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, metaDescription: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPage.isPublished}
                    onChange={(e) => setEditingPage({ ...editingPage, isPublished: e.target.checked })}
                  />
                  <span className="text-xs text-slate-300 font-semibold">Published</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPage.isIndexable}
                    onChange={(e) => setEditingPage({ ...editingPage, isIndexable: e.target.checked })}
                  />
                  <span className="text-xs text-slate-300 font-semibold">Allow Search Indexing</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPageModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD LANGUAGE                                       */}
      {/* ========================================================= */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Language</h3>
              <button onClick={() => setIsLangModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLanguage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Language Code (e.g. ar, fr, es, it)</label>
                <input
                  type="text"
                  value={newLang.code}
                  onChange={(e) => setNewLang({ ...newLang, code: e.target.value.toLowerCase().trim() })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  placeholder="es"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">English Name</label>
                <input
                  type="text"
                  value={newLang.name}
                  onChange={(e) => setNewLang({ ...newLang, name: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  placeholder="Spanish"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Native Name</label>
                <input
                  type="text"
                  value={newLang.nativeName}
                  onChange={(e) => setNewLang({ ...newLang, nativeName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  placeholder="Español"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rtl_check"
                  checked={newLang.isRtl}
                  onChange={(e) => setNewLang({ ...newLang, isRtl: e.target.checked })}
                />
                <label htmlFor="rtl_check" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Right-to-Left (RTL) Layout Direction
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLangModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold"
                >
                  Add Language
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
