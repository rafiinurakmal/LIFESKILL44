import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { addUsersBatch } from '../services/storage';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  HelpCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface ImportUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUsers: User[], addedCount: number, updatedCount: number) => void;
  onShowToast: (title: string, msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface ParsedUserRow {
  name: string;
  email: string;
  role: UserRole;
  className?: string;
  nisNip?: string;
  password?: string;
  isValid: boolean;
  error?: string;
}

export const ImportUsersModal: React.FC<ImportUsersModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedUserRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Download CSV template
  const handleDownloadTemplate = () => {
    const csvContent =
      'Nama,Email,Peran,Kelas,NIS_NIP,Password\n' +
      'Ahmad Fadhil,ahmad.fadhil@smpialazhar44.sch.id,student,7A,2425001,123456\n' +
      'Siti Nurhaliza,siti.nurhaliza@smpialazhar44.sch.id,student,7B,2425002,123456\n' +
      'Ustadz Abdullah M.Pd,abdullah@smpialazhar44.sch.id,teacher,,1988010101,123456\n' +
      'Ustadzah Fatimah S.Pd,fatimah@smpialazhar44.sch.id,teacher,,1990020202,123456';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Template_Import_Akun_AlAzhar44.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowToast('Template Berhasil Diunduh', 'Buka file CSV dengan Excel / Notepad untuk mengisi data.', 'info');
  };

  // Simple robust CSV line parser handling quotes
  const parseCSVLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((char === ',' || char === ';') && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const processCSVText = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      onShowToast('File Kosong', 'File CSV minimal harus memiliki 1 baris header dan 1 baris data.', 'error');
      return;
    }

    const header = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    // Find column indexes
    let nameIdx = header.findIndex(h => h.includes('nama') || h.includes('name'));
    let emailIdx = header.findIndex(h => h.includes('email') || h.includes('surel'));
    let roleIdx = header.findIndex(h => h.includes('peran') || h.includes('role') || h.includes('posisi'));
    let classIdx = header.findIndex(h => h.includes('kelas') || h.includes('class') || h.includes('rombel'));
    let nisIdx = header.findIndex(h => h.includes('nis') || h.includes('nip') || h.includes('nomor') || h.includes('id'));
    let passIdx = header.findIndex(h => h.includes('password') || h.includes('pass') || h.includes('sandi'));

    // Fallback if header names don't match exactly
    if (nameIdx === -1) nameIdx = 0;
    if (emailIdx === -1) emailIdx = 1;
    if (roleIdx === -1) roleIdx = 2;
    if (classIdx === -1) classIdx = 3;
    if (nisIdx === -1) nisIdx = 4;
    if (passIdx === -1) passIdx = 5;

    const parsed: ParsedUserRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols = parseCSVLine(line);
      if (cols.length === 0 || cols.every(c => c === '')) continue;

      const rawName = cols[nameIdx] || '';
      const rawEmail = cols[emailIdx] || '';
      const rawRole = (cols[roleIdx] || '').toLowerCase();
      const rawClass = cols[classIdx] || '';
      const rawNis = cols[nisIdx] || '';
      const rawPass = cols[passIdx] || '123456';

      let role: UserRole = 'student';
      if (rawRole.includes('guru') || rawRole.includes('teacher') || rawRole.includes('ustadz')) {
        role = 'teacher';
      } else if (rawRole.includes('admin')) {
        role = 'admin';
      } else {
        role = 'student';
      }

      let isValid = true;
      let error = '';

      if (!rawName) {
        isValid = false;
        error = 'Nama kosong';
      } else if (!rawEmail || !rawEmail.includes('@')) {
        isValid = false;
        error = 'Email tidak valid';
      }

      parsed.push({
        name: rawName,
        email: rawEmail.toLowerCase(),
        role,
        className: role === 'student' ? (rawClass || '7A') : undefined,
        nisNip: rawNis || (role === 'student' ? '2425' + Math.floor(1000 + Math.random() * 9000) : '1985' + Math.floor(10000 + Math.random() * 90000)),
        password: rawPass || '123456',
        isValid,
        error
      });
    }

    setParsedRows(parsed);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          processCSVText(text);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile.name.endsWith('.csv') && !droppedFile.name.endsWith('.txt')) {
        onShowToast('Format File Salah', 'Mohon unggah file berekstensi .csv', 'error');
        return;
      }
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          processCSVText(text);
        }
      };
      reader.readAsText(droppedFile);
    }
  };

  const handleExecuteImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      onShowToast('Tidak Ada Data Valid', 'Periksa kembali data pada file CSV Anda.', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const newUsersToSave: User[] = validRows.map((row, idx) => ({
        id: `u_${row.role}_${Date.now()}_${idx}`,
        name: row.name,
        email: row.email,
        role: row.role,
        className: row.className,
        nisNip: row.nisNip,
        status: 'approved',
        password: row.password || '123456',
        createdAt: new Date().toISOString()
      }));

      const { updatedUsers, addedCount, updatedCount } = addUsersBatch(newUsersToSave);

      onSuccess(updatedUsers, addedCount, updatedCount);
      onShowToast(
        'Import Selesai',
        `Berhasil mengimpor ${addedCount} akun baru dan memperbarui ${updatedCount} akun yang sudah ada.`,
        'success'
      );
      handleReset();
      onClose();
    } catch (err) {
      console.error('Import error:', err);
      onShowToast('Gagal Import', 'Terjadi kesalahan saat menyimpan data akun.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedRows([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#005da8] to-[#003866] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Import Data Akun Pengguna Massal</h3>
              <p className="text-xs text-blue-100">
                Unggah file CSV untuk menambahkan banyak akun murid & guru sekaligus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Step 1: Download Template */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <HelpCircle className="w-4 h-4 text-[#005da8]" />
                Langkah 1: Gunakan Format Kolom Sesuai Template
              </div>
              <p className="text-[11px] text-slate-600">
                Format kolom: <code className="bg-blue-100/70 px-1 py-0.5 rounded text-[#005da8] font-mono">Nama, Email, Peran, Kelas, NIS_NIP, Password</code>
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              type="button"
              className="px-3 py-2 bg-white hover:bg-blue-100/50 text-[#005da8] border border-blue-300 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template CSV</span>
            </button>
          </div>

          {/* Step 2: Upload Area */}
          <div>
            <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-slate-600" />
              Langkah 2: Pilih atau Tarik File CSV ke Sini
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                dragActive
                  ? 'border-[#005da8] bg-blue-50/50 scale-[0.99]'
                  : file
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />

              {file ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-800 text-sm">{file.name}</div>
                  <p className="text-[11px] text-slate-500">
                    Ukuran: {(file.size / 1024).toFixed(1)} KB • Klik untuk mengganti file
                  </p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#005da8]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-800 text-xs">
                    Klik untuk memilih file CSV atau drag & drop ke sini
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Mendukung file berekstensi .csv (Comma / Semicolon Delimited)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Preview Parsed Data */}
          {parsedRows.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <span>Pratinjau Data ({parsedRows.length} baris terdeteksi)</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {validCount} Siap Import
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {invalidCount} Tidak Valid
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Nama</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Peran</th>
                      <th className="p-2.5">Kelas/NIS</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={row.isValid ? 'hover:bg-slate-50' : 'bg-red-50/60 text-red-900'}
                      >
                        <td className="p-2.5 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-800">{row.name || '-'}</td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-600">{row.email || '-'}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.role === 'teacher'
                                ? 'bg-amber-100 text-amber-800'
                                : row.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {row.role === 'teacher' ? 'Guru' : row.role === 'admin' ? 'Admin' : 'Murid'}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-500 text-[11px]">
                          {row.role === 'student' ? `Kelas ${row.className || '-'}` : (row.nisNip || '-')}
                        </td>
                        <td className="p-2.5 text-center">
                          {row.isValid ? (
                            <span className="inline-flex items-center text-emerald-600 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-red-600 font-semibold text-[11px]" title={row.error}>
                              <AlertCircle className="w-3.5 h-3.5 mr-1" /> {row.error}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {parsedRows.length > 0 ? (
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ganti File</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={validCount === 0 || isProcessing}
              onClick={handleExecuteImport}
              className="px-5 py-2 bg-[#005da8] hover:bg-[#004a87] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Import {validCount > 0 ? `${validCount} Akun` : ''}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
