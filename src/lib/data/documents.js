// Register katalog dari DOK ISO STI. ID katalog terpisah dari nomor dokumen.
import { pad } from './core';
import { documentPaths } from './sjti-document-paths';

export const DOC_CATEGORIES = [
  { key: 'Manual', code: 'MAN' },
  { key: 'Prosedur (SOP)', code: 'SOP' },
  { key: 'Instruksi Kerja', code: 'IK' },
  { key: 'Standar', code: 'STD' },
  { key: 'Dokumen MR', code: 'MR' },
  { key: 'Formulir', code: 'FRM' },
  { key: 'Rekaman', code: 'REK' },
  { key: 'Dokumen Eksternal', code: 'EXT' },
];

export const DEPT_CODE = {
  MR: 'MR', 'Audit Mutu Internal': 'AMI', Utility: 'UTL', PPC: 'PPC', Persiapan: 'PSP',
  Laborat: 'LAB', Loom: 'LOOM', Maintenance: 'MTC', Gudang: 'GDG', GA: 'GA', MIS: 'MIS',
  Pembelian: 'PMB', Marketing: 'MKT', FAT: 'FAT', 'QC Weaving': 'QCW', Finishing: 'FNS',
  'ACC FIN TAX': 'AFT', 'HRD P2K3': 'HRP', 'HRD Legal': 'HRL', 'Maintenance Finishing': 'MCF',
};

const departmentAliases = {
  UTY: 'Utility', LAB: 'Laborat', MKT: 'Marketing', 'MTC FINISING': 'Maintenance Finishing',
  'PROD. FINISHING': 'Finishing', 'PROD. LOOM': 'Loom', 'PROD. PERSIAPAN': 'Persiapan',
};

const verifiedDocumentHeaders = {
  'MR/01~QUALITY MANUAL.pdf': ['QM/MR/001', 'Rev. 03', '2025-04-01'],
  'MR/04~KONTEK ORGANISASI.pdf': ['FOM/MR/001', 'Rev. 00'],
  'MR/05~IDENTIFIKASI RESIKO DAN PELUANG.pdf': ['FOM/MR/002', 'Rev. 00'],
  'MR/06~SASARAN MUTU..pdf': ['FOM/MR/003', 'Rev. 01'],
  'MR/07~PROGRAM KERJA.pdf': ['FOM/MR/004', 'Rev. 00'],
  'MR/08~PENGETAHUAN ORGANISASI.pdf': ['FOM/MR/005', 'Rev. 00'],
  'SOP/SOP AUDIT MUTU INTERNAL.pdf': ['SOP/AMI/001', 'Rev. 01'],
};

function departmentOf(label) {
  return departmentAliases[label] ?? Object.keys(DEPT_CODE).find((dept) => dept.toUpperCase() === label);
}

export const documents = documentPaths.map(([path, ...copies], index) => {
  const [folder, subfolder] = path.split('/');
  const filename = path.split('/').at(-1);
  const format = filename.split('.').at(-1).toUpperCase();
  const stem = filename.slice(0, -(format.length + 1));
  const title = stem.replace(/^[A-Z]*\d+\s*~\s*/i, '').replace(/\.+$/, '').trim();
  const mrType = { '01': 'Manual', '02': 'Prosedur (SOP)', '03': 'Standar' }[stem.slice(0, 2)];
  const kategori = {
    MR: mrType ?? 'Dokumen MR', SOP: 'Prosedur (SOP)', STANDARD: 'Standar', 'INSTRUKSI KERJA': 'Instruksi Kerja',
  }[folder];
  const departemen = folder === 'MR' ? 'MR' : departmentOf(folder === 'SOP'
    ? title.replace(/^SOP /, '')
    : subfolder.replace(/^\d+~\s*/, ''));
  const revisionInFilename = stem.match(/\bREV\s+(\d+)$/i)?.[1];
  const [nomorDokumen, revisi, tglTerbit] = verifiedDocumentHeaders[path] ?? [];
  return {
    id: 'STI-SRC-' + pad(index + 1),
    nama: title,
    kategori,
    departemen,
    folderSumber: folder,
    nomorDokumen,
    revisi: revisi ?? (revisionInFilename ? 'Rev. ' + revisionInFilename : undefined),
    tglTerbit,
    bulanTerbit: tglTerbit?.slice(0, 7),
    format,
    status: 'Belum Diverifikasi',
    sumber: 'DOK ISO STI/' + path,
    salinan: copies.length ? copies.map((copy) => 'DOK ISO STI/' + copy).join(', ') : undefined,
  };
});

export const documentReferences = {
  pestel: ['MR/04~KONTEK ORGANISASI.pdf'],
  executive: ['MR/06~SASARAN MUTU..pdf', 'MR/07~PROGRAM KERJA.pdf', 'STANDARD/MR/STD MR 001 Pedoman Tinjauan Manajemen REV 01.docx'],
  risk: ['MR/05~IDENTIFIKASI RESIKO DAN PELUANG.pdf', 'STANDARD/MR/STD MR 002 Pedoman Identifikasi Risiko dan Peluang.docx'],
  skill: ['MR/08~PENGETAHUAN ORGANISASI.pdf'],
  edoc: ['MR/01~QUALITY MANUAL.pdf', 'MR/02~SOP MR.pdf'],
  audit: ['SOP/SOP AUDIT MUTU INTERNAL.pdf', 'STANDARD/MARKETING/STD PENILAIAN QUESTIONERY.doc'],
  capa: ['MR/02~SOP MR.pdf'],
};
