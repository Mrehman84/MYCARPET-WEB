function janaMesejJanji() {
    const nama = document.getElementById('tjNama').value.trim();
    const telefon = document.getElementById('tjTelefon').value.trim();
    const alamat = document.getElementById('tjAlamat').value.trim();
    const tarikh = document.getElementById('tjTarikh').value;
    const masa = document.getElementById('tjMasa').value;
    if (!nama || !alamat || !tarikh || !masa) { alert('Sila lengkapkan semua maklumat.'); return; }
    const msg = `*Pusat Cucian Karpet MyCarpetPro v2.0*\nSlot janji temu untuk pengambilan karpet anda telah dimasukkan ke dalam sistem kami:\n🗓️ *Tarikh:* ${formatDateMY(tarikh)}\n⏰ *Masa:* ${masa}\n📍 *Alamat:* ${alamat}\nSila maklumkan kepada kami jika anda perlu menukar slot ini. Terima kasih! 🙏`;
    const preview = document.getElementById('mesejPreview');
    preview.textContent = msg; preview.classList.remove('hidden');
    if (navigator.clipboard) navigator.clipboard.writeText(msg).then(() => alert('Mesej disalin.')).catch(() => alert(msg));
    else alert(msg);
}
function hantarWhatsAppJanji() {
    const telefon = document.getElementById('tjTelefon').value.trim();
    if (!telefon) { alert('Sila masukkan nombor telefon pelanggan.'); return; }
    const preview = document.getElementById('mesejPreview');
    let msg = preview.textContent;
    if (!msg || preview.classList.contains('hidden')) { janaMesejJanji(); msg = preview.textContent; }
    window.open(`https://wa.me/60${telefon.replace(/^0+/, '')}?text=${encodeURIComponent(msg)}`, '_blank');
}
