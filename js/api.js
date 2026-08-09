function fetchData() {
    if (STATE.isLoading) return;
    showLoading(true);
    $$('script[data-jsonp]').forEach(el => el.remove());
    const cbName = 'jsonp_' + Date.now() + '_' + Math.random().toString(36).substr(2,5);
    const timeout = setTimeout(() => {
        cleanupJsonp(cbName); showLoading(false);
        alert('Masa muat turun tamat. Sila semak sambungan.');
    }, 30000);

    window[cbName] = function(resp) {
        clearTimeout(timeout);
        try {
            if (!resp || typeof resp !== 'object') throw new Error('Respons tidak sah');
            STATE.senaraiHarga = Array.isArray(resp.senaraiHarga) ? resp.senaraiHarga : [];
            STATE.pelanggan = Array.isArray(resp.pelanggan) ? resp.pelanggan : [];
            STATE.tempahan = Array.isArray(resp.tempahan) ? resp.tempahan : [];
            STATE.karpet = Array.isArray(resp.karpet) ? resp.karpet : [];
            STATE.payment = Array.isArray(resp.payment) ? resp.payment : [];
            STATE.expenses = Array.isArray(resp.expenses) ? resp.expenses : [];
            refreshAllUI();
        } catch(e) { console.error(e); alert('Ralat memproses data.'); }
        finally { showLoading(false); cleanupJsonp(cbName); }
    };

    const script = document.createElement('script');
    script.id = cbName; script.dataset.jsonp = 'true';
    script.src = CONFIG.GAS_API_URL + '?action=readAll&callback=' + encodeURIComponent(cbName);
    script.onerror = function() {
        clearTimeout(timeout); showLoading(false); cleanupJsonp(cbName);
        alert('Gagal hubungi Google Apps Script.');
    };
    document.body.appendChild(script);
}

function cleanupJsonp(name) {
    const el = document.getElementById(name); if (el) el.remove();
    try { delete window[name]; } catch(e) {}
}

async function postData(data) {
    showLoading(true);
    try {
        await fetch(CONFIG.GAS_API_URL, {
            method: 'POST', mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return { success: true };
    } catch(e) { console.error(e); throw e; }
    finally { showLoading(false); }
}
