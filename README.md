1. Penjelasan Synchronous

Synchronous adalah proses yang menjalankan kegiatan secara langsung dan berurutan. Setiap proses harus selesai terlebih dahulu sebelum proses berikutnya dijalankan.

2. Penjelasan Asynchronous

Asynchronous adalah proses yang tidak mengharuskan kegiatan dilakukan pada waktu yang sama. Proses dapat berjalan tanpa harus menunggu proses lainnya selesai.

3. Perbedaan Synchronous dan Asynchronous

Perbedaan synchronous dan asynchronous dapat dilihat dari waktu interaksi, tempat, respons, dan tingkat keterlibatan.

1. Waktu Interaksi

Synchronous: Interaksi dilakukan secara langsung pada waktu yang sama.
Asynchronous: Interaksi dapat dilakukan pada waktu yang berbeda sesuai kebutuhan.

2. Waktu dan Tempat

Synchronous: Biasanya memiliki jadwal dan waktu yang sudah ditentukan.
Asynchronous: Lebih fleksibel karena dapat dilakukan kapan saja dan di mana saja.

3. Interaksi dan Respons

Synchronous: Respons dapat diterima secara langsung.
Asynchronous: Respons membutuhkan waktu karena tidak dilakukan secara bersamaan.

4. Tingkat Keterlibatan

Synchronous: Interaksi langsung dapat membuat peserta lebih aktif.
Asynchronous: Membutuhkan lebih banyak inisiatif dan kedisiplinan, tetapi memiliki waktu yang lebih fleksibel.
4. Contoh Synchronous

Synchronous terjadi ketika komunikasi atau aktivitas dilakukan secara bersamaan atau real-time.

Contoh:

Rapat menggunakan Zoom atau Google Meet.
Video call.
Live chat.
Panggilan telepon.
Pembelajaran tatap muka.

Kelebihan: Mendapatkan respons secara langsung dan diskusi dapat berlangsung lebih aktif.

Kekurangan: Terikat jadwal dan membutuhkan koneksi internet yang stabil untuk kegiatan online.

5. Contoh Asynchronous

Asynchronous terjadi ketika komunikasi atau aktivitas dilakukan pada waktu yang berbeda.

Contoh:

Mengirim dan membalas email.
Menonton video pembelajaran yang telah direkam.
Membaca modul atau file PDF.
Berdiskusi melalui forum online.
Mengirim tugas melalui platform pembelajaran.

Kelebihan: Lebih fleksibel dan dapat dilakukan sesuai waktu masing-masing.

Kekurangan: Respons tidak selalu langsung dan membutuhkan kedisiplinan dari pengguna.

6. Tiga Cara Menulis Asynchronous JavaScript

Dalam JavaScript terdapat tiga cara umum untuk menangani proses asynchronous, yaitu Callback, Promise, dan Async/Await.

1. Callback

Callback adalah fungsi yang dijalankan setelah suatu proses asynchronous selesai.

2. Promise

Promise digunakan untuk menangani hasil dari proses asynchronous. Hasilnya dapat berupa berhasil atau gagal.

3. Async/Await

Async/Await digunakan untuk membuat kode asynchronous lebih sederhana dan mudah dibaca. await digunakan untuk menunggu proses Promise selesai.# Synchronous-vs-Asynchronous-js

### Contoh
//CallBack
function ambilData(callback) {
    setTimeout(() => {
        callback("Data berhasil diambil");
    }, 1000);
}

ambilData((data) => {
    console.log(data);
});

//Promise
const data = new Promise((resolve) => {
    setTimeout(() => {
        resolve("Data berhasil diambil");
    }, 1000);
});

data.then((hasil) => {
    console.log(hasil);
});

//Async
function ambilData() {
    return Promise.resolve("Data berhasil diambil");
}

async function tampilkanData() {
    const hasil = await ambilData();
    console.log(hasil);
}

tampilkanData();
