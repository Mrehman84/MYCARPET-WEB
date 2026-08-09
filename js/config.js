const CONFIG = {
    GAS_API_URL: "https://script.google.com/macros/s/AKfycbyDZGqIqcloW_acpOe7MOYRHvG4neZK0oRiUP5-Cqq8K1oR2-RYOw-Icp6bBRL5yzX3/exec",
    ACTIVE_STATUSES: ["DALAM PROSES", "PENGERINGAN", "READY TO DELIVER", "SELESAI DIHANTAR"],
    LOGO_URL: "https://raw.githubusercontent.com/Mrehman84/MYCARPET_PRO/main/logo_westberry.png"
};

let STATE = {
    senaraiHarga: [],
    pelanggan: [],
    tempahan: [],
    karpet: [],
    payment: [],
    expenses: [],
    carpetRowCount: 0,
    isLoading: false
};

function $(s, c=document) { return c.querySelector(s); }
function $$(s, c=document) { return [...c.querySelectorAll(s)]; }

function getField(row, names, fallback="") {
    if (!row || typeof row !== 'object') return fallback;
    const norm = names.map(n => String(n).toUpperCase().trim());
    for (let key of Object.keys(row)) {
        if (norm.includes(String(key).toUpperCase().trim())) {
            const v = row[key];
            return (v !== undefined && v !== null) ? v : fallback;
        }
    }
    return fallback;
}

function getNumber(v) {
    const n = parseFloat(String(v || "0").replace(/[RM,]/g, '').trim());
    return isNaN(n) ? 0 : n;
}

function formatMoney(v) { return "RM " + getNumber(v).toFixed(2); }

function escapeHtml(t) {
    if (!t) return '';
    return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function normalize(s) { return String(s || "").trim().toUpperCase(); }

function showLoading(show) {
    const el = $('#loadingOverlay');
    if (el) el.classList.toggle('active', show);
}

function getToday() { return new Date().toISOString().split('T')[0]; }
function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}
function formatDateMY(dateStr) {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}
