import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { getUsers, saveUsers, setCurrentUser } from '../services/storage';
import { YpiLogo, YwLogo } from './Logos';
import { UserCheck, ShieldCheck, UserPlus, LogIn, GraduationCap, X, Check, Clock, AlertCircle, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUserChanged: (newUser: User) => void;
  onShowToast: (title: string, msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
  onShowToast
}) => {
  const [users, setUsersList] = useState<User[]>(getUsers());
  const [activeTab, setActiveTab] = useState<'switch' | 'register'>('switch');
  
  // Registration form state
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regName, setRegName] = useState('');
  const [regClass, setRegClass] = useState('8A');
  const [regNis, setRegNis] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Login Password Prompt State
  const [selectedUserForLogin, setSelectedUserForLogin] = useState<User | null>(null);
  const [loginPassword, setLoginPassword] = useState('');

  if (!isOpen) return null;

  const handleSelectUser = (user: User) => {
    if (user.status === 'pending') {
      onShowToast(
        'Akun Menunggu Approval Admin',
        `Akun ${user.name} belum disetujui oleh Admin. Silakan minta Admin Pengelola untuk menyetujui akun ini terlebih dahulu.`,
        'error'
      );
      return;
    }

    if (user.status === 'rejected') {
      onShowToast(
        'Akun Ditolak',
        `Pendaftaran akun ${user.name} telah ditolak oleh Admin.`,
        'error'
      );
      return;
    }

    // Open password prompt for selected user
    setSelectedUserForLogin(user);
    setLoginPassword('');
  };

  const handleConfirmLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForLogin) return;

    const expectedPass = selectedUserForLogin.password || '123456';
    if (loginPassword.trim() !== expectedPass.trim()) {
      onShowToast('Password Salah', 'Password yang Anda masukkan tidak sesuai. Coba lagi.', 'error');
      return;
    }

    setCurrentUser(selectedUserForLogin);
    onUserChanged(selectedUserForLogin);
    const roleTitle = selectedUserForLogin.role === 'admin' 
      ? 'Admin Pengelola' 
      : (selectedUserForLogin.role === 'teacher' ? 'Guru Pembina' : 'Murid ' + (selectedUserForLogin.className || '8A'));
    onShowToast('Login Berhasil', `Selamat datang, ${selectedUserForLogin.name} (${roleTitle})`, 'success');
    setSelectedUserForLogin(null);
    setLoginPassword('');
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      onShowToast('Data Kurang Lengkap', 'Nama, Email, dan Password wajib diisi.', 'error');
      return;
    }

    const newUser: User = {
      id: 'u_' + regRole + '_' + Date.now(),
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      role: regRole,
      className: regRole === 'student' ? regClass : undefined,
      nisNip: regNis.trim() || (regRole === 'student' ? '2425' + Math.floor(1000 + Math.random() * 9000) : '1990' + Math.floor(10000 + Math.random() * 90000)),
      status: 'pending',
      createdAt: new Date().toISOString(),
      password: regPassword.trim()
    };

    const updated = [...users, newUser];
    saveUsers(updated);
    setUsersList(updated);
    
    onShowToast(
      'Pendaftaran Berhasil (Menunggu Approval)',
      `Akun ${newUser.name} telah terdaftar. Status akun saat ini "Menunggu Approval Admin". Minta Admin Pengelola untuk menyetujui akun Anda.`,
      'info'
    );
    
    // Reset form & view switch tab
    setRegName('');
    setRegEmail('');
    setRegNis('');
    setRegPassword('');
    setActiveTab('switch');
  };

  const adminUsers = users.filter(u => u.role === 'admin');
  const teacherUsers = users.filter(u => u.role === 'teacher');
  const studentUsers = users.filter(u => u.role === 'student');

  const renderStatusBadge = (user: User) => {
    if (user.status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
          <Clock className="w-3 h-3 text-amber-600" />
          Menunggu Approval Admin
        </span>
      );
    }
    if (user.status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          Ditolak
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
        <Check className="w-3 h-3 text-emerald-600" />
        Disetujui
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-emerald-100 animate-scale-up">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#003768] via-[#005da8] to-[#003363] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/15 rounded-xl backdrop-blur-sm border border-white/20 flex items-center gap-2 shrink-0">
              <YpiLogo size={36} />
              <YwLogo size={36} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Portal Akun Pengguna</h3>
              <p className="text-xs text-sky-100/90 mt-0.5">
                SMP Islam Al Azhar 44 — Database Admin, Guru, & Murid
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-6 bg-black/20 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('switch')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'switch'
                  ? 'bg-white text-[#003768] shadow-sm font-bold'
                  : 'text-sky-100 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Pilih Akun / Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-white text-[#003768] shadow-sm font-bold'
                  : 'text-sky-100 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Daftar Akun Baru
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {activeTab === 'switch' ? (
            selectedUserForLogin ? (
              /* Password Prompt for Selected User */
              <form onSubmit={handleConfirmLogin} className="space-y-4 animate-fade-in">
                <div className="p-4 bg-pink-50 border border-pink-200 rounded-xl">
                  <div className="text-xs font-bold text-pink-800 uppercase tracking-wider">
                    Verifikasi Password Login
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-1">
                    {selectedUserForLogin.name}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {selectedUserForLogin.email} • {selectedUserForLogin.role === 'admin' ? 'Admin' : (selectedUserForLogin.role === 'teacher' ? 'Guru' : 'Siswa Kelas ' + (selectedUserForLogin.className || '8A'))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Masukkan Password *
                  </label>
                  <input
                    type="password"
                    required
                    autoFocus
                    placeholder="Masukkan password Anda..."
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#be185d]"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-pink-600 shrink-0" />
                    <span>Password default akun bawaan: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-pink-700 font-bold">123456</code></span>
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedUserForLogin(null); setLoginPassword(''); }}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#be185d] hover:bg-[#831843] text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    Masuk Sekarang
                  </button>
                </div>
              </form>
            ) : (
            <div className="space-y-6">
              {/* Admin Section */}
              {adminUsers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5 text-xs font-bold uppercase tracking-wider text-purple-900">
                    <KeyRound className="w-4 h-4 text-purple-700" />
                    Akun Admin (Pengelola Sistem)
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {adminUsers.map(user => {
                      const isSelected = currentUser.id === user.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className={`p-3.5 rounded-xl border text-left transition-all relative flex items-center justify-between group ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-500/20'
                              : 'border-purple-200 hover:border-purple-300 bg-purple-50/30'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                              <span>{user.name}</span>
                              <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-extrabold rounded-full">
                                ADMIN
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {user.email} • NIP: {user.nisNip || '-'}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-purple-700 text-white flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Teacher Accounts Section */}
              <div>
                <div className="flex items-center gap-2 mb-2.5 text-xs font-bold uppercase tracking-wider text-[#831843]">
                  <ShieldCheck className="w-4 h-4 text-pink-600" />
                  Akun Guru Pembina ({teacherUsers.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {teacherUsers.map(user => {
                    const isSelected = currentUser.id === user.id;
                    const isPending = user.status === 'pending';
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`p-3.5 rounded-xl border text-left transition-all relative flex items-center justify-between group ${
                          isSelected
                            ? 'border-pink-600 bg-pink-50/80 ring-2 ring-pink-500/20'
                            : isPending
                            ? 'border-amber-300 bg-amber-50/40 opacity-80'
                            : 'border-slate-200 hover:border-pink-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="font-semibold text-sm text-slate-800 group-hover:text-[#be185d]">
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            NIP: {user.nisNip || '-'}
                          </div>
                          <div>{renderStatusBadge(user)}</div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Student Accounts Section */}
              <div>
                <div className="flex items-center gap-2 mb-2.5 text-xs font-bold uppercase tracking-wider text-[#831843]">
                  <UserCheck className="w-4 h-4 text-pink-600" />
                  Akun Murid ({studentUsers.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {studentUsers.map(user => {
                    const isSelected = currentUser.id === user.id;
                    const isPending = user.status === 'pending';
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`p-3.5 rounded-xl border text-left transition-all relative flex items-center justify-between group ${
                          isSelected
                            ? 'border-pink-600 bg-pink-50/80 ring-2 ring-pink-500/20'
                            : isPending
                            ? 'border-amber-300 bg-amber-50/40 opacity-85'
                            : 'border-slate-200 hover:border-pink-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="font-semibold text-sm text-slate-800 group-hover:text-[#be185d]">
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            Kelas {user.className || '8A'} • NIS: {user.nisNip || '-'}
                          </div>
                          <div>{renderStatusBadge(user)}</div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Persetujuan Admin:</strong> Akun yang didaftarkan akan berstatus <strong>Menunggu Persetujuan</strong> dan memerlukan konfirmasi Admin sebelum dapat digunakan.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Daftar Sebagai Peran *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegRole('student')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      regRole === 'student'
                        ? 'border-[#be185d] bg-pink-50 text-[#be185d]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Murid / Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('teacher')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      regRole === 'teacher'
                        ? 'border-[#be185d] bg-pink-50 text-[#be185d]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Guru Pembina
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder={regRole === 'student' ? 'Contoh: Muhammad Rayhan' : 'Contoh: Bapak Irfan, S.Pd.'}
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#be185d]"
                />
              </div>

              {regRole === 'student' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Kelas *
                    </label>
                    <select
                      value={regClass}
                      onChange={e => setRegClass(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#be185d]"
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

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      NIS (Nomor Induk Siswa)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 242508010"
                      value={regNis}
                      onChange={e => setRegNis(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#be185d]"
                    />
                  </div>
                </div>
              )}

              {regRole === 'teacher' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    NIP (Nomor Induk Pegawai)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 198504122010012015"
                    value={regNis}
                    onChange={e => setRegNis(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#be185d]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Sekolah *
                </label>
                <input
                  type="email"
                  required
                  placeholder="email@smpialazhar44.sch.id"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#be185d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Password Akun Baru *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Buat password akun Anda..."
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#be185d]"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#be185d] hover:bg-[#831843] text-white font-bold rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Daftarkan Akun (Menunggu Persetujuan Admin)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

