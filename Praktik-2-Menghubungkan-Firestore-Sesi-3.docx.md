**Praktik 2: Menghubungkan Firestore dan Menguji Aplikasi**

Bootcamp Web Programming with AI by Plan Indonesia

**Latar Belakang**

UI CRUD Dapur Nia sudah dibuat pada Praktik 1 dengan data contoh. Pada praktik siang, UI tersebut dihubungkan ke Firestore agar data dapat disimpan, dibaca, diubah, dan dihapus dari aplikasi live.

**Tugas Peserta**

Hubungkan UI hasil Praktik 1 ke proyek Firebase masing-masing. Selesaikan CRUD, terapkan aturan data dan tiga state, lakukan deploy ke Netlify, lalu uji aplikasi pasangan dengan enam masukan tidak sah.

**Dokumen Masukan**

| No | Berkas | Isi |
| :---- | :---- | :---- |
| 1 | PRD-App-2-Dapur-Nia.docx | Kebutuhan, alur, validasi, dan \*invariant\*. |
| 2 | Skema-Firestore-Dapur-Nia.docx | Struktur koleksi dan contoh aturan data. |

**Dokumen Keluaran**

| No | Keluaran | Bentuk |
| :---- | :---- | :---- |
| 1 | Aplikasi live | Repository Git dan URL Netlify. |
| 2 | Aturan data | Berkas \*security rules\* pada repository. |
| 3 | Working paper | Bukti CRUD, deploy, temuan, dan perbaikan. |

**Materi dan Keterampilan yang Dipraktikkan**

| Materi | Keterampilan |
| :---- | :---- |
| Koneksi Firebase | Menginisialisasi aplikasi dan membuat koneksi Firestore. |
| CRUD Firestore | Menghubungkan fungsi \*create\*, \*read\*, \*update\*, dan \*delete\*. |
| Security rules | Menolak \*field\* kosong, tipe salah, panjang berlebih, dan nilai tidak sah. |
| Deploy | Menerbitkan repository ke Netlify dan memeriksa URL publik. |

**Langkah Pengerjaan**

**Tahap 1: Menghubungkan Firestore**

* Buat atau pilih proyek Firebase pribadi.  
* Aktifkan Firestore dan buat koleksi sesuai skema.  
* Masukkan dokumen awal sesuai contoh data.  
* Hubungkan fungsi \*read\* dan \*create\* ke UI Praktik 1\.

**Tahap 2: Menyelesaikan CRUD**

* Periksa data muncul dari Firestore, bukan dari data contoh.  
* Hubungkan fungsi \*update\* dan \*delete\*.  
* Periksa setiap perubahan melalui konsol Firestore.  
* Catat hasil pada bagian A dan B working paper.

**Tahap 3: Aturan data dan state**

* Tambahkan validasi formulir sesuai PRD.  
* Tambahkan \*security rules\* sesuai skema.  
* Uji nilai konkret dari enam masukan tidak sah.  
* Pastikan tiga \*state\* tampil pada kondisi yang tepat.

**Tahap 4: Deploy**

* Hubungkan repository ke Netlify dan buka URL publik.  
* Ulangi CRUD melalui URL publik.  
* Bertukar URL dengan pasangan.  
* Catat temuan dan hasil uji ulang pada working paper.

**Dokumen dan Alat Bantu**

| Jenis | Bahan |
| :---- | :---- |
| Dokumen kebutuhan | PRD-App-2-Dapur-Nia.docx |
| Skema data | Skema-Firestore-Dapur-Nia.docx |
| Lembar kerja pagi | Working-Paper-Praktik-1-Sesi-3.docx |
| Lembar kerja siang | Working-Paper-Praktik-2-Sesi-3.docx |
| Alat kerja | Firebase, Antigravity, Git, dan Netlify |

