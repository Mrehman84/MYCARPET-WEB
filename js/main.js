function switchTab(tabId) {
    $$('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    $$('.menu-item').forEach(el => el.classList.remove('active'));
    const menu = $(`.menu-item[data-tab="${tabId}"]`);
    if (menu) menu.classList.add('active');

    if (tabId === 'tracking') { populateTrackingDropdown(); executeGlobalSearch(); }
    if (tabId === 'invoice') { populateInvoiceDropdown(); renderInvoice(); }
    if (tabId === 'payment') { populatePaymentDropdown(); loadPaymentData(); }
    if (tabId === 'barcode') { populateBarcodeDropdown(); generateBarcodes(); }
    if (tabId === 'harga') renderHargaTable();
    if (window.innerWidth <= 992) document.body.classList.remove('sidebar-open');
}

function toggleSidebar() { document.body.classList.toggle('sidebar-open'); }

function refreshAllUI() {
    renderDashboard();
    populateCustomerDropdown();
    resetCarpetRows();
    populateTrackingDropdown();
    executeGlobalSearch();
    populateInvoiceDropdown();
    renderInvoice();
    populatePaymentDropdown();
    loadPaymentData();
    populateBarcodeDropdown();
    generateBarcodes();
    renderHargaTable();
    renderLejar();
}

document.addEventListener('DOMContentLoaded', function() {
    $$('.menu-item').forEach(el => {
        el.addEventListener('click', function() { switchTab(this.dataset.tab); });
    });
    $$('input[name="custType"]').forEach(el => el.addEventListener('change', toggleCustType));
    document.getElementById('searchBox').addEventListener('input', executeGlobalSearch);
    document.getElementById('trackingInvoiceSelect').addEventListener('change', executeGlobalSearch);
    document.getElementById('extraServiceName').addEventListener('input', renderInvoice);
    document.getElementById('extraServicePrice').addEventListener('input', renderInvoice);
    document.getElementById('paymentInvoiceSelect').addEventListener('change', loadPaymentData);
    document.getElementById('barcodeInvoiceSelect').addEventListener('change', generateBarcodes);
    const tjTarikh = document.getElementById('tjTarikh'); if (tjTarikh) tjTarikh.value = getToday();
    fetchData();
});

window.onerror = function(msg, src, line, col, err) { console.error('Global error:', msg, err); return false; };
window.addEventListener('unhandledrejection', e => { console.error('Unhandled rejection:', e.reason); e.preventDefault(); });
console.log('MYCARPET PRO v2.0 (Modular) loaded.');
