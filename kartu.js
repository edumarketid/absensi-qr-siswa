let selectedKartuStudents = new Set();
let logoKartuKiriData = '';
let logoKartuKananData = '';

function initKartuModule() {
  const schoolName = localStorage.getItem("SCHOOL_NAME") || "";
  const warna = localStorage.getItem("WARNA_KARTU") || "biru";
  const bingkai = localStorage.getItem("BINGKAI_KARTU") || "ganda";

  if (document.getElementById('kartu-nama-sekolah')) document.getElementById('kartu-nama-sekolah').value = schoolName;
  if (document.getElementById('kartu-warna')) document.getElementById('kartu-warna').value = warna;
  if (document.getElementById('kartu-bingkai')) document.getElementById('kartu-bingkai').value = bingkai;

  logoKartuKiriData = localStorage.getItem("LOGO_KARTU_KIRI") || "";
  logoKartuKananData = localStorage.getItem("LOGO_KARTU_KANAN") || "";

  showKartuLogo('kiri', logoKartuKiriData);
  showKartuLogo('kanan', logoKartuKananData);

  renderDaftarSiswaKartu();
}

function handleKartuLogoSelect(ev, pos) {
  const f = ev.target.files && ev.target.files[0];
  if (!f) return;
  if (f.size > 1500000) { alert('Ukuran logo maksimal 1,5 MB.'); ev.target.value = ''; return; }
  const r = new FileReader();
  r.onload = () => {
    if (pos === 'kiri') logoKartuKiriData = r.result;
    else logoKartuKananData = r.result;
    showKartuLogo(pos, r.result);
    generateKartuPreview();
  };
  r.readAsDataURL(f);
}

function showKartuLogo(pos, data) {
  const el = document.getElementById(pos === 'kiri' ? 'kartu-prev-kiri' : 'kartu-prev-kanan');
  if (el) el.innerHTML = data ? `<img src="${data}">` : '<span>Belum ada logo</span>';
}

function renderDaftarSiswaKartu() {
  const container = document.getElementById('kartu-students-list');
  if (!container) return;
  const q = (document.getElementById('kartu-cari-siswa') ? document.getElementById('kartu-cari-siswa').value : '').trim().toLowerCase();

  const activeStudents = cachedStudents.filter(s => s.active === undefined || s.active === true);
  const rows = activeStudents.filter(s => ((s.nama || '') + ' ' + (s.nisn || '') + ' ' + (s.id_siswa || '') + ' ' + (s.kelas || '')).toLowerCase().includes(q));

  if (!rows.length) {
    container.innerHTML = '<div class="text-center py-4 text-xs text-gray-400">Tidak ada siswa yang cocok.</div>';
    return;
  }

  let h = '<div class="student-row header"><div></div><div>Nama</div><div>NISN</div><div>Kelas</div><div>ID</div></div>';
  h += rows.map(s => `
    <label class="student-row">
      <div><input type="checkbox" ${selectedKartuStudents.has(s.id_siswa) ? 'checked' : ''} onchange="toggleKartuSiswaSelect('${s.id_siswa}', this.checked)"></div>
      <div><b>${s.nama}</b></div>
      <div>${s.nisn || '-'}</div>
      <div>${s.kelas || '-'}</div>
      <div>${s.id_siswa}</div>
    </label>
  `).join('');
  container.innerHTML = h;
}

function toggleKartuSiswaSelect(id, on) {
  if (on) selectedKartuStudents.add(id);
  else selectedKartuStudents.delete(id);
}

function selectAllKartuStudents() {
  cachedStudents.forEach(s => {
    if (s.active === undefined || s.active === true) selectedKartuStudents.add(s.id_siswa);
  });
  renderDaftarSiswaKartu();
}

function deselectAllKartuStudents() {
  selectedKartuStudents.clear();
  renderDaftarSiswaKartu();
}

function saveKartuSettings() {
  const schoolName = document.getElementById('kartu-nama-sekolah').value.trim();
  const warna = document.getElementById('kartu-warna').value;
  const bingkai = document.getElementById('kartu-bingkai').value;

  localStorage.setItem("SCHOOL_NAME", schoolName);
  localStorage.setItem("WARNA_KARTU", warna);
  localStorage.setItem("BINGKAI_KARTU", bingkai);
  if (logoKartuKiriData) localStorage.setItem("LOGO_KARTU_KIRI", logoKartuKiriData);
  if (logoKartuKananData) localStorage.setItem("LOGO_KARTU_KANAN", logoKartuKananData);

  alert("Pengaturan cetak kartu tersimpan!");
}

function generateKartuPreview() {
  const list = cachedStudents.filter(s => selectedKartuStudents.has(s.id_siswa));
  const area = document.getElementById('kartu-print-area');
  if (!area) return;

  if (!list.length) {
    area.innerHTML = '<div class="text-center py-8 text-xs text-gray-400">Pilih siswa lalu klik "Tampilkan Kartu Terpilih".</div>';
    return;
  }

  const warna = document.getElementById('kartu-warna').value;
  const bingkai = document.getElementById('kartu-bingkai').value;
  const namaSekolah = document.getElementById('kartu-nama-sekolah').value.trim() || 'Sistem Absensi Siswa';

  let html = '';
  for (let p = 0; p < list.length; p += 10) {
    html += '<div class="card-page">';
    list.slice(p, p + 10).forEach(s => html += buildSingleKartuHtml(s, warna, bingkai, namaSekolah));
    html += '</div>';
  }
  area.innerHTML = html;

  requestAnimationFrame(() => list.forEach(s => {
    const el = document.getElementById('qr_' + safeIdStr(s.id_siswa));
    if (el) {
      el.innerHTML = '';
      new QRCode(el, { text: s.qr_key || s.id_siswa, width: 120, height: 120, colorDark: '#000000', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
    }
  }));
}

function safeIdStr(x) { return String(x || '').replace(/[^A-Za-z0-9_-]/g, '_'); }

function buildSingleKartuHtml(s, warna, bingkai, namaSekolah) {
  const logoL = logoKartuKiriData ? `<img class="logo left" src="${logoKartuKiriData}">` : '';
  const logoR = logoKartuKananData ? `<img class="logo right" src="${logoKartuKananData}">` : '';
  
  return `
    <div class="card theme-${warna} frame-${bingkai}">
      <div class="inner-frame"></div>
      <div class="accent-stripe"></div>
      ${logoL}${logoR}
      <div class="school">${namaSekolah}</div>
      <div class="line"></div>
      <div class="line right"></div>
      <div class="title">KARTU PELAJAR</div>
      <div class="photo"><div class="photo-in">FOTO</div></div>
      <div class="details">
        <div class="lbl">NAMA</div>
        <div class="val nama">${s.nama || '-'}</div>
        <div class="lbl">NISN</div>
        <div class="val">${s.nisn || '-'}</div>
        <div class="lbl">TTL</div>
        <div class="val ttl">${s.ttl || '-'}</div>
        <div class="lbl">KELAS</div>
        <div class="val kelas">${s.kelas || '-'}</div>
      </div>
      <div class="qr" id="qr_${safeIdStr(s.id_siswa)}"></div>
      <div class="footer-left">KARTU IDENTITAS SISWA</div>
      <div class="footer-right">${namaSekolah}</div>
    </div>
  `;
}