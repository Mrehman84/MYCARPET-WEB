function renderLejar() {
    const tbody = document.getElementById('lejarBody');
    tbody.innerHTML = '';
    const all = [...STATE.expenses];
    STATE.payment.forEach(p => {
        all.push({
            tarikh: getField(p, ['TARIKH','DATE'], getToday()),
            penerangan: 'Bayaran invois ' + getField(p, ['INV NO','INV_NO','NO INVOIS'], ''),
            jenis: 'Pendapatan',
            jumlah: getNumber(getField(p, ['AMAUN DIBAYAR','AMOUNT']))
        });
    });
    all.sort((a,b) => (a.tarikh || '').localeCompare(b.tarikh || ''));
    if (!all.length) { tbody.innerHTML = '<tr><td colspan="4" class="text-center muted">Tiada rekod</td></tr>'; return; }
    all.slice(-20).reverse().forEach(item => {
        const tr = document.createElement('tr');
        const jenis = getField(item, ['jenis','JENIS'], 'Perbelanjaan');
        const jumlah = getNumber(getField(item, ['jumlah','JUMLAH','AMOUNT']));
        tr.innerHTML = `<td>${escapeHtml(formatDateMY(getField(item, ['tarikh','TARIKH','DATE'], '-')))}</td><td>${escapeHtml(getField(item, ['penerangan','PENERANGAN','DESC'], '-'))}</td><td><span class="badge ${jenis==='Pendapatan'?'badge-selesai':'badge-proses'}">${escapeHtml(jenis)}</span></td><td>${formatMoney(jumlah)}</td>`;
        tbody.appendChild(tr);
    });
}

async function tambahPerbelanjaan() {
    const desc = document.getElementById('expDesc').value.trim();
    const amount = getNumber(document.getElementById('expAmount').value);
    const date = document.getElementById('expDate').value || getToday();
    if (!desc || amount <= 0) return alert('Sila isi penerangan dan jumlah yang sah.');
    await postData({ action: 'addExpense', description: desc, amount, date });
    alert('Perbelanjaan direkodkan.');
    document.getElementById('expDesc').value = '';
    document.getElementById('expAmount').value = '';
    await fetchData();
}
