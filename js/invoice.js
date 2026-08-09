function populateInvoiceDropdown() {
    const sel = document.getElementById('invoiceSelect'); const cur = sel.value;
    sel.innerHTML = '<option value="">-- Pilih --</option>';
    const invs = new Set();
    STATE.karpet.forEach(k => {
        const inv = String(getField(k, ['INV NO','INV_NO','NO INVOIS'])).trim();
        const st = normalize(getField(k, ['STATUS','STATUS KARPET']));
        if (inv && st !== 'SELESAI DIHANTAR' && st !== 'DELIVERED') invs.add(inv);
    });
    if (!invs.size) { STATE.tempahan.forEach(o => { const inv = String(getField(o, ['INV NO','INV_NO','NO INVOIS'])).trim(); if (inv) invs.add(inv); }); }
    invs.forEach(inv => {
        const order = STATE.tempahan.find(o => normalize(getField(o,['INV NO','INV_NO','NO INVOIS'])) === normalize(inv)) || {};
        const cust = STATE.pelanggan.find(c => String(getField(c,['CUSTOMER ID','CUSTOMER_ID'])).trim() === String(getField(order,['CUSTOMER ID','CUSTOMER_ID'])).trim()) || {};
        const opt = document.createElement('option'); opt.value = inv;
        opt.textContent = `${inv} - ${getField(cust,['NAMA'],'')} - ${getField(cust,['ALAMAT'],'')}`;
        sel.appendChild(opt);
    });
    if (cur && [...sel.options].some(o=>o.value===cur)) sel.value = cur;
}

function getInvoiceItems(inv) {
    return STATE.karpet.filter(k => normalize(getField(k, ['INV NO','INV_NO','NO INVOIS'])) === normalize(inv))
           .map(k => ({
               nama: getField(k, ['JENIS','JENIS CARPET'], 'CUCIAN'),
               qr: getField(k, ['QR ID','QR_ID'], ''),
               qty: 1,
               harga: getNumber(getField(k, ['HARGA','HARGA OPEN'])),
               total: getNumber(getField(k, ['HARGA','HARGA OPEN']))
           }));
}
function getDeposit(inv) {
    let total = 0;
    STATE.payment.forEach(p => { if (normalize(getField(p, ['INV NO','INV_NO','NO INVOIS'])) === normalize(inv)) total += getNumber(getField(p, ['AMAUN DIBAYAR','AMOUNT'])); });
    if (!total) { const order = STATE.tempahan.find(o => normalize(getField(o,['INV NO','INV_NO','NO INVOIS'])) === normalize(inv)); if (order) total = getNumber(getField(order, ['DEPOSIT','DEPOSIT DIBAYAR','JUMLAH DEPOSIT'])); }
    return total;
}
function getInvoiceStatus(inv) {
    const order = STATE.tempahan.find(o => normalize(getField(o,['INV NO','INV_NO','NO INVOIS'])) === normalize(inv));
    if (!order) return 'PENDING';
    return normalize(getField(order, ['STATUS'], 'PENDING'));
}

function renderInvoice() {
    var container = document.getElementById('invoicePreviewContainer');
    var inv = document.getElementById('invoiceSelect').value;
    if (!inv) { container.innerHTML = '<div class="card muted">Sila pilih invoice.</div>'; return; }
    var order = STATE.tempahan.find(function(o) { return normalize(getField(o, ['INV NO', 'INV_NO', 'NO INVOIS'])) === normalize(inv); }) || {};
    var cust = STATE.pelanggan.find(function(c) { return String(getField(c, ['CUSTOMER ID', 'CUSTOMER_ID'])).trim() === String(getField(order, ['CUSTOMER ID', 'CUSTOMER_ID'])).trim(); }) || {};
    var nama = getField(cust, ['NAMA'], getField(order, ['NAMA'], '-'));
    var telefon = getField(cust, ['TELEFON', 'NO TELEFON'], getField(order, ['TELEFON'], '-'));
    var alamat = getField(cust, ['ALAMAT'], getField(order, ['ALAMAT'], '-'));
    var daerah = getField(cust, ['DAERAH'], getField(order, ['DAERAH'], '-'));
    var tarikh = String(getField(order, ['TARIKH', 'DATE'], getToday())).split('T')[0];
    var status = getInvoiceStatus(inv);
    var isPaid = (status === 'PAID' || status === 'LUNAS' || status === 'SELESAI');
    var statusClass = isPaid ? 'status-paid' : 'status-pending';
    var statusText = isPaid ? '✅ PAID (LUNAS)' : '⏳ PENDING (BELUM LUNAS)';
    var items = getInvoiceItems(inv);
    if (!items.length) { var totalFromOrder = getNumber(getField(order, ['JUMLAH HARGA', 'TOTAL'])); if (totalFromOrder) items = [{ nama: 'PERKHIDMATAN CUCIAN', qr: '', qty: 1, harga: totalFromOrder, total: totalFromOrder }]; }
    var subtotal = items.reduce(function(s, i) { return s + i.total; }, 0);
    var extraName = document.getElementById('extraServiceName').value.trim();
    var extraPrice = getNumber(document.getElementById('extraServicePrice').value);
    var deposit = getDeposit(inv);
    var total = subtotal + extraPrice;
    var baki = Math.max(0, total - deposit);
    var rows = '';
    items.forEach(function(item, i) {
        var itemRow = '<tr><td>' + (i+1) + '</td><td>' + escapeHtml(item.nama);
        if (item.qr) itemRow += '<br><small>QR: ' + escapeHtml(item.qr) + '</small>';
        itemRow += '</td><td>' + item.qty + '</td><td>' + formatMoney(item.harga) + '</td><td>' + formatMoney(item.total) + '</td></tr>';
        rows += itemRow;
    });
    if (extraName && extraPrice > 0) {
        rows += '<tr><td>' + (items.length+1) + '</td><td>' + escapeHtml(extraName.toUpperCase()) + ' (TAMBAHAN)</td><td>1</td><td>' + formatMoney(extraPrice) + '</td><td>' + formatMoney(extraPrice) + '</td></tr>';
    }

    var html = '<div class="card print-area"><div class="invoice-preview" id="invoice_pdf_content">';
    html += '<div class="invoice-head"><div style="display:flex;align-items:center;gap:16px;">';
    html += '<img src="' + CONFIG.LOGO_URL + '" alt="Logo" style="height:60px;object-fit:contain;" onerror="this.style.display=\'none\'">';
    html += '<div><div class="invoice-title">INVOIS / RESIT</div></div></div>';
    html += '<div style="text-align:right;"><div style="font-size:22px;font-weight:700;">INVOIS</div><div><strong>' + escapeHtml(inv) + '</strong></div><div class="muted">Tarikh: ' + escapeHtml(formatDateMY(tarikh)) + '</div>';
    html += '<div class="mt-16"><span class="status-badge ' + statusClass + '">' + statusText + '</span></div></div></div>';
    html += '<div class="row"><div class="col"><strong>PELANGGAN</strong><br>' + escapeHtml(nama) + '<br>' + escapeHtml(telefon) + '<br>' + escapeHtml(alamat) + '<br>' + escapeHtml(daerah) + '</div>';
    html += '<div class="col"><strong>STATUS BAYARAN</strong><br>Jumlah: <strong>' + formatMoney(total) + '</strong><br>Deposit: <strong>' + formatMoney(deposit) + '</strong><br>Baki: <strong style="color:' + (isPaid ? 'var(--green)' : 'var(--orange)') + ';">' + formatMoney(baki) + '</strong></div></div>';
    html += '<table class="invoice-table"><thead><tr><th>No.</th><th>Perincian</th><th>Qty</th><th>Harga</th><th>Jumlah</th></tr></thead><tbody>' + rows + '</tbody></table>';
    html += '<div class="invoice-total"><div><span>Sub Jumlah</span><strong>' + formatMoney(subtotal) + '</strong></div>';
    if (extraPrice > 0) html += '<div><span>Servis Tambahan</span><strong>' + formatMoney(extraPrice) + '</strong></div>';
    html += '<div><span>Jumlah Keseluruhan</span><strong>' + formatMoney(total) + '</strong></div><div><span>Deposit</span><strong>' + formatMoney(deposit) + '</strong></div>';
    html += '<div class="grand"><span>BAKI</span><strong style="color:' + (isPaid ? 'var(--green)' : 'var(--orange)') + ';">' + formatMoney(baki) + '</strong></div></div>';
    html += '<div style="margin-top:35px;padding-top:15px;border-top:1px solid #ddd;text-align:center;font-size:12px;color:#777;">Terima kasih menggunakan perkhidmatan kami.</div></div></div>';
    container.innerHTML = html;
}

function downloadInvoicePDF() {
    const inv = document.getElementById('invoiceSelect').value;
    if (!inv) return alert('Pilih invoice dahulu.');
    renderInvoice();
    const element = document.getElementById('invoice_pdf_content');
    if (!element) return alert('Ralat: Elemen invoice tidak dijumpai.');
    const opt = {
        margin: 10,
        filename: `Invoice_${inv}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

function copyInvoiceWhatsApp() {
    const inv = document.getElementById('invoiceSelect').value;
    if (!inv) return alert('Pilih invoice dahulu.');
    const element = document.getElementById('invoice_pdf_content');
    if (!element) return alert('Sila render invoice terlebih dahulu.');
    const text = element.innerText;
    navigator.clipboard.writeText(text).then(() => alert('Teks invois disalin ke clipboard.')).catch(() => alert('Gagal salin. Sila cuba lagi.'));
}

function hantarWhatsAppInvoice() {
    const inv = document.getElementById('invoiceSelect').value;
    if (!inv) return alert('Pilih invoice dahulu.');
    const element = document.getElementById('invoice_pdf_content');
    if (!element) return alert('Sila render invoice terlebih dahulu.');
    const text = element.innerText;
    const order = STATE.tempahan.find(o => normalize(getField(o,['INV NO','INV_NO','NO INVOIS'])) === normalize(inv)) || {};
    const cust = STATE.pelanggan.find(c => String(getField(c,['CUSTOMER ID','CUSTOMER_ID'])).trim() === String(getField(order,['CUSTOMER ID','CUSTOMER_ID'])).trim()) || {};
    const telefon = getField(cust, ['TELEFON','NO TELEFON'], '');
    if (!telefon) return alert('Nombor telefon pelanggan tidak dijumpai.');
    window.open(`https://wa.me/60${telefon.replace(/^0+/, '')}?text=${encodeURIComponent(text)}`, '_blank');
}
