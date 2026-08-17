import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { YpiLogo, YwLogo } from './Logos';
import {
  LayoutDashboard,
  FilePlus,
  History,
  FileSpreadsheet,
  User as UserIcon,
  LogOut,
  ChevronDown,
  KeyRound,
  ShieldCheck,
  Settings,
  GraduationCap
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  activeTab: 'dashboard' | 'form' | 'reports' | 'history' | 'admin';
  onTabChange: (tab: 'dashboard' | 'form' | 'reports' | 'history' | 'admin') => void;
  onOpenProfileSettings: () => void;
  onExportExcel: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  onOpenProfileSettings,
  onExportExcel,
  onLogout
}) => {
  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-gradient-to-r from-[#831843] via-[#be185d] to-[#881337] text-white shadow-xl sticky top-0 z-40 relative">
      
      {/* Kop Ornament Left (Soft Pink & White Waves + Dots) */}
      <div className="absolute left-0 top-0 bottom-0 pointer-events-none z-0 opacity-80 hidden sm:block w-36 overflow-hidden">
        <svg viewBox="0 0 150 80" className="w-full h-full" preserveAspectRatio="none">
          {/* Soft Pink Organic Wave */}
          <path d="M 0 0 L 80 0 Q 60 40 0 70 Z" fill="#f472b6" fillOpacity="0.3" />
          <path d="M 0 0 L 60 0 Q 45 30 0 55 Z" fill="#fda4af" fillOpacity="0.4" />
          {/* Soft Pastel Accent Wave */}
          <path d="M 0 35 Q 50 45 0 80 Z" fill="#f43f5e" fillOpacity="0.25" />
          {/* Floating Pink Dots */}
          <circle cx="95" cy="18" r="3.5" fill="#f472b6" fillOpacity="0.7" />
          <circle cx="110" cy="12" r="2.5" fill="#fb7185" fillOpacity="0.6" />
          <circle cx="102" cy="28" r="2" fill="#fda4af" fillOpacity="0.8" />
        </svg>
      </div>

      {/* Kop Ornament Right (Pink Corner, Leaf Lines & Coral Starbursts) */}
      <div className="absolute right-0 top-0 bottom-0 pointer-events-none z-0 opacity-85 hidden sm:block w-40 overflow-hidden">
        <svg viewBox="0 0 160 80" className="w-full h-full" preserveAspectRatio="none">
          {/* Pink Corner Wave */}
          <path d="M 160 0 L 70 0 Q 110 50 160 80 Z" fill="#e11d48" fillOpacity="0.35" />
          <path d="M 160 0 L 95 0 Q 125 35 160 60 Z" fill="#fb7185" fillOpacity="0.3" />
          {/* Coral / Pink Starburst / Dots */}
          <circle cx="55" cy="18" r="3.5" fill="#f472b6" fillOpacity="0.8" />
          <circle cx="42" cy="26" r="2.5" fill="#fb7185" fillOpacity="0.7" />
          <circle cx="68" cy="12" r="2" fill="#fda4af" fillOpacity="0.8" />
          {/* Starburst Graphic */}
          <path d="M 35 15 L 39 15 M 37 13 L 37 17" stroke="#fb7185" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand & Dual Logos (Logo YPI then Logo YW) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5 bg-white/15 p-2 rounded-2xl border border-white/25 backdrop-blur-md shadow-md shrink-0">
              {/* Logo YPI (Yayasan Pesantren Islam Al-Azhar) */}
              <YpiLogo size={40} className="drop-shadow-sm hover:scale-105 transition-transform shrink-0 aspect-square" />
              {/* Logo YW (Yayasan Jam'iyyah Al-Azhar Grand Wisata) */}
              <YwLogo size={40} className="drop-shadow-sm hover:scale-105 transition-transform shrink-0 aspect-square" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl tracking-tight leading-none text-white">
                  Life Skill
                </h1>
                <span className="text-[10px] uppercase font-extrabold tracking-widest bg-pink-400/25 text-pink-100 border border-pink-300/40 px-2 py-0.5 rounded-full shadow-sm">
                  SMPIA 44 Grand Wisata
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <p className="text-[11px] text-pink-100/90 font-medium">
                  Online
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-black/20 p-1.5 rounded-2xl border border-white/15 backdrop-blur-md">
            {isAdmin && (
              <button
                onClick={() => onTabChange('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-white text-[#831843] shadow-md font-bold'
                    : 'text-pink-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <KeyRound className="w-4 h-4 text-pink-300" />
                <span>Kelola Akun (Admin)</span>
              </button>
            )}

            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#831843] shadow-md font-bold'
                  : 'text-pink-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard {isAdmin ? 'Admin' : (isTeacher ? 'Guru' : 'Murid')}</span>
            </button>

            {!isTeacher && !isAdmin && (
              <button
                onClick={() => onTabChange('form')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'form'
                    ? 'bg-white text-[#831843] shadow-md font-bold'
                    : 'text-pink-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <FilePlus className="w-4 h-4" />
                <span>Kirim Laporan</span>
              </button>
            )}

            {(isTeacher || isAdmin) && (
              <button
                onClick={() => onTabChange('reports')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'reports'
                    ? 'bg-white text-[#831843] shadow-md font-bold'
                    : 'text-pink-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Daftar Laporan</span>
              </button>
            )}

            <button
              onClick={() => onTabChange('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-[#831843] shadow-md font-bold'
                  : 'text-pink-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Riwayat Status</span>
            </button>
          </nav>

          {/* User Account Info & Dropdown Menu */}
          <div className="flex items-center gap-2 relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-left group cursor-pointer"
              title="Menu Pengguna & Pengaturan Akun"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border relative ${
                isAdmin
                  ? 'bg-pink-300/30 text-pink-100 border-pink-300/50'
                  : 'bg-pink-300/25 text-pink-100 border-pink-300/40'
              }`}>
                {currentUser.name.charAt(0)}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-pink-300 transition-transform duration-200 sm:hidden ${showMenu ? 'rotate-180' : ''}`} />
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-white group-hover:text-pink-200 transition-colors flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  <ChevronDown className={`w-3 h-3 text-pink-300 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
                </div>
                <div className="text-[10px] text-pink-100/90 font-medium">
                  {isAdmin ? 'Admin Pengelola' : (isTeacher ? 'Guru' : `Murid • Kelas ${currentUser.className || '8A'}`)}
                </div>
              </div>
            </button>

            {/* Dropdown Popover */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 text-slate-800 p-2 z-50 animate-fade-in">
                {/* Account Header */}
                <div className="p-3 bg-rose-50/70 rounded-xl mb-1 border border-rose-100">
                  <p className="text-xs font-extrabold text-slate-900 truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{currentUser.email}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-[#be185d]">
                    {isAdmin && <KeyRound className="w-3 h-3" />}
                    {isTeacher && <ShieldCheck className="w-3 h-3" />}
                    {!isAdmin && !isTeacher && <GraduationCap className="w-3 h-3" />}
                    <span>{isAdmin ? 'Admin Utama' : (isTeacher ? 'Guru Pembina' : `Murid (Kelas ${currentUser.className || '8A'})`)}</span>
                  </div>
                </div>

                {/* Settings / Edit Info Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenProfileSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-[#be185d] transition-all cursor-pointer text-left group"
                >
                  <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600 group-hover:text-[#be185d] group-hover:bg-pink-100">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span>Settings & Edit Informasi</span>
                    <span className="text-[10px] font-medium text-slate-400">Ubah nama, password, & profil</span>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100"></div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer text-left"
                >
                  <div className="p-1.5 bg-rose-100/80 text-rose-600 rounded-lg">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            )}

            {/* Quick Excel Export button */}
            <button
              onClick={onExportExcel}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-pink-400/20 hover:bg-pink-400/30 text-pink-100 rounded-xl text-xs font-semibold border border-pink-300/30 transition-all cursor-pointer"
              title="Ekspor seluruh laporan ke Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-pink-300" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around gap-1 pb-3 pt-1 border-t border-white/15">
          {isAdmin && (
            <button
              onClick={() => onTabChange('admin')}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
                activeTab === 'admin' ? 'text-white font-bold' : 'text-pink-100/70'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Admin</span>
            </button>
          )}

          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
              activeTab === 'dashboard' ? 'text-white font-bold' : 'text-pink-100/70'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {!isTeacher && !isAdmin && (
            <button
              onClick={() => onTabChange('form')}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
                activeTab === 'form' ? 'text-white font-bold' : 'text-pink-100/70'
              }`}
            >
              <FilePlus className="w-4 h-4" />
              <span>Kirim</span>
            </button>
          )}

          {(isTeacher || isAdmin) && (
            <button
              onClick={() => onTabChange('reports')}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
                activeTab === 'reports' ? 'text-white font-bold' : 'text-pink-100/70'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Laporan</span>
            </button>
          )}

          <button
            onClick={() => onTabChange('history')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
              activeTab === 'history' ? 'text-white font-bold' : 'text-pink-100/70'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat</span>
          </button>
        </div>
      </div>
    </header>
  );
};


