import React, { useState } from 'react';
import { User, Report, KategoriCapaian } from '../types';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from 'recharts';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingUp,
  Users,
  Filter,
  ArrowRight,
  Sparkles,
  Download,
  Search,
  Eye,
  CheckSquare
} from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  reports: Report[];
  users?: User[];
  onViewReport: (report: Report) => void;
  onNavigateToForm: () => void;
  onNavigateToReports: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  reports,
  users = [],
  onViewReport,
  onNavigateToForm,
  onNavigateToReports,
  onExportExcel,
  onExportPDF
}) => {
  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';
  const canSeeAll = isTeacher || isAdmin;

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Filter reports based on role & class filter
  const visibleReports = canSeeAll
    ? (selectedClass === 'all' ? reports : reports.filter(r => r.className === selectedClass))
    : reports.filter(r => r.studentId === currentUser.id || r.email === currentUser.email);

  // Compute Metrics
  const totalCount = visibleReports.length;
  const pendingCount = visibleReports.filter(r => r.category === 'Belum Dinilai').length;
  const bbCount = visibleReports.filter(r => r.category === 'BB').length;
  const mbCount = visibleReports.filter(r => r.category === 'MB').length;
  const bshCount = visibleReports.filter(r => r.category === 'BSH').length;
  const sabCount = visibleReports.filter(r => r.category === 'SAB').length;

  // Auto-Group Students Who Have Submitted Reports
  const studentSubmissionsMap = new Map<string, {
    studentName: string;
    className: string;
    nis?: string;
    studentId?: string;
    email?: string;
    reports: Report[];
    latestReport: Report;
  }>();

  visibleReports.forEach(rep => {
    const key = (rep.studentName || 'Anonim').toLowerCase().trim() + '_' + (rep.className || '');
    if (!studentSubmissionsMap.has(key)) {
      studentSubmissionsMap.set(key, {
        studentName: rep.studentName || 'Murid Al Azhar',
        className: rep.className || '8A',
        nis: rep.nis,
        studentId: rep.studentId,
        email: rep.email,
        reports: [rep],
        latestReport: rep
      });
    } else {
      const existing = studentSubmissionsMap.get(key)!;
      existing.reports.push(rep);
      // Pick latest report by date/created
      if (new Date(rep.createdAt || rep.date).getTime() > new Date(existing.latestReport.createdAt || existing.latestReport.date).getTime()) {
        existing.latestReport = rep;
      }
    }
  });

  const submittedStudentsList = Array.from(studentSubmissionsMap.values()).filter(st => {
    if (!studentSearch.trim()) return true;
    const term = studentSearch.toLowerCase();
    return (
      st.studentName.toLowerCase().includes(term) ||
      st.className.toLowerCase().includes(term) ||
      (st.nis && st.nis.toLowerCase().includes(term))
    );
  });

  // Pie Chart Data: Capaian Distribution
  const pieData = [
    { name: 'Belum Dinilai', value: pendingCount, color: '#f59e0b' },
    { name: 'BB (Belum Berkembang)', value: bbCount, color: '#f43f5e' },
    { name: 'MB (Mulai Berkembang)', value: mbCount, color: '#3b82f6' },
    { name: 'BSH (Berkembang Sesuai Harapan)', value: bshCount, color: '#10b981' },
    { name: 'SAB (Sangat Amat Berkembang)', value: sabCount, color: '#8b5cf6' }
  ].filter(item => item.value > 0);

  // Class Comparison Bar Chart Data
  const classesList = ['7A', '7B', '8A', '8B', '8C', '9A', '9B'];
  const classBarData = classesList.map(cls => {
    const classReps = reports.filter(r => r.className === cls);
    return {
      className: `Kelas ${cls}`,
      'Sudah Dinilai': classReps.filter(r => r.category !== 'Belum Dinilai').length,
      'Belum Dinilai': classReps.filter(r => r.category === 'Belum Dinilai').length,
      Total: classReps.length
    };
  });

  // Recent Pending Reports for Teachers
  const pendingReportsList = visibleReports.filter(r => r.category === 'Belum Dinilai').slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-[#831843] via-[#be185d] to-[#881337] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Sparkles className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-pink-200 text-xs font-semibold backdrop-blur-sm border border-white/20 mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>Dashboard Menu</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang, {currentUser.name}!
            </h2>
            <p className="text-pink-100/90 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
              {isTeacher
                ? 'Pantau aktivitas pelaporan kegiatan Life Skill seluruh murid SMP Islam Al Azhar 44 dan lakukan evaluasi capaian secara mendalam.'
                : 'Pantau kemajuan laporan kegiatan Life Skill, catat refleksi diri, dan lihat catatan apresiasi dari guru.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {isTeacher ? (
              <>
                <button
                  onClick={onExportPDF}
                  className="px-4 py-2.5 rounded-xl bg-white text-[#831843] hover:bg-pink-50 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#be185d]" />
                  Cetak PDF Rekap
                </button>
                <button
                  onClick={onExportExcel}
                  className="px-4 py-2.5 rounded-xl bg-pink-400/20 hover:bg-pink-400/30 text-white text-xs font-bold border border-pink-300/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-pink-200" />
                  Ekspor Excel
                </button>
              </>
            ) : (
              <button
                onClick={onNavigateToForm}
                className="px-5 py-3 rounded-xl bg-white text-[#831843] hover:bg-pink-50 text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#be185d]" />
                Buat Laporan Baru
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Class Filter Bar for Teacher & Admin */}
      {canSeeAll && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-[#be185d]" />
            <span>Filter Kelas Memantau:</span>
          </div>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedClass('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedClass === 'all'
                  ? 'bg-[#be185d] text-white shadow-sm font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Kelas ({reports.length})
            </button>
            {classesList.map(cls => {
              const count = reports.filter(r => r.className === cls).length;
              return (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedClass === cls
                      ? 'bg-[#be185d] text-white shadow-sm font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cls} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Reports */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Laporan</span>
            <FileText className="w-4 h-4 text-[#be185d]" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Tersimpan</p>
        </div>

        {/* Pending Review */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Belum Dinilai</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900">{pendingCount}</div>
          <p className="text-[10px] text-amber-700/80 mt-1">Menunggu evaluasi</p>
        </div>

        {/* Belum Berkembang (BB) */}
        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">BB</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900">{bbCount}</div>
          <p className="text-[10px] text-rose-700/80 mt-1">Belum Berkembang</p>
        </div>

        {/* Mulai Berkembang (MB) */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">MB</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900">{mbCount}</div>
          <p className="text-[10px] text-blue-700/80 mt-1">Mulai Berkembang</p>
        </div>

        {/* Berkembang Sesuai Harapan (BSH) */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">BSH</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900">{bshCount}</div>
          <p className="text-[10px] text-emerald-700/80 mt-1">Sesuai Harapan</p>
        </div>

        {/* Sangat Amat Berkembang (SAB) */}
        <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-purple-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">SAB</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-900">{sabCount}</div>
          <p className="text-[10px] text-purple-700/80 mt-1">Sangat Amat Berkembang</p>
        </div>
      </div>

      {/* Analytics Charts Section (Ditampilkan untuk Guru/Admin, disembunyikan untuk Murid) */}
      {currentUser.role !== 'student' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart: Distribution of Capaian */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#be185d]" />
                Distribusi Kategori Capaian Life Skill
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Persentase capaian kualitas laporan murid
              </p>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        color: '#fff',
                        borderRadius: '12px',
                        fontSize: '12px',
                        border: 'none'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span className="text-xs text-slate-700 font-medium">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400 italic">Belum ada data grafik.</div>
              )}
            </div>
          </div>

          {/* Bar Chart: Class Participation Comparison */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#be185d]" />
                Perbandingan Laporan Per Kelas
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Jumlah laporan terkumpul dan status penilaian per kelas
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="className" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend iconType="square" formatter={(v) => <span className="text-xs">{v}</span>} />
                  <Bar dataKey="Sudah Dinilai" fill="#be185d" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Belum Dinilai" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Teacher / Admin View: Daftar Murid Yang Sudah Mengisi Laporan */}
      {canSeeAll && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#be185d]" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Daftar Murid Yang Sudah Mengisi Laporan
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Otomatis terbarui dari database online saat murid mengirimkan laporan Life Skill
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Quick Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama murid atau NIS..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#be185d]"
                />
              </div>
              <span className="px-3 py-2 bg-pink-50 border border-pink-200 text-[#be185d] font-bold text-xs rounded-xl shrink-0">
                {submittedStudentsList.length} Murid
              </span>
            </div>
          </div>

          {/* Student Submissions List / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {submittedStudentsList.length > 0 ? (
              submittedStudentsList.map((st, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 hover:bg-white p-4 rounded-xl border border-slate-200/80 hover:border-pink-300 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#be185d] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                          {st.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#be185d] transition-colors leading-snug">
                            {st.studentName}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              Kelas {st.className}
                            </span>
                            {st.nis && <span>• NIS: {st.nis}</span>}
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 bg-pink-100/80 text-[#be185d] font-extrabold text-[11px] rounded-lg border border-pink-200 shrink-0">
                        {st.reports.length} Laporan
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 text-xs space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Laporan Terakhir:
                      </div>
                      <div className="font-semibold text-slate-800 line-clamp-1">
                        {st.latestReport.title}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Pertemuan Ke-{st.latestReport.meeting}</span>
                        <span className="font-medium text-slate-400">{st.latestReport.date}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onViewReport(st.latestReport)}
                    className="w-full py-2 bg-white hover:bg-[#be185d] text-slate-700 hover:text-white border border-slate-200 hover:border-[#be185d] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Laporan Murid</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">Belum ada murid yang mengisi laporan</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Laporan yang dikirim murid di kelas ini akan muncul di sini secara real-time.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Teacher Action Queue or Student Achievement Badge Panel */}
      {canSeeAll ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-pink-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#be185d]" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Antrean Periksa Laporan Guru</h3>
                <p className="text-xs text-slate-500">Laporan murid yang memerlukan penilaian dan masukan</p>
              </div>
            </div>
            <button
              onClick={onNavigateToReports}
              className="text-xs font-bold text-[#be185d] hover:underline flex items-center gap-1"
            >
              Lihat Semua ({reports.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingReportsList.length > 0 ? (
              pendingReportsList.map(rep => (
                <div key={rep.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{rep.studentName}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-full">
                        Kelas {rep.className}
                      </span>
                      <span className="text-xs text-slate-400">• Pertemuan Ke-{rep.meeting}</span>
                    </div>
                    <div className="text-xs font-semibold text-[#be185d] mt-0.5">{rep.title}</div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{rep.notes}</p>
                  </div>

                  <button
                    onClick={() => onViewReport(rep)}
                    className="px-3.5 py-1.5 bg-[#be185d] hover:bg-[#831843] text-white text-xs font-semibold rounded-lg shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Periksa
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Semua laporan telah selesai dinilai oleh guru!
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Student Progress Summary & Badges */
        <div className="bg-gradient-to-br from-pink-900 to-[#831843] text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-400/20 text-pink-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Lencana Prestasi Laporan Murid
            </div>
            <h3 className="text-xl font-bold">Pencapaian Life Skill Anda</h3>
            <p className="text-xs text-pink-100/80 leading-relaxed">
              Anda telah mengirim <span className="font-bold text-white">{totalCount} laporan</span> kegiatan. Terus pertahankan kedisiplinan dan kualitas praktek Anda!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center p-3 bg-white/10 rounded-xl border border-white/15 min-w-[100px]">
              <div className="text-xs text-pink-200">Mandiri</div>
              <div className="text-lg font-black mt-0.5 text-white">{bshCount + sabCount} BSH/SAB</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-xl border border-white/15 min-w-[100px]">
              <div className="text-xs text-pink-200">Kehadiran</div>
              <div className="text-lg font-black mt-0.5 text-white">100%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
