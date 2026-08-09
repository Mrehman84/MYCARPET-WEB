// --- Helper untuk customer ---
function toggleCustType() {
    const isNew = document.querySelector('input[name="custType"]:checked').value === 'baru';
    document.getElementById('secCustLama').style.display = isNew ? 'none' : 'block';
    document.getElementById('secCustBaru').style.display = isNew ? 'block' : 'none';
    if (isNew) clearCustomerForm();
}
function clearCustomerForm() {
    ['custNama','custTel','custAlamat','custDaerah'].forEach(id => document.getElementById(id).value = '');
}
function populateCustomerDropdown() {
    const sel = document.getElementById('optPelanggan');
    sel.innerHTML = '<option value="">-- Pilih --</option>';
    STATE.pelanggan.forEach(c => {
        const id = String(getField(c,['CUSTOMER ID','CUSTOMER_ID'])).trim();
        if (!id) return;
        const nama = getField(c,['NAMA'],'');
        const alamat = getField(c,['ALAMAT'],'');
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = `${id} - ${alamat}${nama?' | '+nama:''}`;
        sel.appendChild(opt);
    });
}
function loadCustomerDetails() {
    const id = document.getElementById('optPelanggan').value;
    const c = STATE.pelanggan.find(p => String(getField(p,['CUSTOMER ID','CUSTOMER_ID'])).trim() === id);
    if (!c) return;
    document.getElementById('custNama').value = getField(c,['NAMA'],'');
    document.getElementById('custTel').value = getField(c,['TELEFON','NO TELEFON'],'');
    document.getElementById('custAlamat').value = getField(c,['ALAMAT'],'');
    document.getElementById('custDaerah').value = getField(c,['DAERAH'],'');
}

// --- Harga & Carpet Rows ---
function buildPriceOptions(select) {
    select.innerHTML = '<option value="">-- Pilih Kod --</option>';
    STATE.senaraiHarga.forEach(p => {
        const kod = String(getField(p,['KOD'])).trim().toUpperCase();
        if (!kod) return;
        const jenis = getField(p,['JENIS CARPET'],'');
        const lebar = getNumber(getField(p,['LEBAR'],0));
        const panjang = getNumber(getField(p,['PANJANG'],0));
        const hargaSqft = getNumber(getField(p,['HARGA_SQFT'], getField(p,['HARGA OPEN'],0)));
        const luas = lebar * panjang;
        const harga = luas * hargaSqft;
        const opt = document.createElement('option');
        opt.value = kod;
        opt.textContent = `${kod} - ${jenis} (${lebar}'x${panjang}')`;
        opt.dataset.lebar = lebar; opt.dataset.panjang = panjang;
        opt.dataset.hargaSqft = hargaSqft; opt.dataset.harga = harga;
        opt._mycarpet = { kod, jenis, lebar, panjang, hargaSqft, harga, luas };
        select.appendChild(opt);
    });
    if (!STATE.senaraiHarga.some(p => normalize(getField(p,['KOD'])) === 'CUSTOM')) {
        const opt = document.createElement('option');
        opt.value = 'CUSTOM'; opt.textContent = 'CUSTOM - Saiz Manual';
        opt.dataset.lebar = 0; opt.dataset.panjang = 0;
        opt.dataset.hargaSqft = 0; opt.dataset.harga = 0;
        opt._mycarpet = { kod:'CUSTOM', jenis:'CUSTOM', lebar:0, panjang:0, hargaSqft:0, harga:0, luas:0 };
        select.appendChild(opt);
    }
}

function resetCarpetRows() {
    document.getElementById('carpetItemsContainer').innerHTML = '';
    STATE.carpetRowCount = 0;
    addCarpetRow();
}
function addCarpetRow() {
    STATE.carpetRowCount++;
    const container = document.getElementById('carpetItemsContainer');
    const rowId = 'carpetRow_'+STATE.carpetRowCount;
    const div = document.createElement('div');
    div.className = 'row card-item-row';
    div.id = rowId;
    div.style.cssText = 'padding:12px;background:#fcfcfc;border:1px solid #edf2f7;border-radius:8px;margin-bottom:12px;';

    const col1 = document.createElement('div'); col1.className = 'col form-group'; col1.style.flex = '1.7';
    const lbl1 = document.createElement('label'); lbl1.textContent = 'Kod';
    const sel = document.createElement('select'); sel.className = 'form-control select-kod-karpet';
    buildPriceOptions(sel);
    sel.onchange = function() { handleCodeSelection(rowId); };
    const info = document.createElement('div'); info.className = 'jenis-vlookup-info';
    info.style.cssText = 'margin-top:6px;padding:6px 10px;border-radius:6px;background:#edf6ff;color:#2b6cb0;font-size:13px;min-height:32px;';
    info.textContent = 'Jenis & harga auto.';
    col1.append(lbl1, sel, info);

    const col2 = document.createElement('div'); col2.className = 'col form-group'; col2.style.maxWidth = '100px';
    const lbl2 = document.createElement('label'); lbl2.textContent = 'Qty';
    const qty = document.createElement('input'); qty.type = 'number'; qty.min = 1; qty.step = 1; qty.value = 1;
    qty.className = 'form-control inp-qty'; qty.oninput = calculateGrandTotal;
    col2.append(lbl2, qty);

    const col3 = document.createElement('div'); col3.className = 'col form-group sub-custom-dimensions';
    col3.style.cssText = 'display:none;max-width:220px';
    const lbl3 = document.createElement('label'); lbl3.textContent = 'Dimensi (L x P kaki)';
    const wrap = document.createElement('div'); wrap.style.cssText = 'display:flex;gap:5px;align-items:center';
    const w = document.createElement('input'); w.type='number'; w.min=0; w.className='form-control inp-width'; w.placeholder='L';
    const x = document.createElement('span'); x.textContent = 'x';
    const h = document.createElement('input'); h.type='number'; h.min=0; h.className='form-control inp-height'; h.placeholder='P';
    w.oninput = function() { calculateRowPrice(rowId); };
    h.oninput = function() { calculateRowPrice(rowId); };
    wrap.append(w, x, h); col3.append(lbl3, wrap);

    const col4 = document.createElement('div'); col4.className = 'col form-group'; col4.style.maxWidth = '140px';
    const lbl4 = document.createElement('label'); lbl4.textContent = 'Harga (RM)';
    const price = document.createElement('input'); price.type = 'number'; price.step = '0.01'; price.min = 0; price.value = '0.00';
    price.className = 'form-control inp-harga-final'; price.style.fontWeight = '600'; price.oninput = calculateGrandTotal;
    col4.append(lbl4, price);

    const col5 = document.createElement('div'); col5.style.cssText = 'display:flex;align-items:center;margin-top:5px';
    const del = document.createElement('button'); del.type = 'button'; del.className = 'btn btn-danger btn-sm';
    del.innerHTML = '<i class="fa-solid fa-trash"></i>'; del.onclick = function() { removeCarpetRow(rowId); };
    col5.appendChild(del);
    div.append(col1, col2, col3, col4, col5); container.appendChild(div);
    calculateGrandTotal();
}

function handleCodeSelection(rowId) {
    const row = document.getElementById(rowId); if (!row) return;
    const sel = row.querySelector('.select-kod-karpet');
    const price = row.querySelector('.inp-harga-final');
    const custom = row.querySelector('.sub-custom-dimensions');
    const info = row.querySelector('.jenis-vlookup-info');
    const opt = sel.options[sel.selectedIndex];
    const data = opt?._mycarpet || { jenis:'', lebar:0, panjang:0, hargaSqft:0, harga:0, luas:0 };
    if (sel.value === 'CUSTOM') {
        custom.style.display = 'block'; info.textContent = 'CUSTOM: masukkan saiz, harga auto.';
        price.value = '0.00'; calculateRowPrice(rowId); return;
    }
    custom.style.display = 'none';
    const luas = data.luas || 0; const hargaSqft = data.hargaSqft || 0;
    const harga = data.harga || (luas * hargaSqft);
    info.innerHTML = `<strong>${escapeHtml(data.jenis||'')}</strong> (${data.lebar}'x${data.panjang}')<br>Luas: ${luas} kaki² × RM${hargaSqft.toFixed(2)} = ${formatMoney(harga)}`;
    price.value = harga.toFixed(2); calculateGrandTotal();
}

function calculateRowPrice(rowId) {
    const row = document.getElementById(rowId); if (!row) return;
    const sel = row.querySelector('.select-kod-karpet'); if (sel.value !== 'CUSTOM') return;
    const w = getNumber(row.querySelector('.inp-width').value);
    const h = getNumber(row.querySelector('.inp-height').value);
    const price = row.querySelector('.inp-harga-final');
    if (price) price.value = (w * h * 2.50).toFixed(2);
    calculateGrandTotal();
}

function calculateGrandTotal() {
    let total = 0;
    $$('.card-item-row').forEach(row => {
        total += getNumber(row.querySelector('.inp-qty').value || 1) * getNumber(row.querySelector('.inp-harga-final').value || 0);
    });
    document.getElementById('grandTotalLabel').textContent = formatMoney(total);
}

function removeCarpetRow(rowId) {
    if ($$('.card-item-row').length <= 1) { alert('Perlu sekurang-kurangnya satu item.'); return; }
    document.getElementById(rowId)?.remove(); calculateGrandTotal();
}

// --- Simpan Tempahan & WhatsApp ---
function binaMesejTempahan(order) {
    let itemsText = '';
    order.items.forEach((item, i) => { itemsText += ` ${i+1}. ${item.jenis} (${item.dimensi}) x${item.qty} = ${formatMoney(item.subtotal)}\n`; });
    return `🧺 *MYCARPET PRO v2.0*\nPelanggan yang dihormati, karpet anda telah selamat diambil dan akan diproses.\n\n🧾 *No Invoice:* ${order.invNo} - (${order.customer.nama}, ${order.customer.alamat})\n📅 *Tarikh Ambil:* ${formatDateMY(order.tarikhAmbil)}\n📆 *Tarikh Siap:* ${formatDateMY(order.tarikhSiap)}\n\n📝 *Butiran Jenis Karpet:*\n${itemsText}\n💰 *Jumlah:* ${formatMoney(order.total)}\nTerima kasih! 🙏`;
}

async function simpanTempahan() {
    try {
        const isNew = document.querySelector('input[name="custType"]:checked').value === 'baru';
        const customer = {
            id: isNew ? '' : document.getElementById('optPelanggan').value,
            nama: document.getElementById('custNama').value.trim(),
            telefon: document.getElementById('custTel').value.trim(),
            alamat: document.getElementById('custAlamat').value.trim(),
            daerah: document.getElementById('custDaerah').value.trim()
        };
        if (!customer.nama || !customer.telefon || !customer.alamat) { alert('Sila lengkapkan maklumat pelanggan.'); return; }
        const items = []; let valid = true;
        $$('.card-item-row').forEach(row => {
            const sel = row.querySelector('.select-kod-karpet'); if (!sel.value) { valid = false; return; }
            const opt = sel.options[sel.selectedIndex]; const data = opt?._mycarpet || {};
            const qty = Math.max(1, getNumber(row.querySelector('.inp-qty').value || 1));
            const harga = getNumber(row.querySelector('.inp-harga-final').value || 0);
            let jenis = data.jenis || ''; let dimensi = `${data.lebar || 0} x ${data.panjang || 0}`;
            if (sel.value === 'CUSTOM') {
                const w = row.querySelector('.inp-width').value || 0; const h = row.querySelector('.inp-height').value || 0;
                dimensi = `${w} x ${h}`; jenis = `CUSTOM (${w} x ${h} kaki)`;
            }
            items.push({ kod: sel.value, jenis: jenis, dimensi: dimensi, harga: harga, qty: qty, subtotal: qty * harga });
        });
        if (!valid || !items.length) { alert('Pastikan semua kod karpet dipilih.'); return; }
        const total = items.reduce((sum, i) => sum + i.subtotal, 0);
        const today = getToday(); const tarikhSiap = addDays(today, 7);
        await postData({ action: 'createOrder', isNewCustomer: isNew, customer: customer, items: items });
        const msg = binaMesejTempahan({ invNo: 'INV' + Date.now().toString().slice(-7), tarikhAmbil: today, tarikhSiap: tarikhSiap, items: items, total: total, customer: customer });
        const preview = document.getElementById('tempahanPreview'); preview.textContent = msg; preview.classList.remove('hidden');
        document.getElementById('tempahanWhatsAppBtn').classList.remove('hidden');
        STATE.lastOrderCustomer = customer;  // simpan untuk WhatsApp
        alert('Tempahan berjaya dihantar! Sila salin atau hantar mesej WhatsApp.');
        clearCustomerForm(); resetCarpetRows(); await fetchData(); switchTab('dashboard');
    } catch(e) { console.error(e); alert('Ralat menyimpan data. Sila cuba lagi.'); }
}

function hantarWhatsAppTempahan() {
    const cust = STATE.lastOrderCustomer; if (!cust || !cust.telefon) { alert('Tiada maklumat pelanggan.'); return; }
    const preview = document.getElementById('tempahanPreview'); let msg = preview.textContent;
    if (!msg || preview.classList.contains('hidden')) { alert('Sila simpan tempahan dahulu.'); return; }
    window.open(`https://wa.me/60${cust.telefon.replace(/^0+/, '')}?text=${encodeURIComponent(msg)}`, '_blank');
}
