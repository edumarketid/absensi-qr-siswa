// Ganti URL di bawah ini dengan Web App URL asli dari Google Apps Script Anda
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxVGAsO-sG7E9bHsSxQ-M16EykkO6jc6QpLzDY7sWg9qEHIbpk9Re32IGgDn1qPOmJ_/exec";

// Contoh fungsi Sinkronisasi Antrean Presensi ke Google Sheets
async function syncDataKeSpreadsheet(queueData) {
  if (!queueData || queueData.length === 0) return;
  
  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ 
        action: "SYNC_ATTENDANCE_BATCH", 
        data: queueData 
      })
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Gagal sinkronisasi ke GAS:", error);
  }
}

// Navigasi Menu Utama
function bukaHalamanLaporan() { 
  toggleView('laporan'); 
  if (typeof initLaporanModule === 'function') {
    initLaporanModule();
  }
}

function bukaHalamanCetakQR() { 
  toggleView('kartu'); 
  if (typeof initKartuModule === 'function') {
    initKartuModule();
  }
}

// Fungsi Navigasi Antar Halaman / View
function toggleView(viewName) {
  const views = [
    'scanner', 'success', 'students', 'monitoring', 
    'dashboard', 'about', 'tindak-lanjut', 'hari-libur', 
    'settings', 'promotion', 'edit-students', 'upload-batch', 
    'laporan', 'kartu'
  ];
  
  // Sembunyikan semua halaman
  views.forEach(v => {
    const el = document.getElementById('view-' + v);
    if (el) el.classList.add('hidden');
  });
  
  // Tampilkan halaman tujuan
  const targetView = document.getElementById('view-' + viewName);
  if (targetView) targetView.classList.remove('hidden');

  // Panggil pembaru data sesuai modul yang dibuka
  if (viewName === 'students' && typeof loadStudentsView === 'function') loadStudentsView();
  if (viewName === 'monitoring' && typeof onMonitoringDateChange === 'function') onMonitoringDateChange();
  if (viewName === 'dashboard' && typeof renderDashboardView === 'function') renderDashboardView();
  if (viewName === 'tindak-lanjut' && typeof renderTindakLanjutView === 'function') renderTindakLanjutView();
  if (viewName === 'laporan' && typeof initLaporanModule === 'function') initLaporanModule();
  if (viewName === 'kartu' && typeof initKartuModule === 'function') initKartuModule();
}