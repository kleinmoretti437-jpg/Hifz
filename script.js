// ── GLOBAL HELPER — must be defined before ALL feature scripts ──

// _authToast didefinisikan di sini sebagai window global agar tersedia
// untuk semua script block (skrining, jurnal, refleksi, mood check-in)
// tanpa tergantung urutan eksekusi script block lain di bawah.
window._authToast = function(msg, type) {
    if (typeof showHnToast === 'function') { showHnToast(msg, type); return; }
    const bgMap = { error: '#dc2626', success: '#0d9488', info: '#475569' };
    const bg = bgMap[type] || '#0d9488';
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.cssText = `
        position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
        background:${bg};color:#fff;
        padding:12px 24px;border-radius:50px;font-size:0.85rem;font-weight:600;
        z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.15);
        animation:fadeInUp 0.3s ease;font-family:'Poppins',sans-serif;
        white-space:nowrap;max-width:90vw;text-overflow:ellipsis;overflow:hidden;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3500);
};

function renderIconHtml(icon, size, color) {
    size = size || '1.4rem';
    color = color || 'inherit';
    if (icon && icon.startsWith('fa-')) {
        return '<i class="fas ' + icon + '" style="font-size:' + size + ';color:' + color + ';"></i>';
    }
    return '<span style="font-size:' + size + ';">' + (icon||'') + '</span>';
}

const SPA_PAGES = ['beranda','fitur','fitur-a','fitur-b','fitur-c','fitur-d','fitur-alert','fitur-ruh','fitur-ruh-a','fitur-ruh-b','tentang',
                   'hub-a','hub-b','hub-alert','hub-d','hub-ruh','kontak','terms','privacy'];

// Mapping: saat klik dari beranda → tampilkan hub dulu
const HUB_MAP = {
    'fitur-b':     'hub-b',
    'fitur-alert': 'hub-alert',
    'fitur-d':     'hub-d',
    'fitur-ruh':   'hub-ruh',
    'fitur-ruh-a': 'hub-ruh',
    'fitur-ruh-b': 'hub-ruh',
    'fitur-a':     'hub-a',
};

// Apakah navigasi berasal dari beranda (bukan dari hub sendiri)
let _fromBeranda = false;

function navigateTo(pageId, skipHub) {
    // Normalize: strip 'page-' prefix untuk lookup di SPA_PAGES
    const normalId = pageId.replace(/^page-/, '');

// Jika navigasi ke fitur utama → SELALU tampilkan hub terlebih dahulu
// (kecuali skipHub=true, yaitu saat dari hub subcard sendiri)
if (!skipHub && HUB_MAP[normalId]) {
    const hubId = HUB_MAP[normalId];
    _showPage(hubId);
    window._lastPage = hubId;
    history.pushState({ page: pageId, hub: hubId }, '', '#' + hubId);
    return;
}

    _showPage(normalId);
    window._lastPage = normalId;
    history.pushState({ page: pageId }, '', '#' + normalId);
}

function _showPage(normalId) {
    SPA_PAGES.forEach(id => {
        const el = document.getElementById('page-' + id);
        if (el) el.classList.remove('active');
    });
    const target = document.getElementById('page-' + normalId);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (normalId === 'beranda') {
            _fromBeranda = true;
            setTimeout(() => { if (window._dashChart) window._dashChart.resize(); }, 400);
        } else {
            _fromBeranda = false;
        }

        if (normalId === 'fitur-b') {
            setTimeout(() => { if (window._miniChart) window._miniChart.resize(); }, 400);
        }
    }
}
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.page) navigateTo(e.state.page, true);
});

// ── Label helpers for breadcrumb active labels ──
window.setFiturBLabel = function(label) {
    const el = document.getElementById('fitur-b-active-label');
    if (el) el.textContent = label;
};
window.setSupportLabel = function(label) {
    const el = document.getElementById('fitur-a-active-label');
    if (el) el.textContent = label;
};
window.setEduLabel = function(label) {
    const el = document.getElementById('fitur-d-active-label');
    if (el) el.textContent = label;
};

// ── Hub subcard navigation: from hub directly to feature page (no hub redirect) ──
window.hubGoTo = function(pageId, tabFn, tabArg) {
    _showPage(pageId);
    window._lastPage = pageId;
    history.pushState({ page: pageId }, '', '#' + pageId);
    if (tabFn && tabArg) {
        setTimeout(function() {
            if (typeof window[tabFn] === 'function') window[tabFn](tabArg);
        }, 200);
    }
};
// Initialize lastPage
window._lastPage = 'beranda';

// Handle direct URL hash on load
window.addEventListener('load', () => {
    const hash = location.hash.replace('#','');
    const allValid = ['fitur','fitur-a','fitur-b','fitur-c','fitur-d','fitur-alert','fitur-ruh','fitur-ruh-a','fitur-ruh-b','page-dashboard','page-tentang',
                      'hub-a','hub-b','hub-alert','hub-d','hub-ruh'];
    if (hash && allValid.includes(hash)) {
        // Direct URL → go straight to target, no hub redirect
        _showPage(hash.replace(/^page-/,''));
        window._lastPage = hash;
    }
});
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
});

function closeMobileNav() {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('active');
}

// ===== MOBILE FITUR BOTTOM SHEET =====
window.openMobileFiturSheet = function() {
    closeMobileNav();
    const overlay = document.getElementById('mobileFiturOverlay');
    const sheet = document.getElementById('mobileFiturSheet');
    overlay.style.display = 'block';
    sheet.style.display = 'block';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            sheet.style.transform = 'translateY(0)';
        });
    });
    document.body.style.overflow = 'hidden';
};

window.closeMobileFiturSheet = function() {
    const overlay = document.getElementById('mobileFiturOverlay');
    const sheet = document.getElementById('mobileFiturSheet');
    overlay.style.opacity = '0';
    sheet.style.transform = 'translateY(100%)';
    setTimeout(() => {
        overlay.style.display = 'none';
        sheet.style.display = 'none';
        document.body.style.overflow = '';
    }, 380);
};

function createMoodMiniChart() {
    const ctx = document.getElementById('moodMiniChart');
    if (!ctx) return;
    const _existing = Chart.getChart(ctx);
    if (_existing) _existing.destroy();
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
            datasets: [{
                label: 'Mood',
                data: [58, 65, 70, 63, 75, null, null],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139,92,246,0.1)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                spanGaps: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(26,26,46,0.85)', titleFont: { family: 'Poppins', size: 11 }, bodyFont: { family: 'Poppins', size: 11 }, padding: 8, cornerRadius: 8 } },
            scales: {
                y: { beginAtZero: false, min: 40, max: 100, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Poppins', size: 10 } } },
                x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 10 } } }
            }
        }
    });
}

function selectMood(btn) {
    btn.closest('.mood-emoji-row').querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

window.addEventListener('load', createMoodMiniChart);
function revealElements() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => {
        const windowHeight = window.innerHeight;
        const elementTop = el.getBoundingClientRect().top;
        const revealPoint = 120;

        if (elementTop < windowHeight - revealPoint) {
            el.classList.add('active');
        }
    });
}

window.addEventListener('scroll', revealElements);
window.addEventListener('load', revealElements);
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

const updateCounter = () => {
    current += step;
    if (current < target) {
        counter.textContent = Math.floor(current).toLocaleString() + suffix;
        requestAnimationFrame(updateCounter);
    } else {
        counter.textContent = target.toLocaleString() + suffix;
    }
};

// Check if element is in viewport
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            updateCounter();
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

        observer.observe(counter);
    });
}

animateCounters();
function animateProgressBars() {
    const progressFills = document.querySelectorAll('.progress-fill');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('data-width');
                entry.target.style.width = width + '%';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    progressFills.forEach(bar => observer.observe(bar));
}

animateProgressBars();
window._dashChart = null;
window._miniChart = null;

function createMoodChart() {
    const ctx = document.getElementById('moodChart');
    if (!ctx) return;
    if (window._dashChart) { window._dashChart.destroy(); window._dashChart = null; }

    window._dashChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
            datasets: [
                {
                    label: 'Mood',
                    data: [65, 72, 68, 80, 75, 85, 82],
                    borderColor: '#0d9488',
                    backgroundColor: 'rgba(13, 148, 136, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#0d9488',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Resiliensi',
                    data: [60, 65, 70, 72, 78, 76, 80],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.05)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            family: 'Poppins',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.9)',
                    titleFont: { family: 'Poppins' },
                    bodyFont: { family: 'Poppins' },
                    padding: 12,
                    cornerRadius: 10
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 40,
                    max: 100,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    ticks: {
                        font: { family: 'Poppins', size: 11 }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: { family: 'Poppins', size: 11 }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// createMoodChart dipanggil saat navigateTo('page-dashboard'), bukan saat load
(function() {
    // State
    const DAYS = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
    const MOOD_EMOJIS = ['','😔','😕','😐','🙂','😄'];
    const MOOD_LABELS = ['','Sangat Buruk','Kurang Baik','Biasa Saja','Lumayan Baik','Sangat Baik'];
    const MOOD_MSGS = [
        '',
        'Tidak apa-apa, kamu tidak sendirian. Ceritakan di Ruang Anonim jika perlu.',
        'Semoga harimu membaik. Coba tarik napas perlahan ·',
        'Hari yang biasa itu juga berharga. Terus semangat!',
        'Bagus! Pertahankan energi positifmu hari ini!',
        'Luar biasa! Sebarkan energimu ke komunitas ya!'
    ];

// Seed data: last 6 days + today placeholder
let moodData = [3, 4, 2, 5, 3, 4, null];
let resiliData = [3, 3, 3, 4, 4, 4, null];
let selectedMoodVal = null;
let selectedTags = [];
let refleksiList = [
    { date: 'Kamis, kemarin', emoji: '😄', tag: 'Akademik', text: 'Presentasi berjalan lancar! Akhirnya kerja keras seminggu terbayar. Lega banget rasanya.' },
    { date: 'Rabu, 2 hari lalu', emoji: '😔', tag: 'Relasi Sosial', text: 'Hari ini agak berat. Ada salah paham sama teman, semoga bisa beres besok...' }
];
let moodChartInstance = null;

// Init on load
window.addEventListener('load', function() {
    renderDate();
    renderStreak();
    renderRefleksiList();
    initMoodChart();
    renderSummary();
    document.getElementById('refleksiInput').addEventListener('input', function() {
        const len = Math.min(this.value.length, 300);
        this.value = this.value.slice(0, 300);
        document.getElementById('charCount').textContent = len + ' / 300';
    });
});

function renderDate() {
    const d = new Date();
    const opts = { weekday:'long', day:'numeric', month:'long', year:'numeric' };
    document.getElementById('moodDateLabel').textContent = d.toLocaleDateString('id-ID', opts);
}

function renderStreak() {
    const row = document.getElementById('streakRow');
    if (!row) return;
    const today = new Date().getDay();
    row.innerHTML = '';
    DAYS.forEach((day, i) => {
        const val = moodData[i];
        const isToday = i === 6;
        const done = val !== null && !isToday;
        const div = document.createElement('div');
        div.style.cssText = `width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:${done?'16px':'11px'};font-weight:600;transition:all .3s;`;
        if (done) {
            div.style.background = 'linear-gradient(135deg,#0d9488,#06b6d4)';
            div.style.color = 'white';
            div.title = MOOD_LABELS[val] || '';
            div.textContent = MOOD_EMOJIS[val];
        } else if (isToday) {
            div.style.border = '2px solid var(--primary)';
            div.style.background = 'rgba(13,148,136,0.1)';
            div.style.color = 'var(--primary)';
            div.textContent = moodData[6] ? MOOD_EMOJIS[moodData[6]] : day;
        } else {
            div.style.background = 'rgba(13,148,136,0.08)';
            div.style.color = 'var(--text-light)';
            div.textContent = day;
        }
        row.appendChild(div);
    });
}

function initMoodChart() {
    const ctx = document.getElementById('moodMiniChart');
    if (!ctx) return;
    const _existing = Chart.getChart(ctx);
    if (_existing) _existing.destroy();
    const labels = DAYS.slice(0,6).concat(['Hari Ini']);
    window._miniChart = moodChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Mood',
                    data: [...moodData],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139,92,246,0.08)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: moodData.map(v => v ? '#8b5cf6' : 'transparent'),
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: moodData.map(v => v ? 5 : 0),
                    pointHoverRadius: 7,
                    spanGaps: false
                },
                {
                    label: 'Resiliensi',
                    data: [...resiliData],
                    borderColor: '#0d9488',
                    backgroundColor: 'rgba(13,148,136,0.05)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: resiliData.map(v => v ? '#0d9488' : 'transparent'),
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: resiliData.map(v => v ? 5 : 0),
                    pointHoverRadius: 7,
                    spanGaps: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(26,26,46,0.9)',
                    titleFont: { family: 'Poppins', size: 11 },
                    bodyFont: { family: 'Poppins', size: 11 },
                    padding: 10, cornerRadius: 10,
                    callbacks: {
                        label: c => ' ' + c.dataset.label + ': ' + (MOOD_LABELS[c.raw] || '-')
                    }
                }
            },
            scales: {
                y: {
                    min: 1, max: 5,
                    ticks: { stepSize: 1, font: { family: 'Poppins', size: 11 }, callback: v => MOOD_EMOJIS[v] || v },
                    grid: { color: 'rgba(0,0,0,0.04)' }
                },
                x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 11 } } }
            }
        }
    });
}

function updateChart() {
    const c = window._miniChart;
    if (!c) return;
    c.data.datasets[0].data = [...moodData];
    c.data.datasets[0].pointRadius = moodData.map(v => v ? 5 : 0);
    c.data.datasets[0].pointBackgroundColor = moodData.map(v => v ? '#8b5cf6' : 'transparent');
    c.data.datasets[1].data = [...resiliData];
    c.data.datasets[1].pointRadius = resiliData.map(v => v ? 5 : 0);
    c.data.datasets[1].pointBackgroundColor = resiliData.map(v => v ? '#0d9488' : 'transparent');
    c.update('active');
}

function renderSummary() {
    const el = document.getElementById('moodSummaryRow');
    if (!el) return;
    const validMood = moodData.filter(v => v !== null);
    const validResili = resiliData.filter(v => v !== null);
    const avgMood = validMood.length ? (validMood.reduce((a,b)=>a+b,0)/validMood.length).toFixed(1) : '-';
    const avgResili = validResili.length ? (validResili.reduce((a,b)=>a+b,0)/validResili.length).toFixed(1) : '-';
    const bestMood = validMood.length ? Math.max(...validMood) : null;
    el.innerHTML = `
        <div style="background:rgba(139,92,246,0.07);border-radius:14px;padding:14px;text-align:center;">
            <div style="font-size:1.6rem;">${bestMood ? MOOD_EMOJIS[bestMood] : '—'}</div>
            <div style="font-size:0.7rem;color:var(--text-gray);margin-top:4px;font-weight:600;">Mood Terbaik</div>
            <div style="font-size:0.75rem;color:#8b5cf6;font-weight:700;">${bestMood ? MOOD_LABELS[bestMood] : '-'}</div>
        </div>
        <div style="background:rgba(13,148,136,0.07);border-radius:14px;padding:14px;text-align:center;">
            <div style="font-size:1.4rem;font-weight:800;color:#0d9488;">${avgMood}</div>
            <div style="font-size:0.7rem;color:var(--text-gray);margin-top:4px;font-weight:600;">Rata-rata Mood</div>
            <div style="font-size:0.75rem;color:var(--text-gray);">dari skala 5</div>
        </div>
        <div style="background:rgba(16,185,129,0.07);border-radius:14px;padding:14px;text-align:center;">
            <div style="font-size:1.4rem;font-weight:800;color:#10b981;">${avgResili}</div>
            <div style="font-size:0.7rem;color:var(--text-gray);margin-top:4px;font-weight:600;">Rata-rata Resiliensi</div>
            <div style="font-size:0.75rem;color:var(--text-gray);">dari skala 5</div>
        </div>
    `;
}

function renderRefleksiList() {
    const el = document.getElementById('refleksiList');
    if (!el) return;
    if (!refleksiList.length) {
        el.innerHTML = '<p style="font-size:0.8rem;color:var(--text-light);text-align:center;padding:16px 0;">Belum ada refleksi. Mulai tulis hari ini!</p>';
        return;
    }
    el.innerHTML = refleksiList.map(r => `
        <div style="background:white;border-radius:12px;padding:14px 16px;border:1px solid rgba(139,92,246,0.1);box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="font-size:0.72rem;color:var(--text-light);">${r.date}</span>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:0.7rem;padding:3px 10px;border-radius:50px;background:rgba(139,92,246,0.1);color:#8b5cf6;font-weight:600;">${r.tag || ''}</span>
                    ${r.id ? `<button onclick="deleteRefleksi('${r.id}')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:0.8rem;padding:4px 8px;border-radius:6px;transition:background 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.1)'" onmouseout="this.style.background='none'" title="Hapus"><i class="fas fa-trash-alt"></i></button>` : ''}
                </div>
            </div>
            <div style="display:flex;gap:10px;align-items:flex-start;">
                <span style="font-size:1.3rem;">${r.emoji}</span>
                <p style="font-size:0.82rem;color:var(--text-gray);font-style:italic;line-height:1.6;">"${r.text}"</p>
            </div>
        </div>
    `).join('');
}

// Exposed functions
window.moodSwitchTab = function(tab) {
    ['checkin','skrining','refleksi'].forEach(t => {
        const panel = document.getElementById('panel-'+t);
        if (panel) panel.style.display = t===tab ? 'block' : 'none';
        const btn = document.getElementById('tab-'+t);
        if (btn) {
            if (t===tab) {
                btn.style.color = 'var(--primary)';
                btn.style.borderBottom = '3px solid var(--primary)';
            } else {
                btn.style.color = 'var(--text-gray)';
                btn.style.borderBottom = '3px solid transparent';
            }
        }
        // Sync horizontal topnav
        const sfbtn = document.getElementById('sfnav-b-'+t);
        if (sfbtn) {
            sfbtn.classList.toggle('active', t===tab);
        }
    });

};

// ===== SKRINING KESEHATAN MENTAL =====
// Instrumen 10 item, skala Likert 1–7
// Item positif (1,2,3,8,9): reverse:false → skor = 8-rawVal (SS=7, STS=1) → skor tinggi = BAIK
// Item negatif (4,5,6,7,10): reverse:true  → skor = rawVal  (SS=1, STS=7) → skor tinggi = BAIK
const SKRINING_QUESTIONS = [
    {
        id: 'q1',
        num: 1,
        icon: 'fas fa-heart',
        label: 'Kepribadian',
        text: 'Saya menyukai sebagian besar kepribadian saya',
        reverse: false
    },
    {
        id: 'q2',
        num: 2,
        icon: 'fas fa-road',
        label: 'Perjalanan Hidup',
        text: 'Ketika saya mengingat perjalanan hidup saya, saya merasa puas dengan apa yang terjadi sejauh ini',
        reverse: false
    },
    {
        id: 'q3',
        num: 3,
        icon: 'fas fa-bullseye',
        label: 'Tujuan Hidup',
        text: 'Beberapa orang menjalani hidup tanpa tujuan, tapi saya bukan bagian dari mereka',
        reverse: false
    },
    {
        id: 'q4',
        num: 4,
        icon: 'fas fa-weight-hanging',
        label: 'Tuntutan Hidup',
        text: 'Tuntutan hidup sehari-hari kadang membuat saya terpuruk',
        reverse: true
    },
    {
        id: 'q5',
        num: 5,
        icon: 'fas fa-medal',
        label: 'Pencapaian',
        text: 'Dalam beberapa hal, saya merasa kecewa dengan pencapaian saya',
        reverse: true
    },
    {
        id: 'q6',
        num: 6,
        icon: 'fas fa-users',
        label: 'Hubungan Dekat',
        text: 'Menurut saya, mempertahankan hubungan dekat itu sulit dan membuat frustrasi',
        reverse: true
    },
    {
        id: 'q7',
        num: 7,
        icon: 'fas fa-hourglass-half',
        label: 'Orientasi Masa Depan',
        text: 'Saya menjalani hidup hari ini dan tidak terlalu memikirkan masa depan',
        reverse: true
    },
    {
        id: 'q8',
        num: 8,
        icon: 'fas fa-user-check',
        label: 'Tanggung Jawab',
        text: 'Secara umum, saya merasa bertanggung jawab atas kondisi saya sekarang',
        reverse: false
    },
    {
        id: 'q9',
        num: 9,
        icon: 'fas fa-tasks',
        label: 'Manajemen Diri',
        text: 'Saya pandai dalam mengatur tanggung jawab harian saya',
        reverse: false
    },
    {
        id: 'q10',
        num: 10,
        icon: 'fas fa-flag-checkered',
        label: 'Pemenuhan Hidup',
        text: 'Kadang-kadang saya merasa bahwa saya telah melakukan semua yang harus saya lakukan dalam hidup',
        reverse: true
    }
];

// Pilihan Likert 1–7 (urutan dari Sangat Setuju ke Sangat Tidak Setuju)
// val = nilai mentah pilihan (1=SS, 7=STS)
const LIKERT_OPTIONS = [
    { val: 1, text: 'Sangat Setuju',       color: '#10b981' },
    { val: 2, text: 'Setuju',               color: '#34d399' },
    { val: 3, text: 'Agak Setuju',          color: '#a3e635' },
    { val: 4, text: 'Ragu-Ragu',            color: '#f59e0b' },
    { val: 5, text: 'Agak Tidak Setuju',    color: '#f97316' },
    { val: 6, text: 'Tidak Setuju',         color: '#ef4444' },
    { val: 7, text: 'Sangat Tidak Setuju',  color: '#dc2626' }
];

// Fungsi scoring:
// Item POSITIF (reverse:false): SS=7 (baik), STS=1 (buruk) → skor = 8 - rawVal
// Item NEGATIF (reverse:true):  SS=1 (buruk), STS=7 (baik) → skor = rawVal
// Dengan demikian skor tinggi = kondisi mental lebih baik
function skriningScore(rawVal, isReverse) {
    return isReverse ? rawVal : (8 - rawVal);
}

// Kategori berdasarkan total skor 10–70
const SKRINING_CATEGORIES = [
    { label: 'Rendah',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.3)',    icon: 'fas fa-heart-pulse',       desc: 'Berdasarkan jawaban yang kamu berikan, skor kondisi mental hari ini berada pada kategori rendah. Ini bukan diagnosis, namun menjadi sinyal untuk memberikan perhatian lebih pada dirimu. Pertimbangkan untuk berbicara dengan orang yang kamu percaya atau konselor.' },
    { label: 'Sedang', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.3)',   icon: 'fas fa-exclamation-circle', desc: 'Berdasarkan jawaban yang kamu berikan, skor kondisi mental hari ini berada pada kategori sedang. Ada beberapa aspek yang bisa lebih diperhatikan. Jaga pola istirahat, luangkan waktu untuk diri sendiri, dan tetap terhubung dengan orang-orang terdekatmu.' },
    { label: 'Tinggi', color: '#10b981', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.3)',   icon: 'fas fa-leaf',               desc: 'Berdasarkan jawaban yang kamu berikan, skor kondisi mental hari ini berada pada kategori tinggi. Kondisimu saat ini tampak cukup baik. Pertahankan kebiasaan positifmu dan terus jaga keseimbangan hidup.' }
];

function getSkriningCategory(totalScore) {
    if (totalScore > 50) return SKRINING_CATEGORIES[2]; // Tinggi
    if (totalScore > 30) return SKRINING_CATEGORIES[1]; // Sedang
    return SKRINING_CATEGORIES[0];                        // Rendah
}

let skriningAnswers = {}; // { qId: rawVal (1–7) }
let skriningCurrent = 0;

window.mulaiSkrining = function() {
    skriningAnswers = {};
    skriningCurrent = 0;
    document.getElementById('skrining-intro').style.display = 'none';
    document.getElementById('skrining-result').style.display = 'none';
    document.getElementById('skrining-question').style.display = 'block';
    renderSkriningQuestion();
};

function renderSkriningQuestion() {
    const q = SKRINING_QUESTIONS[skriningCurrent];
    const total = SKRINING_QUESTIONS.length;
    document.getElementById('skrining-step-label').textContent = q.label;
    document.getElementById('skrining-progress-text').textContent = (skriningCurrent+1) + ' / ' + total;
    document.getElementById('skrining-progress-bar').style.width = ((skriningCurrent+1)/total*100) + '%';
    document.getElementById('skrining-q-icon').className = q.icon;
    document.getElementById('skrining-q-text').textContent = q.text;
    // Tampilkan nomor soal + keterangan arah item
    const dirLabel = q.reverse ? '(item negatif)' : '(item positif)';
    document.getElementById('skrining-q-desc').textContent = 'Pernyataan ' + q.num + ' dari ' + total + ' · ' + dirLabel;
    const prevBtn = document.getElementById('skrining-prev-btn');
    const nextBtn = document.getElementById('skrining-next-btn');
    prevBtn.style.display = skriningCurrent > 0 ? 'block' : 'none';
    const opts = document.getElementById('skrining-options');
    opts.innerHTML = '';
    LIKERT_OPTIONS.forEach(opt => {
        const btn = document.createElement('button');
        const isSelected = skriningAnswers[q.id] === opt.val;
        btn.style.cssText = `width:100%;padding:10px 14px;border-radius:12px;border:2px solid ${isSelected ? opt.color : 'rgba(139,92,246,0.15)'};background:${isSelected ? opt.color+'18' : 'white'};font-family:'Poppins',sans-serif;font-size:0.82rem;font-weight:${isSelected?'700':'500'};color:${isSelected ? opt.color : 'var(--text-dark)'};cursor:pointer;text-align:left;transition:all .25s;display:flex;align-items:center;gap:10px;`;
        btn.innerHTML = `<span style="width:20px;height:20px;border-radius:50%;border:2px solid ${opt.color};background:${isSelected ? opt.color : 'white'};display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">${isSelected ? '<i class="fas fa-check" style="color:white;font-size:9px;"></i>' : ''}</span>${opt.text}`;
        btn.onclick = function() {
            skriningAnswers[q.id] = opt.val;
            renderSkriningQuestion();
            nextBtn.style.opacity = '1';
            nextBtn.style.pointerEvents = 'auto';
        };
        opts.appendChild(btn);
    });
    const answered = skriningAnswers[q.id] !== undefined;
    nextBtn.style.opacity = answered ? '1' : '0.4';
    nextBtn.style.pointerEvents = answered ? 'auto' : 'none';
    nextBtn.innerHTML = skriningCurrent === total-1
        ? '<i class="fas fa-check" style="margin-right:6px;"></i>Lihat Hasil'
        : 'Lanjut <i class="fas fa-chevron-right" style="margin-left:6px;"></i>';
}

window.skriningNext = function() {
    const q = SKRINING_QUESTIONS[skriningCurrent];
    if (skriningAnswers[q.id] === undefined) return;
    if (skriningCurrent < SKRINING_QUESTIONS.length - 1) {
        skriningCurrent++;
        renderSkriningQuestion();
    } else {
        showSkriningResult();
    }
};

window.skriningPrev = function() {
    if (skriningCurrent > 0) {
        skriningCurrent--;
        renderSkriningQuestion();
    }
};

async function showSkriningResult() {
    document.getElementById('skrining-question').style.display = 'none';
    document.getElementById('skrining-result').style.display = 'block';

// Hitung skor per item dengan reverse scoring
const itemScores = {};
SKRINING_QUESTIONS.forEach(q => {
    const rawVal = skriningAnswers[q.id] || 1;
    itemScores[q.id] = skriningScore(rawVal, q.reverse);
});

// Total skor (rentang 10–70)
const totalScore = Object.values(itemScores).reduce((a,b)=>a+b, 0);
const cat = getSkriningCategory(totalScore);

// Tanggal screening
const tanggalScreening = new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' });

document.getElementById('skrining-result-badge').style.cssText = `border-radius:20px;padding:24px;text-align:center;margin-bottom:20px;background:${cat.bg};border:2px solid ${cat.border};`;
document.getElementById('skrining-result-badge').innerHTML = `
    <div style="width:56px;height:56px;background:${cat.color};border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;box-shadow:0 6px 20px ${cat.color}40;">
        <i class="${cat.icon}" style="color:white;font-size:1.4rem;"></i>
    </div>
    <div style="font-size:0.7rem;color:var(--text-light);margin-bottom:4px;">Kondisi Mental Hari Ini</div>
    <div style="font-size:1.2rem;font-weight:800;color:${cat.color};margin-bottom:6px;">${cat.label}</div>
    <div style="font-size:0.82rem;font-weight:700;color:${cat.color};">Skor: ${totalScore}/70</div>
    <div style="font-size:0.68rem;color:var(--text-light);margin-top:4px;">${tanggalScreening}</div>
`;

// Detail skor per item
const detailEl = document.getElementById('skrining-result-detail');
detailEl.innerHTML = '';
SKRINING_QUESTIONS.forEach(q => {
    const rawVal = skriningAnswers[q.id] || 1;
    const scored = itemScores[q.id];
    const optLabel = LIKERT_OPTIONS.find(o => o.val === rawVal)?.text || '-';
    const optColor = LIKERT_OPTIONS.find(o => o.val === rawVal)?.color || '#64748b';
    const reverseTag = q.reverse ? '<span style="font-size:0.6rem;color:#8b5cf6;background:rgba(139,92,246,0.1);padding:1px 5px;border-radius:4px;margin-left:4px;">reverse</span>' : '';
    detailEl.innerHTML += `
        <div style="background:white;border-radius:12px;padding:10px 14px;display:flex;align-items:center;gap:12px;border:1px solid rgba(0,0,0,0.06);">
            <i class="${q.icon}" style="color:${optColor};width:18px;text-align:center;flex-shrink:0;font-size:0.85rem;"></i>
            <div style="flex:1;min-width:0;">
                <div style="font-size:0.78rem;font-weight:600;color:var(--text-dark);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${q.num}. ${q.label}${reverseTag}</div>
                <div style="font-size:0.68rem;color:var(--text-gray);">${optLabel}</div>
            </div>
            <span style="font-size:0.75rem;padding:3px 10px;border-radius:50px;background:${optColor}18;color:${optColor};font-weight:800;flex-shrink:0;">${scored}</span>
        </div>`;
});

document.getElementById('skrining-result-saran').innerHTML = `
    <p style="font-size:0.8rem;font-weight:700;color:var(--text-dark);margin-bottom:8px;"><i class="fas fa-lightbulb" style="color:#f59e0b;margin-right:6px;"></i>Hasil Screening</p>
    <p style="font-size:0.82rem;color:var(--text-gray);line-height:1.7;">${cat.desc}</p>
    <p style="font-size:0.72rem;color:var(--text-light);margin-top:10px;"><i class="fas fa-info-circle" style="margin-right:4px;"></i>Hasil screening ini bukan diagnosis medis atau psikologis. Untuk konsultasi lebih lanjut, hubungi profesional kesehatan mental.</p>
`;

    // Simpan hasil skrining ke Supabase jika sudah login
    try {
        const { data: { user } } = await window._sb.auth.getUser();
        if (user) {
            const uid = user.id;
            // Simpan: tanggal, jawaban raw, skor per item, total skor, kategori
            const detail = {};
            SKRINING_QUESTIONS.forEach(q => {
                detail[q.id] = {
                    jawaban: skriningAnswers[q.id] ?? 1,
                    skor: itemScores[q.id],
                    reverse: q.reverse
                };
            });
            await window._sb.from('hn_skrining_results').insert({
                user_id: uid,
                answers: detail,
                total_score: totalScore,
                kategori: cat.label
            });
            _authToast('☁️ Hasil skrining tersimpan ke cloud', 'success');
            if (window.refreshDashboard) window.refreshDashboard();
        } else {
            _authToast('💾 Hasil skrining tersimpan lokal · Login untuk simpan permanen', 'info');
        }
    } catch (err) {
        console.warn('showSkriningResult Supabase error:', err);
        _authToast('Gagal menyimpan hasil skrining ke cloud.', 'error');
    }
}

window.resetSkrining = function() {
    document.getElementById('skrining-result').style.display = 'none';
    document.getElementById('skrining-intro').style.display = 'block';
};

// ===== HIFZ JOURNAL =====
let journalEntries = [];

function renderJournalList() {
    const el = document.getElementById('journalList');
    if (!el) return;
    if (!journalEntries.length) {
        el.innerHTML = '<p style="font-size:0.8rem;color:var(--text-light);text-align:center;padding:16px 0;"><i class="fas fa-pen-to-square" style="margin-right:6px;"></i>Belum ada entri. Mulai tulis hari ini!</p>';
        return;
    }
    el.innerHTML = journalEntries.map((e,i) => `
        <div style="background:white;border-radius:14px;padding:16px;border:1px solid rgba(245,158,11,0.15);box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <span style="font-size:0.72rem;color:var(--text-light);"><i class="fas fa-calendar" style="margin-right:5px;"></i>${e.date}</span>
                ${e.id ? `<button onclick="deleteJurnal('${e.id}')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:0.8rem;padding:4px 8px;border-radius:6px;transition:background 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.1)'" onmouseout="this.style.background='none'" title="Hapus"><i class="fas fa-trash-alt"></i></button>` : ''}
            </div>
            <div style="display:grid;gap:8px;">
                ${e.rasakan ? `<div style="padding:8px 12px;background:rgba(245,158,11,0.07);border-radius:8px;border-left:3px solid #f59e0b;"><span style="font-size:0.7rem;font-weight:700;color:#f59e0b;display:block;margin-bottom:2px;">Dirasakan</span><p style="font-size:0.8rem;color:var(--text-gray);margin:0;line-height:1.6;">${e.rasakan}</p></div>` : ''}
                ${e.terjadi ? `<div style="padding:8px 12px;background:rgba(16,185,129,0.07);border-radius:8px;border-left:3px solid #10b981;"><span style="font-size:0.7rem;font-weight:700;color:#10b981;display:block;margin-bottom:2px;">Terjadi</span><p style="font-size:0.8rem;color:var(--text-gray);margin:0;line-height:1.6;">${e.terjadi}</p></div>` : ''}
                ${e.pikirkan ? `<div style="padding:8px 12px;background:rgba(99,102,241,0.07);border-radius:8px;border-left:3px solid #6366f1;"><span style="font-size:0.7rem;font-weight:700;color:#6366f1;display:block;margin-bottom:2px;">Dipikirkan</span><p style="font-size:0.8rem;color:var(--text-gray);margin:0;line-height:1.6;">${e.pikirkan}</p></div>` : ''}
                ${e.lakukan ? `<div style="padding:8px 12px;background:rgba(236,72,153,0.07);border-radius:8px;border-left:3px solid #ec4899;"><span style="font-size:0.7rem;font-weight:700;color:#ec4899;display:block;margin-bottom:2px;">Dilakukan</span><p style="font-size:0.8rem;color:var(--text-gray);margin:0;line-height:1.6;">${e.lakukan}</p></div>` : ''}
            </div>
        </div>
    `).join('');
}

window.simpanJournal = async function() {
    const rasakan = document.getElementById('journal-rasakan').value.trim();
    const terjadi = document.getElementById('journal-terjadi').value.trim();
    const pikirkan = document.getElementById('journal-pikirkan').value.trim();
    const lakukan = document.getElementById('journal-lakukan').value.trim();
    const msgEl = document.getElementById('journal-save-msg');
    if (!rasakan && !terjadi && !pikirkan && !lakukan) {
        msgEl.textContent = 'Isi minimal satu kolom untuk menyimpan.';
        msgEl.style.color = '#ef4444';
        setTimeout(()=>msgEl.textContent='',2500);
        return;
    }
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'}) + ', ' + now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
    journalEntries.unshift({ date: dateStr, rasakan, terjadi, pikirkan, lakukan });
    ['journal-rasakan','journal-terjadi','journal-pikirkan','journal-lakukan'].forEach(id => { document.getElementById(id).value=''; });
    msgEl.textContent = 'Entri journal tersimpan!';
    msgEl.style.color = '#f59e0b';
    setTimeout(()=>msgEl.textContent='',2500);
    renderJournalList();
    // Simpan ke Supabase jika sudah login
    try {
        const { data: { user } } = await window._sb.auth.getUser();
        if (user) {
            const uid = user.id;
            const isi = [rasakan, terjadi, pikirkan, lakukan].filter(Boolean).join('\n---\n');
            const judul = rasakan ? rasakan.substring(0, 80) : (terjadi ? terjadi.substring(0, 80) : 'Jurnal');
            await window._sb.from('hn_journal_entries').insert({
                user_id: uid,
                type: 'jurnal',
                judul,
                isi: JSON.stringify({ rasakan, terjadi, pikirkan, lakukan }),
                tags: []
            });
            _authToast('☁️ Jurnal tersimpan ke cloud', 'success');
            if (window.refreshDashboard) window.refreshDashboard();
        } else {
            _authToast('💾 Tersimpan lokal · Login untuk simpan permanen', 'info');
        }
    } catch (err) {
        console.warn('simpanJournal Supabase error:', err);
        _authToast('Gagal menyimpan ke cloud, tersimpan lokal saja.', 'error');
    }
};

// Init journal list
window.addEventListener('load', function() { renderJournalList(); });

window.moodSelect = function(btn) {
    document.querySelectorAll('.mdyn-btn').forEach(b => {
        b.style.transform = '';
        b.style.borderColor = 'transparent';
        b.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
    });
    btn.style.transform = 'scale(1.18)';
    btn.style.borderColor = btn.dataset.color || 'var(--primary)';
    btn.style.boxShadow = `0 0 0 5px ${btn.dataset.color}25`;
    selectedMoodVal = parseInt(btn.dataset.val);

    const fb = document.getElementById('moodFeedback');
    fb.style.display = 'flex';
    document.getElementById('moodFeedbackEmoji').textContent = MOOD_EMOJIS[selectedMoodVal];
    document.getElementById('moodFeedbackLabel').textContent = MOOD_LABELS[selectedMoodVal];
    document.getElementById('moodFeedbackMsg').textContent = MOOD_MSGS[selectedMoodVal];
};

window.moodSave = async function() {
    if (!selectedMoodVal) {
        document.getElementById('saveMsg').textContent = 'Pilih emoji mood dulu ya!';
        document.getElementById('saveMsg').style.color = '#f97316';
        return;
    }
    moodData[6] = selectedMoodVal;
    resiliData[6] = Math.min(5, Math.max(1, Math.round(selectedMoodVal * 0.8 + Math.random())));
    renderStreak();
    document.getElementById('saveMsg').textContent = 'Check-in tersimpan! Lihat grafikmu di tab Grafik Emosi.';
    document.getElementById('saveMsg').style.color = 'var(--primary)';
    setTimeout(() => document.getElementById('saveMsg').textContent = '', 3000);
    // Simpan ke Supabase jika sudah login
    try {
        const { data: { user } } = await window._sb.auth.getUser();
        if (user) {
            const uid = user.id;
            // Maksimal 1 entry mood per hari per user: update jika hari ini sudah ada, insert jika belum.
            const now = new Date();
            const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const nextDayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            const { data: todayEntries, error: todayLookupError } = await window._sb
                .from('hifz_check_entries')
                .select('id, created_at')
                .eq('user_id', uid)
                .gte('created_at', dayStart.toISOString())
                .lt('created_at', nextDayStart.toISOString())
                .order('created_at', { ascending: false })
                .limit(1);
            if (todayLookupError) throw todayLookupError;

const moodPayload = {
    user_id: uid,
    mood: selectedMoodVal,
    stress: selectedMoodVal,
    hopelessness: selectedMoodVal,
    withdraw: selectedMoodVal,
    note: MOOD_LABELS[selectedMoodVal] || null
};

            if (todayEntries && todayEntries.length) {
                const { error: updateError } = await window._sb
                    .from('hifz_check_entries')
                    .update(moodPayload)
                    .eq('id', todayEntries[0].id)
                    .eq('user_id', uid);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await window._sb
                    .from('hifz_check_entries')
                    .insert(moodPayload);
                if (insertError) throw insertError;
            }
            _authToast('☁️ Mood tersimpan ke cloud', 'success');
            if (window.refreshDashboard) window.refreshDashboard();
        } else {
            _authToast('💾 Tersimpan lokal · Login untuk simpan permanen', 'info');
        }
    } catch (err) {
        console.warn('moodSave Supabase error:', err);
        _authToast('Gagal menyimpan ke cloud, tersimpan lokal saja.', 'error');
    }
};

window.addTag = function(btn, tag) {
    document.querySelectorAll('.refleksi-tag').forEach(b => {
        b.style.background = 'white';
        b.style.color = '#8b5cf6';
    });
    btn.style.background = 'linear-gradient(135deg,#8b5cf6,#6366f1)';
    btn.style.color = 'white';
    selectedTags = [tag];
};

window.simpanRefleksi = async function() {
    const text = document.getElementById('refleksiInput').value.trim();
    if (!text) {
        document.getElementById('refleksiInput').style.borderColor = '#ef4444';
        setTimeout(() => document.getElementById('refleksiInput').style.borderColor = 'rgba(139,92,246,0.25)', 1500);
        return;
    }
    const emoji = moodData[6] ? MOOD_EMOJIS[moodData[6]] : '—';
    const now = new Date();
    const dateStr = 'Hari ini, ' + now.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
    const tag = selectedTags[0] || 'Umum';
    refleksiList.unshift({ date: dateStr, emoji, tag, text });
    document.getElementById('refleksiInput').value = '';
    document.getElementById('charCount').textContent = '0 / 300';
    document.querySelectorAll('.refleksi-tag').forEach(b => { b.style.background='white'; b.style.color='#8b5cf6'; });
    selectedTags = [];
    renderRefleksiList();
    // Simpan ke Supabase jika sudah login
    try {
        const { data: { user } } = await window._sb.auth.getUser();
        if (user) {
            const uid = user.id;
            await window._sb.from('hn_journal_entries').insert({
                user_id: uid,
                refleksi_text: text,
                refleksi_tag: tag || 'Umum'
            });
            _authToast('☁️ Refleksi tersimpan ke cloud', 'success');
            if (window.refreshDashboard) window.refreshDashboard();
        } else {
            _authToast('💾 Tersimpan lokal · Login untuk simpan permanen', 'info');
        }
    } catch (err) {
        console.warn('simpanRefleksi Supabase error:', err);
        _authToast('Gagal menyimpan ke cloud, tersimpan lokal saja.', 'error');
    }
};

// ── Bridge setter: izinkan auth IIFE menulis ke variabel lokal ini ──
window._hn_setMoodData = function(d) { moodData = d; };
window._hn_setJournalEntries = function(d) { journalEntries = d; };
window._hn_setRefleksiList = function(d) { refleksiList = d; };
window._hn_renderJournalList = function() { if (typeof renderJournalList === 'function') renderJournalList(); };
window._hn_renderRefleksiList = function() { if (typeof renderRefleksiList === 'function') renderRefleksiList(); };
window._hn_updateChartAndSummary = function() {
    if (typeof updateChart === 'function') updateChart();
    if (typeof renderSummary === 'function') renderSummary();
    if (typeof renderStreak === 'function') renderStreak();
};

// ── Delete functions (akses langsung ke array lokal) ──
window.deleteJurnal = async function(id) {
    if (!confirm('Hapus jurnal ini?')) return;
    try {
        await window._sb.from('hn_journal_entries').delete().eq('id', id);
        journalEntries = journalEntries.filter(e => e.id !== id);
        renderJournalList();
        _authToast('🗑️ Jurnal dihapus', 'success');
        if (window.refreshDashboard) window.refreshDashboard();
    } catch(e) {
        console.warn('deleteJurnal error:', e);
        alert('Gagal menghapus. Coba lagi.');
    }
};

window.deleteRefleksi = async function(id) {
    if (!confirm('Hapus refleksi ini?')) return;
    try {
        await window._sb.from('hn_journal_entries').delete().eq('id', id);
        refleksiList = refleksiList.filter(r => r.id !== id);
        renderRefleksiList();
        _authToast('🗑️ Refleksi dihapus', 'success');
        if (window.refreshDashboard) window.refreshDashboard();
    } catch(e) {
        console.warn('deleteRefleksi error:', e);
        alert('Gagal menghapus. Coba lagi.');
    }
};

})();

// Legacy selectMood kept for compatibility
function selectMood(btn) {}
(function() {
    const MOOD_EMOJIS = ['','😔','😕','😐','🙂','😄'];
    const MOOD_LABELS_LIVE = ['','Sangat Buruk','Kurang Baik','Biasa Saja','Lumayan Baik','Sangat Baik'];

const tickerItems = [
    { init: 'RA', name: 'Rina A.', act: 'menyelesaikan tantangan Digital Detox' },
    { init: 'DF', name: 'Dimas F.', act: 'berbagi pengalaman di forum' },
    { init: 'SK', name: 'Sari K.', act: 'mencapai streak 7 hari journaling' },
    { init: 'BN', name: 'Budi N.', act: 'bergabung ke komunitas baru' },
    { init: 'MP', name: 'Maya P.', act: 'melakukan check-in mood hari ini' },
    { init: 'AL', name: 'Aldi L.', act: 'memposting refleksi di Ruang Anonim' },
    { init: 'NR', name: 'Nisa R.', act: 'menyelesaikan Meditasi 10 Menit' },
    { init: 'FH', name: 'Fahri H.', act: 'membalas thread di Forum Komunitas' },
    { init: 'DW', name: 'Dewi W.', act: 'mendapat badge Streak 7 Hari' },
    { init: 'TY', name: 'Tyas Y.', act: 'bergabung ke Peer Support Group baru' },
    { init: 'RZ', name: 'Reza Z.', act: 'menyelesaikan HIFZ Edu: Kenali Burnout' },
    { init: 'AM', name: 'Aisyah M.', act: 'memberi dukungan di Peer Support Group' },
];

// Stat counter live data
const statBaseValues = [12450, 8720, 94, 87];
const statSuffixes   = ['', '', '%', '%'];
let statDelta        = [0, 0, 0, 0];

let tickerIdx = 0;
let liveB_mood   = [3,4,2,5,3,4,null];
let liveB_resili = [3,3,3,4,4,4,null];

// Progress bar base values
const progressBase = [78, 65, 82, 71];
const progressLabels = ['Resiliensi','Keterlibatan','Mood Positif','Aktivitas Sosial'];

function randBetween(min, max) {
    return Math.round(min + Math.random() * (max - min));
}
function randFloat(min, max) {
    return +(min + Math.random() * (max - min)).toFixed(1);
}

// Pulse animation helper
function pulse(el) {
    el.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
    el.style.transform = 'scale(1.12)';
    el.style.opacity = '0.7';
    setTimeout(() => {
        el.style.transform = 'scale(1)';
        el.style.opacity = '1';
    }, 220);
}

window.addEventListener('load', () => {
    setTimeout(() => setInterval(tick, 3000), 1500);
});

function tick() {
    // 1. Dashboard main chart
    const dc = window._dashChart;
    if (dc) {
        dc.data.datasets[0].data = dc.data.datasets[0].data.slice(1).concat(randBetween(60,95));
        dc.data.datasets[1].data = dc.data.datasets[1].data.slice(1).concat(randBetween(55,90));
        dc.update('active');
    }

// 2. Fitur B mini chart
const bc = window._miniChart;
if (bc) {
    liveB_mood[6]   = randBetween(2,5);
    liveB_resili[6] = Math.min(5, Math.max(1, liveB_mood[6] + randBetween(-1,1)));
    const si = randBetween(0,5);
    liveB_mood[si]   = Math.min(5, Math.max(1, liveB_mood[si]   + randBetween(-1,1)));
    liveB_resili[si] = Math.min(5, Math.max(1, liveB_resili[si] + randBetween(-1,1)));
    bc.data.datasets[0].data = [...liveB_mood];
    bc.data.datasets[0].pointRadius = liveB_mood.map(v => v !== null ? 5 : 0);
    bc.data.datasets[0].pointBackgroundColor = liveB_mood.map(v => v !== null ? '#8b5cf6' : 'transparent');
    bc.data.datasets[1].data = [...liveB_resili];
    bc.data.datasets[1].pointRadius = liveB_resili.map(v => v !== null ? 5 : 0);
    bc.data.datasets[1].pointBackgroundColor = liveB_resili.map(v => v !== null ? '#0d9488' : 'transparent');
    bc.update('active');

    const vM = liveB_mood.filter(v=>v!==null);
    const vR = liveB_resili.filter(v=>v!==null);
    const avgM = (vM.reduce((a,b)=>a+b,0)/vM.length).toFixed(1);
    const avgR = (vR.reduce((a,b)=>a+b,0)/vR.length).toFixed(1);
    const bestM = Math.max(...vM);
    const sumRow = document.getElementById('moodSummaryRow');
    if (sumRow) {
        sumRow.innerHTML = `
            <div style="background:rgba(139,92,246,0.07);border-radius:14px;padding:14px;text-align:center;transition:all .5s;">
                <div style="font-size:1.6rem;">${MOOD_EMOJIS[bestM]}</div>
                <div style="font-size:0.7rem;color:var(--text-gray);margin-top:4px;font-weight:600;">Mood Terbaik</div>
                <div style="font-size:0.75rem;color:#8b5cf6;font-weight:700;">${MOOD_LABELS_LIVE[bestM]}</div>
            </div>
            <div style="background:rgba(13,148,136,0.07);border-radius:14px;padding:14px;text-align:center;">
                <div style="font-size:1.4rem;font-weight:800;color:#0d9488;">${avgM}</div>
                <div style="font-size:0.7rem;color:var(--text-gray);margin-top:4px;font-weight:600;">Rata-rata Mood</div>
                <div style="font-size:0.75rem;color:var(--text-gray);">dari skala 5</div>
            </div>
            <div style="background:rgba(16,185,129,0.07);border-radius:14px;padding:14px;text-align:center;">
                <div style="font-size:1.4rem;font-weight:800;color:#10b981;">${avgR}</div>
                <div style="font-size:0.7rem;color:var(--text-gray);margin-top:4px;font-weight:600;">Rata-rata Resiliensi</div>
                <div style="font-size:0.75rem;color:var(--text-gray);">dari skala 5</div>
            </div>`;
    }
}

// 3. Community activity feed — rotate ALL items
const acts = document.querySelectorAll('.activity-item');
if (acts.length) {
    const numToUpdate = Math.min(2, acts.length);
    for (let n = 0; n < numToUpdate; n++) {
        const item = tickerItems[(tickerIdx + n) % tickerItems.length];
        const el = acts[(tickerIdx + n) % acts.length];
        if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateX(-12px)';
            el.style.transition = 'all 0.35s ease';
            ;(function(el, item) {
                setTimeout(() => {
                    const av  = el.querySelector('.activity-avatar');
                    const txt = el.querySelector('.activity-text');
                    if (av)  av.textContent = item.init;
                    if (txt) txt.innerHTML  = `<strong>${item.name}</strong> ${item.act}`;
                    el.style.opacity   = '1';
                    el.style.transform = 'translateX(0)';
                }, 350);
            })(el, item);
        }
    }
    tickerIdx = (tickerIdx + numToUpdate) % tickerItems.length;
}

// 4. Floating hero cards
const floatCards = document.querySelectorAll('.floating-card .fc-sub');
if (floatCards.length >= 3) {
    const newVals = [
        `+${randBetween(10,35)}% minggu ini`,
        `${randBetween(3,12)} selesai hari ini`,
        `${randBetween(8,24)} aktif`
    ];
    floatCards.forEach((fc, i) => {
        if (newVals[i]) {
            pulse(fc);
            setTimeout(() => { fc.textContent = newVals[i]; }, 100);
        }
    });
}

// 5. Progress bars — animate width AND label percentage
document.querySelectorAll('.progress-item').forEach((item, i) => {
    const fill = item.querySelector('.progress-fill');
    const labelSpans = item.querySelectorAll('.progress-label span');
    if (!fill) return;
    const base = progressBase[i] || 70;
    const newW = Math.min(98, Math.max(25, base + randBetween(-12, 12)));
    fill.style.transition = 'width 0.9s cubic-bezier(0.4,0,0.2,1)';
    fill.style.width = newW + '%';
    if (labelSpans.length >= 2) {
        labelSpans[1].style.transition = 'all 0.3s';
        pulse(labelSpans[1]);
        setTimeout(() => { labelSpans[1].textContent = newW + '%'; }, 150);
    }
});

// 6. Stat numbers (section statistik) — live fluctuation
const statNumbers = document.querySelectorAll('.stat-number');
statNumbers.forEach((el, i) => {
    const base = statBaseValues[i];
    if (base === undefined) return;
    statDelta[i] = statDelta[i] + randBetween(-5, 15);
    statDelta[i] = Math.max(-50, Math.min(200, statDelta[i]));
    const newVal = base + statDelta[i];
    const suffix = statSuffixes[i] || '';
    el.style.transition = 'all 0.4s ease';
    pulse(el);
    setTimeout(() => {
        el.textContent = newVal.toLocaleString('id-ID') + suffix;
    }, 100);
});

// 7. Challenge list — randomly toggle one item
const challengeItems = document.querySelectorAll('.challenge-list li');
if (challengeItems.length) {
    const idx = randBetween(0, challengeItems.length - 1);
    const li = challengeItems[idx];
    const icon = li.querySelector('i');
    if (icon) {
        const isDone = icon.classList.contains('fa-circle-check');
        li.style.transition = 'opacity 0.3s';
        li.style.opacity = '0.3';
        setTimeout(() => {
            if (isDone) {
                icon.classList.remove('fa-circle-check');
                icon.classList.add('fa-circle');
                icon.style.color = 'var(--text-light)';
            } else {
                icon.classList.remove('fa-circle');
                icon.classList.add('fa-circle-check');
                icon.style.color = 'var(--accent)';
            }
            li.style.opacity = '1';
        }, 300);
    }
}

        // 8. Streak dot pulse (today)
        const todayDot = document.querySelector('.streak-dot.today');
        if (todayDot) {
            todayDot.style.transform = 'scale(1.25)';
            todayDot.style.transition = 'transform .3s';
            setTimeout(() => { todayDot.style.transform = 'scale(1)'; }, 300);
        }
    }
})();
const dashChartData = {
    'Mingguan': {
        labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
        mood:     [65, 72, 68, 80, 75, 85, 82],
        resili:   [60, 65, 70, 72, 78, 76, 80],
        title:    'Mood Tracker - 7 Hari Terakhir'
    },
    'Bulanan': {
        labels: ['Mg 1', 'Mg 2', 'Mg 3', 'Mg 4'],
        mood:     [70, 74, 78, 81],
        resili:   [65, 69, 74, 77],
        title:    'Mood Tracker - 4 Minggu Terakhir'
    },
    'Semua': {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
        mood:     [62, 65, 68, 70, 73, 75, 72, 78, 80, 79, 82, 85],
        resili:   [58, 61, 64, 67, 70, 72, 69, 74, 76, 75, 78, 80],
        title:    'Mood Tracker - Sepanjang Tahun'
    }
};

function switchTab(tab) {
    document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

const label = tab.textContent.trim();
const data = dashChartData[label];
if (!data || !window._dashChart) return;

const chart = window._dashChart;
chart.data.labels = data.labels;
chart.data.datasets[0].data = data.mood;
chart.data.datasets[1].data = data.resili;
chart.update('active');

    // Update chart title
    const h4 = document.querySelector('.dashboard-chart h4');
    if (h4) h4.innerHTML = '<i class="fas fa-chart-line"></i> ' + data.title;
}
function animateCard(card) {
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
        card.style.transform = '';
    }, 150);
}
function showModal(event) {
    event.preventDefault();
    const modal = document.getElementById('modalOverlay');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(event) {
    if (event.target === event.currentTarget) {
        closeModalBtn();
    }
}

function closeModalBtn() {
    const modal = document.getElementById('modalOverlay');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
document.querySelectorAll('.ripple').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        try {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch(err) { /* selector tidak valid, biarkan event berjalan normal */ }
    });
});

function kirimKontak() {
            var nama = document.getElementById('kontak-nama').value.trim();
            var telp = document.getElementById('kontak-telp').value.trim();
            var topik = document.getElementById('kontak-topik').value;
            var pesan = document.getElementById('kontak-pesan').value.trim();
            var errEl = document.getElementById('kontak-error');
            var errMsg = document.getElementById('kontak-error-msg');

if (!nama) { errMsg.textContent = 'Nama lengkap wajib diisi.'; errEl.style.display='flex'; return; }
if (!telp) { errMsg.textContent = 'Nomor telepon wajib diisi.'; errEl.style.display='flex'; return; }
if (!pesan) { errMsg.textContent = 'Pertanyaan / pesan wajib diisi.'; errEl.style.display='flex'; return; }
errEl.style.display = 'none';

var teks = '🌿 *Halo HIFZ NAFS!*\n\n'
    + '👤 *Nama:* ' + nama + '\n'
    + '📞 *No. Telepon:* ' + telp + '\n'
    + (topik ? '🏷️ *Topik:* ' + topik + '\n' : '')
    + '\n💬 *Pesan:*\n' + pesan;

    var url = 'https://wa.me/6285712016662?text=' + encodeURIComponent(teks);
    window.open(url, '_blank');
}

(function() {
        // ================================================================
        // SUPABASE CONFIG — Komunitas HIFZ NAFS
        // Jalankan SQL ini sekali di Supabase Dashboard > SQL Editor:
        //
        // create table hn_forum_threads (
        //   id bigserial primary key,
        //   user_init text not null default 'KM',
        //   user_name text not null default 'Anonim',
        //   content text not null,
        //   cat text not null default 'Akademik',
        //   created_at timestamptz default now(),
        //   replies int default 0,
        //   likes int default 0
        // );
        // create table hn_anon_stories (
        //   id bigserial primary key,
        //   content text not null,
        //   tag text default 'Emosi',
        //   created_at timestamptz default now(),
        //   hearts int default 0
        // );
        // create table hn_anon_replies (
        //   id bigserial primary key,
        //   story_id bigint references hn_anon_stories(id) on delete cascade,
        //   content text not null,
        //   created_at timestamptz default now()
        // );
        // alter table hn_anon_replies enable row level security;
        // create policy "read anon replies" on hn_anon_replies for select using (true);
        // create policy "insert anon replies" on hn_anon_replies for insert with check (true);
        // create table hn_peer_groups (
        //   id bigserial primary key,
        //   icon text default 'fa-users',
        //   name text not null,
        //   description text default '',
        //   tags text default '[]',
        //   member_count int default 1,
        //   created_at timestamptz default now()
        // );
        // create table hn_group_messages (
        //   id bigserial primary key,
        //   group_id bigint references hn_peer_groups(id) on delete cascade,
        //   user_init text default 'AN',
        //   content text not null,
        //   created_at timestamptz default now()
        // );
        // -- RLS (izinkan akses publik anonim)
        // alter table hn_forum_threads enable row level security;
        // alter table hn_anon_stories enable row level security;
        // alter table hn_peer_groups enable row level security;
        // alter table hn_group_messages enable row level security;
        // create policy "read forum" on hn_forum_threads for select using (true);
        // create policy "insert forum" on hn_forum_threads for insert with check (true);
        // create policy "update forum" on hn_forum_threads for update using (true);
        // create policy "read anon" on hn_anon_stories for select using (true);
        // create policy "insert anon" on hn_anon_stories for insert with check (true);
        // create policy "update anon" on hn_anon_stories for update using (true);
        // create policy "read groups" on hn_peer_groups for select using (true);
        // create policy "insert groups" on hn_peer_groups for insert with check (true);
        // create policy "update groups" on hn_peer_groups for update using (true);
        // create policy "read messages" on hn_group_messages for select using (true);
        // create policy "insert messages" on hn_group_messages for insert with check (true);
        // ================================================================

/* ================================================================
   HIFZ NAFS — SUPABASE GLOBAL CONFIG (1 titik, dipakai semua)
   Jangan duplikasi URL/KEY di tempat lain!
   ================================================================ */
window.HN_SB_URL = 'https://ltztvkhgwizeudmkcwyg.supabase.co';
window.HN_SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0enR2a2hnd2l6ZXVkbWtjd3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMzk1MzksImV4cCI6MjEwMjcxNTUzOX0.Y8pr3x-N5AxNjfjwISVf_WWB9L_VWViA77570ouBnAY';

// Supabase JS client (_sb) — untuk auth + query data personal (Tahap 2 & 3)
window._sb = supabase.createClient(HN_SB_URL, HN_SB_KEY);

// Raw fetch helpers — dipakai untuk tabel PUBLIK/anonim (komunitas)
// Tidak pakai _sb agar komunitas tetap anonim tanpa session
const SB_URL  = HN_SB_URL;
const SB_KEY  = HN_SB_KEY;
const SB_HDR  = { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

async function sbGet(table, params) {
    const q = new URLSearchParams(params).toString();
    const r = await fetch(`${SB_URL}/rest/v1/${table}?${q}`, { headers: SB_HDR });
    return r.ok ? r.json() : [];
}
async function sbPost(table, body) {
    const r = await fetch(`${SB_URL}/rest/v1/${table}`, { method:'POST', headers: SB_HDR, body: JSON.stringify(body) });
    return r.ok ? r.json() : null;
}
async function sbPatch(table, id, body) {
    const r = await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, { method:'PATCH', headers: SB_HDR, body: JSON.stringify(body) });
    return r.ok;
}

// User session identity (localStorage)
let _myInit = localStorage.getItem('hn_init');
let _myName = localStorage.getItem('hn_name');
if (!_myInit) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    _myInit = chars[Math.floor(Math.random()*chars.length)] + chars[Math.floor(Math.random()*chars.length)];
    _myName = 'Pengguna ' + Math.floor(1000 + Math.random()*9000);
    localStorage.setItem('hn_init', _myInit);
    localStorage.setItem('hn_name', _myName);
}

// Joined groups (localStorage set of ids)
let _joinedGroups = new Set(JSON.parse(localStorage.getItem('hn_joined') || '[]'));
function saveJoined() { localStorage.setItem('hn_joined', JSON.stringify([..._joinedGroups])); }

/* ================================================================
   AUTH MODAL — Tahap 2
   ================================================================ */
// Rate-limit state (client-side lockout)
let _authFailCount = 0;
let _authLockUntil = 0;
const AUTH_MAX_FAIL = 5;
const AUTH_LOCK_SEC = 60;

// ── Buka modal ──
function openAuthModal(tab) {
    tab = tab || 'login';
    const m = document.getElementById('authModal');
    if (!m) { alert('Modal tidak ditemukan!'); return; }
    // Pastikan display diset ke flex terlebih dahulu
    m.style.display = 'flex';
    // Double rAF: frame pertama browser terapkan display,
    // frame kedua baru tambah class active agar transisi CSS berjalan
    // (penting untuk mobile — satu frame saja tidak cukup)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            m.classList.add('active');
            document.body.style.overflow = 'hidden';
            switchAuthTab(tab);
            _clearAuthError();
        });
    });
}

// ── Tutup modal ──
function closeAuthModal() {
    const m = document.getElementById('authModal');
    if (!m) return;
    m.classList.remove('active');
    document.body.style.overflow = '';
    _clearAuthError();
    // Delay display:none sampai animasi selesai, tapi hanya kalau belum dibuka lagi
    setTimeout(() => {
        if (!m.classList.contains('active')) m.style.display = 'none';
    }, 320);
}

function authModalBackdropClose(e) {
    if (e.target === e.currentTarget) closeAuthModal();
}

// ── Switch tab ──
function switchAuthTab(tab) {
    document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
    document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
    document.getElementById('panelLogin').classList.toggle('active', tab === 'login');
    document.getElementById('panelRegister').classList.toggle('active', tab === 'register');
    _clearAuthError();
}

// ── Error banner ──
function _showAuthError(msg) {
    const el = document.getElementById('authErrorMsg');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
}
function _clearAuthError() {
    const el = document.getElementById('authErrorMsg');
    if (el) { el.textContent = ''; el.classList.remove('show'); }
}

// ── Tombol loading state ──
function _authBtnLoading(id, loading) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading
        ? '<i class="fas fa-spinner fa-spin"></i> Memproses...'
        : (id === 'loginBtn'
            ? '<i class="fas fa-right-to-bracket"></i> Masuk'
            : '<i class="fas fa-user-plus"></i> Buat Akun');
}

// ── Toast notifikasi ──
function _authToast(msg, type) {
    // Pakai toast yang sudah ada di app jika tersedia, fallback ke alert sederhana
    if (typeof showHnToast === 'function') { showHnToast(msg, type); return; }
    const bgMap = { error: '#dc2626', success: '#0d9488', info: '#475569' };
    const bg = bgMap[type] || '#0d9488';
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.cssText = `
        position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
        background:${bg};color:#fff;
        padding:12px 24px;border-radius:50px;font-size:0.85rem;font-weight:600;
        z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.15);
        animation:fadeInUp 0.3s ease;font-family:'Poppins',sans-serif;
        white-space:nowrap;max-width:90vw;text-overflow:ellipsis;overflow:hidden;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3500);
}

// ── Update tampilan navbar sesuai status login ──
function _updateNavAuth(user, nama) {
    const area = document.getElementById('navAuthArea');
    if (!area) return;
    if (user) {
        // State: logged in → chip nama + tombol Keluar
        area.innerHTML = `
            <span class="nav-user-chip">
                <i class="fas fa-circle-user"></i>
                ${nama || user.email.split('@')[0]}
            </span>
            <button class="nav-logout-btn" onclick="doLogout()">
                <i class="fas fa-right-from-bracket"></i> Keluar
            </button>`;
    } else {
        // State: guest → tombol Masuk + Daftar
        area.innerHTML = `
            <a href="#" onclick="openAuthModal('login'); return false;"
               style="display:inline-flex;align-items:center;gap:6px;padding:9px 22px;
                      border-radius:50px;border:2px solid var(--primary);color:var(--primary);
                      font-weight:600;font-size:0.88rem;text-decoration:none;transition:all 0.3s;"
               onmouseover="this.style.background='rgba(13,148,136,0.07)'"
               onmouseout="this.style.background='transparent'">Masuk</a>
            <a href="#" onclick="openAuthModal('register'); return false;"
               style="display:inline-flex;align-items:center;gap:8px;padding:10px 22px;
                      border-radius:50px;background:linear-gradient(135deg,#0d9488,#06b6d4);
                      color:white;font-weight:700;font-size:0.88rem;text-decoration:none;
                      box-shadow:0 4px 16px rgba(13,148,136,.30);transition:all 0.3s;margin-left:8px;"
               onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(13,148,136,.45)'"
               onmouseout="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(13,148,136,.30)'">
               <i class="fas fa-rocket" style="font-size:0.85rem;"></i> Daftar</a>`;
    }
}

// ── Cek rate-limit lockout ──
function _checkLockout() {
    if (_authFailCount >= AUTH_MAX_FAIL) {
        const now = Date.now();
        if (!_authLockUntil) _authLockUntil = now + AUTH_LOCK_SEC * 1000;
        if (now < _authLockUntil) {
            const sisa = Math.ceil((_authLockUntil - now) / 1000);
            _showAuthError(`Terlalu banyak percobaan. Coba lagi dalam ${sisa} detik.`);
            return true;
        }
        // Lockout sudah habis, reset
        _authFailCount = 0;
        _authLockUntil = 0;
    }
    return false;
}

// ── REGISTER ──
async function doRegister() {
    if (_checkLockout()) return;
    _clearAuthError();
    const nama  = (document.getElementById('regNama')?.value || '').trim();
    const email = (document.getElementById('regEmail')?.value || '').trim();
    const pass  = (document.getElementById('regPass')?.value || '');

if (!nama)             { _showAuthError('Nama panggilan wajib diisi.'); return; }
if (!email)            { _showAuthError('Email wajib diisi.'); return; }
if (pass.length < 8)   { _showAuthError('Password minimal 8 karakter.'); return; }

    _authBtnLoading('registerBtn', true);
    try {
        const { data, error } = await window._sb.auth.signUp({
            email, password: pass,
            options: { data: { nama } }
        });
        if (error) throw error;
        _authFailCount = 0;
        // bersihkan form
        ['regNama','regEmail','regPass'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        if (data.session) {
            // Email confirmation dinonaktifkan — langsung login
            closeAuthModal();
            _authToast(`Selamat datang, ${nama}! 🎉`, 'success');
            setTimeout(function() {
                var cur = window._lastPage || 'beranda';
                if (typeof navigateTo === 'function') navigateTo(cur, true);
            }, 150);
        } else {
            // Email confirmation aktif — session belum tersedia sampai email dikonfirmasi
            _showAuthError('Pendaftaran berhasil! Cek email kamu untuk konfirmasi akun, lalu login.');
        }
    } catch (err) {
        _authFailCount++;
        let msg = err.message || 'Gagal mendaftar. Coba lagi.';
        if (msg.includes('already registered') || msg.includes('User already registered')) {
            msg = 'Email ini sudah terdaftar. Silakan masuk.';
        } else if (msg.includes('invalid email') || msg.includes('Invalid email')) {
            msg = 'Format email tidak valid.';
        } else if (msg.includes('Password should') || msg.includes('password')) {
            msg = 'Password terlalu lemah. Gunakan minimal 8 karakter.';
        }
        _showAuthError(msg);
    } finally {
        _authBtnLoading('registerBtn', false);
    }
}

// ── LOGIN ──
async function doLogin() {
    if (_checkLockout()) return;
    _clearAuthError();
    const email = (document.getElementById('loginEmail')?.value || '').trim();
    const pass  = (document.getElementById('loginPass')?.value || '');

if (!email) { _showAuthError('Email wajib diisi.'); return; }
if (!pass)  { _showAuthError('Password wajib diisi.'); return; }

    _authBtnLoading('loginBtn', true);
    try {
        const { data, error } = await window._sb.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        closeAuthModal();
        // Ambil uid dari session yang baru dibuat (bukan dari localStorage)
        const uid = data.session.user.id;
        const { data: prof } = await window._sb.from('hn_profiles').select('nama').eq('id', uid).maybeSingle();
        const nama = prof?.nama || data.user.user_metadata?.nama || email.split('@')[0];
        _authToast(`Halo, ${nama}! Selamat datang kembali 👋`, 'success');
        _authFailCount = 0;
        document.getElementById('loginPass').value = '';
        // Refresh halaman aktif agar navbar langsung terupdate
        setTimeout(function() {
            var cur = window._lastPage || 'beranda';
            if (typeof navigateTo === 'function') navigateTo(cur, true);
        }, 150);
    } catch (err) {
        _authFailCount++;
        let msg = err.message || 'Login gagal. Coba lagi.';
        if (msg.includes('Invalid login credentials')) {
            msg = 'Email atau password salah. Periksa kembali.';
        } else if (msg.includes('Email not confirmed')) {
            msg = 'Email belum dikonfirmasi. Cek kotak masuk emailmu.';
        } else if (msg.includes('Too many requests')) {
            msg = 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.';
        }
        _showAuthError(msg);
    } finally {
        _authBtnLoading('loginBtn', false);
    }
}

// ── LOGOUT ──
async function doLogout() {
    await window._sb.auth.signOut();
    _authToast('Kamu telah keluar. Sampai jumpa! 👋', 'success');
}

// ── Load functions untuk data user dari Supabase ──
async function loadMoodHistory() {
    try {
        const { data: { session } } = await _sb.auth.getSession();
        if (!session) return;
        const uid = session.user.id;
        const { data, error } = await _sb.from('hifz_check_entries')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false })
            .limit(7);
        if (error) throw error;
        if (data && data.length > 0) {
            // Petakan ke array 7 slot (urutan lama→baru), null jika tidak ada
            const scores = data.map(e => e.mood || null).reverse();
            while (scores.length < 7) scores.unshift(null);
            if (window._hn_setMoodData) window._hn_setMoodData(scores);
            if (window._hn_updateChartAndSummary) window._hn_updateChartAndSummary();
            console.log('[HN] loadMoodHistory:', data.length, 'entri dimuat.');
        }
    } catch (err) {
        console.warn('[HN] loadMoodHistory:', err);
    }
}

async function loadJurnalHistory() {
    try {
        const { data: { session } } = await _sb.auth.getSession();
        if (!session) return;
        const uid = session.user.id;
        const { data, error } = await _sb.from('hn_journal_entries')
            .select('*')
            .eq('user_id', uid)
            .eq('type', 'jurnal')
            .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) {
            const mapped = data.map(e => {
                let parsed = {};
                try { parsed = JSON.parse(e.isi); } catch(_) { parsed = { rasakan: e.isi }; }
                const d = new Date(e.created_at);
                return {
                    id: e.id,
                    date: d.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'}) + ', ' + d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}),
                    rasakan: parsed.rasakan || '',
                    terjadi: parsed.terjadi || '',
                    pikirkan: parsed.pikirkan || '',
                    lakukan: parsed.lakukan || '',
                    _cloud: true
                };
            });
            if (window._hn_setJournalEntries) window._hn_setJournalEntries(mapped);
            if (window._hn_renderJournalList) window._hn_renderJournalList();
            console.log('[HN] loadJurnalHistory:', mapped.length, 'entri dimuat.');
        }
    } catch (err) {
        console.warn('[HN] loadJurnalHistory:', err);
    }
}

async function loadRefleksiHistory() {
    try {
        const { data: { session } } = await _sb.auth.getSession();
        if (!session) return;
        const uid = session.user.id;
        const { data, error } = await _sb.from('hn_journal_entries')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) {
            const mapped = data.map(e => {
                const d = new Date(e.created_at);
                return {
                    id: e.id,
                    date: d.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'}) + ', ' + d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}),
                    emoji: '📝',
                    tag: e.refleksi_tag || 'Umum',
                    text: e.refleksi_text || '',
                    _cloud: true
                };
            });
            if (window._hn_setRefleksiList) window._hn_setRefleksiList(mapped);
            if (window._hn_renderRefleksiList) window._hn_renderRefleksiList();
            console.log('[HN] loadRefleksiHistory:', mapped.length, 'entri dimuat.');
        }
    } catch (err) {
        console.warn('[HN] loadRefleksiHistory:', err);
    }
}

async function loadSkriningHistory() {
    try {
        const { data: { session } } = await _sb.auth.getSession();
        if (!session) return;
        const uid = session.user.id;
        const { data, error } = await _sb.from('hn_skrining_results')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false })
            .limit(1);
        if (error) throw error;
        const last = data?.[0];
        if (last) {
            // Simpan ke window untuk keperluan dashboard
            window._hn_lastSkrining = last;
            console.log('[HN] loadSkriningHistory: skor', last.total_score, '|', last.kategori);
        }
    } catch (err) {
        console.warn('[HN] loadSkriningHistory:', err);
    }
}

// ── onAuthStateChange → update navbar otomatis ──
_sb.auth.onAuthStateChange(async (event, session) => {
    if (session && session.user) {
        const uid = session.user.id;
        // Ambil nama dari hn_profiles
        const { data: prof } = await _sb.from('hn_profiles').select('nama').eq('id', uid).maybeSingle();
        const nama = prof?.nama || session.user.user_metadata?.nama || session.user.email.split('@')[0];
        _updateNavAuth(session.user, nama);
        // Load data user dari Supabase
        loadMoodHistory();
        loadJurnalHistory();
        loadRefleksiHistory();
        loadSkriningHistory();
        // Refresh statistik dashboard
        setTimeout(() => { if (typeof refreshDashboard === 'function') refreshDashboard(); }, 800);
    } else {
        _updateNavAuth(null, null);
    }
});

/* ================================================================
   END AUTH — Tahap 2
   ================================================================ */

let activeForumCat = 'semua';
let selectedAnonTag = '';
let _forumData = [];
let _anonData  = [];
let _groupData = [];
let _forumRefInterval = null;
let _anonRefInterval  = null;

function getCatColor(cat) {
    const map = { 'Akademik':'#0d9488','Relasi Sosial':'#06b6d4','Produktivitas':'#f59e0b','Digital':'#8b5cf6','Relasi':'#06b6d4','Emosi':'#ec4899','Keluarga':'#f97316','Mental Health':'#10b981','Kebiasaan':'#64748b' };
    return map[cat] || '#0d9488';
}

function relativeTime(iso) {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60) return 'baru saja';
    if (diff < 3600) return Math.floor(diff/60) + ' menit lalu';
    if (diff < 86400) return Math.floor(diff/3600) + ' jam lalu';
    return Math.floor(diff/86400) + ' hari lalu';
}

// ============================================================
// FORUM
// ============================================================
async function loadForum() {
    const el = document.getElementById('forumThreadList');
    if (!el) return;
    el.innerHTML = '<p style="font-size:0.75rem;color:var(--text-light);text-align:center;padding:16px;">Memuat diskusi...</p>';
    const data = await sbGet('hn_forum_threads', { select:'*', order:'created_at.desc', limit:30 });
    _forumData = Array.isArray(data) ? data : [];
    renderForumThreads();
}

function renderForumThreads() {
    const el = document.getElementById('forumThreadList');
    if (!el) return;
    const filtered = activeForumCat === 'semua' ? _forumData : _forumData.filter(t => t.cat.toLowerCase().includes(activeForumCat));
    if (!filtered.length) {
        el.innerHTML = '<p style="font-size:0.78rem;color:var(--text-light);text-align:center;padding:16px;">Belum ada diskusi di kategori ini. Jadilah yang pertama!</p>';
        return;
    }
    el.innerHTML = filtered.map(t => `
        <div style="background:white;border-radius:12px;padding:14px 16px;border:1px solid rgba(13,148,136,0.1);box-shadow:0 2px 8px rgba(0,0,0,0.04);transition:all .25s;cursor:pointer;" onmouseenter="this.style.boxShadow='0 4px 16px rgba(13,148,136,0.12)'" onmouseleave="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'">
            <div style="display:flex;gap:10px;align-items:flex-start;">
                <div style="width:34px;height:34px;border-radius:50%;background:var(--gradient-1);display:flex;align-items:center;justify-content:center;color:white;font-size:0.72rem;font-weight:700;flex-shrink:0;">${t.user_init}</div>
                <div class="u-flex1-min">
                    <p style="font-size:0.82rem;font-weight:600;color:var(--text-dark);margin-bottom:4px;line-height:1.5;">${escHtml(t.content)}</p>
                    <p style="font-size:0.68rem;color:var(--text-light);margin-bottom:8px;">${escHtml(t.user_name)} · ${relativeTime(t.created_at)}</p>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        <span style="padding:3px 10px;border-radius:50px;background:${getCatColor(t.cat)}18;color:${getCatColor(t.cat)};font-size:0.65rem;font-weight:600;">${t.cat}</span>
                        <span style="font-size:0.68rem;color:var(--text-light);"><i class="fas fa-comment" style="margin-right:3px;"></i>${t.replies}</span>
                        <button onclick="likeThread(${t.id},this)" style="display:inline-flex;align-items:center;gap:4px;font-size:0.68rem;color:var(--text-light);background:none;border:none;cursor:pointer;font-family:'Poppins',sans-serif;padding:0;" id="likeBtn-${t.id}">
                            <i class="fas fa-heart" style="color:#ec4899;"></i><span id="likeCount-${t.id}">${t.likes}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

window.likeThread = async function(id, btn) {
    btn.disabled = true;
    const t = _forumData.find(x => x.id === id);
    if (!t) return;
    const newLikes = (t.likes || 0) + 1;
    await sbPatch('hn_forum_threads', id, { likes: newLikes });
    t.likes = newLikes;
    const el = document.getElementById('likeCount-' + id);
    if (el) el.textContent = newLikes;
    btn.style.color = '#ec4899';
};

window.filterForum = function(btn, cat) {
    document.querySelectorAll('.kforum-cat').forEach(b => {
        b.style.background='white'; b.style.color='var(--text-gray)'; b.style.borderColor='rgba(13,148,136,0.3)';
    });
    btn.style.background='var(--primary)'; btn.style.color='white'; btn.style.borderColor='var(--primary)';
    activeForumCat = cat;
    renderForumThreads();
};

window.postForumThread = async function() {
    const txt = document.getElementById('forumNewPost').value.trim();
    const cat = document.getElementById('forumNewCat').value;
    const msg = document.getElementById('forumPostMsg');
    if (!txt) { msg.style.color='#ef4444'; msg.textContent='Tulis topik diskusimu dulu ya!'; return; }
    msg.style.color='var(--primary)'; msg.textContent='Mengirim...';
    const res = await sbPost('hn_forum_threads', { user_init: _myInit, user_name: _myName, content: txt, cat });
    if (res) {
        document.getElementById('forumNewPost').value = '';
        msg.textContent = 'Diskusimu berhasil diposting!';
        setTimeout(() => msg.textContent='', 3000);
        await loadForum();
    } else {
        msg.style.color='#ef4444'; msg.textContent='Gagal kirim. Coba lagi.';
    }
};

// ============================================================
// ANON STORIES
// ============================================================
async function loadAnonStories() {
    const el = document.getElementById('anonStoryList');
    if (!el) return;
    el.innerHTML = '<p style="font-size:0.75rem;color:var(--text-light);text-align:center;padding:16px;">Memuat cerita...</p>';
    const data = await sbGet('hn_anon_stories', { select:'*', order:'created_at.desc', limit:20 });
    _anonData = Array.isArray(data) ? data.map(s => ({...s, _replies:[]})) : [];
    await loadAllAnonReplies();
    renderAnonStories();
}

function renderAnonStories() {
    const el = document.getElementById('anonStoryList');
    if (!el) return;
    if (!_anonData.length) {
        el.innerHTML = '<p style="font-size:0.78rem;color:var(--text-light);text-align:center;padding:16px;">Belum ada cerita. Jadilah yang pertama berbagi.</p>';
        return;
    }
    el.innerHTML = _anonData.map((s) => `
        <div style="background:white;border-radius:14px;padding:16px;border:1px solid rgba(100,116,139,0.12);box-shadow:0 2px 10px rgba(0,0,0,0.05);">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#64748b,#475569);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;flex-shrink:0;"><i class="fas fa-mask"></i></div>
                <div>
                    <span style="font-size:0.72rem;font-weight:600;color:#64748b;">Anonim</span>
                    <span style="font-size:0.65rem;color:var(--text-light);margin-left:8px;">${relativeTime(s.created_at)}</span>
                    <span style="margin-left:8px;padding:2px 8px;border-radius:50px;background:${getCatColor(s.tag)}15;color:${getCatColor(s.tag)};font-size:0.62rem;font-weight:600;">${s.tag}</span>
                </div>
            </div>
            <p style="font-size:0.82rem;color:var(--text-dark);line-height:1.7;font-style:italic;margin-bottom:12px;">"${escHtml(s.content)}"</p>
            <!-- Replies -->
            <div id="anonReplies-${s.id}" style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px;">
                ${(s._replies||[]).map(r=>`
                <div style="background:#f8fafc;border-radius:10px;padding:10px 12px;border-left:3px solid #64748b;">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                        <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#64748b,#475569);display:flex;align-items:center;justify-content:center;color:white;font-size:9px;flex-shrink:0;"><i class="fas fa-mask"></i></div>
                        <span style="font-size:0.65rem;font-weight:600;color:#64748b;">Anonim</span>
                        <span style="font-size:0.6rem;color:var(--text-light);">${relativeTime(r.created_at)}</span>
                    </div>
                    <p style="font-size:0.78rem;color:var(--text-dark);line-height:1.6;margin:0;">${escHtml(r.content)}</p>
                </div>`).join('')}
            </div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <button onclick="supportAnon(${s.id},this)" style="display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:50px;border:1.5px solid rgba(236,72,153,0.25);background:white;font-family:'Poppins',sans-serif;font-size:0.72rem;font-weight:600;color:#ec4899;cursor:pointer;transition:all .25s;" id="heartBtn-${s.id}">
                    <i class="fas fa-heart"></i> <span id="heartCount-${s.id}">${s.hearts}</span>
                </button>
                <button onclick="toggleAnonReply(${s.id})" style="display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:50px;border:1.5px solid rgba(100,116,139,0.2);background:white;font-family:'Poppins',sans-serif;font-size:0.72rem;font-weight:600;color:#64748b;cursor:pointer;transition:all .25s;">
                    <i class="fas fa-reply"></i> Balas
                </button>
            </div>
            <!-- Reply input (tersembunyi, toggle) -->
            <div id="anonReplyBox-${s.id}" style="display:none;margin-top:10px;">
                <div style="display:flex;gap:8px;align-items:flex-end;">
                    <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#64748b,#475569);display:flex;align-items:center;justify-content:center;color:white;font-size:9px;flex-shrink:0;margin-bottom:2px;"><i class="fas fa-mask"></i></div>
                    <textarea id="anonReplyInput-${s.id}" placeholder="Tulis balasan anonim..." maxlength="300" style="flex:1;height:60px;border:1.5px solid rgba(100,116,139,0.25);border-radius:10px;padding:8px 10px;font-family:'Poppins',sans-serif;font-size:0.78rem;color:var(--text-dark);resize:none;outline:none;transition:border .3s;" onfocus="this.style.borderColor='#64748b'" onblur="this.style.borderColor='rgba(100,116,139,0.25)'"></textarea>
                    <button onclick="kirimAnonReply(${s.id})" style="flex-shrink:0;padding:8px 14px;border-radius:50px;background:linear-gradient(135deg,#64748b,#475569);color:white;border:none;font-family:'Poppins',sans-serif;font-size:0.72rem;font-weight:600;cursor:pointer;transition:all .3s;align-self:flex-end;">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div id="anonReplyMsg-${s.id}" style="font-size:0.68rem;color:#64748b;margin-top:5px;min-height:14px;"></div>
            </div>
        </div>
    `).join('');
}

window.toggleAnonReply = function(storyId) {
    const box = document.getElementById('anonReplyBox-' + storyId);
    if (!box) return;
    const isHidden = box.style.display === 'none';
    box.style.display = isHidden ? 'block' : 'none';
    if (isHidden) {
        const ta = document.getElementById('anonReplyInput-' + storyId);
        if (ta) ta.focus();
    }
};

window.kirimAnonReply = async function(storyId) {
    const ta = document.getElementById('anonReplyInput-' + storyId);
    const msg = document.getElementById('anonReplyMsg-' + storyId);
    if (!ta || !msg) return;
    const txt = ta.value.trim();
    if (!txt) { msg.style.color='#ef4444'; msg.textContent='Tulis balasanmu dulu ya!'; return; }
    msg.style.color='#64748b'; msg.textContent='Mengirim...';
    const res = await sbPost('hn_anon_replies', { story_id: storyId, content: txt });
    if (res) {
        ta.value = '';
        msg.textContent = 'Balasanmu terkirim secara anonim.';
        setTimeout(() => { msg.textContent=''; }, 3000);
        // Muat ulang replies untuk cerita ini
        await loadRepliesForStory(storyId);
    } else {
        msg.style.color='#ef4444'; msg.textContent='Gagal kirim. Coba lagi.';
    }
};

async function loadRepliesForStory(storyId) {
    const data = await sbGet('hn_anon_replies', { select:'*', story_id:'eq.'+storyId, order:'created_at.asc', limit:20 });
    const story = _anonData.find(s => s.id === storyId);
    if (story) story._replies = Array.isArray(data) ? data : [];
    // Re-render hanya bagian replies
    const repliesEl = document.getElementById('anonReplies-' + storyId);
    if (!repliesEl) return;
    const replies = story._replies || [];
    repliesEl.innerHTML = replies.map(r=>`
        <div style="background:#f8fafc;border-radius:10px;padding:10px 12px;border-left:3px solid #64748b;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#64748b,#475569);display:flex;align-items:center;justify-content:center;color:white;font-size:9px;flex-shrink:0;"><i class="fas fa-mask"></i></div>
                <span style="font-size:0.65rem;font-weight:600;color:#64748b;">Anonim</span>
                <span style="font-size:0.6rem;color:var(--text-light);">${relativeTime(r.created_at)}</span>
            </div>
            <p style="font-size:0.78rem;color:var(--text-dark);line-height:1.6;margin:0;">${escHtml(r.content)}</p>
        </div>`).join('');
}

async function loadAllAnonReplies() {
    if (!_anonData.length) return;
    const ids = _anonData.map(s => s.id);
    // Muat replies untuk semua story sekaligus
    const data = await sbGet('hn_anon_replies', { select:'*', order:'created_at.asc', limit:200 });
    if (!Array.isArray(data)) return;
    // Kelompokkan per story_id
    _anonData.forEach(s => { s._replies = data.filter(r => r.story_id === s.id); });
}

window.supportAnon = async function(id, btn) {
    btn.disabled = true;
    const s = _anonData.find(x => x.id === id);
    if (!s) return;
    const newHearts = (s.hearts || 0) + 1;
    await sbPatch('hn_anon_stories', id, { hearts: newHearts });
    s.hearts = newHearts;
    const el = document.getElementById('heartCount-' + id);
    if (el) el.textContent = newHearts;
    btn.style.background = 'rgba(236,72,153,0.1)';
    btn.style.transform = 'scale(1.1)';
    setTimeout(() => btn.style.transform='', 200);
};

window.selectAnonTag = function(btn, tag) {
    document.querySelectorAll('.anon-tag').forEach(b => { b.style.background='white'; b.style.color='#64748b'; });
    btn.style.background='linear-gradient(135deg,#64748b,#475569)'; btn.style.color='white';
    selectedAnonTag = tag;
};

window.kirimCeritaAnonim = async function() {
    const txt = document.getElementById('anonInput').value.trim();
    const msg = document.getElementById('anonMsg');
    if (!txt) { msg.style.color='#ef4444'; msg.textContent='Ceritamu kosong. Yuk tulis dulu!'; return; }
    msg.style.color='var(--text-gray)'; msg.textContent='Mengirim secara anonim...';
    const res = await sbPost('hn_anon_stories', { content: txt, tag: selectedAnonTag || 'Emosi', hearts: 0 });
    if (res) {
        document.getElementById('anonInput').value='';
        document.querySelectorAll('.anon-tag').forEach(b => { b.style.background='white'; b.style.color='#64748b'; });
        selectedAnonTag='';
        msg.textContent='Ceritamu terkirim secara anonim.';
        setTimeout(() => msg.textContent='', 3000);
        await loadAnonStories();
    } else {
        msg.style.color='#ef4444'; msg.textContent='Gagal kirim. Coba lagi.';
    }
};

// ============================================================
// PEER GROUPS
// ============================================================
async function loadPeerGroups() {
    const el = document.getElementById('peerGroupList');
    if (!el) return;
    el.innerHTML = '<p style="font-size:0.75rem;color:var(--text-light);text-align:center;padding:16px;">Memuat grup...</p>';
    const data = await sbGet('hn_peer_groups', { select:'*', order:'created_at.desc', limit:20 });
    // Seed default groups if empty
    if (Array.isArray(data) && data.length === 0) {
        const seeds = [
            { icon:'fa-brain', name:'Survivor Anxious', description:'Ruang aman berbagi untuk mereka yang berjuang dengan kecemasan. Sesi sharing setiap Sabtu sore.', tags:'["Kecemasan","Mental Health"]', member_count:42 },
            { icon:'fa-book-open', name:'Belajar Bareng Fokus', description:'Kelompok produktivitas untuk mahasiswa yang ingin belajar konsisten tanpa terdistraksi.', tags:'["Akademik","Produktivitas"]', member_count:29 },
            { icon:'fa-heart', name:'Healing Together', description:'Komunitas untuk mereka yang sedang dalam proses penyembuhan emosional. Tidak ada penghakiman di sini.', tags:'["Relasi","Emosi"]', member_count:67 },
            { icon:'fa-ban', name:'Digital Detox Club', description:'Bersama-sama membangun hubungan yang lebih sehat dengan teknologi dan media sosial.', tags:'["Digital","Kebiasaan"]', member_count:35 },
        ];
        for (const s of seeds) await sbPost('hn_peer_groups', s);
        const d2 = await sbGet('hn_peer_groups', { select:'*', order:'created_at.desc', limit:20 });
        _groupData = Array.isArray(d2) ? d2 : seeds;
    } else {
        _groupData = Array.isArray(data) ? data : [];
    }
    renderPeerGroups();
}

function renderIconHtml(icon, size, color) {
    return `<div style="width:38px;height:38px;border-radius:50%;background:var(--gradient-1);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas ${icon}" style="color:${color};font-size:${size};"></i></div>`;
}

function renderPeerGroups() {
    const el = document.getElementById('peerGroupList');
    if (!el) return;
    if (!_groupData.length) {
        el.innerHTML = '<p style="font-size:0.78rem;color:var(--text-light);text-align:center;padding:16px;">Belum ada grup. Buat yang pertama!</p>';
        return;
    }
    el.innerHTML = _groupData.map((g) => {
        const joined = _joinedGroups.has(String(g.id));
        let tags = [];
        try { tags = JSON.parse(g.tags || '[]'); } catch(e) {}
        return `
        <div style="background:white;border-radius:14px;padding:16px;border:1.5px solid ${joined ? 'rgba(13,148,136,0.3)' : 'rgba(13,148,136,0.1)'};box-shadow:0 2px 10px rgba(0,0,0,0.04);">
            <div style="display:flex;align-items:flex-start;gap:12px;">
                ${renderIconHtml(g.icon || 'fa-users', '1rem', '#fff')}
                <div class="u-flex1-min">
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
                        <p style="font-size:0.85rem;font-weight:700;color:var(--text-dark);">${escHtml(g.name)}</p>
                        ${joined ? '<span style="padding:2px 10px;border-radius:50px;background:rgba(13,148,136,0.12);color:var(--primary);font-size:0.62rem;font-weight:700;">&#10003; Bergabung</span>' : ''}
                    </div>
                    <p style="font-size:0.75rem;color:var(--text-gray);line-height:1.6;margin-bottom:8px;">${escHtml(g.description || '')}</p>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">
                        ${tags.map(t=>`<span style="padding:2px 8px;border-radius:50px;background:rgba(13,148,136,0.08);color:var(--primary);font-size:0.62rem;font-weight:600;">${t}</span>`).join('')}
                        <span style="font-size:0.68rem;color:var(--text-light);margin-left:4px;"><i class="fas fa-users" style="margin-right:3px;"></i><span id="memberCount-${g.id}">${g.member_count}</span> anggota</span>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button onclick="toggleJoinGroup(${g.id})" id="joinBtn-${g.id}" style="padding:7px 18px;border-radius:50px;border:1.5px solid ${joined ? 'rgba(239,68,68,0.4)' : 'var(--primary)'};background:${joined ? 'rgba(239,68,68,0.05)' : 'var(--primary)'};color:${joined ? '#ef4444' : 'white'};font-family:'Poppins',sans-serif;font-size:0.72rem;font-weight:600;cursor:pointer;transition:all .3s;">
                            ${joined ? '<i class="fas fa-times" style="margin-right:4px;"></i>Keluar' : '<i class="fas fa-plus" style="margin-right:4px;"></i>Bergabung'}
                        </button>
                        ${joined ? `<button onclick="openGroupChat(${g.id})" style="padding:7px 18px;border-radius:50px;border:1.5px solid rgba(13,148,136,0.3);background:rgba(13,148,136,0.08);color:var(--primary);font-family:'Poppins',sans-serif;font-size:0.72rem;font-weight:600;cursor:pointer;transition:all .3s;"><i class="fas fa-comments" style="margin-right:4px;"></i>Chat Grup</button>` : ''}
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

window.toggleJoinGroup = async function(id) {
    const g = _groupData.find(x => x.id === id);
    if (!g) return;
    const sid = String(id);
    if (_joinedGroups.has(sid)) {
        _joinedGroups.delete(sid);
        g.member_count = Math.max(0, (g.member_count || 1) - 1);
    } else {
        _joinedGroups.add(sid);
        g.member_count = (g.member_count || 0) + 1;
    }
    saveJoined();
    await sbPatch('hn_peer_groups', id, { member_count: g.member_count });
    renderPeerGroups();
};

window.buatPeerGroup = async function() {
    const name = document.getElementById('newGroupName').value.trim();
    const desc = document.getElementById('newGroupDesc').value.trim();
    const msg = document.getElementById('groupMsg');
    if (!name) { msg.style.color='#ef4444'; msg.textContent='Nama grup tidak boleh kosong.'; return; }
    msg.style.color='var(--primary)'; msg.textContent='Membuat grup...';
    const res = await sbPost('hn_peer_groups', { icon:'fa-users', name, description: desc || 'Grup baru yang dibuat oleh anggota HIFZ.', tags:'["Baru"]', member_count:1 });
    if (res) {
        const newGroup = Array.isArray(res) ? res[0] : res;
        if (newGroup && newGroup.id) {
            _joinedGroups.add(String(newGroup.id));
            saveJoined();
        }
        document.getElementById('newGroupName').value='';
        document.getElementById('newGroupDesc').value='';
        msg.textContent='Grupmu berhasil dibuat!';
        setTimeout(() => msg.textContent='', 3000);
        await loadPeerGroups();
    } else {
        msg.style.color='#ef4444'; msg.textContent='Gagal membuat grup. Coba lagi.';
    }
};

// ============================================================
// GROUP CHAT (Supabase REST + polling)
// ============================================================
let _activeChatGroupId = null;
let _chatPollInterval = null;
let _lastChatMsgId = 0;

window.openGroupChat = async function(groupId) {
    const g = _groupData.find(x => x.id === groupId);
    if (!g) return;
    _activeChatGroupId = groupId;
    _lastChatMsgId = 0;

const modal = document.getElementById('groupChatModal');
document.getElementById('chatModalName').textContent = g.name;
document.getElementById('chatModalSub').textContent = (g.member_count || 0) + ' anggota';
document.getElementById('chatMessages').innerHTML = '<p style="font-size:0.75rem;color:var(--text-light);text-align:center;padding:20px;">Memuat pesan...</p>';
modal.style.display = 'flex';
document.body.style.overflow = 'hidden';

    await fetchChatMessages(true);
    if (_chatPollInterval) clearInterval(_chatPollInterval);
    _chatPollInterval = setInterval(() => fetchChatMessages(false), 4000);
};

window.closeGroupChat = function() {
    document.getElementById('groupChatModal').style.display = 'none';
    document.body.style.overflow = '';
    if (_chatPollInterval) clearInterval(_chatPollInterval);
    _chatPollInterval = null;
    _activeChatGroupId = null;
};

async function fetchChatMessages(initial) {
    if (!_activeChatGroupId) return;
    const params = { select:'*', group_id:'eq.' + _activeChatGroupId, order:'created_at.asc', limit:'60' };
    if (!initial && _lastChatMsgId > 0) params['id'] = 'gt.' + _lastChatMsgId;
    const data = await sbGet('hn_group_messages', params);
    if (!Array.isArray(data) || !data.length) {
        if (initial) {
            document.getElementById('chatMessages').innerHTML = '<p style="font-size:0.75rem;color:var(--text-light);text-align:center;padding:20px;">Belum ada pesan. Mulai obrolan!</p>';
        }
        return;
    }
    if (initial) document.getElementById('chatMessages').innerHTML = '';
    const container = document.getElementById('chatMessages');
    data.forEach(m => {
        const isMe = m.user_init === _myInit;
        const div = document.createElement('div');
        div.style.cssText = `display:flex;flex-direction:column;align-items:${isMe ? 'flex-end' : 'flex-start'};gap:2px;`;
        div.innerHTML = `
            ${!isMe ? `<span style="font-size:0.62rem;color:var(--text-light);margin-left:8px;">${escHtml(m.user_init)}</span>` : ''}
            <div style="max-width:75%;padding:10px 14px;border-radius:${isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};background:${isMe ? 'var(--gradient-1)' : 'white'};color:${isMe ? 'white' : 'var(--text-dark)'};font-size:0.82rem;line-height:1.5;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                ${escHtml(m.content)}
            </div>
            <span style="font-size:0.6rem;color:var(--text-light);margin:0 8px;">${relativeTime(m.created_at)}</span>`;
        container.appendChild(div);
        if (m.id > _lastChatMsgId) _lastChatMsgId = m.id;
    });
    container.scrollTop = container.scrollHeight;
}

window.sendGroupMessage = async function() {
    const input = document.getElementById('chatInput');
    const txt = input.value.trim();
    if (!txt || !_activeChatGroupId) return;
    input.value = '';
    await sbPost('hn_group_messages', { group_id: _activeChatGroupId, user_init: _myInit, content: txt });
    await fetchChatMessages(false);
};

// ============================================================
// TAB SWITCHER
// ============================================================
window.kolabSwitchTab = function(tab) {
    // 'group' sudah digabung ke dalam 'forum', redirect ke forum
    if (tab === 'group') tab = 'forum';
    ['forum','anonim'].forEach(t => {
        const panel = document.getElementById('kpanel-'+t);
        if (panel) panel.style.display = t===tab ? 'block' : 'none';
        const btn = document.getElementById('ktab-'+t);
        if (btn) {
            if (t===tab) { btn.style.color='var(--primary)'; btn.style.borderBottom='3px solid var(--primary)'; }
            else { btn.style.color='var(--text-gray)'; btn.style.borderBottom='3px solid transparent'; }
        }
        const sfbtn = document.getElementById('sfnav-a-'+t);
        if (sfbtn) sfbtn.classList.toggle('active', t===tab);
    });
    // Lazy-load data on first tab switch
    if (tab === 'forum' && !_forumData.length) loadForum();
    if (tab === 'anonim' && !_anonData.length) loadAnonStories();
    if (tab === 'group' && !_groupData.length) loadPeerGroups();
};

function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Initial load for active panel (forum is default)
loadForum();
loadAnonStories();
loadPeerGroups();

// ── Delete mood entry ──
async function deleteMood(id) {
    if (!confirm('Hapus catatan mood ini?')) return;
    try {
        await _sb.from('hifz_check_entries').delete().eq('id', id);
        await loadMoodHistory();
        _authToast('🗑️ Mood dihapus', 'success');
        if (window.refreshDashboard) window.refreshDashboard();
    } catch(e) {
        console.warn('deleteMood error:', e);
        alert('Gagal menghapus. Coba lagi.');
    }
}

// ── Dashboard: refresh statistik real dari Supabase ──
async function refreshDashboard() {
    try {
        const { data: { session } } = await _sb.auth.getSession();
        if (!session) {
            // Belum login → tampilkan placeholder
            const elJ = document.getElementById('dash-stat-jurnal');
            const elM = document.getElementById('dash-stat-mood');
            const elS = document.getElementById('dash-stat-skrining');
            if (elJ) elJ.textContent = '—';
            if (elM) elM.textContent = '—';
            if (elS) elS.textContent = '—';
            return;
        }
        const uid = session.user.id;

// Total jurnal
const { count: totalJurnal } = await _sb
    .from('hn_journal_entries').select('*', { count: 'exact', head: true })
    .eq('user_id', uid).eq('type', 'jurnal');

// Total mood entry
const { count: totalMood } = await _sb
    .from('hifz_check_entries').select('*', { count: 'exact', head: true })
    .eq('user_id', uid);

// Skrining terakhir
const { data: lastSkrining } = await _sb
    .from('hn_skrining_results').select('kategori, created_at')
    .eq('user_id', uid).order('created_at', { ascending: false }).limit(1);

        // Update elemen UI dashboard (pakai id khusus agar tidak tabrakan)
        const elJ = document.getElementById('dash-stat-jurnal');
        const elM = document.getElementById('dash-stat-mood');
        const elS = document.getElementById('dash-stat-skrining');
        if (elJ) elJ.textContent = totalJurnal || 0;
        if (elM) elM.textContent = totalMood || 0;
        if (elS && lastSkrining?.[0]) elS.textContent = lastSkrining[0].kategori;
        else if (elS) elS.textContent = '—';
    } catch (err) {
        console.warn('[HN] refreshDashboard error:', err);
    }
}

// ── Expose fungsi auth ke window agar bisa dipanggil dari HTML ──
window.openAuthModal   = openAuthModal;
window.closeAuthModal  = closeAuthModal;
window.switchAuthTab   = switchAuthTab;
window.doLogin         = doLogin;
window.doRegister      = doRegister;
window.doLogout        = doLogout;
window.authModalBackdropClose = authModalBackdropClose;

// ── Expose load functions ke window ──
window.loadMoodHistory     = loadMoodHistory;
window.loadJurnalHistory   = loadJurnalHistory;
window.loadRefleksiHistory = loadRefleksiHistory;
window.loadSkriningHistory = loadSkriningHistory;

    // ── Expose delete & dashboard functions ke window ──
    window.deleteMood        = deleteMood;
    window.refreshDashboard  = refreshDashboard;
})();

(function() {
        const challenges = [
            { id:1, icon:'fa-ban', name:'Digital Detox 2 Jam', cat:'Digital Detox', desc:'Jauhi semua layar selama 2 jam penuh setiap hari.', peserta:234, progress:80, joined:false, color:'#0d9488' },
            { id:2, icon:'fa-book', name:'Journaling Pagi', cat:'Journaling', desc:'Tulis 3 hal yang kamu syukuri setiap pagi selama 7 hari.', peserta:189, progress:55, joined:false, color:'#f59e0b' },
            { id:3, icon:'fa-spa', name:'Meditasi 10 Menit', cat:'Mindfulness', desc:'Luangkan 10 menit untuk bernapas dan menenangkan pikiran.', peserta:97, progress:35, joined:true, color:'#8b5cf6' },
            { id:4, icon:'fa-moon', name:'Tidur Sebelum Jam 11', cat:'Tidur Teratur', desc:'Bangun pola tidur sehat dengan konsisten tidur lebih awal.', peserta:143, progress:62, joined:false, color:'#06b6d4' },
            { id:5, icon:'fa-handshake', name:'Sapa Teman Baru', cat:'Sosial Positif', desc:'Ajak bicara atau kirim pesan ke seseorang yang jarang kamu sapa.', peserta:78, progress:28, joined:false, color:'#ec4899' },
        ];

const badges = [
    { icon:'fa-star', label:'Streak 7 Hari', color:'#f59e0b', earned:true },
    { icon:'fa-leaf', label:'Detox Hero', color:'#0d9488', earned:true },
    { icon:'fa-pen', label:'Journal Starter', color:'#8b5cf6', earned:true },
    { icon:'fa-heart', label:'Komunitas Aktif', color:'#ec4899', earned:true },
    { icon:'fa-medal', label:'10 Challenge', color:'#06b6d4', earned:false },
    { icon:'fa-fire', label:'Streak 30 Hari', color:'#f97316', earned:false },
];

const leaderboardData = [
    { init:'SK', name:'Sari K.', poin:480, chall:12 },
    { init:'DW', name:'Dewi W.', poin:410, chall:10 },
    { init:'AR', name:'Arina R.', poin:375, chall:9 },
    { init:'FH', name:'Fahri H.', poin:320, chall:8 },
    { init:'NR', name:'Nisa R.', poin:290, chall:7 },
];

const actFeed = [
    { init:'TY', name:'Tyas Y.', act:'menyelesaikan Digital Detox 2 Jam', time:'2 menit lalu', icon:'fa-ban' },
    { init:'AM', name:'Aisyah M.', act:'bergabung ke challenge Journaling Pagi', time:'8 menit lalu', icon:'fa-book' },
    { init:'BN', name:'Budi N.', act:'mendapat badge Streak 7 Hari', time:'15 menit lalu', icon:'fa-trophy' },
    { init:'RZ', name:'Reza Z.', act:'menyelesaikan Meditasi 10 Menit', time:'22 menit lalu', icon:'fa-spa' },
    { init:'MP', name:'Maya P.', act:'mengajak 3 teman ikut challenge bersama', time:'34 menit lalu', icon:'fa-handshake' },
];

function renderChallengeList() {
    const el = document.getElementById('challengeList');
    if (!el) return;
    el.innerHTML = challenges.map((c, i) => `
        <div style="background:white;border-radius:14px;padding:16px;border:1.5px solid ${c.joined ? c.color+'55' : 'rgba(245,158,11,0.12)'};box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <div style="display:flex;align-items:flex-start;gap:12px;">
                <div style="font-size:1.4rem;line-height:1;flex-shrink:0;">${renderIconHtml(c.icon,'1.4rem',c.color||'#0d9488')}</div>
                <div class="u-flex1-min">
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:3px;">
                        <p style="font-size:0.85rem;font-weight:700;color:var(--text-dark);">${c.name}</p>
                        ${c.joined ? `<span style="padding:2px 9px;border-radius:50px;background:${c.color}18;color:${c.color};font-size:0.62rem;font-weight:700;">&#10003; Diikuti</span>` : ''}
                    </div>
                    <p style="font-size:0.75rem;color:var(--text-gray);margin-bottom:8px;line-height:1.5;">${c.desc}</p>
                    <div style="background:#f1f5f9;border-radius:50px;height:6px;margin-bottom:6px;overflow:hidden;">
                        <div style="height:100%;width:${c.progress}%;background:linear-gradient(90deg,${c.color},${c.color}99);border-radius:50px;transition:width .8s ease;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.68rem;color:var(--text-light);"><i class="fas fa-users" style="margin-right:3px;"></i>${c.peserta} peserta</span>
                        <button onclick="toggleChallenge(${i})" style="padding:6px 16px;border-radius:50px;border:1.5px solid ${c.joined ? '#ef444455' : c.color};background:${c.joined ? 'rgba(239,68,68,0.05)' : c.color};color:${c.joined ? '#ef4444' : 'white'};font-family:'Poppins',sans-serif;font-size:0.7rem;font-weight:600;cursor:pointer;transition:all .3s;">
                            ${c.joined ? 'Keluar' : 'Ikuti'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderProgressBars() {
    const el = document.getElementById('progressBars');
    if (!el) return;
    const joined = challenges.filter(c => c.joined);
    if (!joined.length) {
        el.innerHTML = '<p style="font-size:0.75rem;color:var(--text-light);text-align:center;padding:12px 0;">Belum ikut challenge apapun. Yuk mulai dari tab Tantangan!</p>';
        return;
    }
    el.innerHTML = joined.map(c => `
        <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                <span style="font-size:0.75rem;font-weight:600;color:var(--text-dark);">${renderIconHtml(c.icon,'0.85rem')} ${c.name}</span>
                <span style="font-size:0.72rem;color:${c.color};font-weight:700;">${c.progress}%</span>
            </div>
            <div style="background:#f1f5f9;border-radius:50px;height:8px;overflow:hidden;">
                <div style="height:100%;width:${c.progress}%;background:linear-gradient(90deg,${c.color},${c.color}88);border-radius:50px;transition:width 1s ease;"></div>
            </div>
        </div>
    `).join('');
}

function renderBadges() {
    const el = document.getElementById('badgeGrid');
    if (!el) return;
    el.innerHTML = badges.map(b => `
        <div style="text-align:center;padding:12px 8px;border-radius:12px;background:${b.earned ? b.color+'12' : '#f1f5f9'};border:1.5px solid ${b.earned ? b.color+'33' : 'transparent'};opacity:${b.earned ? '1' : '0.45'};">
            <div style="font-size:1.4rem;margin-bottom:4px;">${renderIconHtml(b.icon,'1.3rem',b.color||'#0d9488')}</div>
            <p style="font-size:0.65rem;font-weight:600;color:${b.earned ? b.color : 'var(--text-light)'};">${b.label}</p>
            ${!b.earned ? '<p style="font-size:0.6rem;color:var(--text-light);margin-top:2px;">Terkunci</p>' : ''}
        </div>
    `).join('');
}

function renderLeaderboard() {
    const el = document.getElementById('leaderboard');
    if (!el) return;
    const medals = ['#1','#2','#3'];
    el.innerHTML = leaderboardData.map((u, i) => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;background:${i===0 ? 'rgba(245,158,11,0.08)' : '#fafafa'};border:1px solid ${i===0 ? 'rgba(245,158,11,0.2)' : 'rgba(0,0,0,0.04)'};">
            <span style="font-size:1.1rem;width:20px;text-align:center;">${medals[i] || (i+1)+'.'}</span>
            <div style="width:32px;height:32px;border-radius:50%;background:var(--gradient-1);display:flex;align-items:center;justify-content:center;color:white;font-size:0.7rem;font-weight:700;flex-shrink:0;">${u.init}</div>
            <div style="flex:1;">
                <p style="font-size:0.8rem;font-weight:600;color:var(--text-dark);">${u.name}</p>
                <p style="font-size:0.68rem;color:var(--text-light);">${u.chall} challenge selesai</p>
            </div>
            <span style="font-size:0.8rem;font-weight:700;color:#f59e0b;">${u.poin} poin</span>
        </div>
    `).join('');
}

function renderActivityFeed() {
    const el = document.getElementById('challActivityFeed');
    if (!el) return;
    el.innerHTML = actFeed.map(a => `
        <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(0,0,0,0.04);">
            <div style="width:30px;height:30px;border-radius:50%;background:var(--gradient-1);display:flex;align-items:center;justify-content:center;color:white;font-size:0.68rem;font-weight:700;flex-shrink:0;">${a.init}</div>
            <div class="u-flex1-min">
                <p style="font-size:0.75rem;color:var(--text-dark);"><strong>${a.name}</strong> ${a.act}</p>
                <p style="font-size:0.65rem;color:var(--text-light);">${a.time}</p>
            </div>
            <span style="font-size:0.9rem;">${renderIconHtml(a.icon,'0.9rem','#fff')}</span>
        </div>
    `).join('');
}

window.challSwitchTab = function(tab) {
    ['tantangan','progress','kolaborasi'].forEach(t => {
        document.getElementById('cpanel-'+t).style.display = t===tab ? 'block' : 'none';
        const btn = document.getElementById('ctab-'+t);
        if (t===tab) { btn.style.color='#f59e0b'; btn.style.borderBottom='3px solid #f59e0b'; }
        else { btn.style.color='var(--text-gray)'; btn.style.borderBottom='3px solid transparent'; }
    });
    if (tab==='progress') { renderProgressBars(); renderBadges(); }
    if (tab==='kolaborasi') { renderLeaderboard(); renderActivityFeed(); }
};

window.toggleChallenge = function(i) {
    challenges[i].joined = !challenges[i].joined;
    challenges[i].peserta += challenges[i].joined ? 1 : -1;
    renderChallengeList();
};

window.usulkanChallenge = function() {
    const name = document.getElementById('newChallName').value.trim();
    const cat = document.getElementById('newChallCat').value;
    const msg = document.getElementById('challMsg');
    if (!name) { msg.style.color='#ef4444'; msg.textContent='Nama tantangan tidak boleh kosong.'; return; }
    const icons = {'Journaling':'fa-book','Digital Detox':'fa-ban','Tidur Teratur':'fa-moon','Sosial Positif':'fa-handshake','Mindfulness':'fa-spa'};
    const colors = {'Journaling':'#f59e0b','Digital Detox':'#0d9488','Tidur Teratur':'#06b6d4','Sosial Positif':'#ec4899','Mindfulness':'#8b5cf6'};
    challenges.unshift({ id:Date.now(), icon:icons[cat]||'fa-star', name, cat, desc:'Tantangan baru yang diusulkan oleh komunitas.', peserta:1, progress:0, joined:true, color:colors[cat]||'#f59e0b' });
    document.getElementById('newChallName').value='';
    msg.style.color='#f59e0b'; msg.textContent='Tantanganmu berhasil diusulkan!';
    setTimeout(()=>msg.textContent='',3000);
    renderChallengeList();
};

    renderChallengeList();
})();

(function(){
        const artikelData = [
            { cat:'stres', emoji:'fa-brain', type:'Artikel · 4 menit baca', title:'Kenali Tanda Burnout Sebelum Terlambat', desc:'Pelajari sinyal awal burnout dan cara mengatasinya sebelum memengaruhi kesehatan mentalmu.', url:'https://www.halodoc.com/artikel/ini-5-ciri-ciri-burnout-dan-cara-sederhana-mengatasinya', tag:'Stres & Burnout' },
            { cat:'digital', emoji:'fa-mobile-alt', type:'Artikel · 5 menit baca', title:'Cara Sehat Pakai Medsos Tanpa Anxious', desc:'Tips praktis mengelola penggunaan media sosial agar tidak memicu kecemasan berlebih.', url:'https://www.alodokter.com/9-dampak-negatif-media-sosial-terhadap-kesehatan-mental-dan-tubuh', tag:'Kehidupan Digital' },
            { cat:'selfdev', emoji:'fa-seedling', type:'Artikel · 3 menit baca', title:'5 Kebiasaan Pagi yang Tingkatkan Fokus & Mood', desc:'Rutinitas sederhana yang bisa meningkatkan produktivitas dan suasana hati sepanjang hari.', url:'https://www.klikdokter.com/psikologi/kesehatan-mental/alasan-bangun-pagi-baik-untuk-kesehatan-mental', tag:'Self-Dev' },
            { cat:'relasi', emoji:'fa-users', type:'Artikel · 6 menit baca', title:'Membangun Batasan Sehat dalam Pertemanan', desc:'Bagaimana cara menetapkan batasan yang sehat tanpa merusak hubungan pertemanan.', url:'https://lifestyle.kompas.com/read/2022/07/14/070257920/5-tips-menetapkan-batasan-sehat-dalam-bermacam-hubungan?page=all', tag:'Relasi' },
            { cat:'stres', emoji:'fa-wind', type:'Artikel · 4 menit baca', title:'Teknik Pernapasan untuk Redakan Kecemasan', desc:'Latihan pernapasan sederhana yang terbukti efektif menenangkan sistem saraf dalam hitungan menit.', url:'https://www.alodokter.com/teknik-relaksasi-untuk-mengatasi-kecemasan', tag:'Stres & Burnout' },
            { cat:'digital', emoji:'fa-bell-slash', type:'Artikel · 5 menit baca', title:'Digital Detox: Panduan Mulai dari Nol', desc:'Langkah-langkah memulai digital detox yang realistis dan tidak bikin stres.', url:'https://myedusolve.com/blog/digital-detox-pengertian-manfaat-dan-cara-melakukannya', tag:'Kehidupan Digital' },
            { cat:'selfdev', emoji:'fa-book', type:'Artikel · 3 menit baca', title:'Journaling untuk Kesehatan Mental Remaja', desc:'Cara mudah memulai journaling dan manfaat nyatanya bagi kesejahteraan emosional.', url:'https://www.klikdokter.com/psikologi/kesehatan-mental/manfaat-journaling', tag:'Self-Dev' },
        ];

const videoData = [
    { emoji:'fa-brain', title:'Apa itu Kesehatan Mental? (Belajar Psikologi)', channel:'Satu Persen - Indonesian Life School', duration:'7:12', url:'https://www.youtube.com/watch?v=xDUy5dmhHcM', thumb:'#fef3c7', isIndonesia:true },
    { emoji:'fa-mobile-alt', title:'Dampak Media Sosial Terhadap Mental Health Remaja', channel:'Satu Persen - Indonesian Life School', duration:'10:15', url:'https://www.youtube.com/watch?v=Czg_9C7gw0o', thumb:'#ede9fe', isIndonesia:true },
    { emoji:'fa-brain', title:'Ini Penyebab Lo Banyak Pikiran (Tips Mengatasi Overthinking)', channel:'Satu Persen - Indonesian Life School', duration:'11:24', url:'https://www.youtube.com/watch?v=U8CE4mb8IlY', thumb:'#d1fae5', isIndonesia:true },
    { emoji:'fa-heart', title:'Kesehatan Mental: Apa Aku Normal? (Stres dan Overthinking)', channel:'Satu Persen - Indonesian Life School', duration:'9:48', url:'https://www.youtube.com/watch?v=MKJppZ18FYU', thumb:'#fef3c7', isIndonesia:true },
    { emoji:'fa-bolt', title:'Mengatasi Masalah Overthinking dan Kecemasan akan Masa Depan', channel:'Satu Persen - Indonesian Life School', duration:'9:30', url:'https://www.youtube.com/watch?v=4L1VN1WUIH4', thumb:'#fee2e2', isIndonesia:true },
];

/* ── Video Edukasi Mental Islami ── */
const videoIslamiData = [
    { emoji:'fa-mosque', title:'Kesehatan Mental dalam Perspektif Islam', channel:'Yufid.TV - Dakwah & Kajian Islam', duration:'12:34', url:'https://www.youtube.com/watch?v=Q3jJ7VX4fkY', thumb:'linear-gradient(135deg,#d1fae5,#a7f3d0)', isIndonesia:true },
    { emoji:'fa-star-and-crescent', title:'Mengatasi Stres dan Kecemasan dengan Dzikir & Doa', channel:'Nouman Ali Khan Indonesia', duration:'8:45', url:'https://www.youtube.com/watch?v=UYKcuLpEFkQ', thumb:'linear-gradient(135deg,#ede9fe,#ddd6fe)', isIndonesia:true },
    { emoji:'fa-heart-pulse', title:'Sabar & Ikhlas: Terapi Jiwa Islami untuk Remaja', channel:'Muslim.or.id', duration:'14:20', url:'https://www.youtube.com/watch?v=3iA6VY6rDlI', thumb:'linear-gradient(135deg,#fef3c7,#fde68a)', isIndonesia:true },
    { emoji:'fa-brain', title:'Tazkiyatun Nafs — Membersihkan Jiwa dari Penyakit Hati', channel:'Rumaysho TV', duration:'18:05', url:'https://www.youtube.com/watch?v=pT8nxYJNIHk', thumb:'linear-gradient(135deg,#ccfbf1,#99f6e4)', isIndonesia:true },
    { emoji:'fa-moon', title:'Menjaga Hifz Nafs: Jiwa Sehat dalam Bingkai Islam', channel:'Al-Bahjah TV', duration:'11:15', url:'https://www.youtube.com/watch?v=BQ6VxbMXkXo', thumb:'linear-gradient(135deg,#e0e7ff,#c7d2fe)', isIndonesia:true },
    { emoji:'fa-hands-praying', title:'Istighfar & Taubat sebagai Penyembuh Luka Batin', channel:'Yufid.TV - Dakwah & Kajian Islam', duration:'9:55', url:'https://www.youtube.com/watch?v=SxhFZIqUnYQ', thumb:'linear-gradient(135deg,#fce7f3,#fbcfe8)', isIndonesia:true },
];

/* ── Video Makna Surah (QS. Az-Zumar:53 & Ar-Ra'd:28) ── */
const videoSurahData = [
    { emoji:'fa-book-quran', surah:'QS. Az-Zumar : 53', arabTitle:'لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ', title:'Tafsir & Makna QS. Az-Zumar Ayat 53 — Jangan Berputus Asa dari Rahmat Allah', channel:'Tafsir Al-Qur\'an Indonesia', duration:'10:22', url:'https://www.youtube.com/results?search_query=tafsir+az-zumar+53+jangan+berputus+asa+rahmat+Allah', thumb:'linear-gradient(135deg,#ccfbf1,#a7f3d0)', color:'#0d9488', isIndonesia:true },
    { emoji:'fa-heart', surah:'QS. Ar-Ra\'d : 28', arabTitle:'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ', title:'Tafsir & Makna QS. Ar-Ra\'d Ayat 28 — Hanya dengan Mengingat Allah Hati Menjadi Tenteram', channel:'Tafsir Al-Qur\'an Indonesia', duration:'8:47', url:'https://www.youtube.com/results?search_query=tafsir+ar-rad+28+hati+tenteram+dzikir+allah', thumb:'linear-gradient(135deg,#ede9fe,#c4b5fd)', color:'#7c3aed', isIndonesia:true },
];

let activeEduCat = 'semua';

function renderArtikels() {
    const el = document.getElementById('eduArtikelList');
    if (!el) return;
    const list = activeEduCat === 'semua' ? artikelData : artikelData.filter(a => a.cat === activeEduCat);
    el.innerHTML = list.map(a => `
        <a href="${a.url}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
            <div style="background:white;border-radius:14px;padding:14px 16px;border:1px solid rgba(0,0,0,0.07);box-shadow:0 2px 8px rgba(0,0,0,0.04);display:flex;gap:14px;align-items:center;transition:all .25s;cursor:pointer;" onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)';this.style.borderColor='rgba(0,0,0,0.13)'" onmouseleave="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)';this.style.borderColor='rgba(0,0,0,0.07)'">
                <div style="width:44px;height:44px;border-radius:10px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${renderIconHtml(a.emoji,'1.2rem','var(--primary)')}</div>
                <div class="u-flex1-min">
                    <p style="font-size:0.62rem;color:var(--text-light);font-weight:500;margin-bottom:2px;">${a.type}</p>
                    <p style="font-size:0.82rem;font-weight:700;color:var(--text-dark);line-height:1.4;margin-bottom:4px;">${a.title}</p>
                    <span style="padding:2px 10px;border-radius:50px;background:rgba(13,148,136,0.08);color:var(--primary);font-size:0.6rem;font-weight:600;">${a.tag}</span>
                </div>
                <i class="fas fa-external-link-alt" style="color:var(--text-light);font-size:0.7rem;flex-shrink:0;"></i>
            </div>
        </a>
    `).join('');
}

function renderVideos() {
    const el = document.getElementById('eduVideoList');
    if (!el) return;
    el.innerHTML = videoData.map(v => `
        <a href="${v.url}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
            <div style="background:white;border-radius:14px;overflow:hidden;border:1px solid rgba(0,0,0,0.07);box-shadow:0 2px 8px rgba(0,0,0,0.04);display:flex;gap:0;align-items:stretch;transition:all .25s;cursor:pointer;" onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)';this.style.borderColor='rgba(0,0,0,0.13)'" onmouseleave="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)';this.style.borderColor='rgba(0,0,0,0.07)'">
                <div style="width:80px;min-height:68px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;">
                    <i class="fab fa-youtube" style="font-size:1.8rem;color:#ff0000;"></i>
                    <div style="position:absolute;bottom:5px;right:5px;background:rgba(0,0,0,0.6);color:white;font-size:0.56rem;padding:2px 5px;border-radius:3px;">${v.duration}</div>
                </div>
                <div style="padding:12px 14px;flex:1;min-width:0;">
                    <span style="font-size:0.62rem;color:var(--text-light);">${v.channel}</span>
                    <p style="font-size:0.82rem;font-weight:700;color:var(--text-dark);line-height:1.4;margin:3px 0 0;">${v.title}</p>
                </div>
            </div>
        </a>
    `).join('');
}

/* ── Render Video Islami ── */
function renderVideoIslami() {
    const el = document.getElementById('eduVideoIslamiList');
    if (!el) return;
    el.innerHTML = videoIslamiData.map(v => `
        <a href="${v.url}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
            <div style="background:white;border-radius:14px;overflow:hidden;border:1px solid rgba(0,0,0,0.07);box-shadow:0 2px 8px rgba(0,0,0,0.04);display:flex;gap:0;align-items:stretch;transition:all .25s;cursor:pointer;" onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)';this.style.borderColor='rgba(0,0,0,0.13)'" onmouseleave="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)';this.style.borderColor='rgba(0,0,0,0.07)'">
                <div style="width:80px;min-height:68px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;">
                    <i class="fab fa-youtube" style="font-size:1.8rem;color:#ff0000;"></i>
                    <div style="position:absolute;bottom:5px;right:5px;background:rgba(0,0,0,0.6);color:white;font-size:0.56rem;padding:2px 5px;border-radius:3px;">${v.duration}</div>
                </div>
                <div style="padding:12px 14px;flex:1;min-width:0;">
                    <span style="font-size:0.62rem;color:var(--text-light);">${v.channel}</span>
                    <p style="font-size:0.82rem;font-weight:700;color:var(--text-dark);line-height:1.4;margin:3px 0 0;">${v.title}</p>
                </div>
            </div>
        </a>
    `).join('');
}

/* ── Render Video Surah ── */
function renderVideoSurah() {
    const el = document.getElementById('eduVideoSurahList');
    if (!el) return;
    el.innerHTML = videoSurahData.map(v => `
        <div style="background:white;border-radius:16px;overflow:hidden;border:1px solid rgba(0,0,0,0.07);box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <!-- Surah header -->
            <div style="background:#f8fafc;padding:16px 18px 14px;border-bottom:1px solid rgba(0,0,0,0.06);">
                <p style="font-size:0.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary);margin-bottom:4px;">${v.surah}</p>
                <p style="font-family:'Scheherazade New',serif;font-size:22px;direction:rtl;text-align:right;color:#1a1a2e;margin:0;line-height:1.9;">${v.arabTitle}</p>
            </div>
            <!-- Video link -->
            <a href="${v.url}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                <div style="display:flex;align-items:center;gap:14px;padding:14px 18px;transition:background .2s;" onmouseenter="this.style.background='#f8fafc'" onmouseleave="this.style.background='transparent'">
                    <div style="width:44px;height:44px;background:#f1f5f9;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <i class="fab fa-youtube" style="color:#ff0000;font-size:1.3rem;"></i>
                    </div>
                    <div style="flex:1;min-width:0;">
                        <p style="font-size:0.8rem;font-weight:700;color:var(--text-dark);line-height:1.4;margin-bottom:3px;">${v.title}</p>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="font-size:0.62rem;color:var(--text-light);">${v.channel}</span>
                            <span style="font-size:0.6rem;background:rgba(0,0,0,0.06);border-radius:4px;padding:1px 6px;color:var(--text-gray);">${v.duration}</span>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    `).join('');
}

/* ── Video sub-tab switcher ── */
window.videoSwitchTab = function(tab) {
    ['umum','islami','surah'].forEach(t => {
        const panel = document.getElementById('vpanel-'+t);
        if (panel) panel.style.display = t===tab ? 'flex' : 'none';
        const btn = document.getElementById('vtab-'+t);
        if (btn) {
            if (t===tab) {
                if (t==='umum') { btn.style.background='#f97316'; btn.style.color='white'; btn.style.border='none'; }
                else if (t==='islami') { btn.style.background='linear-gradient(135deg,#0d9488,#06b6d4)'; btn.style.color='white'; btn.style.border='none'; }
                else { btn.style.background='linear-gradient(135deg,#7c3aed,#8b5cf6)'; btn.style.color='white'; btn.style.border='none'; }
            } else {
                btn.style.background='white';
                btn.style.color='var(--text-gray)';
                if (t==='umum') btn.style.border='1.5px solid rgba(245,158,11,0.3)';
                else if (t==='islami') btn.style.border='1.5px solid rgba(13,148,136,0.25)';
                else btn.style.border='1.5px solid rgba(139,92,246,0.25)';
            }
        }
    });
    if (tab === 'umum') renderVideos();
    if (tab === 'islami') renderVideoIslami();
    if (tab === 'surah') renderVideoSurah();
};

/* ── Coping sub-tab switcher ── */
window.copingSwitchTab = function(tab) {
    ['latihan','islami'].forEach(t => {
        const panel = document.getElementById('cpanel-'+t);
        if (panel) panel.style.display = t===tab ? 'block' : 'none';
        const btn = document.getElementById('ctab-'+t);
        if (btn) {
            if (t===tab) {
                btn.style.background='linear-gradient(135deg,#0d9488,#06b6d4)';
                btn.style.color='white';
                btn.style.border='none';
            } else {
                btn.style.background='white';
                btn.style.color='var(--text-gray)';
                btn.style.border='1.5px solid rgba(13,148,136,0.25)';
            }
        }
    });
};

window.eduSwitchTab = function(tab) {
    ['konten','video','coping'].forEach(t => {
        const panel = document.getElementById('epanel-'+t);
        if (panel) panel.style.display = t===tab ? 'block' : 'none';
        const btn = document.getElementById('etab-'+t);
        if (btn) {
            if (t===tab) { btn.style.color='#f59e0b'; btn.style.borderBottom='3px solid #f59e0b'; }
            else { btn.style.color='var(--text-gray)'; btn.style.borderBottom='3px solid transparent'; }
        }
        // Sync horizontal topnav
        const sfbtn = document.getElementById('sfnav-d-'+t);
        if (sfbtn) sfbtn.classList.toggle('active', t===tab);
    });
    // update label
    const labelMap = {konten:'Artikel & Video', video:'Tips Self-Dev', coping:'Latihan Coping'};
    const lbl = document.getElementById('fitur-d-active-label');
    if (lbl) lbl.textContent = labelMap[tab] || tab;
    // Always re-render to ensure DOM is populated (fixes empty list on first open)
    if (tab === 'konten') renderArtikels();
    if (tab === 'video')  renderVideos();
};

window.filterEdu = function(btn, cat) {
    document.querySelectorAll('.edu-cat-btn').forEach(b => { b.style.background='white'; b.style.color='var(--text-gray)'; b.style.borderColor='rgba(245,158,11,0.3)'; });
    btn.style.background='#f59e0b'; btn.style.color='white'; btn.style.borderColor='#f59e0b';
    activeEduCat = cat;
    renderArtikels();
};

    // Render saat DOM siap — bukan langsung (mencegah eduArtikelList belum ada)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { renderArtikels(); renderVideos(); });
    } else {
        renderArtikels();
        renderVideos();
    }
})();

(function() {
            'use strict';

/* ── Supabase config — pakai global HN_SB_URL & HN_SB_KEY ── */
const SUPABASE_URL  = HN_SB_URL;
const SUPABASE_KEY  = HN_SB_KEY;
const TABLE_MOOD    = 'hifz_check_entries';

/* ── chart instance holder ── */
let alertChart = null;

/* ── Fetch real HIFZ Alert data from Supabase ── */
async function fetchData(days) {
    try {
        const { data: { session }, error: sessionError } = await window._sb.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session || !session.user) return { mood: [], skrining: [] };

const uid = session.user.id;
const now = new Date();
const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

const [moodResult, skriningResult] = await Promise.all([
    window._sb.from('hifz_check_entries')
        .select('created_at,mood')
        .eq('user_id', uid)
        .gte('created_at', start.toISOString())
        .lt('created_at', end.toISOString())
        .order('created_at', { ascending: true }),
    window._sb.from('hn_skrining_results')
        .select('created_at,total_score')
        .eq('user_id', uid)
        .gte('created_at', start.toISOString())
        .lt('created_at', end.toISOString())
        .order('created_at', { ascending: true })
]);

if (moodResult.error) throw moodResult.error;
if (skriningResult.error) throw skriningResult.error;

        return {
            mood: Array.isArray(moodResult.data) ? moodResult.data : [],
            skrining: Array.isArray(skriningResult.data) ? skriningResult.data : []
        };
    } catch (e) {
        console.warn('[HIFZ Alert] Gagal mengambil data Supabase:', e);
        return { mood: [], skrining: [], error: e };
    }
}

function localDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function normalizeAlertData(data) {
    const moodByDate = new Map();
    const skriningByDate = new Map();

(data.mood || []).forEach(row => {
    if (!row || !row.created_at) return;
    const key = localDateKey(new Date(row.created_at));
    // Satu mood per hari seharusnya sudah dijaga saat submit; latest tetap dipakai sebagai pengaman.
    const prev = moodByDate.get(key);
    if (!prev || new Date(row.created_at) > new Date(prev.created_at)) moodByDate.set(key, row);
});

(data.skrining || []).forEach(row => {
    if (!row || !row.created_at || row.total_score == null) return;
    const key = localDateKey(new Date(row.created_at));
    // Jika ada lebih dari satu skrining pada hari yang sama, grafik memakai hasil terbaru hari itu.
    const prev = skriningByDate.get(key);
    if (!prev || new Date(row.created_at) > new Date(prev.created_at)) skriningByDate.set(key, row);
});

    return { moodByDate, skriningByDate };
}

/* ── Pattern Detection Engine ── */
function detectPatterns(rows) {
    if (!rows || rows.length < 3) return { score: 0, patterns: [] };

// Use last 7 rows max for pattern check
const recent = rows.slice(-7);

const patterns = [];
let score = 0; // higher = more alert needed

// 1. Mood decline
const moods = recent.map(r => Number(r.mood || 3));
const moodSlope = linSlope(moods);
if (moodSlope < -0.3) {
    patterns.push({ label: 'Penurunan Mood', icon: 'fas fa-face-frown', color: '#ef4444', desc: 'Mood cenderung menurun dalam beberapa hari terakhir.' });
    score += moodSlope < -0.6 ? 2 : 1;
}

// 2. Mental health decline — dihitung dari stress, hopelessness, withdraw
const mental = recent.map(r => { const s=Number(r.stress||3),h=Number(r.hopelessness||3),w=Number(r.withdraw||3); return Math.round((6-((s+h+w)/3))*10)/10; });


const mentalSlope = linSlope(mental);
const avgMental = mental.reduce((a,b) => a+b, 0) / mental.length;
if (mentalSlope < -0.3) {
    patterns.push({ label: 'Kesehatan Mental Menurun', icon: 'fas fa-brain', color: '#0d9488', desc: 'Kondisi kesehatan mental menunjukkan tren menurun yang perlu diperhatikan.' });
    score += mentalSlope < -0.6 ? 2 : 1;
} else if (avgMental <= 2) {
    patterns.push({ label: 'Kesehatan Mental Rendah', icon: 'fas fa-brain', color: '#0d9488', desc: 'Rata-rata kesehatan mental berada di zona yang memerlukan perhatian.' });
    score += avgMental <= 1.5 ? 2 : 1;
}

    return { score, patterns };
}

/* ── Simple linear slope via least-squares ── */
function linSlope(arr) {
    const n = arr.length;
    if (n < 2) return 0;
    const xMean = (n - 1) / 2;
    const yMean = arr.reduce((a,b) => a+b, 0) / n;
    let num = 0, den = 0;
    arr.forEach((y, x) => {
        num += (x - xMean) * (y - yMean);
        den += (x - xMean) ** 2;
    });
    return den === 0 ? 0 : num / den;
}

/* ── Status levels ── */
const STATUS = {
    aman      : { label:'Aman', emoji:'', color:'#10b981', bg:'rgba(16,185,129,0.07)', border:'rgba(16,185,129,0.25)', icon:'fas fa-shield-check', desc:'Kondisi psikologismu secara keseluruhan terpantau stabil. Terus pertahankan kebiasaan baikmu!' },
    perhatian : { label:'Perhatian', emoji:'', color:'#f59e0b', bg:'rgba(245,158,11,0.07)', border:'rgba(245,158,11,0.3)', icon:'fas fa-triangle-exclamation', desc:'Ada beberapa sinyal perubahan yang perlu diperhatikan. Jangan abaikan perasaanmu sekarang.' },
    waspada   : { label:'Waspada', emoji:'', color:'#ef4444', bg:'rgba(239,68,68,0.07)', border:'rgba(239,68,68,0.3)', icon:'fas fa-circle-exclamation', desc:'Pola data menunjukkan beberapa tanda yang memerlukan tindakan segera. Kamu tidak sendiri.' }
};

/* ── Pick status from score ── */
function getStatus(score) {
    if (score <= 1) return 'aman';
    if (score <= 3) return 'perhatian';
    return 'waspada';
}

/* ── Recommendations per status ── */
const REKOMENDASI = {
    aman: [
        { icon:'fas fa-heart', color:'#10b981', text:'Lanjutkan check-in harian di HIFZ Check untuk terus memantau kondisimu.' },
        { icon:'fas fa-moon',  color:'#6366f1', text:'Pertahankan rutinitas dzikir dan refleksi spiritual di HIFZ Ruh.' },
        { icon:'fas fa-people-group', color:'#0d9488', text:'Tetap aktif di komunitas — berbagi kebaikan kepada sesama.' },
    ],
    perhatian: [
        { icon:'fas fa-pen-to-square', color:'#f59e0b', text:'Tulis refleksi harianmu di HIFZ Journal untuk melepaskan beban pikiran.' },
        { icon:'fas fa-wind',  color:'#06b6d4', text:'Coba latihan pernapasan 4-7-8 di HIFZ Edu Coping untuk meredakan stres.' },
        { icon:'fas fa-moon',  color:'#8b5cf6', text:'Buka HIFZ Ruh & Hope — baca ayat refleksi dan afirmasi Islami hari ini.' },
        { icon:'fas fa-comments', color:'#ec4899', text:'Ceritakan perasaanmu kepada orang terpercaya atau di forum HIFZ Support.' },
    ],
    waspada: [
        { icon:'fas fa-phone', color:'#ef4444', text:'Segera hubungi konselor atau orang dewasa terpercaya di sekitarmu.' },
        { icon:'fas fa-hands-holding-heart', color:'#ec4899', text:'Buka HIFZ Support & Safe — akses jalur bantuan profesional tersedia 24 jam.' },
        { icon:'fas fa-book-open-reader', color:'#8b5cf6', text:'Baca QS. Az-Zumar: 53 — "Janganlah berputus asa dari rahmat Allah."' },
        { icon:'fas fa-house-chimney-heart', color:'#f97316', text:'Batasi isolasi diri. Ajak satu orang terdekat untuk menemanimu hari ini.' },
        { icon:'fas fa-clipboard-list', color:'#6366f1', text:'Lakukan skrining ulang di HIFZ Check untuk evaluasi kondisi terkini.' },
    ]
};

/* ── Render status banner ── */
function renderStatus(statusKey) {
    const s = STATUS[statusKey];
    document.getElementById('alertStatusBanner').innerHTML = `
        <div style="background:${s.bg};border:1.5px solid ${s.border};border-radius:20px;padding:22px 24px;display:flex;gap:18px;align-items:flex-start;">
            <div style="width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,${s.color} 0%,${s.color}cc 100%);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 6px 18px ${s.border},0 2px 6px rgba(0,0,0,0.08);position:relative;overflow:hidden;">
                <div style="position:absolute;top:-8px;right:-8px;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.15);"></div>
                <div style="position:absolute;bottom:-6px;left:-6px;width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,0.1);"></div>
                <i class="${s.icon}" style="color:#fff;font-size:1.3rem;position:relative;z-index:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.2));"></i>
            </div>
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap;">
                    <span style="font-size:1rem;font-weight:800;color:${s.color};">Status: ${s.label}</span>
                    <span style="padding:3px 12px;border-radius:50px;background:${s.bg};border:1px solid ${s.border};font-size:0.68rem;font-weight:700;color:${s.color};letter-spacing:.05em;">${s.emoji} ${s.label.toUpperCase()}</span>
                </div>
                <p style="font-size:0.82rem;color:var(--text-gray);line-height:1.7;">${s.desc}</p>
            </div>
        </div>`;
}

/* ── Render pattern badges ── */
function renderPatterns(patterns) {
    const el = document.getElementById('alertPatternBadges');
    if (!patterns.length) {
        el.innerHTML = '<span style="font-size:0.78rem;color:var(--text-gray);"><i class="fas fa-check-circle" style="color:#10b981;margin-right:5px;"></i>Tidak ada pola negatif terdeteksi</span>';
        return;
    }
    el.innerHTML = patterns.map(p => `
        <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:50px;background:rgba(0,0,0,0.03);border:1.5px solid ${p.color}22;">
            <i class="${p.icon}" style="color:${p.color};font-size:0.82rem;"></i>
            <span style="font-size:0.76rem;font-weight:600;color:${p.color};">${p.label}</span>
        </div>`).join('');
}

/* ── Render action recommendations ── */
function renderActions(statusKey) {
    const actions = REKOMENDASI[statusKey] || [];
    document.getElementById('alertActionList').innerHTML = actions.map((a, i) => `
        <div style="display:flex;align-items:flex-start;gap:14px;padding:14px 16px;border-radius:14px;background:white;border:1.5px solid rgba(99,102,241,0.1);box-shadow:0 2px 8px rgba(0,0,0,0.03);">
            <div style="width:36px;height:36px;border-radius:11px;background:${a.color}18;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <i class="${a.icon}" style="color:${a.color};font-size:0.9rem;"></i>
            </div>
            <div style="flex:1;min-width:0;">
                <p style="font-size:0.82rem;color:var(--text-dark);line-height:1.7;">${a.text}</p>
            </div>
        </div>`).join('');
}

/* ── Build Chart.js trend chart from real Supabase data ── */
function ensureAlertRangeToggle() {
    // Toggle dihapus — sistem pakai 30 hari terakhir secara otomatis
    window._hifzAlertRange = 30;
}

function renderChart(data, days) {
    const canvas = document.getElementById('alertTrendChart');
    if (!canvas) return;
    if (alertChart) { alertChart.destroy(); alertChart = null; }

const { moodByDate, skriningByDate } = normalizeAlertData(data);
const today = new Date();

// Buat array lengkap 30 hari terakhir
const allLabels = [], allMood = [], allSkrining = [];
for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = localDateKey(d);
    const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    allLabels.push(`${String(d.getDate()).padStart(2,'0')} ${monthNames[d.getMonth()]}`);
    const mood = moodByDate.get(key);
    const skrining = skriningByDate.get(key);
    allMood.push(mood && mood.mood != null ? Number(mood.mood) : null);
    allSkrining.push(skrining && skrining.total_score != null ? Number(skrining.total_score) : null);
}

// Temukan indeks hari pertama yang ada data (mood atau skrining)
let firstDataIdx = 0;
for (let i = 0; i < allLabels.length; i++) {
    if (allMood[i] != null || allSkrining[i] != null) { firstDataIdx = i; break; }
}

// Trim: mulai dari hari pertama ada data
const labels    = allLabels.slice(firstDataIdx);
const moodArr   = allMood.slice(firstDataIdx);
const skriningArr = allSkrining.slice(firstDataIdx);

const moodPointCount     = moodArr.filter(v => v != null).length;
const skriningPointCount = skriningArr.filter(v => v != null).length;

const titleEl = document.querySelector('#alertChartWrap p');
if (titleEl) titleEl.textContent = 'Tren 30 Hari Terakhir';

// Pesan di bawah grafik
// Tampilkan jika salah satu dataset (mood atau skrining) punya kurang dari 3 titik data
const chartNote = document.getElementById('alertChartDataNote');
if (chartNote) {
    if (moodPointCount < 3 || skriningPointCount < 3) {
        chartNote.textContent = 'Terus isi data untuk melihat tren lengkap';
    } else {
        chartNote.textContent = '';
    }
}

// Wrapper: perbesar tinggi chart
const canvasWrap = canvas.parentElement;
if (canvasWrap) canvasWrap.style.height = '320px';

    alertChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Mood',
                    data: moodArr,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99,102,241,0.10)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: moodArr.map(v => v == null ? 0 : 6),
                    pointHoverRadius: moodArr.map(v => v == null ? 0 : 8),
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    spanGaps: false,
                    borderWidth: 2.5,
                    yAxisID: 'yMood'
                },
                {
                    label: 'Kesehatan Mental',
                    data: skriningArr,
                    borderColor: '#0d9488',
                    backgroundColor: 'rgba(13,148,136,0.08)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: skriningArr.map(v => v == null ? 0 : 6),
                    pointHoverRadius: skriningArr.map(v => v == null ? 0 : 8),
                    pointBackgroundColor: '#0d9488',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    spanGaps: false,
                    borderWidth: 2.5,
                    yAxisID: 'ySkrining'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1a2e',
                    titleColor: '#e2e8f0',
                    bodyColor: 'rgba(255,255,255,0.75)',
                    padding: 14,
                    cornerRadius: 12,
                    boxPadding: 6,
                    callbacks: {
                        title: items => items[0]?.label || '',
                        label: ctx => {
                            if (ctx.parsed.y === null) return null;
                            if (ctx.datasetIndex === 0) {
                                const labels = ['','Sangat Baik','Baik','Sedang','Kurang','Buruk'];
                                return ` Mood: ${labels[ctx.parsed.y] || ctx.parsed.y}`;
                            }
                            return ` Kesehatan Mental: ${ctx.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
                    ticks: {
                        font: { family: 'Poppins', size: 11 },
                        color: '#94a3b8',
                        maxRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 15
                    }
                },
                yMood: {
                    position: 'left',
                    min: 0.5, max: 5.5,
                    grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
                    ticks: {
                        stepSize: 1,
                        font: { family: 'Poppins', size: 11 },
                        color: '#6366f1',
                        callback: v => ['','Sangat Baik','Baik','Sedang','Kurang','Buruk'][v] || ''
                    }
                },
                ySkrining: {
                    position: 'right',
                    min: 5, max: 75,
                    grid: { drawOnChartArea: false, drawBorder: false },
                    ticks: {
                        stepSize: 10,
                        font: { family: 'Poppins', size: 11 },
                        color: '#0d9488'
                    }
                }
            },
            layout: { padding: { top: 10, right: 10 } }
        }
    });
}

/* ── Main init (exposed globally so Refresh button works) ── */
window.alertInit = async function() {
    // Show loading
    document.getElementById('alertLoading').style.display = 'block';
    document.getElementById('alertNoData').style.display = 'none';
    document.getElementById('alertDashboard').style.display = 'none';
    ensureAlertRangeToggle();

const days = Number(window._hifzAlertRange || 30);
const data = await fetchData(days);
const hasData = (data.mood && data.mood.length) || (data.skrining && data.skrining.length);

document.getElementById('alertLoading').style.display = 'none';

// Tidak perlu menunggu 14/30 hari. Tampilkan grafik selama ada minimal satu data real.
if (!hasData) {
    document.getElementById('alertNoData').style.display = 'block';
    return;
}

document.getElementById('alertDashboard').style.display = 'block';

// Status/pola tetap memakai data real mood yang sudah ada; tidak ada data simulasi.
const patternRows = (data.mood || []).map(r => ({
    created_at: r.created_at,
    mood: r.mood
}));
const { score, patterns } = detectPatterns(patternRows);
const statusKey = getStatus(score);

renderStatus(statusKey);
renderPatterns(patterns);
renderChart(data, days);
renderActions(statusKey);

const now = new Date();
document.getElementById('alertTimestamp').textContent =
    `Diperbarui: ${now.toLocaleDateString('id-ID', {day:'numeric',month:'long',year:'numeric'})} pukul ${now.toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'})}`;

    applyAlertMode();
};

/* ── Show/hide sections based on _alertMode ── */
function applyAlertMode() {
    const mode = window._alertMode || 'ews';
    const isEWS = mode === 'ews';
    // EWS: pola deteksi + grafik visible; rekomendasi hidden
    // TL: pola deteksi + grafik hidden; rekomendasi visible
    const polaWrap   = document.getElementById('alertPolaWrap');
    const chartWrap  = document.getElementById('alertChartWrap');
    const divider1   = document.getElementById('alertDivider1');
    const rekomen    = document.getElementById('alertRekomendasi');
    const divider2   = document.getElementById('alertDivider2');
    const label      = document.getElementById('alertBreadcrumbLabel');
    if (polaWrap)  polaWrap.style.display  = isEWS ? '' : 'none';
    if (chartWrap) chartWrap.style.display  = isEWS ? '' : 'none';
    if (divider1)  divider1.style.display   = isEWS ? '' : 'none';
    if (rekomen)   rekomen.style.display    = isEWS ? 'none' : '';
    if (divider2)  divider2.style.display   = isEWS ? 'none' : '';
    if (label)     label.textContent        = isEWS ? 'Early Warning System' : 'Tindak Lanjut';
}

/* ── Auto-run when page becomes visible ── */
// Observer: run alertInit whenever #page-fitur-alert becomes visible
const alertPage = document.getElementById('page-fitur-alert');
if (alertPage) {
    const obs = new MutationObserver(function(muts) {
        muts.forEach(function(m) {
            if (m.attributeName === 'style' || m.attributeName === 'class') {
                const visible = alertPage.style.display !== 'none' && !alertPage.classList.contains('hidden');
                if (visible) alertInit();
            }
        });
    });
    obs.observe(alertPage, { attributes: true });
}

})();

(function(){
        const dzikirData = [
            { arabic:'سُبْحَانَ اللَّهِ', latin:'Subhanallah', arti:'Maha Suci Allah', count:33 },
            { arabic:'الْحَمْدُ لِلَّهِ', latin:'Alhamdulillah', arti:'Segala puji bagi Allah', count:33 },
            { arabic:'اللَّهُ أَكْبَرُ', latin:'Allahu Akbar', arti:'Allah Maha Besar', count:33 },
            { arabic:'لَا إِلَهَ إِلَّا اللَّهُ', latin:'La ilaha illallah', arti:'Tiada Tuhan selain Allah', count:100 },
            { arabic:'أَسْتَغْفِرُ اللَّهَ', latin:'Astaghfirullah', arti:'Aku mohon ampun kepada Allah', count:100 },
        ];
        const countersA = {};
        function renderDzikirA(){
            const el = document.getElementById('dzikirListA');
            if(!el) return;
            el.innerHTML = dzikirData.map((d,i)=>`
                <div style="background:white;border-radius:14px;padding:16px 18px;border:1.5px solid rgba(139,92,246,0.12);display:flex;align-items:center;justify-content:space-between;gap:12px;">
                    <div>
                        <div style="font-size:1.1rem;direction:rtl;font-family:'Georgia',serif;color:#4c1d95;margin-bottom:4px;">${d.arabic}</div>
                        <div style="font-size:0.75rem;color:#8b5cf6;font-weight:600;">${d.latin}</div>
                        <div style="font-size:0.7rem;color:var(--text-gray);">${d.arti}</div>
                    </div>
                    <div style="text-align:center;flex-shrink:0;">
                        <button onclick="countDzikirA(${i})" style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#6366f1);border:none;color:#fff;font-size:1rem;cursor:pointer;font-family:'Poppins',sans-serif;font-weight:700;transition:transform .15s;" onmousedown="this.style.transform='scale(.9)'" onmouseup="this.style.transform='scale(1)'" id="dbtnA-${i}">${countersA[i]||0}</button>
                        <div style="font-size:0.6rem;color:var(--text-light);margin-top:4px;">/ ${d.count}x</div>
                    </div>
                </div>
            `).join('');
        }
        let _audioCtxA = null;
        function playClickA(done) {
            try {
                if (!_audioCtxA) _audioCtxA = new (window.AudioContext || window.webkitAudioContext)();
                const ctx = _audioCtxA;
                const osc = ctx.createOscillator(); const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.type = 'sine';
                if (done) {
                    osc.frequency.setValueAtTime(880, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
                    gain.gain.setValueAtTime(0.28, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
                } else {
                    osc.frequency.setValueAtTime(520, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.06);
                    gain.gain.setValueAtTime(0.18, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.08);
                }
            } catch(e) {}
        }
        window.countDzikirA = function(i){
            const target = dzikirData[i].count;
            const prev = countersA[i] || 0;
            if (prev >= target) return;
            countersA[i] = prev + 1;
            const btn = document.getElementById('dbtnA-'+i);
            const done = countersA[i] === target;
            playClickA(done);
            if(btn) {
                btn.textContent = countersA[i];
                if (done) {
                    btn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
                    setTimeout(() => { countersA[i]=0; btn.textContent=0; btn.style.background='linear-gradient(135deg,#8b5cf6,#6366f1)'; }, 1200);
                }
            }
        };
        renderDzikirA();
    })();

(function(){
        const afirmasiList = [
            'Aku adalah hamba Allah yang berharga dan dicintai-Nya.',
            'Setiap kesulitan yang aku hadapi adalah jalan menuju ketenangan.',
            'Aku berhak merasa baik-baik saja dan meminta pertolongan.',
            'Allah tidak membebani seseorang melebihi kesanggupannya.',
            'Dengan sabar dan sholat, aku menemukan ketenangan jiwa.',
            'Aku percaya bahwa setelah kesulitan ada kemudahan.',
            'Aku percaya Allah selalu bersamaku di setiap langkah.',
            'Hatiku terbuka untuk menerima rahmat dan kasih sayang Allah.',
        ];
        let afirmasiIdxB = 0;
        function showAfirmasiB(){
            const el = document.getElementById('afirmasiTextB');
            if(el) el.textContent = afirmasiList[afirmasiIdxB];
        }
        window.nextAfirmasiB = function(){
            afirmasiIdxB = (afirmasiIdxB+1) % afirmasiList.length;
            showAfirmasiB();
        };
        window.simpanSyukurB = function(){
            const v = [1,2,3].map(i=>document.getElementById('syukurB'+i).value.trim()).filter(Boolean);
            const msg = document.getElementById('syukurMsgB');
            if(v.length===0){ msg.textContent='Isi minimal 1 hal yang kamu syukuri'; return; }
            msg.textContent = 'Syukur tersimpan! Semoga harimu semakin indah.';
            setTimeout(()=>{ msg.textContent=''; [1,2,3].forEach(i=>{ document.getElementById('syukurB'+i).value=''; }); },2500);
        };
        showAfirmasiB();
    })();

(function(){ if(document.getElementById('page-fitur-ruh').classList.contains('active')){ _showPage('hub-ruh'); } })();

// Prevent pinch-to-zoom only (allow normal scroll)
        document.addEventListener('touchmove', function(e) {
            if (e.touches.length > 1) { e.preventDefault(); }
        }, { passive: false });
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) { e.preventDefault(); }
        }, { passive: false });
        var lastTouchEnd = 0;
        document.addEventListener('touchend', function(e) {
            var now = Date.now();
            if (now - lastTouchEnd <= 300) { e.preventDefault(); }
            lastTouchEnd = now;
        }, false);
        document.addEventListener('gesturestart', function(e) { e.preventDefault(); }, false);
        document.addEventListener('gesturechange', function(e) { e.preventDefault(); }, false);
        document.addEventListener('gestureend', function(e) { e.preventDefault(); }, false);
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
                e.preventDefault();
            }
        });
        document.addEventListener('wheel', function(e) {
            if (e.ctrlKey) { e.preventDefault(); }
        }, { passive: false });

(function(){
        const splash = document.getElementById('hfz-splash');
        if(!splash) return;
        const _t0 = Date.now();
        function hideSplash(){
            const delay = Math.max(0, 4800 - (Date.now() - _t0));
            setTimeout(()=>{ splash.classList.add('out'); setTimeout(()=>{ splash.style.display='none'; },700); }, delay);
        }
        if(document.readyState === 'loading'){
            document.addEventListener('DOMContentLoaded', hideSplash);
        } else { hideSplash(); }
        // Hard fallback
        setTimeout(()=>{ splash.classList.add('out'); setTimeout(()=>{ splash.style.display='none'; },700); }, 6500);
    })();

// renderIconHtml already defined globally at top of script block

(function(){
    // ============================================================
    // EXERCISE DATA
    // ============================================================
    const CM_EXERCISES = {
        nafas: {
            title: 'Pernapasan 4-7-8',
            subtitle: 'Teknik menenangkan sistem saraf',
            icon: 'fa-wind',
            grad: 'linear-gradient(135deg,#06b6d4,#0ea5e9)',
            color: '#06b6d4',
            quote: 'Dan sesungguhnya dalam penciptaan langit dan bumi terdapat tanda-tanda bagi orang yang berakal.',
            quoteSource: 'QS. Ali Imran: 190',
            steps: [
                { type:'breathe', phase:'inhale', duration:4, label:'Tarik Napas', instruction:'Tarik napas perlahan lewat hidung selama 4 detik', btnText:'Siap, mulai!' },
                { type:'breathe', phase:'hold',   duration:7, label:'Tahan',       instruction:'Tahan napas selama 7 detik. Rasakan ketenangan.', btnText:'Lanjut →' },
                { type:'breathe', phase:'exhale', duration:8, label:'Buang Napas', instruction:'Buang napas perlahan lewat mulut selama 8 detik', btnText:'Lanjut →' },
                { type:'breathe', phase:'inhale', duration:4, label:'Tarik Napas', instruction:'Ulangi — tarik napas lagi, 4 detik', btnText:'Lanjut →' },
                { type:'breathe', phase:'hold',   duration:7, label:'Tahan',       instruction:'Tahan napas, 7 detik', btnText:'Lanjut →' },
                { type:'breathe', phase:'exhale', duration:8, label:'Buang Napas', instruction:'Buang napas, 8 detik terakhir', btnText:'Selesai ✓' },
            ]
        },
        grounding: {
            title: 'Grounding 5-4-3-2-1',
            subtitle: 'Kembali ke saat ini dengan indera',
            icon: 'fa-leaf',
            grad: 'linear-gradient(135deg,#34d399,#10b981)',
            color: '#10b981',
            quote: 'Maka ingatlah kepada-Ku, niscaya Aku pun akan ingat kepadamu.',
            quoteSource: 'QS. Al-Baqarah: 152',
            steps: [
                { type:'grounding', sense:'see',   number:5, emoji:'👁️', label:'5 hal yang kamu LIHAT',   prompt:'Sebutkan 5 benda di sekitarmu yang bisa kamu lihat sekarang', chips:['Dinding','Langit','Meja','Tangan','Pintu'], btnText:'Lanjut →' },
                { type:'grounding', sense:'touch',  number:4, emoji:'✋', label:'4 hal yang kamu SENTUH', prompt:'Rasakan 4 tekstur benda yang menyentuh tubuhmu', chips:['Kursi','Baju','Lantai','Meja'], btnText:'Lanjut →' },
                { type:'grounding', sense:'hear',   number:3, emoji:'👂', label:'3 hal yang kamu DENGAR',  prompt:'Dengarkan sekeliling — apa 3 suara yang kamu tangkap?', chips:['Angin','Kendaraan','Nafas'], btnText:'Lanjut →' },
                { type:'grounding', sense:'smell',  number:2, emoji:'👃', label:'2 hal yang kamu CIUM',    prompt:'Hirup udara — apa dua aroma yang kamu rasakan?', chips:['Udara segar','Ruangan'], btnText:'Lanjut →' },
                { type:'grounding', sense:'taste',  number:1, emoji:'👅', label:'1 hal yang kamu RASA',    prompt:'Perhatikan satu rasa di mulutmu saat ini', chips:['Netral'], btnText:'Selesai ✓' },
            ]
        },
        relaksasi: {
            title: 'Relaksasi Otot Progresif',
            subtitle: 'Lepaskan ketegangan fisik step by step',
            icon: 'fa-person-rays',
            grad: 'linear-gradient(135deg,#0d9488,#0f766e)',
            color: '#0d9488',
            quote: 'Sesungguhnya Allah mencintai orang yang menjaga tubuhnya dengan baik.',
            quoteSource: 'HR. Bukhari',
            steps: [
                { type:'muscle', group:'Tangan & Lengan', emoji:'✊', tenseSec:5, relaxSec:10, instruction:'Kepalkan kedua tangan erat selama 5 detik, lalu lepaskan perlahan', btnText:'Mulai Tegangkan →' },
                { type:'muscle', group:'Bahu & Leher',    emoji:'🤷', tenseSec:5, relaxSec:10, instruction:'Angkat kedua bahu setinggi mungkin ke telinga, tahan 5 detik, lepaskan', btnText:'Mulai Tegangkan →' },
                { type:'muscle', group:'Wajah',           emoji:'😬', tenseSec:5, relaxSec:8,  instruction:'Kerutkan dahi, pejamkan mata, dan katupkan gigi — 5 detik, lalu relakskan', btnText:'Mulai Tegangkan →' },
                { type:'muscle', group:'Perut',           emoji:'🫁', tenseSec:5, relaxSec:10, instruction:'Kencangkan otot perut seolah menahan pukulan, 5 detik, lalu bebaskan', btnText:'Mulai Tegangkan →' },
                { type:'muscle', group:'Kaki',            emoji:'🦵', tenseSec:5, relaxSec:10, instruction:'Tekuk jari-jari kaki, tegangkan betis dan paha — 5 detik, lalu lepaskan', btnText:'Mulai Tegangkan →' },
            ]
        },
        emosi: {
            title: 'Emotion Labeling',
            subtitle: 'Kenali dan beri nama emosimu',
            icon: 'fa-tags',
            grad: 'linear-gradient(135deg,#f59e0b,#d97706)',
            color: '#f59e0b',
            quote: 'Dan janganlah kamu berputus asa dari rahmat Allah.',
            quoteSource: 'QS. Az-Zumar: 53',
            steps: [
                { type:'emotion-pick',      instruction:'Pilih emosi yang paling menggambarkan perasaanmu sekarang', btnText:'Lanjut →' },
                { type:'emotion-intensity', instruction:'Seberapa kuat emosi ini kamu rasakan?', btnText:'Lanjut →' },
                { type:'emotion-where',     instruction:'Di mana di tubuhmu kamu merasakannya?', chips:['Dada','Perut','Kepala','Tenggorokan','Pundak','Seluruh tubuh'], btnText:'Lanjut →' },
                { type:'emotion-message',   instruction:'Apa yang ingin disampaikan emosi ini kepadamu?', chips:['Butuh istirahat','Butuh bicara','Butuh ruang sendiri','Butuh bergerak','Butuh doa'], btnText:'Selesai ✓' },
            ]
        }
    };

const CM_EMOTIONS = [
    {emoji:'😰',name:'Cemas'},{emoji:'😔',name:'Sedih'},{emoji:'😤',name:'Marah'},
    {emoji:'😨',name:'Takut'},{emoji:'😶',name:'Mati rasa'},{emoji:'😕',name:'Bingung'},
    {emoji:'😩',name:'Lelah'},{emoji:'🙁',name:'Kecewa'},{emoji:'🫤',name:'Tidak puas'},
];

// ============================================================
// STATE
// ============================================================
let _cmEx = null, _cmStep = 0, _cmTimer = null, _cmChips = {}, _cmEmotion = null, _cmIntensity = 0, _cmMusclePhase = 'ready';

// ============================================================
// OPEN / CLOSE
// ============================================================
window.openCopingModal = function(type) {
    const ex = CM_EXERCISES[type];
    if (!ex) return;
    _cmEx = type; _cmStep = 0; _cmChips = {}; _cmEmotion = null; _cmIntensity = 0; _cmMusclePhase = 'ready';
    clearCmTimer();

const overlay = document.getElementById('copingModalOverlay');
const content = document.getElementById('copingModalContent');

content.innerHTML = _buildShell(ex);
overlay.style.display = 'flex';
document.body.style.overflow = 'hidden';

    _cmBuildDots(ex.steps.length);
    _cmRenderStep();
};

window.closeCopingModal = function(e) {
    if (e && e.target !== document.getElementById('copingModalOverlay')) return;
    clearCmTimer();
    document.getElementById('copingModalOverlay').style.display = 'none';
    document.body.style.overflow = '';
};

function clearCmTimer() {
    if (_cmTimer) { clearInterval(_cmTimer); _cmTimer = null; }
}

// ============================================================
// SHELL
// ============================================================
function _buildShell(ex) {
    return `
    <div style="background:${ex.grad};border-radius:24px 24px 0 0;padding:16px 20px 14px;position:relative;display:flex;align-items:center;gap:12px;">
        <button onclick="closeCopingModal()" style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.2);border:none;width:32px;height:32px;border-radius:50%;color:white;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;"><i class="fas fa-times"></i></button>
        <div style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;"><i class="fas ${ex.icon}" style="color:white;font-size:1.2rem;"></i></div>
        <div>
            <p style="font-size:0.6rem;color:rgba(255,255,255,0.8);font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin:0;">Latihan Coping</p>
            <h3 style="color:white;font-size:1rem;font-weight:700;margin:0;">${ex.title}</h3>
        </div>
    </div>
    <div id="cm-dots" style="display:flex;justify-content:center;gap:8px;padding:12px 0 8px;"></div>
    <div id="cm-visual" style="min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 20px;"></div>
    <div style="padding:0 20px 24px;text-align:center;">
        <p id="cm-instruction" style="font-size:0.8rem;color:#64748b;margin-bottom:14px;min-height:36px;line-height:1.5;"></p>
        <button id="cm-next-btn" onclick="cmNextStep()" style="width:100%;max-width:300px;padding:14px;border-radius:50px;border:none;font-size:0.9rem;font-weight:700;color:white;cursor:pointer;background:${ex.grad};box-shadow:0 4px 16px rgba(0,0,0,0.15);font-family:'Poppins',sans-serif;transition:transform 0.15s;"></button>
    </div>`;
}

// ============================================================
// DOTS
// ============================================================
function _cmBuildDots(n) {
    const wrap = document.getElementById('cm-dots');
    if (!wrap) return;
    const ex = CM_EXERCISES[_cmEx];
    wrap.innerHTML = Array.from({length:n}, (_,i) => `<div class="cm-dot ${i===0?'active':''}" id="cm-dot-${i}" style="background:${i===0?ex.color:'#ddd'};"></div>`).join('');
}

function _cmUpdateDots() {
    const ex = CM_EXERCISES[_cmEx];
    const n = ex.steps.length;
    for (let i=0;i<n;i++) {
        const d = document.getElementById('cm-dot-'+i);
        if (!d) continue;
        d.className = 'cm-dot'+(i===_cmStep?' active':'');
        d.style.background = i<=_cmStep ? ex.color : '#ddd';
    }
}

// ============================================================
// RENDER STEP
// ============================================================
function _cmRenderStep() {
    clearCmTimer();
    const ex = CM_EXERCISES[_cmEx];
    const step = ex.steps[_cmStep];
    const visual = document.getElementById('cm-visual');
    const instr = document.getElementById('cm-instruction');
    const btn = document.getElementById('cm-next-btn');
    if (!visual||!instr||!btn) return;

btn.style.background = ex.grad;
btn.textContent = step.btnText || 'Lanjut →';
btn.disabled = false; btn.style.opacity = '1';
instr.textContent = step.instruction || '';
_cmUpdateDots();

    if (step.type === 'breathe')           _cmRenderBreathe(step, visual, ex);
    else if (step.type === 'grounding')    _cmRenderGrounding(step, visual, ex);
    else if (step.type === 'muscle')       _cmRenderMuscle(step, visual, ex);
    else if (step.type === 'emotion-pick')      _cmRenderEmotionPick(step, visual, ex);
    else if (step.type === 'emotion-intensity') _cmRenderEmotionIntensity(step, visual, ex);
    else if (step.type === 'emotion-where')     _cmRenderEmotionChips(step, visual, ex);
    else if (step.type === 'emotion-message')   _cmRenderEmotionChips(step, visual, ex);
}

// ============================================================
// BREATHE
// ============================================================
function _cmRenderBreathe(step, visual, ex) {
    const startSize = step.phase==='inhale' ? 130 : step.phase==='exhale' ? 210 : 180;
    visual.innerHTML = `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:260px;height:260px;">
        <svg width="260" height="260" style="position:absolute;top:0;left:0;">
            <circle cx="130" cy="130" r="118" fill="none" stroke="${ex.color}22" stroke-width="16"/>
            <circle id="cm-arc" cx="130" cy="130" r="118"
                fill="none" stroke="${ex.color}" stroke-width="8"
                stroke-linecap="round"
                stroke-dasharray="${2*Math.PI*118}"
                stroke-dashoffset="${2*Math.PI*118}"
                transform="rotate(-90 130 130)"/>
        </svg>
        <div id="cm-breath-circle" style="
            width:${startSize}px;height:${startSize}px;border-radius:50%;
            background:${ex.color};
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            transition:all 0.8s ease;z-index:2;position:relative;
            box-shadow:0 0 0 0 ${ex.color}66;
        ">
            <div style="font-size:0.85rem;font-weight:700;color:white;letter-spacing:1px;">${step.label.toUpperCase()}</div>
            <div id="cm-breath-num" style="font-size:3rem;font-weight:800;color:white;line-height:1;">${step.duration}</div>
        </div>
    </div>`;

setTimeout(() => {
    const circle = document.getElementById('cm-breath-circle');
    if (!circle) return;
    const endSize = step.phase==='inhale' ? 200 : step.phase==='exhale' ? 130 : 180;
    circle.style.width = endSize+'px'; circle.style.height = endSize+'px';
    if (step.phase==='inhale') circle.style.boxShadow = `0 0 60px 20px ${ex.color}22`;
    else if (step.phase==='exhale') circle.style.boxShadow = `0 0 0 0 ${ex.color}11`;
}, 100);

    let elapsed = 0;
    const total = step.duration;
    const circ = 2*Math.PI*118;
    _cmTimer = setInterval(() => {
        elapsed++;
        const numEl = document.getElementById('cm-breath-num');
        const arc = document.getElementById('cm-arc');
        const remaining = total - elapsed;
        if (numEl) numEl.textContent = remaining > 0 ? remaining : '✓';
        if (arc) arc.style.strokeDashoffset = circ * (1 - elapsed/total);
        if (elapsed >= total) clearCmTimer();
    }, 1000);
}

// ============================================================
// GROUNDING
// ============================================================
function _cmRenderGrounding(step, visual, ex) {
    if (!_cmChips[_cmStep]) _cmChips[_cmStep] = new Set();
    const chipsHtml = step.chips.map((c,i) => {
        const done = _cmChips[_cmStep].has(i);
        return `<div class="cm-chip${done?' done':''}" onclick="cmToggleChip(${_cmStep},${i},this,'${ex.color}')"
            style="${done?`border-color:${ex.color};background:${ex.color};color:white;`:''}">${c}</div>`;
    }).join('');
    visual.innerHTML = `
    <div class="cm-anim-step" style="text-align:center;">
        <div style="font-size:5rem;margin-bottom:12px;animation:cm_popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)">${step.emoji}</div>
        <div style="font-size:1.6rem;font-weight:800;color:${ex.color};margin-bottom:6px;">${step.number}</div>
        <div style="font-size:1.05rem;font-weight:700;margin-bottom:8px;">${step.label}</div>
        <div style="font-size:0.82rem;color:#64748b;margin-bottom:18px;max-width:240px;line-height:1.6;">${step.prompt}</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:280px;">${chipsHtml}</div>
    </div>`;
}

window.cmToggleChip = function(stepIdx, chipIdx, el, color) {
    if (!_cmChips[stepIdx]) _cmChips[stepIdx] = new Set();
    if (_cmChips[stepIdx].has(chipIdx)) {
        _cmChips[stepIdx].delete(chipIdx);
        el.classList.remove('done');
        el.style.borderColor=''; el.style.background=''; el.style.color='';
    } else {
        _cmChips[stepIdx].add(chipIdx);
        el.classList.add('done');
        el.style.borderColor=color; el.style.background=color; el.style.color='white';
    }
};

// ============================================================
// MUSCLE
// ============================================================
function _cmRenderMuscle(step, visual, ex) {
    _cmMusclePhase = 'ready';
    const btn = document.getElementById('cm-next-btn');
    if (btn) btn.textContent = step.btnText || 'Mulai Tegangkan →';
    visual.innerHTML = `
    <div class="cm-anim-step" style="text-align:center;">
        <div style="font-size:5rem;margin-bottom:12px;animation:cm_popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)">${step.emoji}</div>
        <div style="font-size:1.2rem;font-weight:800;color:${ex.color};margin-bottom:8px;">${step.group}</div>
        <div id="cm-muscle-state" style="font-size:0.85rem;color:#64748b;max-width:240px;line-height:1.6;margin:0 auto;">${step.instruction}</div>
        <div id="cm-muscle-timer" style="margin-top:20px;display:none;">
            <svg width="110" height="110" style="display:block;margin:0 auto">
                <circle cx="55" cy="55" r="46" fill="none" stroke="#eee" stroke-width="8"/>
                <circle id="cm-mt-arc" cx="55" cy="55" r="46"
                    fill="none" stroke="${ex.color}" stroke-width="8"
                    stroke-linecap="round"
                    stroke-dasharray="${2*Math.PI*46}"
                    stroke-dashoffset="${2*Math.PI*46}"
                    transform="rotate(-90 55 55)"/>
                <text id="cm-mt-num" x="55" y="63" text-anchor="middle"
                    font-size="26" font-weight="800" fill="${ex.color}" font-family="Poppins,system-ui"></text>
            </svg>
            <div id="cm-mt-phase" style="font-size:0.95rem;font-weight:700;margin-top:8px;color:${ex.color};"></div>
        </div>
    </div>`;
}

function _cmStartMuscleTimer(step, ex) {
    const btn = document.getElementById('cm-next-btn');
    if (btn) { btn.disabled=true; btn.style.opacity='0.5'; btn.textContent='Menunggu...'; }
    const timerWrap = document.getElementById('cm-muscle-timer');
    if (timerWrap) timerWrap.style.display = 'block';
    const arc = document.getElementById('cm-mt-arc');
    const numEl = document.getElementById('cm-mt-num');
    const phaseLabel = document.getElementById('cm-mt-phase');
    const stateEl = document.getElementById('cm-muscle-state');
    const circ = 2*Math.PI*46;
    // Phase 1: TENSE
    if (phaseLabel) phaseLabel.textContent = '💪 Tegangkan!';
    if (stateEl) stateEl.textContent = 'Tegangkan otot sekuatnya...';
    if (numEl) numEl.textContent = step.tenseSec;
    if (arc) { arc.style.stroke = ex.color; arc.style.strokeDashoffset = circ; }
    let elapsed = 0;
    _cmTimer = setInterval(() => {
        elapsed++;
        const rem = step.tenseSec - elapsed;
        if (numEl) numEl.textContent = rem>0 ? rem : '✓';
        if (arc) arc.style.strokeDashoffset = circ*(1-elapsed/step.tenseSec);
        if (elapsed >= step.tenseSec) {
            clearCmTimer();
            // Phase 2: RELAX
            elapsed = 0;
            if (arc) { arc.style.stroke='#1D9E75'; arc.style.strokeDashoffset=circ; }
            if (phaseLabel) phaseLabel.textContent = '😌 Lepaskan!';
            if (stateEl) stateEl.textContent = 'Lemaskan otot sepenuhnya...';
            if (numEl) numEl.textContent = step.relaxSec;
            _cmTimer = setInterval(() => {
                elapsed++;
                const rem2 = step.relaxSec - elapsed;
                if (numEl) numEl.textContent = rem2>0 ? rem2 : '✓';
                if (arc) arc.style.strokeDashoffset = circ*(1-elapsed/step.relaxSec);
                if (elapsed >= step.relaxSec) {
                    clearCmTimer();
                    if (btn) { btn.disabled=false; btn.style.opacity='1'; btn.textContent='Lanjut →'; }
                    if (phaseLabel) phaseLabel.textContent = '✅ Selesai!';
                    if (numEl) numEl.textContent = '✓';
                }
            }, 1000);
        }
    }, 1000);
}

// ============================================================
// EMOTION
// ============================================================
function _cmRenderEmotionPick(step, visual, ex) {
    const btns = CM_EMOTIONS.map((e,i) => {
        const sel = _cmEmotion===i;
        return `<div class="cm-emotion-btn${sel?' selected':''}"
            onclick="cmPickEmotion(${i})"
            style="${sel?`border-color:${ex.color};background:${ex.color}22;`:''}">
            <span style="font-size:1.7rem;display:block;margin-bottom:4px;">${e.emoji}</span>
            <div style="font-size:0.68rem;color:${sel?ex.color:'#64748b'};font-weight:600;">${e.name}</div>
        </div>`;
    }).join('');
    visual.innerHTML = `<div class="cm-anim-step" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:280px;">${btns}</div>`;
}

window.cmPickEmotion = function(idx) {
    _cmEmotion = idx;
    const ex = CM_EXERCISES[_cmEx];
    const step = ex.steps[_cmStep];
    _cmRenderEmotionPick(step, document.getElementById('cm-visual'), ex);
};

function _cmRenderEmotionIntensity(step, visual, ex) {
    const colors = ['#4CAF50','#8BC34A','#CDDC39','#FFEB3B','#FFC107','#FF9800','#FF7043','#F44336','#E91E63','#9C27B0'];
    const bars = [1,2,3,4,5,6,7,8,9,10].map(n =>
        `<div class="cm-intensity-seg" id="cm-iseg-${n}" onclick="cmSetIntensity(${n})" style="background:${n<=_cmIntensity?colors[n-1]:'#eee'}"></div>`
    ).join('');
    const em = _cmEmotion!==null ? CM_EMOTIONS[_cmEmotion] : null;
    visual.innerHTML = `
    <div class="cm-anim-step" style="text-align:center;width:100%;max-width:280px;">
        ${em ? `<div style="font-size:4rem;margin-bottom:8px;">${em.emoji}</div><div style="font-size:1.2rem;font-weight:700;margin-bottom:4px;">${em.name}</div>` : ''}
        <div style="font-size:0.8rem;color:#64748b;margin-bottom:18px;">Seberapa kuat intensitasnya?</div>
        <div style="display:flex;gap:5px;margin-bottom:8px;">${bars}</div>
        <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:#aaa;padding:0 2px;">
            <span>Ringan</span><span>Sedang</span><span>Sangat kuat</span>
        </div>
        <div style="margin-top:14px;font-size:2.2rem;font-weight:800;color:${ex.color};">
            ${_cmIntensity>0 ? _cmIntensity+'/10' : '—'}
        </div>
    </div>`;
}

window.cmSetIntensity = function(n) {
    _cmIntensity = n;
    const ex = CM_EXERCISES[_cmEx];
    _cmRenderEmotionIntensity(ex.steps[_cmStep], document.getElementById('cm-visual'), ex);
};

function _cmRenderEmotionChips(step, visual, ex) {
    if (!_cmChips[_cmStep]) _cmChips[_cmStep] = new Set();
    const chips = step.chips.map((c,i) => {
        const done = _cmChips[_cmStep].has(i);
        return `<div class="cm-chip${done?' done':''}" onclick="cmToggleChip(${_cmStep},${i},this,'${ex.color}')"
            style="${done?`border-color:${ex.color};background:${ex.color};color:white;`:''}">${c}</div>`;
    }).join('');
    visual.innerHTML = `
    <div class="cm-anim-step" style="text-align:center;width:100%;max-width:280px;">
        <div style="font-size:0.85rem;color:#64748b;margin-bottom:18px;">${step.instruction}</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">${chips}</div>
    </div>`;
}

// ============================================================
// NEXT STEP
// ============================================================
window.cmNextStep = function() {
    const ex = CM_EXERCISES[_cmEx];
    const step = ex.steps[_cmStep];
    if (step.type==='muscle' && _cmMusclePhase==='ready') {
        _cmMusclePhase = 'running';
        _cmStartMuscleTimer(step, ex);
        return;
    }
    _cmStep++;
    if (_cmStep >= ex.steps.length) { _cmShowComplete(); return; }
    _cmMusclePhase = 'ready';
    _cmRenderStep();
};

// ============================================================
// COMPLETE
// ============================================================
function _cmShowComplete() {
    const ex = CM_EXERCISES[_cmEx];
    clearCmTimer();
    const dots = document.getElementById('cm-dots');
    const instr = document.getElementById('cm-instruction');
    const btn = document.getElementById('cm-next-btn');
    if (dots) dots.innerHTML='';
    if (instr) instr.innerHTML='';
    if (btn) btn.style.display='none';
    const visual = document.getElementById('cm-visual');
    if (!visual) return;
    visual.innerHTML = `
    <div style="text-align:center;padding:20px 16px 8px;animation:cm_completePop 0.5s ease both;">
        <div style="font-size:4rem;margin-bottom:12px;">✨</div>
        <div style="font-size:1.4rem;font-weight:700;color:${ex.color};margin-bottom:8px;">Alhamdulillah!</div>
        <div style="font-size:0.82rem;color:#64748b;line-height:1.7;max-width:260px;margin:0 auto 20px;">Kamu telah menyelesaikan <strong>${ex.title}</strong>. Semoga hatimu lebih tenang.</div>
        <div style="background:${ex.color}15;border-left:4px solid ${ex.color};border-radius:0 12px 12px 0;padding:12px 14px;margin:0 auto 20px;max-width:280px;text-align:left;">
            <p style="font-size:0.75rem;color:#0f766e;line-height:1.6;font-style:italic;">"${ex.quote}"</p>
            <p style="font-size:0.7rem;font-weight:700;color:${ex.color};margin-top:4px;">${ex.quoteSource}</p>
        </div>
        <button onclick="openCopingModal('${_cmEx}')" style="background:${ex.grad};color:white;border:none;padding:12px 28px;border-radius:50px;font-family:'Poppins',sans-serif;font-size:0.85rem;font-weight:700;cursor:pointer;margin-bottom:10px;">Ulangi Latihan</button>
        <br>
        <button onclick="closeCopingModal()" style="background:none;border:2px solid #ddd;border-radius:50px;padding:10px 24px;font-size:0.82rem;font-weight:600;color:#64748b;cursor:pointer;font-family:'Poppins',sans-serif;margin-top:4px;">← Tutup</button>
    </div>`;
}

})();

// ===== MOBILE: DISABLE INLINE HOVER SCALE EFFECTS =====
// On touch devices, onmouseover/onmouseout fire inconsistently
// and can leave elements stuck in scaled/transformed state.
// We strip those attributes on mobile.
(function fixMobileHover() {
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouchDevice) return;

// Wait for DOM to be ready
function stripHoverStyles() {
    // Remove onmouseover/onmouseout on keunggulan cards (they have scale in onmouseout)
    document.querySelectorAll('.keunggulan-center').forEach(el => {
        el.removeAttribute('onmouseover');
        el.removeAttribute('onmouseout');
        el.style.transform = '';
    });

    // Fix all inline onmouseout that reset to scale() — target parent
    const keunggulanGrid = document.querySelector('#fitur .reveal > div[style*="grid-template-columns"]');
    if (keunggulanGrid) {
        keunggulanGrid.querySelectorAll('[onmouseover]').forEach(el => {
            el.removeAttribute('onmouseover');
            el.removeAttribute('onmouseout');
        });
    }
}

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', stripHoverStyles);
    } else {
        stripHoverStyles();
    }
})();