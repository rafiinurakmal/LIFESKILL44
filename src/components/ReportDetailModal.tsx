import React, { useState, useEffect } from 'react';
import { User, Report, KategoriCapaian } from '../types';
import { exportSingleReportPDF } from '../services/pdfExport';
import { exportReportsToExcel } from '../services/excelExport';
import { YpiLogo, YwLogo } from './Logos';
import {
  X,
  FileText,
  UserCheck,
  Calendar,
  CheckCircle2,
  Award,
  AlertTriangle,
  Clock,
  Printer,
  FileSpreadsheet,
  Image as ImageIcon,
  Save,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Edit3
} from 'lucide-react';

interface ReportDetailModalProps {
  report: Report | null;
  currentUser: User;
  onClose: () => void;
  onSaveGrade: (
    reportId: string,
    category: KategoriCapaian,
    feedback: string,
    updatedNotes?: string,
    updatedResult?: string
  ) => void;
  onShowToast: (title: string, msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function generateDetailsFromReflection(
  title: string,
  reflection: string,
  studentName: string,
  meeting: number
): {
  notes: string;
  result: string;
  feedback: string;
  category: KategoriCapaian;
} {
  const normRef = (reflection || '').toLowerCase().trim();

  // 1. "Saya sudah memahami kegiatan ini"
  if (
    normRef.includes('sudah memahami') ||
    normRef.includes('memahami kegiatan') ||
    normRef.includes('paham') ||
    normRef.includes('mandiri')
  ) {
    return {
      notes: `Ananda ${studentName} telah memahami alur, tujuan, dan tata cara pelaksanaan kegiatan "${title}" pada pertemuan ke-${meeting} secara mendalam. Seluruh tahapan dipraktikkan secara mandiri, terstruktur, dan teliti mulai dari persiapan peralatan, eksekusi keterampilan utama, hingga penyelesaian akhir tanpa kendala.`,
      result: `Hasil / produk kegiatan "${title}" berhasil diselesaikan dengan sangat baik, rapi, dan sesuai dengan indikator capaian Life Skill. Ananda menunjukkan penguasaan keterampilan yang matang, kerapihan hasil kerja, serta siap mengaplikasikan kemampuan ini dalam kehidupan sehari-hari.`,
      feedback: `Barakallah ${studentName}! Pencapaian yang sangat baik karena telah memahami dan menguasai kegiatan ${title} secara mandiri. Pertahankan motivasi belajar dan kerapian kerja ini!`,
      category: 'BSH'
    };
  }

  // 2. "Saya masih perlu berlatih lagi"
  if (normRef.includes('berlatih') || normRef.includes('perlu berlatih')) {
    return {
      notes: `Ananda ${studentName} mengikuti panduan kegiatan "${title}" pada pertemuan ke-${meeting} dengan cermat dan memahami konsep dasarnya. Keterampilan dipraktikkan sesuai instruksi dasar, namun masih memerlukan beberapa kali pengulangan latihan agar gerakan/tata cara menjadi lebih cekatan dan konsisten.`,
      result: `Hasil kegiatan "${title}" sudah terbentuk dan memenuhi indikator dasar utama. Kualitas produk menunjukkan progres positif, tetapi perlu penyempurnaan pada ketelitian dan efisiensi waktu melalui latihan rutin secara berkesinambungan.`,
      feedback: `Usaha yang sangat bagus ${studentName}! Dasar-dasar keterampilan ${title} sudah kamu kuasai. Tingkatkan latihan rutin di rumah agar kemampuanmu semakin lancar dan percaya diri.`,
      category: 'MB'
    };
  }

  // 3. "Saya membutuhkan bantuan guru"
  if (normRef.includes('bantuan guru') || normRef.includes('bimbingan') || normRef.includes('kendala')) {
    return {
      notes: `Ananda ${studentName} berpartisipasi aktif dalam kegiatan "${title}" pada pertemuan ke-${meeting} dengan pendampingan dan arahan langsung dari guru. Langkah pengerjaan dibimbing secara bertahap mulai dari pemahaman materi dasar hingga simulasi perbaikan kendala.`,
      result: `Hasil kegiatan "${title}" berhasil diselesaikan melalui bimbingan intensif guru. Ananda mulai memahami titik kendala yang dihadapi dan dapat mempraktikkan perbaikan dengan bantuan langsung.`,
      feedback: `Tetap semangat ${studentName}! Jangan ragu untuk terus bertanya dan berlatih bersama guru. Pendampingan akan terus diberikan hingga kamu dapat mempraktikkannya secara mandiri.`,
      category: 'BB'
    };
  }

  // 4. "Saya ingin mencoba lagi dengan cara berbeda"
  if (normRef.includes('cara berbeda') || normRef.includes('mencoba lagi') || normRef.includes('berkreasi')) {
    return {
      notes: `Ananda ${studentName} menunjukkan kreativitas dan antusiasme tinggi dengan menguji coba variasi langkah baru dalam kegiatan "${title}" pada pertemuan ke-${meeting}. Ananda mengeksplorasi metode alternatif dan mengevaluasi efisiensi pengerjaannya secara mandiri.`,
      result: `Hasil / produk kegiatan "${title}" tampil sangat inovatif dengan variasi kreasi pribadi ananda. Karya menunjukkan keunikan, pemahaman konsep yang fleksibel, dan wawasan praktik yang berkembang melebihi ekspektasi.`,
      feedback: `Luar biasa kreatif ${studentName}! Keberanian untuk berkreasi dan mencoba cara berbeda pada ${title} sangat patut diapresiasi. Teruskan inovasi dan semangat eksplorasinya!`,
      category: 'SAB'
    };
  }

  // Fallback
  return {
    notes: `Ananda ${studentName} melaksanakan kegiatan "${title}" pada pertemuan ke-${meeting} sesuai dengan refleksi diri yang diisikan ("${reflection}"). Langkah pengerjaan disesuaikan dengan tingkat pemahaman dan keterampilan ananda.`,
    result: `Hasil kegiatan "${title}" telah diperiksa dan disesuaikan berdasarkan pencapaian refleksi ananda. Menunjukkan perkembangan kemampuan Life Skill yang berprogres.`,
    feedback: `Apresiasi atas laporan kegiatan ${title}. Terus tingkatkan keterampilan dan pemahaman pada pertemuan berikutnya.`,
    category: 'BSH'
  };
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  currentUser,
  onClose,
  onSaveGrade,
  onShowToast
}) => {
  if (!report) return null;

  const isTeacher = currentUser.role === 'teacher';
  
  const [selectedCategory, setSelectedCategory] = useState<KategoriCapaian>(
    report.category || 'Belum Dinilai'
  );
  const [feedbackText, setFeedbackText] = useState<string>(report.feedback || '');
  const [editableNotes, setEditableNotes] = useState<string>(report.notes || '');
  const [editableResult, setEditableResult] = useState<string>(report.result || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoGenerated, setIsAutoGenerated] = useState(false);

  useEffect(() => {
    if (report) {
      setSelectedCategory(report.category || 'Belum Dinilai');
      setFeedbackText(report.feedback || '');
      setEditableNotes(report.notes || '');
      setEditableResult(report.result || '');
      setIsAutoGenerated(false);
    }
  }, [report]);

  const handleAutoGenerate = () => {
    const generated = generateDetailsFromReflection(
      report.title,
      report.reflection,
      report.studentName,
      report.meeting
    );

    setEditableNotes(generated.notes);
    setEditableResult(generated.result);
    setFeedbackText(generated.feedback);
    setSelectedCategory(generated.category);
    setIsAutoGenerated(true);

    onShowToast(
      'Generate Otomatis Berhasil',
      `Deskripsi catatan, hasil kegiatan, dan masukan telah disesuaikan dengan refleksi murid ("${report.reflection}")`,
      'success'
    );
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      onSaveGrade(
        report.id,
        selectedCategory,
        feedbackText.trim(),
        editableNotes.trim(),
        editableResult.trim()
      );
      setIsSaving(false);
      onShowToast(
        'Pemeriksaan & Laporan Tersimpan',
        `Catatan, hasil kegiatan, dan kategori (${selectedCategory}) telah berhasil diperbarui.`,
        'success'
      );
      onClose();
    }, 400);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'BB':
        return <span className="px-3 py-1 bg-rose-100 text-rose-800 font-bold rounded-full text-xs">BB — Belum Berkembang</span>;
      case 'MB':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-full text-xs">MB — Mulai Berkembang</span>;
      case 'BSH':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs">BSH — Berkembang Sesuai Harapan</span>;
      case 'SAB':
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 font-bold rounded-full text-xs">SAB — Sangat Amat Berkembang</span>;
      default:
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-xs">Belum Dinilai</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header with Dual Official Logos */}
        <div className="bg-gradient-to-r from-[#831843] via-[#be185d] to-[#881337] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/15 p-1.5 rounded-xl border border-white/20 backdrop-blur-sm shrink-0">
              <YpiLogo size={36} />
              <YwLogo size={36} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-pink-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                Pemeriksaan Laporan dan Hasil Kegiatan
              </span>
              <h3 className="text-lg font-bold mt-1 leading-tight">{report.title}</h3>
              <p className="text-xs text-pink-100/90 mt-0.5">
                {report.studentName} • Kelas {report.className} • NIS: {report.nis || '-'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium block uppercase text-[10px]">Hari / Tanggal</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{report.day}, {report.date}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block uppercase text-[10px]">Pertemuan</span>
              <span className="font-bold text-slate-800 mt-0.5 block">Ke-{report.meeting}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block uppercase text-[10px]">Capaian Saat Ini</span>
              <div className="mt-1">{getCategoryBadge(report.category)}</div>
            </div>
            <div>
              <span className="text-slate-400 font-medium block uppercase text-[10px]">Email Murid</span>
              <span className="font-medium text-slate-700 mt-0.5 block truncate">{report.email}</span>
            </div>
          </div>

          {/* Section: Refleksi Murid */}
          <div className="space-y-2 p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0d493f] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Refleksi Diri Murid
              </h4>
              {isTeacher && (
                <button
                  type="button"
                  onClick={handleAutoGenerate}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#831843] to-[#be185d] hover:from-[#701a3c] hover:to-[#9d174d] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Generate & Sesuaikan Catatan & Hasil Kegiatan Berdasarkan Refleksi Murid"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>Generate Otomatis Berdasarkan Refleksi</span>
                </button>
              )}
            </div>
            <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs font-bold text-emerald-950">
              "{report.reflection || 'Belum diisi'}"
            </div>
            {isTeacher && (
              <p className="text-[11px] text-slate-500 italic">
                Klik tombol di atas untuk menyesuaikan deskripsi Catatan & Langkah Kegiatan serta Hasil / Produk Kegiatan secara otomatis sesuai refleksi diri murid.
              </p>
            )}
          </div>

          {/* Teacher Editable Form or Read-Only View */}
          {isTeacher ? (
            <form onSubmit={handleGradeSubmit} className="space-y-5">
              
              {/* Section: Catatan & Langkah Kegiatan (Editable) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#831843] uppercase tracking-wider block">
                    1. Catatan & Langkah Kegiatan (Dapat Disesuaikan)
                  </label>
                  {isAutoGenerated && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" /> Disesuaikan dengan Refleksi
                    </span>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={editableNotes}
                  onChange={e => setEditableNotes(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-[#be185d] focus:bg-white transition-all font-medium"
                  placeholder="Isikan atau generate otomatis catatan & langkah kegiatan..."
                />
              </div>

              {/* Section: Hasil / Produk Kegiatan (Editable) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#831843] uppercase tracking-wider block">
                    2. Hasil / Produk Kegiatan (Dapat Disesuaikan)
                  </label>
                  {isAutoGenerated && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" /> Disesuaikan dengan Refleksi
                    </span>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={editableResult}
                  onChange={e => setEditableResult(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-[#be185d] focus:bg-white transition-all font-medium"
                  placeholder="Isikan atau generate otomatis deskripsi hasil / produk kegiatan..."
                />
              </div>

              {/* Teacher Evaluation & Grading Box */}
              <div className="p-5 bg-pink-50/70 rounded-2xl border border-pink-200 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#831843]">
                  <Award className="w-5 h-5 text-[#be185d]" />
                  <span>Form Penilaian & Feedback Guru Pembina</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tetapkan Kategori Capaian *
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value as KategoriCapaian)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-[#831843] focus:outline-none focus:border-[#be185d]"
                    >
                      <option value="Belum Dinilai">Belum Dinilai</option>
                      <option value="BB">BB — Belum Berkembang</option>
                      <option value="MB">MB — Mulai Berkembang</option>
                      <option value="BSH">BSH — Berkembang Sesuai Harapan</option>
                      <option value="SAB">SAB — Sangat Amat Berkembang</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Penilai
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={currentUser.name}
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan & Masukan Guru *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Berikan apresiasi, catatan perbaikan, atau saran pengembangan keterampilan..."
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-normal text-slate-800 focus:outline-none focus:border-[#005da8]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleAutoGenerate}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-[#003768] border border-sky-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#005da8]" />
                    <span>Reset Generate Refleksi</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-[#005da8] hover:bg-[#003768] text-white text-xs font-bold rounded-xl transition-colors shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Simpan Laporan...' : 'Simpan Pemeriksaan & Penilaian Laporan'}
                  </button>
                </div>
              </div>

            </form>
          ) : (
            <>
              {/* Section: Catatan Kegiatan (Read-Only) */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[#003768] uppercase tracking-wider">
                  1. Catatan & Langkah Kegiatan
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {report.notes || '-'}
                </div>
              </div>

              {/* Section: Hasil Kegiatan (Read-Only) */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[#003768] uppercase tracking-wider">
                  2. Hasil / Produk Kegiatan
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {report.result || '-'}
                </div>
              </div>

              {/* Feedback Guru (Read-Only) */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
                <div className="text-xs font-bold text-[#003768] flex items-center justify-between">
                  <span>Catatan & Masukan Guru</span>
                  <span className="text-[10px] text-slate-500 font-normal">{report.gradedBy || '-'}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  {report.feedback ? `"${report.feedback}"` : 'Belum ada catatan dari guru pembina.'}
                </p>
              </div>
            </>
          )}

          {/* Section: Foto Dokumentasi */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#003768] uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" />
              Dokumentasi Foto ({report.photos?.length || 0})
            </h4>

            {report.photos && report.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {report.photos.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-video rounded-xl overflow-hidden border border-slate-300 shadow-sm"
                  >
                    <img src={url} alt={`Dokumentasi ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                      Buka Gambar Full
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Tidak ada lampiran foto pada laporan ini.</p>
            )}
          </div>

          {/* Section: Timeline History Trail */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Kronologi Status Laporan
            </h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              {report.history?.map((hist, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#be185d] mt-1 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{hist.action}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{hist.date}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Oleh: {hist.actor}</div>
                    <p className="text-slate-600 text-xs mt-1">{hist.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSingleReportPDF(report)}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              Cetak PDF
            </button>
            <button
              onClick={() => exportReportsToExcel([report], `Laporan_${report.studentName.replace(/\s+/g, '_')}`)}
              className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              Excel
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

