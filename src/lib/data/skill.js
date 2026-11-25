export const SKILLS = ['Teknis Tekstil', 'Mutu & Inspeksi', 'K3 & 5R', 'Digital', 'Leadership', 'Problem Solving'];
export const employees = [];
export const trainings = [];
export const certifications = [];

export const scoresOf = (emps) => emps.flatMap((e) => SKILLS.flatMap((skill, si) => {
  const level = e.skills?.[si];
  const target = e.targets?.[si];
  if (!Number.isFinite(level)) return [];
  return [{
    id: e.id + '-S' + (si + 1), karyawan: e.nama, empId: e.id, departemen: e.departemen, jabatan: e.jabatan,
    golongan: e.golongan, skill, level, target, selisih: target == null ? null : level - target,
    status: target == null ? 'Belum Ada Standar' : level < target ? 'Gap' : 'Kompeten',
  }];
}));

export const skillScores = scoresOf(employees);

const topics = [
  [1, 'Marketing', 'Sales', 'Memahami kebutuhan pelanggan terkait konstruksi kain, harga, dan jadwal pengiriman.'],
  [1, 'Marketing', 'Kompetitor', 'Memahami kekuatan dan kelemahan pesaing untuk mengidentifikasi peluang dan hambatan pasar.'],
  [2, 'PPC', 'Kapasitas produksi Loom', 'Menghitung kapasitas produksi kain tenun berdasarkan kemampuan mesin dan waktu operasi.'],
  [2, 'PPC', 'Perencanaan produksi', 'Merencanakan kapasitas produksi sesuai sumber daya, bahan, dan aksesori mesin yang tersedia.'],
  [3, 'Pembelian', 'Purchase Order', 'Memahami spesifikasi, kuantitas, harga, dan pembayaran yang tercantum pada PO.'],
  [4, 'FAT', 'Analisis laporan keuangan', 'Menganalisis margin, modal kerja, rasio utang terhadap ekuitas, dan perputaran persediaan.'],
  [5, 'HRD', 'Rekrutmen, seleksi, dan penempatan kerja', 'Memahami kualifikasi, penyaringan, wawancara, tes, dan penyerahan karyawan ke bagian terkait.'],
  [6, 'GA', 'Sistem Manajemen Mutu ISO 9001:2015', 'Memahami persiapan, dokumentasi, penerapan, dan evaluasi SMM.'],
  [7, 'Persiapan', 'Proses warping', 'Memahami alur dari pemasangan benang sampai terbentuk beam warping.'],
  [7, 'Persiapan', 'Proses sizing', 'Memahami alur dari beam warping sampai beam after sizing.'],
  [7, 'Persiapan', 'Proses cucuk', 'Menyiapkan beam hasil sizing melalui proses cucuk hingga siap naik ke mesin tenun.'],
  [7, 'Persiapan', 'Proses pirn winder', 'Memahami perubahan dari cone menjadi palet untuk mesin tenun.'],
  [8, 'Loom', 'Konsep dasar 5R', 'Memahami dan menerapkan 5R dalam proses produksi.'],
  [8, 'Loom', 'Pengetahuan cacat kain', 'Mengenali jenis cacat kain dan menganalisisnya.'],
  [9, 'Finishing', 'Tahapan produksi Finishing', 'Preparation, Gas Singeing, Continuous Bleaching Range, Stenter, dan Folding.'],
  [10, 'Maintenance', 'Motion mesin tenun', 'Memahami gerakan utama dan tambahan mesin tenun.'],
  [11, 'Utility', 'Boiler, kompresor, dan pengolahan air', 'Memahami fungsi boiler, udara bertekanan, dan pengolahan air dengan softener.'],
  [12, 'QC In Proses', 'Pemeriksaan kualitas kain dan kalibrasi', 'Memahami pengecekan mutu kain selama proses dan kalibrasi peralatan.'],
  [13, 'QC Weaving', 'Penilaian cacat kain', 'Mengenali bentuk cacat dan membedakan cacat yang dapat diperbaiki dari yang tidak dapat diperbaiki.'],
  [14, 'Laborat', 'Pengujian benang', 'Memahami jenis dan spesifikasi benang serta menguji kualitasnya.'],
  [15, 'Gudang', 'Penyimpanan, pengiriman, dan stok barang', 'Menata barang dan memeriksa kesesuaian stok fisik dengan pencatatan.'],
  [16, 'MIS', 'Troubleshooting TI', 'Menangani masalah perangkat keras, jaringan, dan perangkat lunak.'],
  [17, 'Maintenance Finishing', 'Peralatan kerja dan mesin Finishing', 'Memahami penggunaan alat kerja dan mengenal mesin Finishing.'],
];

export const knowledge = topics.map(([halamanSumber, departemen, topik, penjelasan], index) => ({
  id: 'STI-PO-' + (index + 1), topik, departemen, penjelasan, dokumenId: 'STI-SRC-008', halamanSumber,
}));
