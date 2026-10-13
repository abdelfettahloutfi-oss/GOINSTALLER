'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Menu, X, Globe, ChevronDown, Check } from 'lucide-react';

interface NavbarProps {
  currentPlatform?: string;
  currentLang?: string;
}

export function Navbar({ currentPlatform, currentLang = 'en' }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeLangCode, setActiveLangCode] = useState(currentLang);

  const languages = [
    { code: 'en', name: 'English', native: 'English', href: '/' },
    { code: 'fr', name: 'French', native: 'Français', href: '/fr' },
    { code: 'ar', name: 'Arabic', native: 'العربية', href: '/ar' },
    { code: 'es', name: 'Spanish', native: 'Español', href: '/es' },
    { code: 'de', name: 'German', native: 'Deutsch', href: '/de' },
  ];

  const currentLanguageObj = languages.find((l) => l.code === activeLangCode) || languages[0];

  const navLinks = [
    { name: 'YouTube', href: '/youtube-video-downloader', slug: 'youtube' },
    { name: 'Facebook', href: '/facebook-video-downloader', slug: 'facebook' },
    { name: 'Instagram', href: '/instagram-reels-downloader', slug: 'instagram' },
    { name: 'TikTok', href: '/tiktok-video-downloader', slug: 'tiktok' },
    { name: 'Twitter / X', href: '/twitter-hd-1080p', slug: 'twitter' },
    { name: 'YouTube to MP3', href: '/youtube-to-mp3', slug: 'youtube-mp3' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href={activeLangCode === 'en' ? '/' : `/${activeLangCode}`} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200 group-hover:scale-105 transition-transform duration-200">
              <Download className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-tight flex items-center gap-0.5">
                Goinstaller<span className="text-emerald-600">.com</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Online Media Downloader
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPlatform === link.slug;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Language Selector */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
                aria-label="Language selector"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentLanguageObj.native}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in">
                  {languages.map((lang) => (
                    <Link
                      key={lang.code}
                      href={lang.href}
                      onClick={() => {
                        setActiveLangCode(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">{lang.native}</span>
                        <span className="text-[10px] text-slate-400">{lang.name}</span>
                      </div>
                      {activeLangCode === lang.code && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Open mobile navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
            {languages.map((lang) => (
              <Link
                key={lang.code}
                href={lang.href}
                onClick={() => {
                  setActiveLangCode(lang.code);
                  setMobileMenuOpen(false);
                }}
                className={`px-2.5 py-1 rounded text-xs font-medium border ${
                  activeLangCode === lang.code
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {lang.native}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
