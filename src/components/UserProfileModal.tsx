import React, { useState } from 'react';
import { User } from '../types';
import { updateUserProfile } from '../services/storage';
import { X, User as UserIcon, Mail, Lock, GraduationCap, ShieldCheck, KeyRound, Eye, EyeOff, Save, LogOut, CheckCircle2 } from 'lucide-react';

interface UserProfileModalProps {
  currentUser: User;
  onClose: () => void;
  onUserUpdated: (updatedUser: User) => void;
  onLogout: () => void;
  onShowToast: (title: string, msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  currentUser,
  onClose,
  onUserUpdated,
  onLogout,
  onShowToast
}) => {
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [password, setPassword] = useState(currentUser.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [className, setClassName] = useState(currentUser.className || '');
  const [nisNip, setNisNip] = useState(currentUser.nisNip || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      onShowToast('Gagal Menyimpan', 'Nama Lengkap dan Email tidak boleh kosong.', 'error');
      return;
    }

    setIsSubmitting(true);

    const updatedUser: User = {
      ...currentUser,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim() || '123456',
      className: currentUser.role === 'student' ? className : currentUser.className,
      nisNip: nisNip.trim()
    };

    updateUserProfile(updatedUser);
    onUserUpdated(updatedUser);
    setIsSubmitting(false);

    onShowToast(
      'Profil Diperbarui',
      `Informasi akun ${updatedUser.name} telah berhasil disimpan!`,
      'success'
    );
    onClose();
  };

  const roleBadge = () => {
    if (currentUser.role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-100 text-[#be185d] rounded-full text-xs font-bold border border-pink-200">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Admin Utama</span>
        </span>
      );
    }
    if (currentUser.role === 'teacher') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Guru</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-200">
        <GraduationCap className="w-3.5 h-3.5" />
        <span>Murid Kelas {currentUser.className || '8A'}</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#be185d] flex items-center justify-center font-black text-lg text-white shadow-inner">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-extrabold leading-tight">{currentUser.name}</h2>
              <div className="mt-0.5">{roleBadge()}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Pengaturan Profil Akun
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Nama Lengkap *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#be185d] focus:bg-white transition-all"
            />
          </div>

          {/* Email / Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email / Username Terdaftar *</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#be185d] focus:bg-white transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Password Akun</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password baru"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#be185d] focus:bg-white transition-all"
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

          {/* Class Select (For Students) */}
          {currentUser.role === 'student' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>Kelas</span>
              </label>
              <select
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#be185d] transition-all"
              >
                <option value="7A">Kelas 7A</option>
                <option value="7B">Kelas 7B</option>
                <option value="8A">Kelas 8A</option>
                <option value="8B">Kelas 8B</option>
                <option value="8C">Kelas 8C</option>
                <option value="9A">Kelas 9A</option>
                <option value="9B">Kelas 9B</option>
              </select>
            </div>
          )}

          {/* NIS / NIP */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser.role === 'student' ? 'NIS (Nomor Induk Siswa)' : 'NIP / NUPTK'}</span>
            </label>
            <input
              type="text"
              value={nisNip}
              onChange={e => setNisNip(e.target.value)}
              placeholder="Contoh: 24250801"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#be185d] focus:bg-white transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-[#be185d] hover:bg-[#9d174d] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>

          {/* Integrated Logout Section */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Keluar (Logout) Akun Ini</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
