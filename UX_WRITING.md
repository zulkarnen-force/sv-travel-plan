# UX_WRITING.md

> Panduan UX writing untuk aplikasi mobile berbahasa Indonesia dengan gaya santai, hangat, dan Gen Z. Terinspirasi dari gaya app super-app lokal seperti Gojek. Dokumen ini adalah sumber kebenaran untuk semua teks di produk: tombol, error, notifikasi, onboarding, dan seterusnya.
>
> **Cara pakai:** Baca bagian 1-3 sekali buat paham "suara" produk. Selanjutnya, pakai bagian 4-9 sebagai kamus dan template saat nulis. Sebelum rilis, cek bagian 12 (checklist).

---

## 1. Prinsip Utama

| # | Prinsip | Artinya |
|---|---------|---------|
| 1 | **Ngomong kayak temen, bukan kayak CS bank** | Santai dan natural, tapi tetap sopan. |
| 2 | **Jelas dulu, lucu belakangan** | Kalau user lagi buru-buru atau bingung, kejelasan menang atas keseruan. |
| 3 | **Singkat itu sopan** | Satu ide per kalimat. Buang kata yang nggak nambah arti. |
| 4 | **Kasih tahu next step** | Setiap pesan harus jawab: "Terus aku ngapain?" |
| 5 | **Jangan nyalahin user** | Error itu tanggung jawab sistem, bukan salah user. |
| 6 | **Serius kalau urusan duit & data** | Gaul boleh, ngawur nggak. Transaksi, saldo, dan keamanan wajib presisi. |

---

## 2. Suara (Voice)

Suara produk **selalu sama**, apa pun situasinya.

**Kita itu:**
- **Ramah**: nyapa kayak temen yang bisa diandalkan
- **Santai**: pakai bahasa sehari-hari, bukan bahasa buku
- **Sigap**: to the point, nggak bertele-tele
- **Tulus**: minta maaf kalau salah, bangga kalau berhasil
- **Dikit playful**: ada humor ringan, bukan lawakan

**Kita bukan:**
- Alay berlebihan ("Hai kakaaak 😍😍 mau ordeeer yaaa")
- Sok kaku ("Dengan hormat kami informasikan bahwa...")
- Sok edgy atau toxic
- Sarkas ke user

### Sudut pandang
- Produk menyebut diri: **"kami"** untuk hal formal/kebijakan, **"aku"** boleh dipakai untuk momen personal dan ringan (empty state, onboarding). **Pilih satu per konteks, jangan campur dalam satu layar.**
- User disapa: **"kamu"**. Jangan pernah "Anda", "Bapak/Ibu", atau "Kak" (kecuali brand memutuskan lain secara resmi).
- Nama user dipakai seperlunya saja (sapaan beranda, ulang tahun), jangan di setiap layar.

---

## 3. Nada (Tone) Berdasarkan Situasi

Suara tetap, **nada menyesuaikan mood user.**

| Situasi | Nada | Humor? | Contoh |
|---------|------|--------|--------|
| Sukses / selesai | Girang, singkat | Boleh | "Yeay, pesanan udah dibuat!" |
| Loading / nunggu | Santai, menenangkan | Boleh | "Bentar ya, lagi nyari driver buat kamu..." |
| Info biasa | Netral, ramah | Dikit | "Promo kamu bakal hangus besok." |
| Error ringan | Empati, solutif | Jangan | "Koneksi kamu lagi putus. Coba cek sinyal dulu ya." |
| Error serius / gagal bayar | Tenang, jelas, serius | **Jangan** | "Pembayaran belum berhasil. Saldo kamu nggak kepotong." |
| Keamanan / penipuan | Tegas, jelas | **Jangan** | "Jangan kasih kode OTP ke siapa pun, termasuk kami." |
| Komplain / refund | Empati, bertanggung jawab | **Jangan** | "Maaf ya, pesananmu telat. Kami bantu cek sekarang." |
| Momen senang (ultah, level up) | Hangat, meriah | Boleh | "Happy birthday! Ada hadiah kecil nih buat kamu 🎁" |

> **Aturan emas:** Makin tinggi risiko (uang, keselamatan, data), makin rendah kadar humor.

---

## 4. Kosakata

### 4.1 Pakai ini
| Pakai | Daripada |
|-------|----------|
| kamu | Anda |
| aku / kami | saya |
| nggak / enggak | tidak |
| udah | sudah |
| belum | belum (sama) |
| bisa | dapat |
| lagi (sedang) | sedang |
| cuma / tinggal | hanya |
| bikin | membuat |
| cek | periksa |
| coba lagi | ulangi |
| masuk / login | log in |
| daftar | registrasi |
| bayar | melakukan pembayaran |
| pesan / order | melakukan pemesanan |
| ganti | mengubah |
| oke | baik / setuju |
| yuk | mari |
| ya | (partikel penutup lembut) |
| nih / deh / dong | (boleh, secukupnya) |

### 4.2 Slang Gen Z: boleh, tapi dengan aturan
Boleh dipakai **hanya di konteks ringan** (promo, empty state, onboarding, notif non-kritis).

| Boleh (ringan) | Catatan |
|----------------|---------|
| gas / gaskeun | Ajakan aksi. Contoh: "Gas pesan sekarang!" |
| yuk / ayo | Aman dan netral |
| auto | "Voucher auto kepasang" |
| santuy | Hindari kalau terlalu sering |
| mager | Cocok buat food delivery: "Mager keluar? Pesan aja." |
| spill / worth it / hemat | Cocok buat promo |
| kuy | Pakai sangat jarang |

**Jangan pakai slang** di: pembayaran, error serius, keamanan, legal, bantuan darurat, atau fitur yang dipakai orang tua / lintas generasi.

> **Tes ganda:** Kalau tante atau bapak-bapak 50 tahun baca teks ini, apakah masih paham? Kalau nggak, turunin level slang-nya.

### 4.3 Hindari
- Slang yang cepat basi atau terlalu niche (cek: apakah masih dipakai 6 bulan lagi?)
- Singkatan yang bikin bingung ("gpp", "bgt", "yg", "dr", "utk") di **teks UI**. Singkatan chat boleh di konten sosial, bukan di tombol atau error.
- Bahasa campur Inggris-Indonesia berlebihan ("Mau di-cancel atau di-reschedule order kamu?")
- Istilah teknis mentah ("Error 500", "Timeout", "Null")
- Kata kasar dan merendahkan

### 4.4 Istilah Inggris: kapan boleh?
Boleh dipertahankan kalau **sudah umum** dipakai orang Indonesia:
`login, logout, voucher, driver, chat, e-wallet, top up, OTP, notifikasi, update, download, link, profil, akun, password`

Terjemahkan atau jelaskan kalau belum umum:
| Hindari | Pakai |
|---------|-------|
| Authenticate | Verifikasi |
| Dismiss | Tutup |
| Submit | Kirim |
| Retry | Coba lagi |
| Pending | Lagi diproses |

---

## 5. Aturan Tulisan (Mekanik)

### 5.1 Huruf & tanda baca
- **Sentence case** di semua teks UI: "Pesan sekarang", bukan "Pesan Sekarang" atau "PESAN SEKARANG".
- Nama fitur / brand tetap kapital sesuai aslinya.
- **Tombol:** tanpa titik di akhir.
- **Judul:** tanpa titik.
- **Kalimat penuh (deskripsi, error):** boleh pakai titik. Pilih satu gaya dan konsisten per komponen.
- **Tanda seru (!):** maksimal 1 per layar. Simpan buat momen sukses atau senang. Jangan di error.
- **Elipsis (...):** khusus loading. Jangan buat dramatis.
- **Tanda tanya:** boleh buat nanya ke user, tapi jangan terlalu sering.

### 5.2 Panjang teks (acuan)
| Komponen | Batas ideal |
|----------|-------------|
| Tombol | 1-3 kata (maks 20 karakter) |
| Judul layar / modal | Maks 6 kata |
| Toast / snackbar | Maks 1 kalimat (±60 karakter) |
| Judul push notif | Maks 40 karakter |
| Isi push notif | Maks 90 karakter |
| Deskripsi error | Maks 2 kalimat |
| Placeholder input | Maks 4 kata |
| Label input | 1-3 kata |

### 5.3 Angka, uang, tanggal, jam
| Hal | Format | Contoh |
|-----|--------|--------|
| Rupiah | `Rp` + titik pemisah ribuan, tanpa spasi | `Rp25.000` |
| Singkatan ribuan | `rb`, `jt` (hanya di tempat sempit / promo) | `Rp25rb`, `Rp1,5jt` |
| Tanggal | `30 Okt 2026` | |
| Tanggal lengkap | `Jumat, 30 Oktober 2026` | |
| Jam | 24 jam, pakai titik atau titik dua konsisten | `19.30` |
| Durasi | `5 menit`, `2 jam` | |
| Jarak | `1,2 km` | |
| Persen | `20%` (tanpa spasi) | |
| Relatif | "barusan", "5 menit lalu", "kemarin" | |

> Pakai **angka**, bukan kata, untuk info penting ("3 promo", bukan "tiga promo").

### 5.4 Emoji
- **Boleh, tapi hemat.** Maksimal 1 per teks, dan hanya kalau menambah makna atau rasa.
- Taruh di **akhir** kalimat atau judul, bukan di tengah kalimat.
- Jangan pakai emoji di: error serius, pembayaran gagal, keamanan, legal, atau komplain.
- Hindari emoji ambigu atau berpotensi sensitif (🙏 bisa terbaca berbeda, 😂 pada momen salah).
- Jangan jadikan emoji satu-satunya penyampai makna (aksesibilitas).

| Aman | Hindari |
|------|---------|
| 🎉 sukses, promo | 😭 di error |
| 🛵 🍜 ☕ sesuai konteks | Rentetan emoji 🔥🔥🔥😍😍 |
| ✨ 🎁 reward | Emoji di judul modal konfirmasi hapus akun |

---

## 6. Pola Teks per Komponen

### 6.1 Tombol (CTA)
**Rumus:** Kata kerja + (objek). Ke-aksi-an jelas.

| Jangan | Pakai |
|--------|-------|
| OK | Siap / Oke |
| Submit | Kirim |
| Lanjut ke tahap berikutnya | Lanjut |
| Klik di sini | Lihat detail |
| Ya | Ya, hapus |
| Batal | Nanti aja / Batal |

Pasangan tombol umum:
| Primary | Secondary |
|---------|-----------|
| Pesan sekarang | Nanti aja |
| Bayar | Ganti metode |
| Simpan | Batal |
| Coba lagi | Tutup |
| Ya, keluar | Tetap di sini |
| Aktifkan | Nanti |

> Pada dialog destruktif, **tombol harus menyebut aksinya** ("Ya, hapus"), bukan sekadar "Ya".

### 6.2 Sapaan & beranda
- Pagi: "Selamat pagi, {nama}!" / "Pagi, {nama} ☀️"
- Siang: "Siang, {nama}. Udah makan belum?"
- Malam: "Malam, {nama}. Mau pesan apa?"
- Dini hari (00.00-04.00): "Masih melek nih? Mau pesan apa?"

> Sapaan waktu hanya dipakai di beranda. Jangan sok kenal di fitur lain.

### 6.3 Loading
| Situasi | Teks |
|---------|------|
| Umum | "Bentar ya..." |
| Cari driver | "Lagi nyariin driver buat kamu..." |
| Proses bayar | "Lagi proses pembayaran, jangan ditutup dulu ya." |
| Memuat daftar | "Lagi nyiapin yang terbaik buat kamu..." |
| Lama (>10 detik) | "Agak lama nih. Tunggu sebentar lagi ya." |

> Kalau proses penting (bayar, kirim data), **selalu bilang apa yang sedang terjadi** dan **jangan suruh user nutup app**.

### 6.4 Sukses
**Rumus:** Konfirmasi hasil + info next step (kalau ada).

| Situasi | Teks |
|---------|------|
| Pesanan dibuat | "Yeay, pesanan kamu udah masuk! Driver lagi meluncur." |
| Bayar berhasil | "Pembayaran berhasil. Makasih ya!" |
| Top up | "Top up Rp50.000 berhasil. Saldo kamu udah nambah." |
| Simpan profil | "Perubahan udah disimpan." |
| Voucher dipakai | "Voucher kepasang. Hemat Rp10.000!" |

### 6.5 Error
**Rumus 3 bagian:** (1) Apa yang terjadi → (2) Kenapa (kalau relevan) → (3) Harus ngapain.
**Jangan** salahin user, jangan pakai kode error mentah, jangan bercanda.

| Situasi | Jangan | Pakai |
|---------|--------|-------|
| Offline | "Network error 0x01" | "Koneksi kamu putus. Cek internet, terus coba lagi ya." |
| Server | "Terjadi kesalahan pada server" | "Ada gangguan di sistem kami. Coba lagi bentar lagi ya." |
| Input salah | "Input tidak valid" | "Nomor HP-nya kurang pas. Cek lagi ya." |
| Password salah | "Autentikasi gagal" | "Password-nya belum bener. Coba lagi atau reset password." |
| Pembayaran gagal | "Transaksi ditolak" | "Pembayaran belum berhasil. Saldo kamu nggak kepotong. Coba metode lain ya." |
| Lokasi mati | "Izin lokasi ditolak" | "Aktifin lokasi dulu biar kami bisa nemuin kamu." |
| Sesi habis | "Session expired" | "Sesi kamu habis. Login lagi yuk." |
| Kuota habis | "Quota exceeded" | "Batas harian kamu udah kepake. Coba lagi besok ya." |

> **Kalau ada uang yang terlibat, selalu jelasin status uang user** ("saldo nggak kepotong" / "dana dikembalikan dalam 1x24 jam").

### 6.6 Empty state
**Rumus:** Judul singkat + 1 kalimat kenapa kosong / apa manfaatnya + CTA.

| Layar | Judul | Deskripsi | CTA |
|-------|-------|-----------|-----|
| Riwayat kosong | Belum ada pesanan | Pesanan pertama kamu bakal muncul di sini. | Pesan sekarang |
| Promo kosong | Belum ada promo | Cek lagi nanti ya, promo baru sering muncul. | Balik ke beranda |
| Favorit kosong | Belum ada favorit | Tap ❤️ di resto yang kamu suka biar gampang dicari. | Cari resto |
| Notifikasi kosong | Semua udah kebaca | Belum ada kabar baru buat kamu. | - |
| Hasil cari nihil | Hmm, nggak ketemu | Coba kata kunci lain atau cek ejaannya. | Hapus pencarian |

### 6.7 Onboarding
- Maks **3 layar**, 1 pesan per layar.
- Fokus ke **manfaat**, bukan fitur.

| Layar | Judul | Deskripsi |
|-------|-------|-----------|
| 1 | Semua urusan, satu app | Pesan makan, ojek, sampai bayar tagihan, gampang. |
| 2 | Hemat tiap hari | Banyak promo & voucher yang auto kepasang. |
| 3 | Aman & tenang | Pembayaran kamu dilindungi. Tinggal gas. |

### 6.8 Form & input
- **Label:** jelas dan singkat ("Nomor HP", "Email").
- **Placeholder:** contoh isian, bukan instruksi ("08123456789").
- **Helper text:** hanya kalau butuh ("Kami cuma pakai ini buat kirim kode").
- **Error inline:** langsung di bawah field, singkat, solutif.
- **Wajib vs opsional:** tandai yang **opsional**, bukan yang wajib ("Catatan (opsional)").

| Field | Error |
|-------|-------|
| Email | "Format email-nya kurang pas. Contoh: nama@email.com" |
| Nomor HP | "Nomor HP harus 10-13 angka." |
| Password | "Minimal 8 karakter ya." |
| Kode OTP | "Kodenya belum cocok. Cek lagi atau minta kode baru." |

### 6.9 Dialog konfirmasi
**Rumus:** Judul pertanyaan jelas + konsekuensi + 2 tombol spesifik.

**Contoh (hapus alamat):**
> **Hapus alamat ini?**
> Alamat bakal hilang dari daftar kamu dan nggak bisa dikembalikan.
> `[Ya, hapus]` `[Batal]`

**Contoh (batalkan pesanan):**
> **Yakin mau batalin pesanan?**
> Driver udah on the way. Kamu mungkin kena biaya pembatalan.
> `[Ya, batalin]` `[Lanjutin pesanan]`

> Untuk aksi **berbahaya / tidak bisa dibatalkan**, jelaskan konsekuensinya dengan serius, tanpa slang dan tanpa emoji.

### 6.10 Toast & snackbar
- 1 kalimat, tanpa titik.
- Boleh ada 1 aksi ("Urungkan", "Lihat").

| Situasi | Teks |
|---------|------|
| Disalin | "Kode udah disalin" |
| Dihapus | "Alamat dihapus" + `Urungkan` |
| Tersimpan | "Udah disimpan" |
| Offline | "Kamu lagi offline" |

### 6.11 Push notification
**Rumus:** Judul (hook / info utama) + isi (detail + aksi). Relevan dan tepat waktu.

| Jenis | Judul | Isi |
|-------|-------|-----|
| Status order | Driver udah deket! | Siap-siap ya, pesanan kamu bentar lagi sampai. |
| Pesanan sampai | Pesanan sampai 🎉 | Selamat menikmati! Jangan lupa kasih rating ya. |
| Promo | Diskon 50% buat kamu | Cuma sampai jam 22.00 malam ini. Gas pesan! |
| Voucher mau habis | Voucher kamu hampir hangus | Sisa 2 jam lagi. Pakai sebelum kelewat. |
| Keamanan | Login dari perangkat baru | Kalau bukan kamu, amankan akun sekarang. |
| Pembayaran | Pembayaran berhasil | Rp45.000 ke Warung Bu Sari. |

Aturan push:
- Jangan clickbait menyesatkan.
- Jangan spam. Kalau nggak penting, nggak usah dikirim.
- Jangan pakai slang di notif keamanan dan transaksi.
- Hindari terlalu sering "Yuk" dan "Gas" di semua notif.

### 6.12 Permission (izin)
Jelaskan **kenapa** sebelum minta izin.

| Izin | Teks |
|------|------|
| Lokasi | "Boleh akses lokasi kamu? Biar driver gampang nemuin kamu." |
| Notifikasi | "Aktifin notifikasi biar kamu tahu kapan pesanan sampai." |
| Kontak | "Izinin akses kontak buat kirim uang ke temen lebih cepat." |
| Kamera | "Kamera dibutuhin buat scan QR. Nggak ada foto yang disimpan." |

### 6.13 Pembayaran & keuangan (sensitif)
- **Jelas, presisi, tanpa humor.** Tampilkan angka lengkap.
- Selalu konfirmasi: **berapa, ke siapa, dari mana.**
- Status harus tegas: Berhasil / Gagal / Diproses.

| Situasi | Teks |
|---------|------|
| Konfirmasi | "Bayar Rp45.000 ke Warung Bu Sari pakai saldo?" |
| Berhasil | "Pembayaran berhasil. Rp45.000 terkirim ke Warung Bu Sari." |
| Diproses | "Pembayaran lagi diproses. Biasanya cuma beberapa menit." |
| Gagal | "Pembayaran belum berhasil. Saldo kamu nggak kepotong." |
| Saldo kurang | "Saldo kamu kurang Rp5.000. Top up dulu yuk." |
| Refund | "Dana Rp45.000 dikembalikan ke saldo kamu dalam 1x24 jam." |

### 6.14 Keamanan & verifikasi
- Tegas, jelas, **tanpa slang**.
- Ingatkan hal penting dengan lugas.

| Situasi | Teks |
|---------|------|
| OTP | "Jangan kasih kode ini ke siapa pun, termasuk pihak yang ngaku dari kami." |
| Login baru | "Ada login dari perangkat baru. Kalau bukan kamu, ganti password sekarang." |
| Akun dikunci | "Akun kamu dikunci sementara demi keamanan. Hubungi bantuan buat buka." |

---

## 7. Inklusif & Aman

- **Jangan** asumsikan gender, usia, agama, atau status. Pakai "kamu", bukan "kakak / mas / mbak".
- Hindari stereotip dan candaan soal fisik, ekonomi, daerah, atau SARA.
- Hindari kata yang menyudutkan: "gaptek", "kampungan", "miskin", "buta" (sebagai makian), dsb.
- Pakai bahasa yang bisa dipahami semua kalangan. Slang adalah bumbu, bukan menu utama.
- Untuk topik sensitif (kesehatan, duka, bencana), **turunkan nada jadi tenang dan empatik**. Tanpa emoji.

---

## 8. Aksesibilitas

- Teks tombol dan link harus **bermakna sendiri**, jangan "Klik di sini".
- Jangan andalkan warna atau emoji sebagai satu-satunya penanda.
- Alt text / label aksesibilitas: **deskriptif dan netral**, tanpa slang berlebihan.
- Hindari teks yang hanya hidup di gambar.
- Kalimat pendek lebih mudah dibaca screen reader.
- Hindari singkatan yang dibacakan aneh oleh screen reader.

---

## 9. Contoh Rewrite (Sebelum → Sesudah)

| Konteks | ❌ Sebelum | ✅ Sesudah |
|---------|-----------|-----------|
| Error jaringan | "Terjadi kesalahan jaringan. Silakan coba beberapa saat lagi." | "Koneksi kamu lagi putus. Cek sinyal, terus coba lagi ya." |
| Sukses order | "Pemesanan Anda telah berhasil dibuat." | "Yeay, pesanan kamu udah masuk!" |
| Hapus | "Apakah Anda yakin ingin menghapus data ini?" | "Hapus ini? Datanya nggak bisa dibalikin." |
| Promo | "Dapatkan potongan harga spesial untuk Anda." | "Ada diskon spesial buat kamu. Gas cek!" |
| Izin lokasi | "Aplikasi memerlukan akses lokasi Anda." | "Boleh akses lokasi? Biar driver gampang nemuin kamu." |
| Saldo kurang | "Saldo tidak mencukupi untuk melakukan transaksi." | "Saldo kamu kurang Rp5.000. Top up dulu yuk." |
| Empty state | "Data tidak ditemukan." | "Belum ada pesanan. Yuk, pesan yang pertama!" |
| Update app | "Harap perbarui aplikasi ke versi terbaru." | "Ada versi baru nih. Update dulu biar makin lancar." |

---

## 10. Kata & Frasa Siap Pakai (Microcopy Bank)

**Pembuka / ajakan:** Yuk · Gas · Cobain · Cek dulu · Mulai yuk
**Penutup lembut:** ya · deh · nih · dong (maks 1 per kalimat)
**Konfirmasi:** Siap · Oke · Udah beres · Beres!
**Menunggu:** Bentar ya · Tunggu sebentar · Lagi diproses
**Terima kasih:** Makasih ya · Makasih udah nunggu · Makasih banyak!
**Maaf:** Maaf ya · Maaf banget, ini di luar rencana kami
**Menolak halus:** Nanti aja · Lain kali · Belum dulu
**Rating:** Gimana pengalaman kamu? · Seru nggak tadi?

---

## 11. Yang Harus Dihindari (Anti-Pattern)

1. ❌ **Over-slang:** "Gaskeun bestie, order mu auto cuan, no cap fr fr!"
2. ❌ **Humor di error serius:** "Oops, duit kamu nyangkut 🤡"
3. ❌ **Nyalahin user:** "Kamu salah masukin password."
4. ❌ **Jargon:** "Request timeout (408)."
5. ❌ **Terlalu kaku:** "Mohon maaf atas ketidaknyamanan yang terjadi."
6. ❌ **Campur "Anda" dan "kamu"** dalam satu produk.
7. ❌ **Tanda seru di mana-mana!!!**
8. ❌ **Tombol ambigu:** "OK", "Ya", "Submit" tanpa konteks.
9. ❌ **Clickbait menipu:** "Kamu menang Rp10 juta!" padahal cuma voucher.
10. ❌ **Pesan tanpa solusi:** "Gagal." (terus aku ngapain?)

---

## 12. Checklist Sebelum Rilis

**Suara & nada**
- [ ] Pakai "kamu", bukan "Anda"?
- [ ] Nada sesuai situasi (humor hanya kalau aman)?
- [ ] Slang masih bisa dipahami lintas usia?

**Kejelasan**
- [ ] Satu ide per kalimat?
- [ ] User tahu next step?
- [ ] Error: ada penjelasan + solusi?
- [ ] Info uang / data presisi dan jelas?

**Mekanik**
- [ ] Sentence case dan tanda baca konsisten?
- [ ] Format Rp, tanggal, jam sesuai standar?
- [ ] Panjang teks sesuai batas komponen?
- [ ] Emoji ≤ 1 dan tidak di konteks serius?

**Inklusif & aksesibel**
- [ ] Tidak ada stereotip / kata menyudutkan?
- [ ] Tombol dan link bermakna sendiri?
- [ ] Makna tidak bergantung pada emoji / warna saja?

**Konsistensi**
- [ ] Istilah sama dengan di kamus (bagian 4)?
- [ ] Sudah dibaca keras-keras: terdengar natural?

---

## 13. Template Cepat

### Error
```
[Apa yang terjadi]. [Harus ngapain].
```
> "Koneksi kamu putus. Cek internet, terus coba lagi ya."

### Sukses
```
[Hasil]. [Info lanjutan, opsional].
```
> "Pesanan udah masuk. Driver lagi meluncur."

### Empty state
```
Judul: Belum ada [objek]
Isi: [Kapan / bagaimana muncul].
CTA: [Aksi pertama]
```

### Dialog konfirmasi
```
Judul: [Aksi]?
Isi: [Konsekuensi].
Tombol: [Ya, aksi] / [Batal]
```

### Push notif
```
Judul: [Info utama / hook]
Isi: [Detail + aksi]
```

---

## 14. Menjaga Dokumen Ini

- **Owner:** Tim Content / UX Writer.
- **Review:** tiap kuartal. Slang cepat berubah, jadi cek ulang bagian 4.2.
- **Perubahan:** catat di bawah ini, jelaskan kenapa.
- **Prinsip evolusi:** kalau ragu, pilih yang **lebih jelas** dan **lebih sopan**.

### Changelog
| Tanggal | Perubahan | Oleh |
|---------|-----------|------|
| 30 Okt 2026 | Versi awal | - |