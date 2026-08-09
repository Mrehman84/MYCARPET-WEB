function renderDashboard() {
    let p=0,c=0,r=0,s=0;
    STATE.karpet.forEach(k => {
        const st = normalize(getField(k, ['STATUS','STATUS KARPET']));
        if (st === 'DALAM PROSES') p++;
        else if (st === 'PENGERINGAN' || st === 'SEDANG DICUCI') c++;
        else if (st === 'READY TO DELIVER') r++;
        else if (st === 'SELESAI' || st === 'SELESAI DIHANTAR' || st === 'DELIVERED') s++;
    });
    document.getElementById('countProses').textContent = p;
    document.getElementById('countCuci').textContent = c;
    document.getElementById('countReady').textContent = r;
    document.getElementById('countSelesai').textContent = s;

    const tbody = document.getElementById('dashboardTableBody');
    tbody.innerHTML = '';
    const items = STATE.karpet.slice(-10).reverse();
    if (!items.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center muted">Tiada rekod</td></tr>';
        return;
    }
    items.forEach(k => {
        const st = normalize(getField(k, ['STATUS','STATUS KARPET']));
        const badge = st==='READY TO DELIVER'?'badge-ready':
                      (st==='SELESAI'||st==='SELESAI DIHANTAR'||st==='DELIVERED')?'badge-selesai':
                      (st==='PENGERINGAN'||st==='SEDANG DICUCI')?'badge-cuci':'badge-proses';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHtml(getField(k,['QR ID','QR_ID']))}</strong></td>
            <td>${escapeHtml(getField(k,['INV NO','INV_NO','NO INVOIS']))}</td>
            <td>${escapeHtml(getField(k,['JENIS','JENIS CARPET']))}</td>
            <td>${formatMoney(getField(k,['HARGA','HARGA OPEN']))}</td>
            <td>${escapeHtml(String(getField(k,['TARIKH'],'')).split('T')[0]||'-')}</td>
            <td><span class="badge ${badge}">${escapeHtml(st)}</span></td>
        `;
        tbody.appendChild(tr);
    });
}
