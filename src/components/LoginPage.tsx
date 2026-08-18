import React, { useState } from 'react';
import { User } from '../types';
import { getUsers, setCurrentUser, setIsLoggedIn } from '../services/storage';
import { YpiLogo, YwLogo } from './Logos';
import { LogIn, AlertCircle, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onShowToast: (title: string, msg: string, type?: 'success' | 'error' | 'info') => void;
  bgImageUrl?: string; // Optional custom background image path/URL
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLoginSuccess, 
  onShowToast,
  bgImageUrl = '/images/login-bg.jpg' // Path default gambar background gedung/sekolah
}) => {
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [bgImageError, setBgImageError] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!email.trim() || !password.trim()) {
      setLoginError('Email (Username) dan Password wajib diisi.');
      return;
    }

    const allUsers = getUsers();
    const cleanEmail = email.trim().toLowerCase();
    
    // Find user by email
    const user = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      setLoginError('Email / Username tidak terdaftar dalam sistem.');
      onShowToast('Login Gagal', 'Email/Username tidak terdaftar. Minta Admin untuk membuatkan akun.', 'error');
      return;
    }

    const expectedPassword = user.password || '';
    if (password.trim() !== expectedPassword.trim()) {
      setLoginError('Password yang Anda masukkan salah.');
      onShowToast('Login Gagal', 'Password salah. Periksa kembali password Anda.', 'error');
      return;
    }

    if (user.status === 'pending') {
      setLoginError('Akun Anda masih menunggu persetujuan (approval) dari Admin.');
      onShowToast('Akun Belum Disetujui', 'Akun Anda sedang menunggu verifikasi oleh Admin Pengelola.', 'error');
      return;
    }

    if (user.status === 'rejected') {
      setLoginError('Akun Anda tidak disetujui oleh Admin.');
      onShowToast('Akun Ditolak', 'Maaf, akun ini dinonaktifkan oleh Admin.', 'error');
      return;
    }

    // Success login
    setCurrentUser(user);
    setIsLoggedIn(true);
    onLoginSuccess(user);
    
    const roleLabel = user.role === 'admin' 
      ? 'Admin Utama' 
      : (user.role === 'teacher' ? 'Guru' : `Murid Kelas ${user.className || '8A'}`);
    
    onShowToast('Login Berhasil', `Selamat datang kembali, ${user.name} (${roleLabel})`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-800 font-sans flex flex-col justify-between relative overflow-hidden selection:bg-[#be185d] selection:text-white">
      {/* Real Background Image Overlay (If available at /images/login-bg.jpg or custom URL) */}
      {!bgImageError && bgImageUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={bgImageUrl}
            alt="Background Sekolah SMPIA 44"
            onError={() => setBgImageError(true)}
            className="w-full h-full object-cover object-center filter brightness-[0.35] contrast-105 scale-105 transform transition-all duration-700"
          />
      )}


      {/* Header Banner */}
      <header className="pt-8 px-4 sm:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 shadow-xl mb-3">
          <YpiLogo className="w-10 h-10 object-contain drop-shadow" />
          <div className="w-px h-8 bg-white/20"></div>
          <YwLogo className="w-10 h-10 object-contain drop-shadow" />
          <div className="text-left pl-1">
            <h1 className="text-base font-black text-white leading-none tracking-tight">
              SMP ISLAM AL AZHAR 44
            </h1>
            <p className="text-[11px] font-semibold text-pink-200 mt-0.5">
              Grand Wisata • Bekasi
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-200 max-w-md mx-auto drop-shadow-sm">
          Sistem Pelaporan & Penilaian <span className="text-pink-300 font-bold">Life Skill</span>
        </p>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md mx-auto px-4 py-6 relative z-10 my-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center pb-2 border-b border-slate-100">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Masuk ke Akun Anda
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan email/username dan password terdaftar
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Email / Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contoh: eri@smpialazhar44.sch.id"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#be185d] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Masukkan password akun Anda"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#be185d] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#be185d] hover:bg-[#9d174d] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Ke Sistem</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Admin Management Notice */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#be185d]" />
                  <span>Pendaftaran akun dikelola langsung oleh Admin Sekolah</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-6 px-4 text-center text-xs text-slate-400 relative z-10">
        © {new Date().getFullYear()} SMP Islam Al Azhar 44 Grand Wisata
      </footer>
    </div>
  );
};

