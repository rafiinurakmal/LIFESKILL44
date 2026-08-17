import React, { useState } from 'react';
import { User, Report } from '../types';
import {
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Award,
  Calendar,
  BookOpen,
  Trash2
} from 'lucide-react';

interface ReportListProps {
  currentUser: User;
  reports: Report[];
  onViewReport: (report: Report) => void;
  onDeleteReport: (id: string) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export const ReportList: React.FC<ReportListProps> = ({
  currentUser,
  reports,
  onViewReport,
  onDeleteReport,
  onExportExcel,
  onExportPDF
}) => {
  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';
  const canSeeAllReports = isTeacher || isAdmin;
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

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
        return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">BB</span>;
      case 'MB':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">MB</span>;
      case 'BSH':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">BSH</span>;
      case 'SAB':
        return <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-xs">SAB</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">Belum Dinilai</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Category Reference Banner for Teachers */}
      {isTeacher && (
        <div className="p-4 bg-pink-50/80 border border-pink-200 rounded-2xl space-y-2">
          <h4 className="text-xs font-bold text-[#831843] uppercase tracking-wider">
            Panduan Kategori Capaian Life Skill (SMP Islam Al Azhar 44)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
              <b className="text-rose-700 block">BB — Belum Berkembang</b>
              <span className="text-slate-500 text-[11px] leading-tight block mt-0.5">
                Murid masih membutuhkan bimbingan penuh dari guru.
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
              <b className="text-blue-700 block">MB — Mulai Berkembang</b>
              <span className="text-slate-500 text-[11px] leading-tight block mt-0.5">
                Mulai menampilkan kemampuan namun belum konsisten.
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
              <b className="text-emerald-700 block">BSH — Berkembang Sesuai Harapan</b>
              <span className="text-slate-500 text-[11px] leading-tight block mt-0.5">
                Mencapai target keterampilan secara mandiri dan rapi.
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
              <b className="text-purple-700 block">SAB — Sangat Amat Berkembang</b>
              <span className="text-slate-500 text-[11px] leading-tight block mt-0.5">
                Melebihi ekspektasi dan mampu membimbing temannya.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Control Tools Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search & Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto flex-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari judul, murid, isi..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#176b5b]"
            />
          </div>

          {canSeeAllReports && (
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#176b5b]"
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
          )}

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#176b5b]"
          >
            <option value="">Semua Capaian</option>
            <option value="Belum Dinilai">Belum Dinilai</option>
            <option value="BB">BB — Belum Berkembang</option>
            <option value="MB">MB — Mulai Berkembang</option>
            <option value="BSH">BSH — Sesuai Harapan</option>
            <option value="SAB">SAB — Sangat Amat Berkembang</option>
          </select>

          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#176b5b]"
          />
        </div>

        {/* Exports Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
          <button
            onClick={onExportPDF}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Cetak PDF Rekap</span>
          </button>
          <button
            onClick={onExportExcel}
            className="px-3.5 py-2 bg-[#176b5b] hover:bg-[#0d493f] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>

      {/* Reports Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {canSeeAllReports && <th className="py-3.5 px-4">Murid</th>}
                <th className="py-3.5 px-4">Hari & Tanggal</th>
                <th className="py-3.5 px-4">Pertemuan</th>
                <th className="py-3.5 px-4">Judul Kegiatan</th>
                <th className="py-3.5 px-4">Kategori Capaian</th>
                <th className="py-3.5 px-4 text-right">Aksi Real-Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredReports.length > 0 ? (
                filteredReports.map(rep => (
                  <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                    {canSeeAllReports && (
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{rep.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          Kelas {rep.className} • NIS: {rep.nis || '-'}
                        </div>
                      </td>
                    )}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{rep.day}</div>
                      <div className="text-[11px] text-slate-400">{rep.date}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">Pertemuan {rep.meeting}</td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-800 truncate">{rep.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{rep.notes}</div>
                    </td>
                    <td className="py-3.5 px-4">{getCategoryBadge(rep.category)}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => onViewReport(rep)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#176b5b] font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isTeacher ? 'Periksa' : 'Detail'}</span>
                      </button>

                      {(!isTeacher || currentUser.role === 'teacher') && (
                        <button
                          onClick={() => setReportToDelete(rep)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors inline-flex items-center cursor-pointer"
                          title="Hapus Laporan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isTeacher ? 6 : 5} className="py-12 text-center text-slate-400 italic">
                    Tidak ada laporan kegiatan yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Laporan */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Laporan</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-900 leading-relaxed">
              Apakah Anda yakin ingin menghapus laporan <strong>"{reportToDelete.title}"</strong> milik {reportToDelete.studentName}?
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteReport(reportToDelete.id);
                  setReportToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Laporan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
