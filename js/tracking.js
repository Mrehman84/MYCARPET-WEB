function populateTrackingDropdown() {
    const sel = document.getElementById('trackingInvoiceSelect'); const cur = sel.value;
    sel.innerHTML = '<option value="">-- Semua --</option>'; const seen = new Set();
    STATE.karpet.forEach(k => {
        const st = normalize(getField(k, ['STATUS','STATUS KARPET']));
        if (!CONFIG.ACTIVE_STATUSES.includes(st)) return;
        const inv = String(getField(k, ['INV NO','INV_NO','NO INVOIS'])).trim(); if (!inv || seen.has(inv)) return;
        seen.add(inv);
        const order = STATE.tempahan.find(o => normalize(getField(o,['INV NO','INV_NO','NO INVOIS'])) === normalize(inv)) || {};
        const cust = STATE.pelanggan.find(c => String(getField(c,['CUSTOMER ID','CUSTOMER_ID'])).trim() === String(getField(order,['CUSTOMER ID','CUSTOMER_ID'])).trim()) || {};
        const opt = document.createElement('option'); opt.value = inv;
        opt.textContent = `${inv} — ${getField(cust,['ALAMAT'],'')}${getField(cust,['NAMA'],'') ? ' | '+getField(cust,['NAMA'],'') : ''}`;
        sel.appendChild(opt);
    });
    if (cur && [...sel.options].some(o=>o.value===cur)) sel.value = cur;
}

function executeGlobalSearch() {
    const tbody = document.getElementById('trackingTableBody'); tbody.innerHTML = '';
    const selInv = document.getElementById('trackingInvoiceSelect').value;
    const search = document.getElementById('searchBox').value.trim().toLowerCase();
    let filtered = STATE.karpet.filter(k => {
        const st = normalize(getField(k, ['STATUS','STATUS KARPET']));
        if (!CONFIG.ACTIVE_STATUSES.includes(st)) return false;
        const inv = String(getField(k, ['INV NO','INV_NO','NO INVOIS'])).trim();
        const qr = String(getField(k, ['QR ID','QR_ID'])).trim();
        if (selInv && normalize(inv) !== normalize(selInv)) return false;
        if (search && !qr.toLowerCase().includes(search) && !inv.toLowerCase().includes(search)) return false;
        return true;
    });
    if (!filtered.length) { tbody.innerHTML = '<tr><td colspan="7" class="text-center muted">Tiada hasil</td></tr>'; updateCheckedCount(); return; }
    filtered.reverse().forEach(k => {
        const inv = String(getField(k, ['INV NO','INV_NO','NO INVOIS'])).trim();
        const order = STATE.tempahan.find(o => normalize(getField(o,['INV NO','INV_NO','NO INVOIS'])) === normalize(inv)) || {};
        const cust = STATE.pelanggan.find(c => String(getField(c,['CUSTOMER ID','CUSTOMER_ID'])).trim() === String(getField(order,['CUSTOMER ID','CUSTOMER_ID'])).trim()) || {};
        const qr = String(getField(k, ['QR ID','QR_ID'])).trim();
        const st = normalize(getField(k, ['STATUS','STATUS KARPET']));
        const badge = st==='READY TO DELIVER'?'badge-ready':st==='PENGERINGAN'?'badge-cuci':'badge-proses';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="row-checkbox" value="${escapeHtml(qr)}"></td>
            <td><strong>${escapeHtml(qr)}</strong><br><small>${escapeHtml(inv)}</small></td>
            <td><strong>${escapeHtml(getField(cust,['NAMA'],'TIADA'))}</strong><br><small>${escapeHtml(getField(cust,['ALAMAT'],''))}</small></td>
            <td>${escapeHtml(getField(k,['JENIS','JENIS CARPET']))}</td>
            <td>${formatMoney(getField(k,['HARGA','HARGA OPEN']))}</td>
            <td><span class="badge ${badge}">${escapeHtml(st)}</span></td>
            <td><button class="btn btn-secondary btn-sm" onclick="tukarStatusSingle('${escapeHtml(qr)}')"><i class="fa-solid fa-edit"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
    $$('.row-checkbox').forEach(cb => cb.onchange = updateCheckedCount);
    updateCheckedCount();
}

function toggleSelectAll(master) { $$('.row-checkbox').forEach(cb => cb.checked = master.checked); updateCheckedCount(); }
function updateCheckedCount() { document.getElementById('checkedCountLabel').textContent = $$('.row-checkbox:checked').length + ' item dipilih'; }

function tukarStatusSingle(qrId) {
    const k = STATE.karpet.find(x => String(getField(x,['QR ID','QR_ID'])).trim() === qrId);
    if (!k) return alert('Karpet tidak dijumpai.');
    const cur = normalize(getField(k, ['STATUS','STATUS KARPET']));
    const baru = prompt(`Status semasa: ${cur}\nMasukkan status baru:\nDALAM PROSES\nPENGERINGAN\nREADY TO DELIVER\nSELESAI DIHANTAR`, cur);
    if (!baru) return; const norm = normalize(baru);
    if (!CONFIG.ACTIVE_STATUSES.includes(norm)) return alert('Status tidak sah.');
    updateStatuses([qrId], norm);
}

async function submitBatchUpdate() {
    const checked = $$('.row-checkbox:checked');
    if (!checked.length) return alert('Pilih sekurang-kurangnya satu item.');
    const ids = checked.map(cb => cb.value);
    const status = document.getElementById('batchStatusOpt').value;
    await updateStatuses(ids, status);
}

async function updateStatuses(qrIds, status) {
    try { await postData({ action: 'updateBatchStatus', qrIds, status }); alert('Status dikemas kini.'); document.getElementById('masterCheck').checked = false; await fetchData(); }
    catch(e) { alert('Gagal kemas kini.'); }
}
