// Modul A, Konteks organisasi (Klausul 4.1) dan pihak berkepentingan (4.2).
import { rng, LAST6, PEOPLE, addDays, pad, TODAY, monthOf } from './core';

export const PESTEL_FACTORS = [
  { key: 'Political', label: 'Political', letter: 'P', color: '#3b5bdb', tone: 'blue' },
  { key: 'Economic', label: 'Economic', letter: 'E', color: '#5f6f86', tone: 'mint' },
  { key: 'Social', label: 'Social', letter: 'S', color: '#b9c3d6', tone: 'peach' },
  { key: 'Technological', label: 'Technological', letter: 'T', color: '#8fa2e6', tone: 'lilac' },
  { key: 'Environmental', label: 'Environmental', letter: 'E', color: '#1d2c6e', tone: 'mint' },
  { key: 'Legal', label: 'Legal', letter: 'L', color: '#a58a5a', tone: 'rose' },
];

// Isu khas pabrik garmen ekspor. [isu, dampak, jenis, departemen, tindakan]
const ISSUES = {
  Political: [
    ['Perubahan kebijakan impor kain & aksesoris', 'Tinggi', 'Risiko', 'Purchasing', 'Diversifikasi pemasok lokal untuk kain cotton & interlining'],
    ['Insentif kawasan berikat & KITE', 'Sedang', 'Peluang', 'Finance', 'Ajukan fasilitas KITE untuk bahan baku order ekspor'],
    ['Stabilitas politik menjelang Pilkada daerah', 'Rendah', 'Risiko', 'HR & GA', 'Pantau isu ketenagakerjaan lokal bersama Disnaker'],
    ['Perjanjian dagang IEU-CEPA', 'Tinggi', 'Peluang', 'Merchandising', 'Petakan buyer Uni Eropa yang mendapat tarif preferensi'],
    ['Kebijakan safeguard tekstil', 'Sedang', 'Risiko', 'Purchasing', 'Hitung ulang landed cost kain impor'],
    ['Program hilirisasi industri TPT pemerintah', 'Sedang', 'Peluang', 'QMR', 'Ikuti program restrukturisasi mesin Kemenperin'],
    ['Perubahan kebijakan upah minimum provinsi', 'Tinggi', 'Risiko', 'HR & GA', 'Simulasi biaya tenaga kerja & target efisiensi line'],
    ['Kebijakan bea masuk negara tujuan ekspor', 'Sedang', 'Risiko', 'Merchandising', 'Review syarat asal barang (rules of origin)'],
  ],
  Economic: [
    ['Fluktuasi kurs USD terhadap Rupiah', 'Tinggi', 'Risiko', 'Finance', 'Natural hedging pembelian kain dalam USD'],
    ['Kenaikan harga benang & kain cotton', 'Tinggi', 'Risiko', 'Purchasing', 'Kontrak harga 6 bulan dengan pemasok utama'],
    ['Inflasi & daya beli pasar domestik', 'Sedang', 'Risiko', 'Merchandising', 'Fokus portofolio ekspor 80%'],
    ['Kenaikan suku bunga acuan', 'Sedang', 'Risiko', 'Finance', 'Restrukturisasi fasilitas modal kerja'],
    ['Pertumbuhan permintaan workwear', 'Sedang', 'Peluang', 'Merchandising', 'Kembangkan lini produk seragam kerja'],
    ['Biaya logistik & freight kontainer', 'Tinggi', 'Risiko', 'PPIC', 'Konsolidasi pengiriman per buyer'],
    ['Kenaikan tarif listrik industri', 'Sedang', 'Risiko', 'Maintenance', 'Audit energi & penggantian motor servo'],
    ['Relokasi order dari negara pesaing', 'Tinggi', 'Peluang', 'Merchandising', 'Siapkan kapasitas 2 line tambahan'],
    ['Persaingan harga dengan Vietnam & Bangladesh', 'Tinggi', 'Risiko', 'QMR', 'Tingkatkan efisiensi line & RFT'],
    ['Akses pembiayaan hijau (green financing)', 'Rendah', 'Peluang', 'Finance', 'Siapkan data emisi untuk pengajuan'],
  ],
  Social: [
    ['Perubahan gaya hidup & tren fast fashion', 'Sedang', 'Peluang', 'Merchandising', 'Percepat sampling dengan pola digital'],
    ['Demografi tenaga kerja muda (Gen Z)', 'Sedang', 'Risiko', 'HR & GA', 'Program onboarding & jenjang karier operator'],
    ['Kesadaran konsumen terhadap produk etis', 'Tinggi', 'Peluang', 'QMR', 'Persiapkan sertifikasi social compliance'],
    ['Turnover operator sewing tinggi', 'Tinggi', 'Risiko', 'HR & GA', 'Skema insentif kehadiran & skill bonus'],
    ['Ekspektasi kesejahteraan pekerja', 'Sedang', 'Risiko', 'HR & GA', 'Dialog bipartit triwulanan dengan serikat'],
    ['Tren digitalisasi belanja buyer', 'Sedang', 'Peluang', 'IT', 'Portal buyer untuk tracking order'],
    ['Hubungan dengan masyarakat sekitar pabrik', 'Rendah', 'Risiko', 'HR & GA', 'Program CSR & rekrutmen warga lokal'],
  ],
  Technological: [
    ['Otomasi mesin jahit & cutting otomatis', 'Tinggi', 'Peluang', 'Maintenance', 'Pilot auto cutter di Cutting'],
    ['Digitalisasi supply chain & traceability', 'Tinggi', 'Peluang', 'PPIC', 'Implementasi barcode bundle tracking'],
    ['Keamanan siber sistem ERP', 'Sedang', 'Risiko', 'IT', 'Backup harian & MFA seluruh pengguna ERP'],
    ['Adopsi CAD & 3D sampling', 'Sedang', 'Peluang', 'Merchandising', 'Pelatihan CAD pola untuk tim sampling'],
    ['Inovasi bahan daur ulang (recycled fabric)', 'Sedang', 'Peluang', 'Purchasing', 'Uji coba 2 supplier recycled polyester'],
    ['Keusangan mesin jahit generasi lama', 'Tinggi', 'Risiko', 'Maintenance', 'Rencana peremajaan 120 unit mesin'],
    ['Sistem MES real-time di lantai produksi', 'Sedang', 'Peluang', 'IT', 'Integrasi output per jam ke dashboard'],
    ['AI untuk inspeksi visual cacat kain', 'Rendah', 'Peluang', 'Quality Control', 'Studi kelayakan kamera inspeksi'],
    ['Ketergantungan pada vendor IT tunggal', 'Sedang', 'Risiko', 'IT', 'Dokumentasi & transfer knowledge sistem'],
  ],
  Environmental: [
    ['Regulasi emisi karbon buyer Eropa', 'Tinggi', 'Risiko', 'QMR', 'Hitung jejak karbon per produk'],
    ['Pengelolaan limbah perca kain', 'Sedang', 'Peluang', 'Warehouse', 'Kerja sama daur ulang perca dengan UMKM'],
    ['Perubahan iklim & cuaca ekstrem', 'Sedang', 'Risiko', 'PPIC', 'Rencana kontinjensi banjir gudang'],
    ['Efisiensi energi & panel surya atap', 'Sedang', 'Peluang', 'Maintenance', 'Studi PLTS atap 500 kWp'],
    ['Penggunaan bahan kimia di proses washing', 'Tinggi', 'Risiko', 'Finishing', 'Daftar bahan kimia sesuai MRSL'],
    ['Konsumsi air proses finishing', 'Rendah', 'Risiko', 'Finishing', 'Pasang meter air per area'],
  ],
  Legal: [
    ['Perubahan regulasi ketenagakerjaan', 'Tinggi', 'Risiko', 'HR & GA', 'Review PKB & peraturan perusahaan'],
    ['Kewajiban pelaporan SMK3 & lingkungan', 'Sedang', 'Risiko', 'QMR', 'Kalender kepatuhan perizinan'],
    ['Perlindungan data pribadi (UU PDP)', 'Sedang', 'Risiko', 'IT', 'Klasifikasi data karyawan & buyer'],
    ['Hak kekayaan intelektual desain buyer', 'Sedang', 'Risiko', 'Merchandising', 'NDA & kontrol akses pola digital'],
    ['Persyaratan due diligence HAM (CSDDD)', 'Tinggi', 'Risiko', 'QMR', 'Pemetaan risiko HAM rantai pasok'],
    ['Perubahan standar ISO 9001:2026', 'Tinggi', 'Peluang', 'QMR', 'Gap assessment & transisi sistem manajemen'],
    ['Regulasi label & komposisi produk tujuan ekspor', 'Sedang', 'Risiko', 'Quality Control', 'Verifikasi label care & fiber content'],
    ['Perpajakan & insentif tax holiday', 'Rendah', 'Peluang', 'Finance', 'Konsultasi insentif investasi mesin'],
  ],
};

const STATUS_PLAN = [
  ...Array(8).fill('Prioritas'), ...Array(12).fill('On Progress'), ...Array(8).fill('Monitoring'), ...Array(20).fill('Closed'),
];

function buildPestel() {
  const r = rng('pestel');
  const flat = PESTEL_FACTORS.flatMap((f) => ISSUES[f.key].map((x) => ({ faktor: f.key, x })));
  // Isu berdampak tinggi lebih mungkin menjadi prioritas; isu ringan lebih cepat ditutup.
  const ordered = [...flat].sort((a, b) => ({ Tinggi: 0, Sedang: 1, Rendah: 2 }[a.x[1]] - { Tinggi: 0, Sedang: 1, Rendah: 2 }[b.x[1]]) + (r.next() - 0.5) * 1.6);
  const statusOf = new Map(ordered.map((o, i) => [o, STATUS_PLAN[i]]));
  return flat.map((o, i) => {
    const [isu, dampak, jenis, departemen, tindakan] = o.x;
    const bulan = r.weighted(LAST6.map((m, j) => [m, 1 + j * 0.25]));
    const tanggal = r.dateIn(bulan);
    const kemungkinan = dampak === 'Tinggi' ? r.int(3, 5) : dampak === 'Sedang' ? r.int(2, 4) : r.int(1, 3);
    const dampakNum = dampak === 'Tinggi' ? r.int(4, 5) : dampak === 'Sedang' ? 3 : r.int(1, 2);
    const status = statusOf.get(o);
    return {
      id: `PST-${pad(i + 1)}`,
      faktor: o.faktor,
      isu,
      jenis,
      dampak,
      kemungkinan,
      skor: kemungkinan * dampakNum,
      status,
      departemen,
      pic: r.pick(PEOPLE.slice(0, 30)),
      tanggal,
      bulan,
      target: status === 'Closed' ? null : addDays(TODAY, r.int(7, 120)),
      tindakan,
    };
  });
}

export const pestelIssues = buildPestel();

// ─── Stakeholder ───────────────────────────────────────────────────────────
// [nama, kategori, tipe, pengaruh, kepentingan, kebutuhan & harapan]
const STAKEHOLDERS = [
  ['Nordline Apparel (Uni Eropa)', 'Pelanggan', 'Eksternal', 9, 10, 'Kualitas konsisten, on-time delivery, kepatuhan social compliance'],
  ['Kazuo Retail Japan', 'Pelanggan', 'Eksternal', 8, 9, 'Zero defect jahitan, label sesuai standar Jepang'],
  ['Westbay Outfitters (AS)', 'Pelanggan', 'Eksternal', 8, 8, 'Lead time singkat, traceability bahan'],
  ['Southern Cross Uniform (Australia)', 'Pelanggan', 'Eksternal', 6, 7, 'Harga kompetitif, ketahanan warna'],
  ['PT Tekstil Priangan Jaya', 'Pemasok', 'Eksternal', 7, 8, 'Forecast order akurat, pembayaran tepat waktu'],
  ['CV Aksesoris Mandiri', 'Pemasok', 'Eksternal', 4, 6, 'Spesifikasi kancing & zipper yang jelas'],
  ['PT Benang Sentosa', 'Pemasok', 'Eksternal', 5, 6, 'Volume pembelian stabil'],
  ['Mitra Logistik Samudra', 'Pemasok', 'Eksternal', 5, 5, 'Jadwal stuffing pasti'],
  ['Kementerian Perindustrian', 'Pemerintah', 'Eksternal', 8, 5, 'Laporan industri & kepatuhan SNI'],
  ['Disnaker Kab. Majalengka', 'Pemerintah', 'Eksternal', 7, 6, 'Kepatuhan norma ketenagakerjaan & K3'],
  ['Dinas Lingkungan Hidup', 'Pemerintah', 'Eksternal', 7, 5, 'Pelaporan limbah & emisi'],
  ['Kantor Bea Cukai', 'Pemerintah', 'Eksternal', 8, 4, 'Ketertiban dokumen kawasan berikat'],
  ['Bank Mitra Nusantara', 'Lembaga Keuangan', 'Eksternal', 6, 5, 'Kinerja keuangan & ketepatan cicilan'],
  ['BPJS Ketenagakerjaan', 'Lembaga Keuangan', 'Eksternal', 4, 4, 'Kepesertaan & iuran tepat waktu'],
  ['LSM Lingkungan Citarum Lestari', 'LSM', 'Eksternal', 4, 6, 'Transparansi pengelolaan limbah'],
  ['Masyarakat Desa Sukamulya', 'Masyarakat', 'Eksternal', 5, 7, 'Rekrutmen warga lokal, lingkungan bersih'],
  ['Media Lokal Jabar', 'Media', 'Eksternal', 3, 3, 'Informasi kegiatan & CSR'],
  ['Lembaga Sertifikasi ISO', 'Badan Sertifikasi', 'Eksternal', 7, 6, 'Bukti penerapan SMM yang efektif'],
  ['Auditor Social Compliance Buyer', 'Badan Sertifikasi', 'Eksternal', 8, 7, 'Akses data jam kerja & upah'],
  ['Asosiasi Pertekstilan Indonesia', 'Asosiasi', 'Eksternal', 4, 5, 'Partisipasi program industri'],
  ['Dewan Direksi', 'Manajemen', 'Internal', 10, 10, 'Profitabilitas, pertumbuhan, reputasi'],
  ['Pemegang Saham', 'Manajemen', 'Internal', 9, 8, 'Imbal hasil & tata kelola'],
  ['Karyawan Produksi', 'Karyawan', 'Internal', 6, 9, 'Upah layak, keselamatan kerja, jenjang karier'],
  ['Karyawan Staf & Supervisor', 'Karyawan', 'Internal', 6, 8, 'Pengembangan kompetensi & penghargaan'],
  ['Serikat Pekerja (PUK SPN)', 'Serikat Pekerja', 'Internal', 7, 9, 'Dialog bipartit & kepatuhan PKB'],
  ['Tim Quality Control', 'Karyawan', 'Internal', 5, 8, 'Standar inspeksi jelas & alat ukur terkalibrasi'],
  ['Tim Merchandising', 'Karyawan', 'Internal', 6, 7, 'Informasi kapasitas & status order real-time'],
  ['Koperasi Karyawan', 'Karyawan', 'Internal', 3, 5, 'Dukungan manajemen'],
  ['Komite K3 (P2K3)', 'Karyawan', 'Internal', 5, 7, 'Sumber daya program K3'],
  ['Tim IT', 'Karyawan', 'Internal', 4, 6, 'Anggaran infrastruktur & keamanan siber'],
  ['Tim Maintenance', 'Karyawan', 'Internal', 4, 7, 'Suku cadang tersedia & jadwal PM'],
  ['Manajer Departemen', 'Manajemen', 'Internal', 8, 9, 'Data kinerja akurat untuk keputusan'],
];

export const quadrantOf = (p, k) => (p >= 6 ? (k >= 6 ? 'Kelola Ketat' : 'Jaga Kepuasan') : k >= 6 ? 'Jaga Informasi' : 'Pantau');

function buildStakeholders() {
  const r = rng('stakeholders');
  return STAKEHOLDERS.map(([nama, kategori, tipe, pengaruh, kepentingan, kebutuhan], i) => {
    const status = r.weighted([['Aktif', 7], ['Monitoring', 2], ['Perlu Tindak Lanjut', 1]]);
    return {
      id: `STK-${pad(i + 1)}`,
      nama,
      kategori,
      tipe,
      pengaruh,
      kepentingan,
      kuadran: quadrantOf(pengaruh, kepentingan),
      prioritas: pengaruh + kepentingan >= 15 ? 'Tinggi' : pengaruh + kepentingan >= 10 ? 'Sedang' : 'Rendah',
      status,
      frekuensi: pengaruh + kepentingan >= 15 ? 'Mingguan' : pengaruh + kepentingan >= 11 ? 'Bulanan' : 'Triwulan',
      pic: r.pick(PEOPLE.slice(0, 24)),
      kepuasan: r.round(3.4 + r.next() * 1.5, 1),
      kontakTerakhir: addDays(TODAY, -r.int(1, 60)),
      kebutuhan,
    };
  });
}

export const stakeholders = buildStakeholders();

const TOPICS = {
  Pelanggan: ['Review kinerja kualitas bulanan', 'Pembahasan order musim Spring/Summer 2027', 'Konfirmasi jadwal pengiriman', 'Tindak lanjut komplain jahitan', 'Kunjungan audit buyer'],
  Pemasok: ['Evaluasi kinerja pemasok', 'Negosiasi harga kain', 'Klarifikasi spesifikasi bahan', 'Perbaikan keterlambatan pengiriman'],
  Pemerintah: ['Pelaporan berkala', 'Sosialisasi regulasi baru', 'Inspeksi kepatuhan'],
  Karyawan: ['Town hall kebijakan mutu', 'Survey kepuasan karyawan', 'Sosialisasi target produksi'],
  'Serikat Pekerja': ['Rapat bipartit triwulanan', 'Pembahasan PKB'],
  Manajemen: ['Tinjauan manajemen (management review)', 'Rapat kinerja bulanan'],
};

function buildComms() {
  const r = rng('stk-comms');
  const rows = [];
  for (let i = 0; i < 72; i++) {
    const s = r.weighted(stakeholders.map((x) => [x, x.pengaruh + x.kepentingan]));
    const bulan = r.pick(LAST6);
    rows.push({
      id: `KOM-${pad(i + 1)}`,
      stakeholder: s.nama,
      kategori: s.kategori,
      tipe: s.tipe,
      tanggal: r.dateIn(bulan),
      bulan,
      media: r.weighted([['Meeting', 4], ['Email', 4], ['Telepon', 2], ['Kunjungan', 2], ['Survey', 1]]),
      topik: r.pick(TOPICS[s.kategori] ?? ['Koordinasi rutin', 'Penyampaian informasi kegiatan']),
      pic: s.pic,
      hasil: r.weighted([['Selesai', 6], ['Perlu Tindak Lanjut', 2], ['Terjadwal', 1]]),
    });
  }
  return rows.sort((a, b) => b.tanggal.localeCompare(a.tanggal)).map((x, i) => ({ ...x, id: `KOM-${pad(72 - i)}` }));
}

export const stakeholderComms = buildComms();

export const pestelThisMonth = pestelIssues.filter((i) => monthOf(i.tanggal) === LAST6[5]).length;
