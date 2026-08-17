import React, { useState, useEffect } from 'react';
import { User, Report } from '../types';
import { SubmitButton } from '../components/SubmitButton';
import { REFLECTION_OPTIONS } from '../data/initialData';
import {
  Calendar,
  Clock,
  BookOpen,
  FileText,
  CheckCircle2,
  ImagePlus,
  Trash2,
  Smile,
  RefreshCw,
  HelpCircle,
  Sparkles,
  Info,
  X
} from 'lucide-react';

interface ReportFormProps {
  currentUser: User;
  onSubmitReport: (newReport: Report) => void;
  onShowToast: (title: string, msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToHistory: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  currentUser,
  onSubmitReport,
  onShowToast,
  onNavigateToHistory
}) => {
  const getTodayISO = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  };

  const getDayName = (dateStr: string) => {
    if (!dateStr) return 'Sabtu';
    try {
      return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(
        new Date(dateStr + 'T00:00:00')
      );
    } catch {
      return 'Sabtu';
    }
  };

  const [date, setDate] = useState(getTodayISO());
  const [day, setDay] = useState(getDayName(getTodayISO()));
  const [meeting, setMeeting] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState('');
  const [reflection, setReflection] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  
  // Real-time button states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdReport, setCreatedReport] = useState<Report | null>(null);

  useEffect(() => {
    setDay(getDayName(date));
  }, [date]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files) as File[];

    if (photos.length + files.length > 3) {
      onShowToast('Batas Foto Terlampaui', 'Maksimal 3 foto dokumentasi per laporan.', 'error');
    }

    const availableSlots = 3 - photos.length;
    const filesToProcess = files.slice(0, availableSlots);

    const newPhotoDataUrls: string[] = [];
    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const url = await processAndCompressImage(file);
        newPhotoDataUrls.push(url);
      } catch (err) {
        console.error('Failed to read image', err);
      }
    }

    setPhotos(prev => [...prev, ...newPhotoDataUrls]);
  };

  const processAndCompressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const MAX_BYTES = 300 * 1024; // 300 KB limit
      const originalSizeKb = Math.round(file.size / 1024);

      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const initialDataUrl = e.target?.result as string;
        const initialBinarySize = Math.round((initialDataUrl.length * 3) / 4);

        if (file.size <= MAX_BYTES && initialBinarySize <= MAX_BYTES) {
          resolve(initialDataUrl);
          return;
        }

        // Image exceeds 300 KB -> Compress automatically via Canvas
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(initialDataUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.85;
          let resultDataUrl = canvas.toDataURL('image/jpeg', quality);
          let resultSize = Math.round((resultDataUrl.length * 3) / 4);

          while (resultSize > MAX_BYTES && quality > 0.15) {
            quality -= 0.10;
            resultDataUrl = canvas.toDataURL('image/jpeg', quality);
            resultSize = Math.round((resultDataUrl.length * 3) / 4);
          }

          if (resultSize > MAX_BYTES) {
            maxDim = 800;
            let w2 = img.width > maxDim ? maxDim : img.width;
            let h2 = Math.round((img.height * w2) / img.width);
            canvas.width = w2;
            canvas.height = h2;
            ctx.drawImage(img, 0, 0, w2, h2);

            quality = 0.70;
            resultDataUrl = canvas.toDataURL('image/jpeg', quality);
            resultSize = Math.round((resultDataUrl.length * 3) / 4);

            while (resultSize > MAX_BYTES && quality > 0.15) {
              quality -= 0.10;
              resultDataUrl = canvas.toDataURL('image/jpeg', quality);
              resultSize = Math.round((resultDataUrl.length * 3) / 4);
            }
          }

          const finalSizeKb = Math.round(resultSize / 1024);
          onShowToast(
            'Foto Otomatis Dikompres (< 300 KB)',
            `Ukuran foto "${file.name}" (${originalSizeKb} KB) melebih 300 KB, telah otomatis dikompres menjadi ${finalSizeKb} KB.`,
            'info'
          );

          resolve(resultDataUrl);
        };

        img.src = initialDataUrl;
      };

      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleResetForm = () => {
    const today = getTodayISO();
    setDate(today);
    setDay(getDayName(today));
    setMeeting(1);
    setTitle('');
    setNotes('');
    setResult('');
    setReflection('');
    setPhotos([]);
    setIsSuccess(false);
    setIsSubmitting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Form Validation
    if (currentUser.role === 'student') {
      if (!title.trim()) {
        onShowToast('Form Belum Lengkap', 'Mohon isi Judul Kegiatan Life Skill Anda.', 'error');
        return;
      }
      if (!reflection) {
        onShowToast('Form Belum Lengkap', 'Mohon pilih salah satu Refleksi Diri.', 'error');
        return;
      }
    } else {
      if (!title.trim() || !notes.trim() || !result.trim()) {
        onShowToast('Form Belum Lengkap', 'Mohon lengkapi Judul, Catatan, dan Hasil kegiatan.', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    setIsSuccess(false);

    // Simulate real-time async processing & persistence
    setTimeout(() => {
      const nowStr = new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const newRep: Report = {
        id: 'rep_' + Date.now(),
        studentId: currentUser.id,
        studentName: currentUser.name,
        className: currentUser.className || '8A',
        nis: currentUser.nisNip || '242508001',
        email: currentUser.email,
        day,
        date,
        meeting,
        title: title.trim(),
        notes: notes.trim() || 'Laporan kegiatan dikirim oleh murid.',
        result: result.trim() || 'Dokumentasi foto kegiatan terlampir.',
        reflection: reflection || 'Saya sudah memahami kegiatan ini.',
        category: 'Belum Dinilai',
        feedback: '',
        photos,
        history: [
          {
            id: 'h_' + Date.now(),
            action: 'Laporan Dikirim Real-Time',
            actor: currentUser.name,
            date: nowStr,
            note: 'Laporan diproses dan dikirim secara real-time ke database.',
            type: 'submit'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onSubmitReport(newRep);
      setCreatedReport(newRep);
      setIsSubmitting(false);
      setIsSuccess(true);
      setShowSuccessModal(true);

      onShowToast(
        'Laporan Terkirim Real-Time',
        `Laporan "${newRep.title}" telah diproses dan tersimpan ke riwayat.`,
        'success'
      );
    }, 700);
  };

  const getReflectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smile': return <Smile className="w-5 h-5 text-emerald-600" />;
      case 'RefreshCw': return <RefreshCw className="w-5 h-5 text-amber-600" />;
      case 'HelpCircle': return <HelpCircle className="w-5 h-5 text-sky-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-600" />;
      default: return <Smile className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-[#831843] via-[#be185d] to-[#881337] p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/15">
              <BookOpen className="w-6 h-6 text-pink-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight uppercase">PORTFOLIO LIFE SKILL</h2>
              <p className="text-xs text-pink-100/90 mt-0.5">
                Pengisian data laporan kegiatan mingguan siswa SMP Islam Al Azhar 44
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetForm}
            className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-pink-100 text-xs font-semibold border border-white/15 transition-all self-end sm:self-center"
          >
            Bersihkan Form
          </button>
        </div>

        {/* Card Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Identity & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-pink-50/60 rounded-xl border border-pink-100">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#be185d]" />
                Tanggal Kegiatan *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:border-[#be185d] focus:ring-2 focus:ring-pink-500/10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#be185d]" />
                Hari
              </label>
              <input
                type="text"
                readOnly
                value={day}
                className="w-full px-3.5 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#be185d]" />
                Pertemuan Ke- *
              </label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={meeting}
                onChange={e => setMeeting(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:border-[#be185d]"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Judul Kegiatan Life Skill *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Membuat Tempat Pensil dari Botol Bekas"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 placeholder:font-normal focus:outline-none focus:border-[#be185d] focus:ring-2 focus:ring-pink-500/10"
            />
          </div>

          {/* Notes & Result fields (Hanya untuk Non-Murid) */}
          {currentUser.role !== 'student' && (
            <>
              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Catatan & Langkah Kegiatan *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Jelaskan proses pelaksanaan, bahan/alat yang digunakan, serta langkah kerja kegiatan..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#be185d] focus:ring-2 focus:ring-pink-500/10"
                />
              </div>

              {/* Result */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Hasil / Produk Kegiatan *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan hasil akhir kegiatan (produk fisik, keterampilan baru, atau manfaat yang diperoleh)..."
                  value={result}
                  onChange={e => setResult(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#be185d] focus:ring-2 focus:ring-pink-500/10"
                />
              </div>
            </>
          )}

          {/* Reflection Radio Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              Refleksi Diri Murid *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REFLECTION_OPTIONS.map(opt => {
                const isSelected = reflection === opt.label;
                return (
                  <label
                    key={opt.id}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isSelected
                        ? 'border-[#be185d] bg-pink-50/80 shadow-sm ring-1 ring-pink-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reflection"
                      value={opt.label}
                      checked={isSelected}
                      onChange={e => setReflection(e.target.value)}
                      className="mt-1 text-[#be185d] focus:ring-[#be185d]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        {getReflectionIcon(opt.iconName)}
                        <span>{opt.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Photo Documentation Upload Section */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Dokumentasi Foto Kegiatan (Maksimal 3 Foto)
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unggah foto proses atau hasil karya kegiatan.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg">
                {photos.length} / 3 Foto
              </span>
            </div>

            {/* Photo Previews Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 pt-2">
                {photos.map((url, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-slate-300 group shadow-sm">
                    <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute top-1.5 right-1.5 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"
                      title="Hapus foto ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Trigger Input */}
            {photos.length < 3 && (
              <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 hover:border-[#be185d] rounded-xl bg-white hover:bg-pink-50/50 cursor-pointer transition-all group">
                <ImagePlus className="w-8 h-8 text-slate-400 group-hover:text-[#be185d] transition-colors" />
                <span className="text-xs font-semibold text-slate-700 mt-2 group-hover:text-[#be185d]">
                  Klik untuk unggah foto kegiatan
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Format JPG, PNG, WEBP (File &gt; 300 KB otomatis dikompres ke maks 300 KB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Action Row & Submitting Button */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#be185d] shrink-0" />
              <span>
                Laporan yang dikirim akan langsung masuk ke dashboard guru untuk dinilai.
              </span>
            </div>

            {/* Submit Button Component */}
            <SubmitButton
              isSubmitting={isSubmitting}
              isSuccess={isSuccess}
              label="Kirim Laporan"
              submittingLabel="Memproses Data..."
              successLabel="Berhasil Terkirim!"
            />
          </div>
        </form>
      </div>

      {/* Success Modal Confirmation */}
      {showSuccessModal && createdReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-center border border-emerald-100 animate-scale-up space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Laporan Berhasil Diproses!</h3>
              <p className="text-xs text-slate-600 mt-1">
                Data laporan kegiatan Life Skill Anda telah tersimpan ke dalam data.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl text-left border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-800 text-sm">{createdReport.title}</div>
              <div className="text-slate-600">
                <span className="font-semibold">Hari / Tgl:</span> {createdReport.day}, {createdReport.date}
              </div>
              <div className="text-slate-600">
                <span className="font-semibold">Pertemuan:</span> Ke-{createdReport.meeting}
              </div>
              <div className="text-slate-600">
                <span className="font-semibold">Refleksi:</span> {createdReport.reflection}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  handleResetForm();
                }}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Kirim Laporan Lain
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onNavigateToHistory();
                }}
                className="flex-1 py-2.5 px-4 bg-[#be185d] hover:bg-[#831843] text-white text-xs font-semibold rounded-xl transition-colors shadow-md cursor-pointer"
              >
                Lihat Riwayat Real-Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
