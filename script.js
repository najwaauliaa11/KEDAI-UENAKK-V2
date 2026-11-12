/* ==========================================================================
   KEDAI UENAAK - SCRIPT LOGIC & INTERACTIONS
   Preserves all existing functions, enhanced with live totals, steppers & storage
   ========================================================================== */

var namaMenu = [
    "Nasi Sayur Lodeh",
    "Nasi Ayam Geprek",
    "Nasi Goreng Telur",
    "Indomie Rebus + Telur + Teh Es",
    "Indomie Goreng + Telur + Teh Es",
    "Rice Bowl Ayam Suwir Kemangi",
    "Rice Bowl Tongkol Suwir",
    "Rice Bowl Ayam Teriyaki",
    "Soto Ayam + Telur + Teh Es",
    "Rice Bowl Bakso Sapi Sambalado",
    "Kopi",
    "Kopi Susu",
    "Milo",
    "Es Teh Jumbo",
    "Es Jeruk Kecil",
    "Es Jeruk Besar",
    "Mineral Botol",
    "Air Putih Es"
];

var hargaMenu = [
    10000,
    10000,
    10000,
    10000,
    10000,
    10000,
    10000,
    10000,
    10000,
    10000,
    6000,
    8000,
    6000,
    3000,
    4000,
    5000,
    4000,
    2000
];

var pesananBaru = null;
var daftarPesanan = [];
var nomorTerakhir = 0;

// Format Angka ke Rupiah
function rupiah(angka) {
    return "Rp " + Number(angka).toLocaleString("id-ID") + ",-";
}

// Tambah Paragraf ke Elemen
function tambahTulisan(tempat, tulisan) {
    if (!tempat) return;
    var paragraf = document.createElement("p");
    paragraf.textContent = tulisan;
    tempat.appendChild(paragraf);
}

// Stepper untuk tambah/kurang jumlah pesanan
function stepJumlah(id, delta) {
    var input = document.getElementById(id);
    if (!input) return;
    var currentVal = parseInt(input.value, 10) || 0;
    var newVal = Math.max(0, currentVal + delta);
    input.value = newVal;
    updateLiveTotal();
}

// Hitung total secara real-time saat pengguna mengisi jumlah
function updateLiveTotal() {
    var total = 0;
    var itemCount = 0;

    for (var i = 0; i < namaMenu.length; i++) {
        var el = document.getElementById("jumlah" + i);
        if (el) {
            var val = parseInt(el.value, 10) || 0;
            if (val > 0) {
                total += val * hargaMenu[i];
                itemCount += val;
            }
        }
    }

    var liveEl = document.getElementById("liveTotalVal");
    var liveCountEl = document.getElementById("liveTotalCount");
    if (liveEl) {
        liveEl.textContent = rupiah(total);
    }
    if (liveCountEl) {
        liveCountEl.textContent = itemCount + " item dipilih";
    }
}

// Tampilkan bagian alamat jika jenis pesanan adalah Diantar
function pilihJenisPesanan() {
    var jenisEl = document.getElementById("jenis");
    if (!jenisEl) return;
    
    var jenis = jenisEl.value;
    var bagianAlamat = document.getElementById("bagianAlamat");
    var alamat = document.getElementById("alamat");

    if (bagianAlamat && alamat) {
        if (jenis === "Diantar") {
            bagianAlamat.hidden = false;
            alamat.required = true;
        } else {
            bagianAlamat.hidden = true;
            alamat.required = false;
            alamat.value = "";
        }
    }
}

// Reset Form Isian
function hapusIsian() {
    var form = document.getElementById("formPesanan");
    if (form) form.reset();

    pesananBaru = null;
    pilihJenisPesanan();
    updateLiveTotal();
}

// Baca Riwayat dari LocalStorage
function bacaRiwayat() {
    try {
        var dataLama = localStorage.getItem("riwayatUenaak");
        if (dataLama != null) {
            var hasil = JSON.parse(dataLama);
            if (Array.isArray(hasil)) {
                daftarPesanan = hasil;
            }
        }

        var nomorLama = Number(localStorage.getItem("nomorTerakhirUenaak"));
        if (nomorLama > 0) {
            nomorTerakhir = nomorLama;
        }

        for (var i = 0; i < daftarPesanan.length; i++) {
            if (daftarPesanan[i].nomor > nomorTerakhir) {
                nomorTerakhir = daftarPesanan[i].nomor;
            }
        }

        var infoEl = document.getElementById("infoPenyimpanan");
        if (infoEl) {
            infoEl.textContent = "Riwayat tersimpan pada peramban ini.";
        }
    } catch (error) {
        var infoElErr = document.getElementById("infoPenyimpanan");
        if (infoElErr) {
            infoElErr.textContent = "Riwayat tidak dapat dibaca dari penyimpanan lokal.";
        }
    }
}

// Simpan Riwayat ke LocalStorage
function simpanRiwayat() {
    try {
        localStorage.setItem("riwayatUenaak", JSON.stringify(daftarPesanan));
        localStorage.setItem("nomorTerakhirUenaak", nomorTerakhir);

        var infoEl = document.getElementById("infoPenyimpanan");
        if (infoEl) {
            infoEl.textContent = "Riwayat tersimpan pada peramban ini.";
        }
    } catch (error) {
        var infoElErr = document.getElementById("infoPenyimpanan");
        if (infoElErr) {
            infoElErr.textContent = "Gagal menyimpan riwayat ke penyimpanan lokal.";
        }
    }
}

// Hapus Seluruh Riwayat Pesanan
function hapusSemuaRiwayat() {
    if (daftarPesanan.length === 0) {
        alert("Belum ada riwayat pesanan.");
        return;
    }
    
    var konfirm = confirm("Apakah Anda yakin ingin menghapus seluruh riwayat pesanan?");
    if (konfirm) {
        daftarPesanan = [];
        try {
            localStorage.removeItem("riwayatUenaak");
        } catch (e) {}
        tampilkanPesanan();
        alert("Riwayat pesanan berhasil dibersihkan.");
    }
}

// Buat Pesanan Baru (Validasi Form)
function buatPesanan() {
    var namaEl = document.getElementById("nama");
    var teleponEl = document.getElementById("telepon");
    var jenisEl = document.getElementById("jenis");
    var alamatEl = document.getElementById("alamat");
    var catatanEl = document.getElementById("catatan");

    var nama = namaEl ? namaEl.value.trim() : "";
    var telepon = teleponEl ? teleponEl.value.trim() : "";
    var jenis = jenisEl ? jenisEl.value : "Makan di tempat";
    var alamat = alamatEl ? alamatEl.value.trim() : "";
    var catatan = catatanEl ? catatanEl.value.trim() : "";

    if (nama === "" || telepon === "") {
        alert("Mohon isi nama dan nomor telepon Anda terlebih dahulu.");
        return;
    }

    if (jenis === "Diantar" && alamat === "") {
        alert("Mohon isi alamat pengantaran lengkap terlebih dahulu.");
        if (alamatEl) alamatEl.focus();
        return;
    }

    if (jenis !== "Diantar") {
        alamat = "";
    }

    var detail = [];
    var total = 0;
    for (var i = 0; i < namaMenu.length; i++) {
        var inputJumlah = document.getElementById("jumlah" + i);
        var jumlah = inputJumlah ? Number(inputJumlah.value) : 0;

        if (!Number.isInteger(jumlah) || jumlah < 0) {
            alert("Jumlah pesanan harus berupa angka bulat 0 atau lebih.");
            return;
        }

        if (jumlah > 0) {
            var subtotal = jumlah * hargaMenu[i];
            detail.push({
                nama: namaMenu[i],
                jumlah: jumlah,
                subtotal: subtotal,
                teks: jumlah + "x " + namaMenu[i] + " (" + rupiah(subtotal) + ")"
            });
            total += subtotal;
        }
    }

    if (detail.length === 0) {
        alert("Pilih minimal 1 menu makanan atau minuman.");
        return;
    }

    pesananBaru = {
        nama: nama,
        telepon: telepon,
        jenis: jenis,
        alamat: alamat,
        catatan: catatan,
        detail: detail,
        total: total,
        waktu: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
    };

    var ringkasan = document.getElementById("ringkasan");
    if (ringkasan) {
        ringkasan.innerHTML = "";
        
        var infoBox = document.createElement("div");
        infoBox.className = "ringkasan-box";
        
        tambahTulisan(infoBox, "Nama Pemesan: " + nama);
        tambahTulisan(infoBox, "Nomor Telepon: " + telepon);
        tambahTulisan(infoBox, "Jenis Pesanan: " + jenis);

        if (jenis === "Diantar") {
            tambahTulisan(infoBox, "Alamat Pengantaran: " + alamat);
            tambahTulisan(infoBox, "Catatan Pengantaran: Ongkos kirim dikonfirmasi via WhatsApp oleh kedai.");
        }

        var rincianBox = document.createElement("div");
        rincianBox.className = "ringkasan-box";
        tambahTulisan(rincianBox, "Daftar Menu yang Dipesan:");
        for (var d = 0; d < detail.length; d++) {
            tambahTulisan(rincianBox, "• " + detail[d].teks);
        }

        if (catatan !== "") {
            var catatanBox = document.createElement("div");
            catatanBox.className = "ringkasan-box";
            tambahTulisan(catatanBox, "Catatan Khusus: " + catatan);
            ringkasan.appendChild(catatanBox);
        }

        ringkasan.appendChild(infoBox);
        ringkasan.appendChild(rincianBox);
    }

    var totalEl = document.getElementById("totalPembayaran");
    if (totalEl) {
        totalEl.textContent = "TOTAL PEMBAYARAN: " + rupiah(total);
    }

    var formPesanan = document.getElementById("formPesanan");
    var pembayaran = document.getElementById("pembayaran");
    if (formPesanan) formPesanan.hidden = true;
    if (pembayaran) {
        pembayaran.hidden = false;
        pembayaran.scrollIntoView({ behavior: 'smooth' });
    }
}

// Kembali ke Form untuk Merubah Isian Pesanan
function ubahPesanan() {
    pesananBaru = null;

    var formPesanan = document.getElementById("formPesanan");
    var pembayaran = document.getElementById("pembayaran");
    if (pembayaran) pembayaran.hidden = true;
    if (formPesanan) {
        formPesanan.hidden = false;
        pilihJenisPesanan();
        formPesanan.scrollIntoView({ behavior: 'smooth' });
    }
}

// Konfirmasi Pembayaran dan Simpan Pesanan
function konfirmasiPembayaran() {
    if (pesananBaru == null) {
        return;
    }

    var yakin = confirm(
        "Konfirmasi: Apakah Anda telah mentransfer sesuai total menu (" + rupiah(pesananBaru.total) + ")?"
    );

    if (!yakin) {
        return;
    }

    nomorTerakhir = nomorTerakhir + 1;
    pesananBaru.nomor = nomorTerakhir;
    pesananBaru.status = "Pembayaran dikonfirmasi pemesan (Menunggu verifikasi kasir)";

    daftarPesanan.unshift(pesananBaru); // letakkan pesanan terbaru di paling atas
    simpanRiwayat();

    var formPesanan = document.getElementById("formPesanan");
    var pembayaran = document.getElementById("pembayaran");
    if (pembayaran) pembayaran.hidden = true;
    if (formPesanan) formPesanan.hidden = false;

    hapusIsian();
    tampilkanPesanan();

    var daftarPesananEl = document.getElementById("daftarPesanan");
    if (daftarPesananEl) {
        daftarPesananEl.scrollIntoView({ behavior: 'smooth' });
    }

    alert("Pesanan #" + nomorTerakhir + " berhasil dikonfirmasi! Pesanan akan segera diproses oleh Kedai Uenaak.");
}

// Tampilkan Daftar Riwayat Pesanan
function tampilkanPesanan() {
    var tempat = document.getElementById("daftarPesanan");
    if (!tempat) return;

    tempat.innerHTML = "";

    if (daftarPesanan.length === 0) {
        var emptyNotice = document.createElement("div");
        emptyNotice.className = "petunjuk";
        emptyNotice.style.textAlign = "center";
        emptyNotice.style.padding = "2rem 1rem";
        emptyNotice.innerHTML = "<i class='fa-solid fa-receipt' style='font-size: 2rem; color: var(--border); margin-bottom: 0.5rem; display: block;'></i>Belum ada pesanan aktif.";
        tempat.appendChild(emptyNotice);
        return;
    }

    for (var i = 0; i < daftarPesanan.length; i++) {
        var pesanan = daftarPesanan[i];

        var kartu = document.createElement("div");
        kartu.className = "kartu-pesanan";

        var header = document.createElement("div");
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.alignItems = "center";
        header.style.marginBottom = "0.75rem";

        var judul = document.createElement("h3");
        judul.style.margin = "0";
        judul.innerHTML = "<i class='fa-solid fa-receipt' style='margin-right: 0.5rem; color: var(--primary);'></i>Pesanan #" + pesanan.nomor;

        var statusSpan = document.createElement("span");
        statusSpan.className = "status-badge";
        statusSpan.textContent = "Diproses";

        header.appendChild(judul);
        header.appendChild(statusSpan);
        kartu.appendChild(header);

        tambahTulisan(kartu, "Pemesan: " + pesanan.nama + " (" + pesanan.telepon + ")");
        tambahTulisan(kartu, "Jenis: " + pesanan.jenis + (pesanan.alamat ? " — Alamat: " + pesanan.alamat : ""));

        var rincianWrap = document.createElement("div");
        rincianWrap.style.margin = "0.6rem 0";
        rincianWrap.style.padding = "0.6rem 0.8rem";
        rincianWrap.style.background = "var(--bg-page)";
        rincianWrap.style.borderRadius = "var(--radius-sm)";
        rincianWrap.style.fontSize = "0.86rem";

        if (Array.isArray(pesanan.detail)) {
            for (var j = 0; j < pesanan.detail.length; j++) {
                var itemText = typeof pesanan.detail[j] === "string" ? pesanan.detail[j] : pesanan.detail[j].teks;
                tambahTulisan(rincianWrap, "• " + itemText);
            }
        }
        kartu.appendChild(rincianWrap);

        if (pesanan.catatan) {
            tambahTulisan(kartu, "Catatan: " + pesanan.catatan);
        }

        var totalWrap = document.createElement("div");
        totalWrap.style.display = "flex";
        totalWrap.style.justifyContent = "space-between";
        totalWrap.style.alignItems = "center";
        totalWrap.style.marginTop = "0.75rem";
        totalWrap.style.paddingTop = "0.5rem";
        totalWrap.style.borderTop = "1px solid var(--border-subtle)";

        var totalLabel = document.createElement("strong");
        totalLabel.textContent = "Total Pembayaran:";
        var totalVal = document.createElement("span");
        totalVal.style.color = "var(--accent)";
        totalVal.style.fontWeight = "800";
        totalVal.textContent = rupiah(pesanan.total);

        totalWrap.appendChild(totalLabel);
        totalWrap.appendChild(totalVal);
        kartu.appendChild(totalWrap);

        tempat.appendChild(kartu);
    }
}

// Toggle Menu Mobile Drawer
function toggleMobileMenu() {
    var drawer = document.getElementById("mobileDrawer");
    if (drawer) {
        drawer.classList.toggle("is-open");
    }
}

// Periksa URL Param jika ada pre-selected menu (?menu=0 dst)
function cekUrlMenu() {
    try {
        var params = new URLSearchParams(window.location.search);
        var menuIndex = params.get("menu");
        if (menuIndex !== null && !isNaN(menuIndex)) {
            var idx = parseInt(menuIndex, 10);
            if (idx >= 0 && idx < namaMenu.length) {
                stepJumlah("jumlah" + idx, 1);
                var targetRow = document.getElementById("jumlah" + idx);
                if (targetRow) {
                    targetRow.closest("tr").scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    } catch (e) {}
}

// Deteksi Frame & Sinkronisasi Navigasi Header
if (window.self !== window.top) {
    document.documentElement.classList.add("in-frame");
    try {
        if (window.parent && window.parent.frames && window.parent.frames["atas"]) {
            var atasDoc = window.parent.frames["atas"].document;
            if (atasDoc) {
                var currentPage = window.location.pathname.split("/").pop() || "isi.html";
                var atasLinks = atasDoc.querySelectorAll(".nav-item-link");
                for (var j = 0; j < atasLinks.length; j++) {
                    atasLinks[j].classList.remove("active");
                    if (atasLinks[j].getAttribute("href") === currentPage) {
                        atasLinks[j].classList.add("active");
                    }
                }
            }
        }
    } catch (e) {}
}

// Inisialisasi saat Halaman Dimuat
document.addEventListener("DOMContentLoaded", function () {
    pilihJenisPesanan();
    bacaRiwayat();
    tampilkanPesanan();
    updateLiveTotal();
    cekUrlMenu();

    // Pasang listener update live total pada semua input jumlah
    for (var i = 0; i < namaMenu.length; i++) {
        var el = document.getElementById("jumlah" + i);
        if (el) {
            el.addEventListener("input", updateLiveTotal);
        }
    }
});
