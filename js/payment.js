function populatePaymentDropdown() {
    const sel = document.getElementById('paymentInvoiceSelect'); const cur = sel.value;
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

function loadPaymentData() {
    const inv = document.getElementById('paymentInvoiceSelect').value;
    const info = document.getElementById('paymentInfo');
    if (!inv) { info.style.display = 'none'; return; }
    info.style.display = 'block';
    let total = 0;
    STATE.karpet.forEach(k => { if (normalize(getField(k, ['INV NO','INV_NO','NO INVOIS'])) === normalize(inv)) total += getNumber(getField(k, ['HARGA','HARGA OPEN'])); });
    let deposit = 0;
    STATE.payment.forEach(p => { if (normalize(getField(p, ['INV NO','INV_NO','NO INVOIS'])) === normalize(inv)) deposit += getNumber(getField(p, ['AMAUN DIBAYAR','AMOUNT'])); });
    document.getElementById('payTotal').value = formatMoney(total);
    document.getElementById('payDeposit').value = formatMoney(deposit);
    document.getElementById('payBalance').value = formatMoney(Math.max(0, total - deposit));
    const hist = document.getElementById('paymentHistory');
    const payments = STATE.payment.filter(p => normalize(getField(p, ['INV NO','INV_NO','NO INVOIS'])) === normalize(inv));
    hist.innerHTML = '<strong>Sejarah Bayaran</strong>';
    if (payments.length) {
        const ul = document.createElement('ul'); ul.style.cssText = 'list-style:none;padding:0;margin-top:8px;';
        payments.forEach(p => {
            const li = document.createElement('li'); li.style.cssText = 'padding:4px 0;border-bottom:1px solid #eee;';
            li.textContent = `${getField(p,['TARIKH','DATE'],'')} - RM${getNumber(getField(p,['AMAUN DIBAYAR','AMOUNT'])).toFixed(2)}`;
            ul.appendChild(li);
        });
        hist.appendChild(ul);
    } else {
        hist.innerHTML += '<p class="muted">Tiada rekod bayaran.</p>';
    }
}

async function rekodBayaran() {
    const inv = document.getElementById('paymentInvoiceSelect').value;
    if (!inv) return alert('Sila pilih invois.');
    const amount = getNumber(document.getElementById('payAmount').value);
    if (amount <= 0) return alert('Masukkan jumlah bayaran yang sah.');
    const date = getToday();
    await postData({ action: 'addPayment', invNo: inv, amount: amount, date: date });
    alert('Bayaran direkodkan.');
    document.getElementById('payAmount').value = '';
    await fetchData();
    loadPaymentData();
}
