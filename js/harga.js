function renderHargaTable() {
    const tbody = document.getElementById('hargaTableBody');
    tbody.innerHTML = '';
    if (!STATE.senaraiHarga.length) { tbody.innerHTML = '<tr><td colspan="7" class="text-center muted">Tiada data harga.</td></tr>'; return; }
    STATE.senaraiHarga.forEach(p => {
        const kod = getField(p, ['KOD'], '');
        const jenis = getField(p, ['JENIS CARPET'], '');
        const lebar = getNumber(getField(p, ['LEBAR'], 0));
        const panjang = getNumber(getField(p, ['PANJANG'], 0));
        const hargaSqft = getNumber(getField(p, ['HARGA_SQFT'], getField(p, ['HARGA OPEN'], 0)));
        const luas = lebar * panjang;
        const harga = luas * hargaSqft;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td><strong>${escapeHtml(kod)}</strong></td><td>${escapeHtml(jenis)}</td><td>${lebar}</td><td>${panjang}</td><td>${luas}</td><td>${formatMoney(hargaSqft)}</td><td>${formatMoney(harga)}</td>`;
        tbody.appendChild(tr);
    });
}

async function kemaskiniHargaPukal() {
    const kod = document.getElementById('hargaKodSelect').value;
    const hargaSqft = getNumber(document.getElementById('hargaSqftInput').value);
    if (hargaSqft <= 0) { alert('Sila masukkan harga per SQFT yang sah (lebih dari 0).'); return; }
    if (!confirm('Anda akan kemaskini SEMUA rekod dengan kod "' + kod + '" kepada harga per SQFT RM' + hargaSqft.toFixed(2) + '. Teruskan?')) return;
    try {
        await postData({ action: 'updatePriceBatch', kod: kod, hargaSqft: hargaSqft });
        alert('Harga untuk semua kod "' + kod + '" berjaya dikemas kini.');
        document.getElementById('hargaSqftInput').value = '';
        await fetchData();
        renderHargaTable();
    } catch(e) { alert('Gagal kemas kini harga.'); }
}
