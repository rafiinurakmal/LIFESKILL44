import * as XLSX from 'xlsx';
import { Report } from '../types';

export function exportReportsToExcel(reports: Report[], filenamePrefix = 'Rekap_Laporan_LifeSkill'): void {
  const data = reports.map((rep, idx) => ({
    'No.': idx + 1,
    'Nama Murid': rep.studentName,
    'NIS': rep.nis || '-',
    'Kelas': rep.className,
    'Hari': rep.day,
    'Tanggal Kegiatan': rep.date,
    'Pertemuan Ke-': rep.meeting,
    'Judul Kegiatan': rep.title,
    'Catatan Kegiatan': rep.notes,
    'Hasil Kegiatan': rep.result,
    'Refleksi Murid': rep.reflection || '-',
    'Kategori Capaian': categoryLabel(rep.category),
    'Catatan Evaluasi Guru': rep.feedback || '-',
    'Penilai': rep.gradedBy || '-',
    'Waktu Penilaian': rep.gradedAt || '-',
    'Jumlah Foto': rep.photos?.length || 0,
    'Status Terbaru': rep.history[rep.history.length - 1]?.action || 'Laporan Dikirim'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 22 }, // Nama
    { wch: 12 }, // NIS
    { wch: 8 },  // Kelas
    { wch: 10 }, // Hari
    { wch: 14 }, // Tanggal
    { wch: 12 }, // Pertemuan
    { wch: 30 }, // Judul
    { wch: 40 }, // Catatan
    { wch: 35 }, // Hasil
    { wch: 30 }, // Refleksi
    { wch: 25 }, // Kategori
    { wch: 35 }, // Catatan Guru
    { wch: 20 }, // Penilai
    { wch: 18 }, // Waktu Penilaian
    { wch: 10 }, // Foto
    { wch: 22 }  // Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Life Skill');

  const todayStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filenamePrefix}_${todayStr}.xlsx`);
}

function categoryLabel(category: string): string {
  switch (category) {
    case 'BB': return 'BB — Belum Berkembang';
    case 'MB': return 'MB — Mulai Berkembang';
    case 'BSH': return 'BSH — Berkembang Sesuai Harapan';
    case 'SAB': return 'SAB — Sangat Amat Berkembang';
    default: return 'Belum Dinilai';
  }
}
