function populateBarcodeDropdown() {
    const sel = document.getElementById('barcodeInvoiceSelect');
    const cur = sel.value;
    sel.innerHTML = '<option value="">-- Pilih --</option>';
    const invs = new Set();
    STATE.karpet.forEach(k => { const inv = String(getField(k, ['INV NO','INV_NO','NO INVOIS'])).trim(); if (inv) invs.add(inv); });
    invs.forEach(inv => {
        const order = STATE.tempahan.find(o => normalize(getField(o,['INV NO','INV_NO','NO INVOIS'])) === normalize(inv)) || {};
        const cust = STATE.pelanggan.find(c => String(getField(c,['CUSTOMER ID','CUSTOMER_ID'])).trim() === String(getField(order,['CUSTOMER ID','CUSTOMER_ID'])).trim()) || {};
        const opt = document.createElement('option'); opt.value = inv;
        opt.textContent = `${inv} - ${getField(cust,['NAMA'],'')} - ${getField(cust,['ALAMAT'],'')}`;
        sel.appendChild(opt);
    });
    if (cur && [...sel.options].some(o=>o.value===cur)) sel.value = cur;
}

function generateBarcodes() {
    const container = document.getElementById('barcodeContainer');
    container.innerHTML = '';
    const inv = document.getElementById('barcodeInvoiceSelect').value;
    if (!inv) { container.innerHTML = '<p class="muted">Sila pilih invois.</p>'; return; }
    const items = STATE.karpet.filter(k => normalize(getField(k, ['INV NO','INV_NO','NO INVOIS'])) === normalize(inv));
    if (!items.length) { container.innerHTML = '<p class="muted">Tiada karpet untuk invois ini.</p>'; return; }
    const order = STATE.tempahan.find(o => normalize(getField(o,['INV NO','INV_NO','NO INVOIS'])) === normalize(inv)) || {};
    const cust = STATE.pelanggan.find(c => String(getField(c,['CUSTOMER ID','CUSTOMER_ID'])).trim() === String(getField(order,['CUSTOMER ID','CUSTOMER_ID'])).trim()) || {};
    const alamat = getField(cust, ['ALAMAT'], '');
    const telefon = getField(cust, ['TELEFON','NO TELEFON'], '');
    items.forEach(k => {
        const qr = String(getField(k, ['QR ID','QR_ID'])).trim(); if (!qr) return;
        const div = document.createElement('div'); div.className = 'qr-item';
        const canvas = document.createElement('div'); canvas.id = 'qr_'+qr.replace(/[^a-zA-Z0-9]/g,'_'); div.appendChild(canvas);
        const label = document.createElement('div'); label.className = 'qr-label'; label.textContent = 'MYCARPET PRO v2.0'; div.appendChild(label);
        const infoDiv = document.createElement('div'); infoDiv.style.cssText = 'font-size:10px;text-align:center;margin-top:2px;';
        infoDiv.innerHTML = `INV: ${inv}<br>QR ID: ${qr}`; div.appendChild(infoDiv);
        const footerDiv = document.createElement('div'); footerDiv.style.cssText = 'font-size:9px;color:#444;margin-top:2px;';
        const kodKarpet = getField(k, ['KOD'], '');
        footerDiv.textContent = `KDD: ${kodKarpet} | CUS: ${getField(cust,['CUSTOMER ID','CUSTOMER_ID'],'')} | TEL: ${telefon}`;
        div.appendChild(footerDiv);
        container.appendChild(div);
        setTimeout(function() {
            try { new QRCode(canvas, { text: 'QR ID: ' + qr + '\nAlamat: ' + alamat + '\nTelefon: ' + telefon, width: 140, height: 140, colorDark: "#000", colorLight: "#fff", correctLevel: QRCode.CorrectLevel.H }); }
            catch(e) { canvas.textContent = 'QR Error'; console.error(e); }
        }, 100);
    });
}

function previewBarcodePrint() {
    const inv = document.getElementById('barcodeInvoiceSelect').value;
    if (!inv) { alert('Sila pilih invois dahulu.'); return; }
    const printArea = document.getElementById('barcodePrintArea');
    printArea.innerHTML = ''; printArea.classList.add('active');
    const items = STATE.karpet.filter(k => normalize(getField(k, ['INV NO','INV_NO','NO INVOIS'])) === normalize(inv));
    if (!items.length) { printArea.innerHTML = '<p class="muted">Tiada karpet untuk invois ini.</p>'; return; }
    const order = STATE.tempahan.find(o => normalize(getField(o,['INV NO','INV_NO','NO INVOIS'])) === normalize(inv)) || {};
    const cust = STATE.pelanggan.find(c => String(getField(c,['CUSTOMER ID','CUSTOMER_ID'])).trim() === String(getField(order,['CUSTOMER ID','CUSTOMER_ID'])).trim()) || {};
    const alamat = getField(cust, ['ALAMAT'], '');
    const telefon = getField(cust, ['TELEFON','NO TELEFON'], '');
    var grid = document.createElement('div'); grid.className = 'barcode-print-grid'; grid.id = 'barcodePrintGrid';
    items.forEach(function(k) {
        const qr = String(getField(k, ['QR ID','QR_ID'])).trim(); if (!qr) return;
        var itemDiv = document.createElement('div'); itemDiv.className = 'barcode-print-item';
        var canvasDiv = document.createElement('div'); canvasDiv.id = 'print_qr_' + qr.replace(/[^a-zA-Z0-9]/g,'_'); itemDiv.appendChild(canvasDiv);
        var label = document.createElement('div'); label.className = 'label';
        label.textContent = `MYCARPET PRO v2.0\nINV: ${inv}\nQR ID: ${qr}\nKDD: ${getField(k,['KOD'],'')} | CUS: ${getField(cust,['CUSTOMER ID','CUSTOMER_ID'],'')} | TEL: ${telefon}`;
        itemDiv.appendChild(label); grid.appendChild(itemDiv);
        setTimeout(function() {
            try { new QRCode(canvasDiv, { text: 'QR ID: ' + qr + '\nAlamat: ' + alamat + '\nTelefon: ' + telefon, width: 80, height: 80, colorDark: "#000", colorLight: "#fff", correctLevel: QRCode.CorrectLevel.H }); }
            catch(e) { canvasDiv.textContent = 'QR Error'; console.error(e); }
        }, 100);
    });
    printArea.appendChild(grid);
    printArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function printBarcodes() {
    const inv = document.getElementById('barcodeInvoiceSelect').value;
    if (!inv) { alert('Sila pilih invois dahulu.'); return; }
    previewBarcodePrint();
    setTimeout(function() { window.print(); }, 500);
}
