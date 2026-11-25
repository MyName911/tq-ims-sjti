const context = [
  [1, 'Marketing', 'Internal', 'Output produksi kurang', 'Lost order', 'Marketing, PPQC, Produksi', 'Permintaan pasar terpenuhi', 'Penambahan mesin dan peningkatan efisiensi'],
  [1, 'Marketing', 'Internal', 'Harga kompetitor lebih rendah', 'Lost order', 'Produksi, PPC, Pembelian', 'Harga bersaing dengan mutu yang terjaga', 'Mengupayakan harga bahan baku dan menjaga kualitasnya'],
  [1, 'Marketing', 'Eksternal', 'Tingkat kepercayaan pembeli', 'Lost order', 'Pelanggan, Marketing, FAT', 'Stabilitas layanan yang saling menguntungkan', 'Menjaga ketersediaan, kualitas, dan harga sesuai pasar'],
  [2, 'PPC', null, 'Benang berbeda lot', 'Produksi terganggu', 'Produksi, PPC, Marketing, Gudang', 'Kedatangan benang dengan lot yang sama', 'Menjaga kestabilan pasokan benang dan lot'],
  [2, 'PPC', null, 'Benang rangkap', 'Roll kecil meningkat', 'Produksi, PPC, Pembelian', 'Bahan baku benang tanpa rangkap', 'Tindak lanjut ke Pembelian dan evaluasi pemasok benang'],
  [2, 'PPC', null, 'Pergantian konstruksi di tengah proses', 'Produksi terganggu dan aval meningkat', 'Produksi, PPC, Marketing', 'Pergantian konstruksi selama produksi diminimalkan', 'Menjaga kestabilan order'],
  [2, 'PPC', null, 'Over WIP', 'Biaya operasional tinggi', 'Produksi, PPC, Persiapan, FAT', 'Stok beam sesuai rencana produksi', 'Memastikan stok beam akhir bulan sesuai rencana PPC'],
  [3, 'Pembelian', 'Internal', 'Barang yang dibutuhkan sudah discontinued', 'Penyediaan barang terlambat', 'Pengguna dan pemasok', 'Kebutuhan barang tetap terpenuhi', 'Mencari barang pengganti bersama pengguna dan pemasok'],
  [3, 'Pembelian', 'Internal', 'Karakteristik dan spesifikasi barang kompleks', 'Barang tidak bisa digunakan atau pemesanan terlambat', 'Pembelian dan bagian terkait', 'Spesifikasi barang ditulis sesuai kebutuhan', 'Melengkapi identitas dan spesifikasi barang pada PR'],
  [4, 'FAT', 'Internal', 'Peralihan sistem dari DOS ke web', 'Gangguan pemindahan data dan peluang pelaporan yang lebih mudah diakses', 'Seluruh bagian', 'Laporan dapat diakses kapan pun dan dari berbagai lokasi', 'Menyiapkan instruksi kerja dan pelatihan sistem web per bagian'],
  [5, 'HRD', 'Internal', 'Rekrutmen mekanik berpengalaman', 'Kandidat berpengalaman sulit diperoleh', 'Mekanik dan Produksi', 'Kebutuhan tenaga kerja mekanik terpenuhi', 'Membuka kesempatan bagi kandidat tanpa pengalaman melalui program Balai Latihan Kerja'],
  [6, 'GA', 'Internal', 'Belum tersedia alat scanner untuk kendaraan baru', 'Diagnosis kerusakan kendaraan kurang optimal', 'GA', 'Tersedia alat scanner yang sesuai', 'Pengadaan scanner yang sesuai untuk kendaraan'],
  [7, 'Persiapan', 'Internal', 'Kestabilan bunching', 'Mesin sering berhenti pada arah pakan', 'Loom, Persiapan, Maintenance', 'Kualitas bunching stabil', 'Kontrol bunching sesuai standar'],
  [7, 'Persiapan', 'Internal', 'Beam bermasalah', 'Mesin sering berhenti pada arah lusi, aval tinggi, dan efisiensi rendah', 'Loom, Persiapan, PPQC', 'Gulungan awal beam sizing baik', 'Memeriksa kualitas gulungan beam sizing'],
  [8, 'Loom Weaving I', 'Internal', 'Lebar kain tidak stabil', 'Kepercayaan pelanggan menurun', 'PPQC dan bagian terkait', 'Perhitungan konstruksi sesuai dan alat ukur tegangan tersedia', 'Pencegahan masalah tegangan benang lusi dan pakan'],
  [8, 'Loom Weaving I', 'Internal', 'Ketersediaan beam tidak sesuai kebutuhan mesin dan konstruksi', 'Produksi Loom terganggu', 'Loom dan Persiapan', 'Beam tersedia sesuai konstruksi dan rencana', 'Mengontrol stok beam per konstruksi'],
  [9, 'Loom Weaving II', 'Internal', 'Tingkat kehadiran operator di bawah 99%', 'Proses produksi terganggu', 'Produksi', 'Pengaturan cuti dan pengurangan absensi', 'Memantau tingkat kehadiran operator'],
  [10, 'Finishing', 'Internal', 'Order dari PPC kurang stabil', 'Hasil produksi tidak sesuai kapasitas mesin', 'Finishing, FAT, PPC', 'Order stabil sesuai kapasitas mesin', 'Memenuhi kebutuhan bahan baku kain grey'],
  [10, 'Finishing', 'Internal', 'Tekanan uap kurang stabil', 'Produksi terlambat dan kualitas berkurang', 'Produksi Finishing', 'Tekanan uap minimal 5 bar', 'Menjaga pasokan uap sesuai standar proses'],
  [10, 'Finishing', 'Internal', 'Tekanan udara kompresor tidak stabil', 'Produksi terlambat dan kualitas berkurang', 'Produksi Finishing', 'Tekanan udara kompresor minimal 6 bar', 'Menjaga tekanan kompresor sesuai standar proses'],
  [10, 'Finishing', 'Internal', 'Shrinkage tinggi', 'Keluhan pelanggan', 'Produksi Finishing, Marketing, PPC', 'Overfeed berfungsi normal', 'Mengendalikan fungsi overfeed'],
  [11, 'Maintenance', 'Eksternal', 'Kedatangan suku cadang terlambat', 'Stok suku cadang di gudang kosong'],
  [12, 'Utility', 'Internal', 'Tangki dan pipa distribusi pengolahan air keropos', 'Distribusi air ke produksi dan kantor terganggu', 'Seluruh bagian', 'Distribusi air lancar', 'Penggantian pipa'],
  [13, 'QC Weaving', 'Internal', 'Sisa pakan tertenun pada kain', 'Hasil produksi terhambat', 'QC Weaving, Produksi, Maintenance', 'Kain dengan sisa pakan tertenun yang terkendali'],
  [14, 'Laborat', 'Internal', 'Alat ukur belum terkalibrasi', 'Kualitas hasil produksi tidak sesuai', 'Laborat', 'Kalibrasi rutin dan periodik', 'Melaksanakan kalibrasi tepat waktu'],
  [15, 'Gudang', 'Internal', 'Pengiriman kain dari QC Weaving ke Gudang terlambat', 'Pengiriman kain ke pelanggan terlambat', 'Gudang dan Marketing', 'Pengiriman kain tepat waktu', 'Mempercepat pemeriksaan kain dan kesiapan forklift'],
  [16, 'MIS', 'Internal', 'Jaringan lokal sering terputus', 'Pelaporan administrasi dan komunikasi terhambat', 'Seluruh bagian', 'Pembaruan jalur instalasi', 'Pemeriksaan dan perawatan jaringan'],
  [17, 'Maintenance Finishing', 'Internal', 'Kain sering putus saat proses CBR', 'Kain rusak', 'Mekanik dan Elektrik Finishing', 'Cloth guider berjalan normal', 'Perawatan terjadwal'],
];

export const pestelIssues = context.map(([halamanSumber, departemen, jenis, isu, risikoPeluang, pihak, harapan, tindakan], index) => ({
  id: 'STI-KO-' + (index + 1), isu, jenis, departemen, risikoPeluang, pihak, harapan, tindakan,
  periode: 'Januari–Desember 2026', dokumenId: 'STI-SRC-004', halamanSumber,
}));

export const stakeholders = [
  ['Pelanggan', 'Eksternal', 'Pelanggan', 'Stabilitas layanan dan kerja sama yang saling menguntungkan', 1],
  ['Marketing, PPQC, dan Produksi', 'Internal', 'Bagian internal', 'Permintaan pasar terpenuhi', 1],
  ['Produksi, PPC, Marketing, dan Gudang', 'Internal', 'Bagian internal', 'Kedatangan benang dengan lot yang sama', 2],
  ['Pembelian dan bagian terkait', 'Internal', 'Bagian internal', 'Spesifikasi barang sesuai kebutuhan pengguna', 3],
  ['Pengguna dan pemasok', 'Eksternal / Internal', 'Pemasok dan pengguna', 'Kebutuhan barang terpenuhi walaupun barang lama dihentikan', 3],
  ['Loom, Persiapan, dan Maintenance', 'Internal', 'Bagian internal', 'Kualitas bunching stabil', 7],
  ['Finishing, FAT, dan PPC', 'Internal', 'Bagian internal', 'Kestabilan order sesuai kapasitas mesin', 10],
].map(([nama, tipe, kategori, kebutuhan, halamanSumber], i) => ({
  id: 'STI-PK-' + (i + 1), nama, tipe, kategori, kebutuhan, dokumenId: 'STI-SRC-004', halamanSumber,
}));

export const stakeholderComms = [];
export const quadrantOf = (p, k) => (p >= 6 ? (k >= 6 ? 'Kelola Ketat' : 'Jaga Kepuasan') : k >= 6 ? 'Jaga Informasi' : 'Pantau');
