import { Report } from '../types';

export function exportSingleReportPDF(report: Report): void {
  const photoSection = (report.photos && report.photos.length > 0)
    ? `
      <div class="section-title">Dokumentasi Foto Kegiatan</div>
      <div class="photo-grid">
        ${report.photos.map((url, i) => `
          <div class="photo-card">
            <img src="${url}" alt="Dokumentasi ${i + 1}">
            <div class="photo-caption">Foto ${i + 1} — Dokumentasi Siswa</div>
          </div>
        `).join('')}
      </div>
    `
    : `
      <div class="section-title">Dokumentasi Foto Kegiatan</div>
      <p style="color: #666; font-style: italic; margin-top: 5px;">Belum ada lampiran foto untuk laporan ini.</p>
    `;

  const historyRows = (report.history || []).map(h => `
    <tr>
      <td style="width: 25%;"><b>${escapeHTML(h.action)}</b></td>
      <td style="width: 25%; color: #555;">${escapeHTML(h.actor)}<br><small>${escapeHTML(h.date)}</small></td>
      <td style="width: 50%;">${escapeHTML(h.note)}</td>
    </tr>
  `).join('');

  const printableHTML = `
    <!doctype html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>Laporan_LifeSkill_${escapeHTML(report.studentName)}_${report.date}</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: 'Times New Roman', Times, serif; color: #111; font-size: 12pt; line-height: 1.5; margin: 0; padding: 0; }
        
        .header-kop {
          text-align: center;
          border-bottom: 3px double #005da8;
          padding-bottom: 12px;
          margin-bottom: 20px;
        }
        .header-kop h1 { margin: 0; font-size: 16pt; text-transform: uppercase; color: #005da8; letter-spacing: 1px; }
        .header-kop h2 { margin: 3px 0 0 0; font-size: 13pt; font-weight: bold; color: #222; }
        .header-kop p { margin: 3px 0 0 0; font-size: 10pt; color: #555; font-style: italic; }

        .report-title {
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 15px;
          color: #003768;
        }

        .identity-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .identity-table td {
          padding: 8px 10px;
          border: 1px solid #b0bec5;
          font-size: 11pt;
        }
        .identity-table td.label {
          width: 25%;
          background-color: #f4f8f7;
          font-weight: bold;
          color: #005da8;
        }

        .section-title {
          font-size: 12pt;
          font-weight: bold;
          color: #005da8;
          border-bottom: 1.5px solid #005da8;
          padding-bottom: 4px;
          margin-top: 18px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .content-box {
          background-color: #fafdfc;
          border: 1px solid #d1e3df;
          padding: 10px 14px;
          border-radius: 4px;
          white-space: pre-wrap;
          font-size: 11pt;
          margin-bottom: 15px;
        }

        .badge-kategori {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 10.5pt;
          font-weight: bold;
          background-color: #e8f5e9;
          color: #1b5e20;
          border: 1px solid #a5d6a7;
        }

        .photo-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 10px;
          page-break-inside: avoid;
        }
        .photo-card {
          border: 1px solid #cccccc;
          padding: 6px;
          text-align: center;
          background: #ffffff;
        }
        .photo-card img {
          max-width: 100%;
          max-height: 220px;
          object-fit: contain;
        }
        .photo-caption {
          font-size: 9pt;
          color: #666;
          margin-top: 4px;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          font-size: 10pt;
        }
        .history-table th, .history-table td {
          border: 1px solid #ccc;
          padding: 6px 8px;
          text-align: left;
        }
        .history-table th { background: #f0f4f3; color: #176b5b; }

        .signature-block {
          margin-top: 35px;
          display: flex;
          justify-content: space-between;
          page-break-inside: avoid;
        }
        .sig-box {
          width: 200px;
          text-align: center;
          font-size: 11pt;
        }
        .sig-space {
          height: 65px;
        }

        @media print {
          body { background: transparent; }
        }
      </style>
    </head>
    <body>
      <div class="header-kop">
        <h1>SMP ISLAM AL AZHAR 44</h1>
        <h2>LEMBAR EVALUASI & LAPORAN KEGIATAN LIFE SKILL</h2>
        <p>Jl. Grand Wisata, Tambun Selatan, Kabupaten Bekasi — Jawa Barat</p>
      </div>

      <div class="report-title">LAPORAN KEGIATAN MURID</div>

      <table class="identity-table">
        <tr>
          <td class="label">Nama Murid</td>
          <td><b>${escapeHTML(report.studentName)}</b></td>
          <td class="label">NIS</td>
          <td>${escapeHTML(report.nis || '-')}</td>
        </tr>
        <tr>
          <td class="label">Kelas</td>
          <td>${escapeHTML(report.className)}</td>
          <td class="label">Pertemuan Ke-</td>
          <td><b>Pertemuan ${report.meeting}</b></td>
        </tr>
        <tr>
          <td class="label">Hari / Tanggal</td>
          <td>${escapeHTML(report.day)}, ${formatDate(report.date)}</td>
          <td class="label">Kategori Capaian</td>
          <td><span class="badge-kategori">${escapeHTML(categoryLabel(report.category))}</span></td>
        </tr>
        <tr>
          <td class="label">Judul Kegiatan</td>
          <td colspan="3"><b>${escapeHTML(report.title)}</b></td>
        </tr>
      </table>

      <div class="section-title">1. Uraian Catatan Kegiatan</div>
      <div class="content-box">${escapeHTML(report.notes || '-')}</div>

      <div class="section-title">2. Hasil / Produk Kegiatan</div>
      <div class="content-box">${escapeHTML(report.result || '-')}</div>

      <div class="section-title">3. Refleksi Diri Murid</div>
      <div class="content-box"><b>${escapeHTML(report.reflection || 'Belum diisi')}</b></div>

      <div class="section-title">4. Evaluasi & Catatan Guru Pembina</div>
      <div class="content-box" style="background-color: #f7fbfd; border-color: #bce0fd;">
        <b>Penilai:</b> ${escapeHTML(report.gradedBy || 'Belum dinilai')}<br>
        <b>Waktu Evaluasi:</b> ${escapeHTML(report.gradedAt || '-')}<br>
        <b>Catatan Guru:</b> ${escapeHTML(report.feedback || 'Belum ada catatan evaluasi dari guru pembina.')}
      </div>

      ${photoSection}

      <div class="section-title" style="margin-top: 25px;">Riwayat Aktivitas Laporan</div>
      <table class="history-table">
        <thead>
          <tr>
            <th>Status Aktivitas</th>
            <th>Oleh / Tanggal</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${historyRows}
        </tbody>
      </table>

      <div class="signature-block">
        <div class="sig-box">
          <p>Mengetahui,<br>Orang Tua / Wali Murid</p>
          <div class="sig-space"></div>
          <p><b>( ......................................... )</b></p>
        </div>
        <div class="sig-box">
          <p>Bekasi, ${formatDate(report.date)}<br>Guru Pembina Life Skill</p>
          <div class="sig-space"></div>
          <p><b>${escapeHTML(report.gradedBy || 'Ibu Diah, S.Pd.')}</b></p>
        </div>
      </div>

      <script>
        window.onload = function() {
          var imgs = Array.from(document.images);
          if (imgs.length === 0) {
            window.print();
            return;
          }
          var count = 0;
          function done() {
            count++;
            if (count === imgs.length) {
              window.print();
            }
          }
          imgs.forEach(function(img) {
            if (img.complete) done();
            else {
              img.onload = done;
              img.onerror = done;
            }
          });
        };
      <\/script>
    </body>
    </html>
  `;

  openPrintWindow(printableHTML);
}

export function exportBatchReportsPDF(reports: Report[], filterTitle = 'Semua Laporan'): void {
  const rows = reports.map((rep, idx) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td><b>${escapeHTML(rep.studentName)}</b><br><small style="color:#555;">NIS: ${escapeHTML(rep.nis || '-')}</small></td>
      <td style="text-align: center;"><b>${escapeHTML(rep.className)}</b></td>
      <td>${escapeHTML(rep.day)},<br>${formatDate(rep.date)}</td>
      <td style="text-align: center;">Ke-${rep.meeting}</td>
      <td><b>${escapeHTML(rep.title)}</b></td>
      <td>${categoryLabel(rep.category)}</td>
      <td><small>${escapeHTML(rep.feedback || '-')}</small></td>
    </tr>
  `).join('');

  const printableHTML = `
    <!doctype html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>Rekap_Laporan_LifeSkill_${filterTitle.replace(/\s+/g, '_')}</title>
      <style>
        @page { size: A4 landscape; margin: 12mm; }
        body { font-family: Arial, sans-serif; color: #111; font-size: 10pt; line-height: 1.4; margin: 0; }
        
        .header {
          text-align: center;
          border-bottom: 2px solid #176b5b;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .header h1 { margin: 0; font-size: 14pt; color: #176b5b; text-transform: uppercase; }
        .header h2 { margin: 2px 0 0 0; font-size: 12pt; font-weight: normal; color: #333; }

        .meta-summary {
          display: flex;
          justify-content: space-between;
          background: #f0f7f5;
          border: 1px solid #176b5b;
          padding: 8px 12px;
          margin-bottom: 12px;
          font-size: 9.5pt;
        }

        table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 9pt; }
        th, td { border: 1px solid #888; padding: 6px 8px; text-align: left; vertical-align: top; }
        th { background: #176b5b; color: #ffffff; font-size: 8.5pt; text-transform: uppercase; }
        tr:nth-child(even) { background: #fafafa; }

        .footer {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
          page-break-inside: avoid;
        }
        .sig { text-align: center; width: 220px; }
        .sig-space { height: 50px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>SMP ISLAM AL AZHAR 44</h1>
        <h2>REKAPITULASI EVALUASI LAPORAN LIFE SKILL — ${escapeHTML(filterTitle)}</h2>
      </div>

      <div class="meta-summary">
        <div><b>Total Laporan:</b> ${reports.length} Item</div>
        <div><b>Tanggal Cetak:</b> ${formatDate(new Date().toISOString().slice(0, 10))}</div>
        <div><b>Status Filter:</b> ${escapeHTML(filterTitle)}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th style="width: 140px;">Nama Murid</th>
            <th style="width: 50px;">Kelas</th>
            <th style="width: 90px;">Tanggal</th>
            <th style="width: 60px;">Pertemuan</th>
            <th>Judul Kegiatan</th>
            <th style="width: 130px;">Capaian</th>
            <th style="width: 150px;">Catatan Guru</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="footer">
        <div class="sig">
          Bekasi, ${formatDate(new Date().toISOString().slice(0, 10))}<br>
          Guru Pembina Life Skill<br>
          <div class="sig-space"></div>
          <b>Ibu Diah, S.Pd.</b>
        </div>
      </div>

      <script>
        window.onload = function() { window.print(); };
      <\/script>
    </body>
    </html>
  `;

  openPrintWindow(printableHTML);
}

function openPrintWindow(htmlContent: string): void {
  const win = window.open('', '_blank', 'width=1000,height=800');
  if (!win) {
    alert('Popup diblokir oleh browser. Harap izinkan popup untuk mencetak PDF.');
    return;
  }
  win.document.open();
  win.document.write(htmlContent);
  win.document.close();
}

function formatDate(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(isoDate + (isoDate.includes('T') ? '' : 'T00:00:00')));
  } catch {
    return isoDate;
  }
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

function escapeHTML(str: string): string {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
