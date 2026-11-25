export const RISK_LEVELS = ['Tidak Dapat Diterima', 'Sangat Berbahaya', 'Berbahaya', 'Dapat Diterima', 'Kecil'];
export const OPPORTUNITY_LEVELS = ['Segera Ditindaklanjuti', 'Sangat Menguntungkan', 'Dapat Diterima', 'Dipertimbangkan', 'Kecil'];
export const PRIORITY_RISK_LEVELS = RISK_LEVELS.slice(0, 3);

export function assessRisk(jenis, frekuensi, kemungkinan, dampak, diaturRegulasi) {
  if (![frekuensi, kemungkinan, dampak].every((n) => Number.isInteger(n) && n >= 1 && n <= 5)) {
    return { skor: null, level: null };
  }
  const skor = frekuensi * kemungkinan * dampak;
  const band = skor >= 101 ? 0 : skor >= 76 ? 1 : skor >= 51 ? 2 : skor >= 26 ? 3 : 4;
  if (jenis === 'Peluang') return { skor, level: OPPORTUNITY_LEVELS[band] };
  const minBahaya = kemungkinan === 5 || dampak === 5 || diaturRegulasi;
  return { skor, level: RISK_LEVELS[minBahaya ? Math.min(band, 2) : band] };
}

const register = [
  [1, 'Marketing', 'Risiko', 'Persaingan harga di pasar', 'Order berkurang dan stok kain menumpuk', 'Gudang, FAT', 'Stock ending balance dan kebijakan penentuan harga kain', [3, 4, 4], [3, 3, 3]],
  [1, 'Marketing', 'Risiko', 'Komplain pelanggan tentang kualitas kain', 'Kehilangan order dan penurunan kepercayaan pelanggan', 'Marketing, PPQC', 'Kuesioner, SPKR, dan evaluasi kepuasan pelanggan', [3, 3, 3], [3, 3, 3]],
  [2, 'PPC', 'Risiko', 'Perubahan konstruksi dari rencana awal', 'Order Marketing tidak terpenuhi dan aval meningkat', 'PPC, Produksi, Marketing', 'Keseimbangan produksi tenun dan persiapan serta pemantauan outstanding order Marketing', [3, 4, 2], [3, 3, 2]],
  [2, 'PPC', 'Risiko', 'Aval benang melebihi standar', 'Pemborosan material dan biaya operasional naik', 'PPC', 'Laporan harian aval dan evaluasi rencana serta realisasi produksi', [5, 3, 3], [3, 3, 2]],
  [2, 'PPC', 'Risiko', 'Benang berbeda lot', 'Kain belang dan komplain pelanggan', 'PPC, Loom, Persiapan', 'Surat komunikasi dan koordinasi alokasi benang pakan per blok', [4, 3, 3], [4, 3, 3]],
  [2, 'PPC', 'Risiko', 'Over WIP', 'Biaya operasional tinggi', 'PPC, Produksi', 'Stok opname WIP dan pengaturan keseimbangan produksi setiap akhir bulan', [3, 3, 3], [3, 3, 3]],
  [2, 'PPC', 'Risiko', 'Pakan rangkap', 'Roll kecil meningkat', 'PPC, Produksi, QC Weaving', 'Komunikasi ke Pembelian dan Persiapan serta laporan penyebab kain terpotong', [3, 3, 4], [3, 3, 3]],
  [2, 'PPC', 'Risiko', 'Hasil produksi Finishing tidak stabil', 'Rencana produksi terganggu dan biaya operasional tinggi', 'PPC', 'Laporan produksi dan tindak lanjut dengan Marketing', [3, 4, 4], [5, 3, 3]],
  [4, 'FAT', 'Risiko', 'Akses data real-time terbatas', 'Sistem administrasi DOS harus diakses lewat komputer LAN', 'FAT, MIS', 'Instruksi kerja dan pelatihan sistem berbasis web', [4, 2, 1], [2, 3, 2]],
  [4, 'FAT', 'Peluang', 'Keamanan dan kecepatan akses data', 'Akses data operasional melalui sistem berbasis web', 'Kepala Bagian', 'Implementasi sistem berbasis web dan pemasangan perangkat lunak', [2, 5, 5], [1, 1, 1]],
  [4, 'FAT', 'Risiko', 'Piutang tak tertagih', 'Penagihan piutang kurang efektif', 'FAT', 'Laporan piutang dan penagihan setiap minggu', [4, 5, 5], [4, 3, 3]],
  [4, 'FAT', 'Peluang', 'Penyediaan barang mendesak melalui transaksi tunai', 'Pembelian dapat menyediakan barang mendesak', 'Pembelian', 'PO, mutasi AP, dan riset pasar', [5, 3, 1], [1, 1, 1]],
  [4, 'FAT', 'Risiko', 'Nilai stok WIP dan aksesori berbeda dari stok fisik', 'Administrasi dan stok opname tidak rutin', 'FAT', 'Mutasi stok dan stok opname setiap bulan', [3, 3, 3], [2, 3, 2]],
  [4, 'FAT', 'Risiko', 'Kenaikan harga bahan baku', 'Kontrak benang dengan harga sesuai sulit diperoleh', 'Pembelian', 'Penawaran, matriks pemasok, dan pembaruan harga mingguan', [3, 3, 3], [2, 2, 2]],
  [4, 'FAT', 'Peluang', 'Buffer stock benang untuk operasional', 'Menjaga ketersediaan benang', 'FAT', 'Anggaran tahunan dan pengajuan pembayaran bahan baku', [3, 3, 1], [1, 1, 1]],
  [4, 'FAT', 'Risiko', 'Perubahan peraturan perpajakan', 'Perubahan regulasi pemerintah', 'FAT', 'Pemantauan peraturan dan revisi anggaran arus kas', [1, 1, 1], [1, 1, 1], true],
  [10, 'Finishing', 'Risiko', 'Tekanan uap kurang stabil', 'Kualitas kain tidak stabil', 'Finishing', 'Laporan produksi dan optimalisasi proses kain di CBR', [4, 3, 4], [3, 3, 3]],
  [10, 'Finishing', 'Risiko', 'Susut kain tinggi', 'Komplain pelanggan', 'Finishing, Laborat', 'Pengujian shrinkage dan pengaturan overfeed pada stenter', [5, 3, 3], [4, 3, 3]],
];

export const risks = register.map(([halamanSumber, departemen, jenis, deskripsi, dampakUraian, pic, pengendalian, awal, akhir, diaturRegulasi], index) => {
  const [frekuensi, kemungkinan, dampak] = awal;
  const [residualFrekuensi, residualKemungkinan, residualDampak] = akhir;
  const residual = assessRisk(jenis, ...akhir, diaturRegulasi);
  return {
    id: 'STI-IRP-' + (index + 1), halamanSumber, departemen, jenis, deskripsi, dampakUraian, pic, pengendalian,
    sumber: 'FOM/MR/002', dokumenId: 'STI-SRC-005',
    periode: [1, 4].includes(halamanSumber) ? 'Januari–Juni 2026' : 'Januari–Desember 2026',
    frekuensi, kemungkinan, dampak, diaturRegulasi: diaturRegulasi ? 'Ya' : undefined, ...assessRisk(jenis, ...awal, diaturRegulasi),
    residualFrekuensi, residualKemungkinan, residualDampak, residualSkor: residual.skor, residualLevel: residual.level,
  };
});

const plans = [
  [1, 'Marketing', 'Omset penjualan', 'Menjaga pelanggan aktif, mengaktifkan kembali pelanggan lama, dan menambah pelanggan baru.', '95%'],
  [1, 'Marketing', 'Kepuasan pelanggan', 'Kunjungan pelanggan dua minggu sekali dan survei kepuasan enam bulan sekali.', '90%'],
  [1, 'Marketing', 'Pemenuhan order produksi Weaving dan Finishing', 'Aktivasi pelanggan lama, penambahan pelanggan baru, dan survei pasar.', '95%'],
  [3, 'Pembelian', 'Pemenuhan spesifikasi barang', 'Memastikan barang yang dipesan lewat PO datang sesuai spesifikasi dan kebutuhan.'],
  [8, 'Loom Weaving I', 'Menekan roll kecil akibat cacat produksi', 'Briefing operator, menghentikan mesin yang berpotensi menimbulkan cacat, dan memperbaiki cacat di proses Loom.', 'Maks. 0,17%'],
  [8, 'Loom Weaving I', 'Menekan BS akibat cacat kain', 'Memaksimalkan kontrol personel produksi terhadap mutu kain dan alokasi shuttle.', 'Maks. 0,15%'],
  [13, 'QC Weaving', 'Ketersediaan dan mutu kain grey', 'Menindaklanjuti ketersediaan potongan kain dan memberi umpan balik ke Produksi atas sisa pakan atau fly waste.'],
  [13, 'QC Weaving', 'Ketersediaan dan mutu kain finish', 'Menindaklanjuti ketersediaan kain finish dan memberi umpan balik terkait sobek, lubang, karat, dan lebar kurang.'],
  [16, 'MIS', 'Kestabilan jaringan', 'Perbaikan jaringan sesuai work order dan penjadwalan perawatan komputer, telepon, serta CCTV.', '100%'],
  [16, 'MIS', 'Kelancaran sistem', 'Pembersihan hard disk dan sistem serta backup data secara terjadwal.', '100%'],
  [16, 'MIS', 'Ketepatan penyelesaian komplain', 'Perawatan terjadwal dan penyediaan stok suku cadang komputer, telepon, CCTV, dan printer.', 'Maks. 2 hari per perbaikan'],
];

export const okrs = plans.map(([halamanSumber, pemilik, objective, keyResult, targetSumber], index) => ({
  id: 'STI-PKJ-' + (index + 1), keyResult, objective, pemilik, targetSumber,
  periode: 'Juli–Desember 2026', dokumenId: 'STI-SRC-007', halamanSumber,
}));
