import React, { useState, useEffect } from 'react';
import { User, Report, KategoriCapaian } from './types';
import {
  getCurrentUser,
  getReports,
  saveReports,
  addReport,
  updateReport,
  deleteReport,
  getUsers,
  getIsLoggedIn,
  setIsLoggedIn,
  logoutUser
} from './services/storage';

import { subscribeToReports, subscribeToUsers } from './lib/firebase';
import { exportReportsToExcel } from './services/excelExport';
import { exportBatchReportsPDF } from './services/pdfExport';

import { Navbar } from './components/Navbar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { UserProfileModal } from './components/UserProfileModal';
import { Dashboard } from './components/Dashboard';
import { ReportForm } from './components/ReportForm';
import { ReportList } from './components/ReportList';
import { ReportHistory } from './components/ReportHistory';
import { ReportDetailModal } from './components/ReportDetailModal';
import { AdminPanel } from './components/AdminPanel';
import { LoginPage } from './components/LoginPage';

export default function App() {
  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(getIsLoggedIn());
  const [currentUser, setCurrentUser] = useState<User>(getCurrentUser());
  const [reports, setReports] = useState<Report[]>(getReports());
  const [users, setUsers] = useState<User[]>(getUsers());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'form' | 'reports' | 'history' | 'admin'>(
    currentUser.role === 'admin' ? 'admin' : 'dashboard'
  );

  // Real-time Firestore sync
  useEffect(() => {
    const unsubscribeReports = subscribeToReports((realtimeReports) => {
      if (realtimeReports) {
        setReports(realtimeReports);
        saveReports(realtimeReports);
      }
    });

    const unsubscribeUsers = subscribeToUsers((realtimeUsers) => {
      if (realtimeUsers) {
        setUsers(realtimeUsers);
        localStorage.setItem('alazhar_lifeskill_users_v3', JSON.stringify(realtimeUsers));
      }
    });

    return () => {
      unsubscribeReports();
      unsubscribeUsers();
    };
  }, []);

  // Modal & Notification States
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Handler
  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: ToastMessage = {
      id: 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title,
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Real-time Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedInState(true);
    setActiveTab(user.role === 'admin' ? 'admin' : 'dashboard');
  };

  const handleLogout = () => {
    logoutUser();
    setIsLoggedInState(false);
    showToast('Logout Berhasil', 'Anda telah keluar dari sistem.', 'info');
  };

  const handleUserChanged = (newUser: User) => {
    setCurrentUser(newUser);
    if (newUser.role === 'admin') {
      setActiveTab('admin');
    } else if (newUser.role === 'teacher' && activeTab === 'form') {
      setActiveTab('dashboard');
    }
  };

  const handleAddReport = (newReport: Report) => {
    const updated = addReport(newReport);
    setReports(updated);
  };

  const handleGradeReport = (
    reportId: string,
    category: KategoriCapaian,
    feedback: string,
    updatedNotes?: string,
    updatedResult?: string
  ) => {
    const target = reports.find(r => r.id === reportId);
    if (!target) return;

    const nowStr = new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const updated: Report = {
      ...target,
      category,
      feedback,
      notes: updatedNotes !== undefined && updatedNotes.trim() !== '' ? updatedNotes : target.notes,
      result: updatedResult !== undefined && updatedResult.trim() !== '' ? updatedResult : target.result,
      gradedBy: currentUser.name,
      gradedAt: nowStr,
      updatedAt: new Date().toISOString(),
      history: [
        ...target.history,
        {
          id: 'h_' + Date.now(),
          action: 'Pemeriksaan & Penilaian Guru',
          actor: currentUser.name,
          date: nowStr,
          note: `Laporan diperiksa & disesuaikan berdasarkan refleksi. Kategori: ${category}.`,
          type: 'grade'
        }
      ]
    };

    const newReportsList = updateReport(updated);
    setReports(newReportsList);
    setSelectedReport(updated);
  };

  const handleDeleteReport = (id: string) => {
    const updated = deleteReport(id);
    setReports(updated);
    showToast('Laporan Dihapus', 'Laporan berhasil dihapus dari database.', 'info');
  };

  const handleExportExcelAll = () => {
    const canSeeAll = currentUser.role === 'teacher' || currentUser.role === 'admin';
    const filtered = canSeeAll
      ? reports
      : reports.filter(r => r.studentId === currentUser.id || r.email === currentUser.email);
    
    exportReportsToExcel(filtered, `Rekap_LifeSkill_${canSeeAll ? 'Semua' : currentUser.name.replace(/\s+/g, '_')}`);
    showToast('Ekspor Excel Berhasil', `${filtered.length} data laporan berhasil diunduh ke file .xlsx`, 'success');
  };

  const handleExportPDFAll = () => {
    const canSeeAll = currentUser.role === 'teacher' || currentUser.role === 'admin';
    const filtered = canSeeAll
      ? reports
      : reports.filter(r => r.studentId === currentUser.id || r.email === currentUser.email);

    exportBatchReportsPDF(filtered, canSeeAll ? 'Semua Murid Al Azhar 44' : `Murid ${currentUser.name}`);
    showToast('Cetak PDF Diproses', 'Jendela cetak PDF rekap laporan telah dibuka.', 'info');
  };

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onShowToast={showToast}
        />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
      {/* Top Navbar Header */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenProfileSettings={() => setIsProfileSettingsOpen(true)}
        onExportExcel={handleExportExcelAll}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'admin' && (
          <AdminPanel
            currentUser={currentUser}
            users={users}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            reports={reports}
            users={users}
            onViewReport={rep => setSelectedReport(rep)}
            onNavigateToForm={() => setActiveTab('form')}
            onNavigateToReports={() => setActiveTab('reports')}
            onExportExcel={handleExportExcelAll}
            onExportPDF={handleExportPDFAll}
          />
        )}

        {activeTab === 'form' && (
          <ReportForm
            currentUser={currentUser}
            onSubmitReport={handleAddReport}
            onShowToast={showToast}
            onNavigateToHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'reports' && (
          <ReportList
            currentUser={currentUser}
            reports={reports}
            onViewReport={rep => setSelectedReport(rep)}
            onDeleteReport={handleDeleteReport}
            onExportExcel={handleExportExcelAll}
            onExportPDF={handleExportPDFAll}
          />
        )}

        {activeTab === 'history' && (
          <ReportHistory
            currentUser={currentUser}
            reports={reports}
            onViewReport={rep => setSelectedReport(rep)}
            onExportExcel={handleExportExcelAll}
            onExportPDF={handleExportPDFAll}
          />
        )}
      </main>

      {/* App Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-700">SMP Islam Al Azhar 44</span> — Sistem Pelaporan Life Skill
          </div>
          <div className="text-slate-400">
            SMP ISLAM AL AZHAR 44 Grand Wisata, Bekasi • 
          </div>
        </div>
      </footer>

      {/* Modals & Toasts */}
      {isProfileSettingsOpen && (
        <UserProfileModal
          currentUser={currentUser}
          onClose={() => setIsProfileSettingsOpen(false)}
          onUserUpdated={handleUserChanged}
          onLogout={handleLogout}
          onShowToast={showToast}
        />
      )}

      <ReportDetailModal
        report={selectedReport}
        currentUser={currentUser}
        onClose={() => setSelectedReport(null)}
        onSaveGrade={handleGradeReport}
        onShowToast={showToast}
      />

      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
