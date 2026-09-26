let laporanLogoData = ''; 
let jenisLaporan = 'HARIAN';

function initLaporanModule() {
  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  if (document.getElementById('laporan-tanggal')) document.getElementById('laporan-tanggal').value = todayStr;
  if (document.getElementById('laporan-tgl-mulai')) document.getElementById('laporan-tgl-mulai').value = todayStr;
  if (document.getElementById('laporan-tgl-selesai')) document.getElementById('laporan-tgl-selesai').value = todayStr;
  if (document.getElementById('laporan-bulan')) document.getElementById('laporan-bulan').value = String(d.getMonth() + 1);

  loadLaporanSettings();
}

function loadLaporanSettings() {
  const schoolName = localStorage.getItem("SCHOOL_NAME") || "Sekolah";
  const principalName = localStorage.getItem("PRINCIPAL_NAME") || "";
  const principalNip = localStorage.getItem("PRINCIPAL_NIP") || "";
  const tempatTtd = localStorage.getItem("TEMPAT_TTD") || "";
  laporanLogoData = localStorage.getItem("LOGO_KOP") || "";

  if (document.getElementById('laporan-nama-sekolah')) document.getElementById('laporan-nama-sekolah').value = schoolName;
  if (document.getElementById('laporan-nama-kepala')) document.getElementById('laporan-nama-kepala').value = principalName;
  if (document.getElementById('laporan-nip-kepala')) document.getElementById('laporan-nip-kepala').value = principalNip;
  if (document.getElementById('laporan-tempat-ttd')) document.getElementById('laporan-tempat-ttd').value = tempatTtd;

  showLaporanLogo(laporanLogoData);
  renderLaporanIdentity(principalName, principalNip, schoolName);
}

function handleKopFileSelect(ev) {
  const f = ev.target.files && ev.target.files[0];
  if (!f) return;
  if (f.size > 1500000) { alert('Ukuran kop maksimal 1,5 MB.'); ev.target.value = ''; return; }
  const rd = new FileReader();
  rd.onload = () => {
    laporanLogoData = rd.result;
    showLaporanLogo(laporanLogoData);
  };
  rd.readAsDataURL(f);
}

function showLaporanLogo(src) {
  const prev = document.getElementById('laporan-logo-preview');
  const printEl = document.getElementById('laporan-logo-cetak');
  if (prev) prev.innerHTML = src ? `<img src="${src}" alt="Kop sekolah">` : 'Belum ada kop sekolah.';
  if (printEl) printEl.innerHTML = src ? `<img src="${src}" alt="Kop sekolah">` : '';
}

function saveLaporanSettings() {
  const schoolName = document.getElementById('laporan-nama-sekolah').value.trim();
  const principalName = document.getElementById('laporan-nama-kepala').value.trim();
  const principalNip = document.getElementById('laporan-nip-kepala').value.trim();
  const tempatTtd = document.getElementById('laporan-tempat-ttd').value.trim();

  localStorage.setItem("SCHOOL_NAME", schoolName);
  localStorage.setItem("PRINCIPAL_NAME", principalName);
  localStorage.setItem("PRINCIPAL_NIP", principalNip);
  localStorage.setItem("TEMPAT_TTD", tempatTtd);
  if (laporanLogoData) localStorage.setItem("LOGO_KOP", laporanLogoData);

  renderLaporanIdentity(principalName, principalNip, schoolName);

  if (navigator.onLine) {
    fetch(GAS_WEB_APP_URL, {
      method: "POST", mode: "cors", headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "SAVE_SETTINGS",
        settings: {
          SCHOOL_NAME: schoolName,
          PRINCIPAL_NAME: principalName,
          PRINCIPAL_NIP: principalNip,
          TEMPAT_TTD: tempatTtd,
          LOGO_KOP: laporanLogoData
        }
      })
    });
  }
  alert("Pengaturan cetak laporan tersimpan!");
}

function renderLaporanIdentity(nama, nip, sekolah) {
  if (document.getElementById('laporan-kepala-cetak')) document.getElementById('laporan-kepala-cetak').innerText = nama || 'Nama Kepala Sekolah';
  if (document.getElementById('laporan-nip-cetak')) document.getElementById('laporan-nip-cetak').innerText = nip || '-';
  if (document.getElementById('laporan-sekolah-cetak')) document.getElementById('laporan-sekolah-cetak').innerText = sekolah || 'Sekolah';
}

function pilihJenisLaporan(j) {
  jenisLaporan = j;
  document.querySelectorAll('.report-item').forEach(x => x.classList.toggle('active', x.dataset.jenis === j));
  
  if (document.getElementById('laporan-box-tanggal')) document.getElementById('laporan-box-tanggal').classList.toggle('hidden', j !== 'HARIAN');
  if (document.getElementById('laporan-box-mulai')) document.getElementById('laporan-box-mulai').classList.toggle('hidden', j !== 'MINGGUAN');
  if (document.getElementById('laporan-box-selesai')) document.getElementById('laporan-box-selesai').classList.toggle('hidden', j !== 'MINGGUAN');
  if (document.getElementById('laporan-box-bulan')) document.getElementById('laporan-box-bulan').classList.toggle('hidden', j !== 'BULANAN');
  if (document.getElementById('laporan-box-semester')) document.getElementById('laporan-box-semester').classList.toggle('hidden', j !== 'SEMESTER');
  
  if (document.getElementById('laporan-judul-cetak')) document.getElementById('laporan-judul-cetak').innerText = 'LAPORAN ABSENSI ' + j;
}

async function generateLaporanView() {
  const statusEl = document.getElementById('laporan-status-loading');
  if (statusEl) statusEl.innerText = 'Mengambil data laporan...';

  const filter = {
    jenis: jenisLaporan,
    tanggal: document.getElementById('laporan-tanggal').value,
    tanggalMulai: document.getElementById('laporan-tgl-mulai').value,
    tanggalSelesai: document.getElementById('laporan-tgl-selesai').value,
    bulan: document.getElementById('laporan-bulan').value,
    tahun: document.getElementById('laporan-tahun').value,
    semester: document.getElementById('laporan-semester').value,
    kelas: document.getElementById('laporan-kelas').value
  };

  try {
    const url = `${GAS_WEB_APP_URL}?action=GET_LAPORAN_DATA&jenis=${filter.jenis}&tanggal=${filter.tanggal}&tanggalMulai=${filter.tanggalMulai}&tanggalSelesai=${filter.tanggalSelesai}&bulan=${filter.bulan}&tahun=${filter.tahun}&semester=${filter.semester}&kelas=${filter.kelas}`;
    const res = await fetch(url);
    const result = await res.json();
    
    if (statusEl) statusEl.innerText = '';
    if (result && result.success) {
      renderReportTable(result);
    } else {
      alert((result && result.message) || 'Gagal mengambil data laporan.');
    }
  } catch (e) {
    if (statusEl) statusEl.innerText = '';
    alert('Gagal terhubung ke server laporan.');
  }
}

function renderReportTable(r) {
  if (document.getElementById('laporan-judul-cetak')) document.getElementById('laporan-judul-cetak').innerText = 'LAPORAN ABSENSI ' + (r.jenis || jenisLaporan);
  const kelasCetak = document.getElementById('laporan-kelas').value || 'Semua Kelas';
  if (document.getElementById('laporan-filter-cetak')) document.getElementById('laporan-filter-cetak').innerText = 'Kelas: ' + kelasCetak;
  if (document.getElementById('laporan-periode-cetak')) document.getElementById('laporan-periode-cetak').innerText = 'Periode: ' + (r.periode || '-');

  const sum = r.summary || { hadir: 0, terlambat: 0, bolos: 0, alpa: 0, sakit: 0, izin: 0, persentase: 0 };
  if (document.getElementById('kHadir')) document.getElementById('kHadir').innerText = sum.hadir;
  if (document.getElementById('kTerlambat')) document.getElementById('kTerlambat').innerText = sum.terlambat;
  if (document.getElementById('kBolos')) document.getElementById('kBolos').innerText = sum.bolos;
  if (document.getElementById('kAlpa')) document.getElementById('kAlpa').innerText = sum.alpa;
  if (document.getElementById('kSakit')) document.getElementById('kSakit').innerText = sum.sakit;
  if (document.getElementById('kIzin')) document.getElementById('kIzin').innerText = sum.izin;
  if (document.getElementById('kPersen')) document.getElementById('kPersen').innerText = (sum.persentase || 0) + '%';

  const head = document.getElementById('laporan-thead');
  const body = document.getElementById('laporan-tbody');
  const rows = r.rows || r.data || [];

  if (jenisLaporan === 'HARIAN') {
    head.innerHTML = '<tr><th>No.</th><th>NISN</th><th>Nama Siswa</th><th>Absen Pagi</th><th>Status Apel</th><th>Absen Siang</th><th>Keterangan</th></tr>';
    if (!rows.length) { body.innerHTML = '<tr><td colspan="7" class="empty">Belum ada data absensi pada tanggal tersebut.</td></tr>'; return; }
    body.innerHTML = rows.map((x, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${x.nisn || x.nis || '-'}</td>
        <td><b>${x.nama}</b></td>
        <td>${x.jam_pagi || x.pagi || '-'}</td>
        <td>${x.status_pagi === 'TERLAMBAT' ? '<span class="badge-status terlambat">TERLAMBAT</span>' : (x.status_pagi || '-')}</td>
        <td>${x.jam_siang || x.siang || '-'}</td>
        <td><span class="badge-status ${(x.status_akhir || '').toLowerCase()}">${x.status_akhir || '-'}</span></td>
      </tr>
    `).join('');
  } else {
    head.innerHTML = '<tr><th rowspan="2">No.</th><th rowspan="2">NISN</th><th rowspan="2">Nama Siswa</th><th colspan="6" style="text-align:center">Kehadiran</th><th rowspan="2">Persentase</th></tr><tr><th>Hadir</th><th>Izin</th><th>Alpa</th><th>Sakit</th><th>Terlambat</th><th>Bolos</th></tr>';
    if (!rows.length) { body.innerHTML = '<tr><td colspan="10" class="empty">Belum ada data rekap pada periode tersebut.</td></tr>'; return; }
    body.innerHTML = rows.map((x, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${x.nisn || x.nis || '-'}</td>
        <td><b>${x.nama}</b></td>
        <td>${x.hadir || 0}</td>
        <td>${x.izin || 0}</td>
        <td>${x.alpa || 0}</td>
        <td>${x.sakit || 0}</td>
        <td>${x.terlambat || 0}</td>
        <td>${x.bolos || 0}</td>
        <td><b>${(x.persentase || 0)}%</b></td>
      </tr>
    `).join('');
  }
}

function printLaporanView() {
  const d = new Date();
  if (document.getElementById('laporan-tanggal-cetak')) {
    document.getElementById('laporan-tanggal-cetak').innerText = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  if (document.getElementById('laporan-tempat-cetak')) {
    document.getElementById('laporan-tempat-cetak').innerText = (document.getElementById('laporan-tempat-ttd') ? document.getElementById('laporan-tempat-ttd').value : '') || '';
  }
  window.print();
}