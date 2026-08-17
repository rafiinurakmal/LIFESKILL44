import React, { useState } from 'react';
import { User, Report } from '../types';
import {
  History,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

interface ReportHistoryProps {
  currentUser: User;
  reports: Report[];
  onViewReport: (report: Report) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export const ReportHistory: React.FC<ReportHistoryProps> = ({
  currentUser,
  reports,
  onViewReport,
  onExportExcel,
  onExportPDF
}) => {
  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';
  const canSeeAllReports = isTeacher || isAdmin;
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  // Visible Reports filter
  const baseReports = canSeeAllReports
    ? reports
    : reports.filter(r => r.studentId === currentUser.id || r.email === currentUser.email);

  const filteredReports = baseReports.filter(rep => {
    const text = [
      rep.studentName,
      rep.className,
      rep.title,
      rep.notes,
      rep.result,
      rep.feedback
    ].join(' ').toLowerCase();

    const matchesSearch = !searchTerm || text.includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || rep.className === selectedClass;
    const matchesCategory = !selectedCategory || rep.category === selectedCategory;
    const matchesMonth = !selectedMonth || rep.date.startsWith(selectedMonth);

    return matchesSearch && matchesClass && matchesCategory && matchesMonth;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'BB':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs flex items-center gap-1 w-fit">
            <AlertTriangle className="w-3 h-3" /> BB — Belum Berkembang
          </span>
        );
      case 'MB':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" /> MB — Mulai Berkembang
          </span>
        );
      case 'BSH':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" /> BSH — Sesuai Harapan
          </span>
        );
      case 'SAB':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs flex items-center gap-1 w-fit">
            <Award className="w-3 h-3" /> SAB — Sangat Amat Berkembang
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" /> Belum Dinilai
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#be185d]">
            <History className="w-4 h-4" />
            <span>Pelacakan Laporan</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            Riwayat Status Laporan Life Skill
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isTeacher
              ? 'Pantau kronologi masuknya laporan dan riwayat penilaian murid secara langsung.'
              : 'Pantau jejak status laporan Anda dari pengiriman hingga evaluasi oleh guru.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onExportPDF}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            Cetak PDF
          </button>
          <button
            onClick={onExportExcel}
            className="px-3.5 py-2 bg-[#be185d] hover:bg-[#831843] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-pink-200" />
            Ekspor Excel
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama, judul, catatan..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#005da8]"
          />
        </div>

        {/* Class Filter (Teacher & Admin View) */}
        {canSeeAllReports ? (
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#005da8]"
          >
            <option value="">Semua Kelas</option>
            <option value="7A">Kelas 7A</option>
            <option value="7B">Kelas 7B</option>
            <option value="8A">Kelas 8A</option>
            <option value="8B">Kelas 8B</option>
            <option value="8C">Kelas 8C</option>
            <option value="9A">Kelas 9A</option>
            <option value="9B">Kelas 9B</option>
          </select>
        ) : (
          <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-2">
            <span>Kelas Saya:</span>
            <span className="font-bold text-slate-900">{currentUser.className || '8A'}</span>
          </div>
        )}

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#005da8]"
        >
          <option value="">Semua Kategori Capaian</option>
          <option value="Belum Dinilai">Belum Dinilai</option>
          <option value="BB">BB — Belum Berkembang</option>
          <option value="MB">MB — Mulai Berkembang</option>
          <option value="BSH">BSH — Berkembang Sesuai Harapan</option>
          <option value="SAB">SAB — Sangat Amat Berkembang</option>
        </select>

        {/* Month Filter */}
        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#005da8]"
        />
      </div>

      {/* Reports History Cards Timeline List */}
      <div className="space-y-4">
        {filteredReports.length > 0 ? (
          filteredReports.map(rep => {
            const latestHistory = rep.history?.[rep.history.length - 1];

            return (
              <div
                key={rep.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {isTeacher && (
                      <span className="font-bold text-slate-900 text-sm">{rep.studentName}</span>
                    )}
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg">
                      Kelas {rep.className}
                    </span>
                    <span className="text-xs text-slate-400">
                      • Hari {rep.day}, {rep.date} • Pertemuan Ke-{rep.meeting}
                    </span>
                  </div>

                  {getCategoryBadge(rep.category)}
                </div>

                {/* Main Report Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 space-y-1">
                    <h3 className="font-bold text-slate-900 text-base">{rep.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      <span className="font-semibold text-slate-800">Catatan:</span> {rep.notes}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed">
                      <span className="font-semibold text-slate-800">Hasil:</span> {rep.result}
                    </p>
                  </div>

                  {/* Teacher Feedback Preview */}
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/80 text-xs space-y-1">
                    <div className="font-bold text-[#176b5b] flex items-center justify-between">
                      <span>Evaluasi Guru</span>
                      {rep.gradedBy && (
                        <span className="text-[10px] text-slate-500 font-normal">{rep.gradedBy}</span>
                      )}
                    </div>
                    <p className="text-slate-600 line-clamp-2 italic">
                      {rep.feedback ? `"${rep.feedback}"` : 'Belum ada catatan evaluasi.'}
                    </p>
                  </div>
                </div>

                {/* Real-time Timeline History Log Trail */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Kronologi Aktivitas Status Laporan
                  </div>

                  <div className="space-y-2">
                    {rep.history?.map((hist, idx) => (
                      <div key={hist.id || idx} className="flex items-start gap-2.5 text-xs">
                        <div className="w-2 h-2 rounded-full bg-[#176b5b] mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{hist.action}</span>
                            <span className="text-[11px] text-slate-400">{hist.date}</span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5">{hist.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Row */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onViewReport(rep)}
                    className="px-4 py-2 bg-[#176b5b] hover:bg-[#0d493f] text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Lihat Detail Laporan</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Tidak ada riwayat laporan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Sesuaikan kata kunci pencarian atau filter untuk menemukan laporan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
