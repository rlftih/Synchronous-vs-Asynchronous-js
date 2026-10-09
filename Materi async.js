/*
 * ====================================================================
 *  BELAJAR JAVASCRIPT ASINKRON - SEMUA MATERI DALAM 1 FILE
 * ====================================================================
 *
 * CARA MENJALANKAN (bisa di Node.js ATAU di browser):
 *
 *   A) Node.js (terminal):
 *      node belajar-async.js        -> jalankan SEMUA bagian berurutan
 *      node belajar-async.js 4      -> jalankan bagian 4 saja
 *      node belajar-async.js 6 7 8  -> jalankan bagian 6, 7, dan 8
 *
 *   B) Browser (F12 -> Console):
 *      Salin-tempel seluruh isi file, tekan Enter -> semua bagian jalan.
 *      Untuk memilih bagian tertentu, ketik dulu baris ini lalu Enter,
 *      BARU tempel kodenya:
 *         var BAGIAN_DIPILIH = [4, 6];
 *
 * SYARAT:
 *   - Node.js 18+ (Node.js 22+ agar bagian 5 Promise.withResolvers jalan)
 *   - Bagian 10, 11, 12 (Fetch) butuh koneksi internet
 *
 * DAFTAR BAGIAN:
 *   1  Callback Function dan Callback Hell
 *   2  Promise: Konsep dan Cara Membuatnya
 *   3  Promise: then, catch, dan finally
 *   4  Promise.all, race, allSettled, any
 *   5  Promise.withResolvers (ES2024)
 *   6  Async dan Await
 *   7  Error Handling di Async Function
 *   8  Event Loop dan Cara Kerjanya
 *   9  Timer: setTimeout dan setInterval
 *   10 Fetch API: Ambil Data dari Server (GET)
 *   11 Fetch: POST, PUT, PATCH, dan DELETE
 *   12 Error Handling Fetch dan Network
 */

// Fungsi bantu yang dipakai di banyak bagian: "tidur" selama ms milidetik
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

// Fungsi bantu: Promise yang selesai setelah ms, bisa berhasil atau gagal
const tunggu = (ms, nilai, gagal = false) =>
  new Promise((resolve, reject) =>
    setTimeout(() => (gagal ? reject(new Error(nilai)) : resolve(nilai)), ms)
  );


/* ====================================================================
 * BAGIAN 1 - CALLBACK FUNCTION DAN CALLBACK HELL
 * --------------------------------------------------------------------
 * Callback = fungsi yang dikirim sebagai argumen ke fungsi lain, lalu
 * dipanggil NANTI (misalnya setelah proses asinkron selesai).
 *
 * Callback Hell (Pyramid of Doom) = callback bersarang terlalu dalam
 * sehingga kode sulit dibaca, di-debug, dan dirawat.
 * SOLUSI: Promise (bagian 2-3) atau async/await (bagian 6).
 * ==================================================================== */
function bagian1() {
  return new Promise((selesai) => {
    // Fungsi yang meniru pengambilan data dari server (butuh waktu)
    function ambilUser(id, callback) {
      setTimeout(() => callback({ id, nama: "Budi" }), 200);
    }
    function ambilPost(userId, callback) {
      setTimeout(() => callback([{ id: 10, judul: "Belajar JS", userId }]), 200);
    }
    function ambilKomentar(postId, callback) {
      setTimeout(() => callback(["Bagus!", "Mantap!"]), 200);
    }

    // CALLBACK HELL: tiap langkah bergantung pada langkah sebelumnya
    ambilUser(1, (user) => {
      console.log("User:", user);
      ambilPost(user.id, (posts) => {
        console.log("Post:", posts);
        ambilKomentar(posts[0].id, (komentar) => {
          console.log("Komentar:", komentar);
          // kalau ada langkah ke-4, ke-5, dst. kode makin menjorok ke kanan...
          selesai();
        });
      });
    });
  });
}


/* ====================================================================
 * BAGIAN 2 - PROMISE: KONSEP DAN CARA MEMBUATNYA
 * --------------------------------------------------------------------
 * Promise = objek yang mewakili hasil operasi asinkron di masa depan.
 * Punya 3 status:
 *   - pending   : masih berjalan
 *   - fulfilled : berhasil  (lewat resolve)
 *   - rejected  : gagal     (lewat reject)
 * Setelah fulfilled/rejected, status TIDAK bisa berubah lagi.
 * ==================================================================== */
async function bagian2() {
  function bagiAngka(a, b) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (b === 0) reject(new Error("Tidak bisa dibagi nol!")); // gagal
        else resolve(a / b);                                      // berhasil
      }, 200);
    });
  }

  const janji = bagiAngka(10, 2);
  console.log("Status awal:", janji); // Promise { <pending> }
  console.log("Hasil 10/2:", await janji);

  try {
    await bagiAngka(10, 0);
  } catch (e) {
    console.log("Gagal:", e.message);
  }

  // Cara cepat membuat Promise yang langsung selesai
  console.log(await Promise.resolve("langsung berhasil"));
  await Promise.reject(new Error("langsung gagal")).catch((e) => console.log(e.message));
}


/* ====================================================================
 * BAGIAN 3 - PROMISE: then, catch, dan finally
 * --------------------------------------------------------------------
 *  .then(fn)    : jalan saat Promise BERHASIL. Mengembalikan Promise baru
 *                 sehingga bisa di-chaining (disambung).
 *  .catch(fn)   : jalan saat ada ERROR di rantai sebelumnya.
 *  .finally(fn) : SELALU jalan (berhasil/gagal). Cocok untuk cleanup,
 *                 misalnya menyembunyikan loading spinner.
 * ==================================================================== */
async function bagian3() {
  const proses = (berhasil) =>
    new Promise((resolve, reject) =>
      setTimeout(() => (berhasil ? resolve(5) : reject(new Error("Gagal diproses"))), 200)
    );

  // Skenario BERHASIL dengan chaining
  await proses(true)
    .then((hasil) => {
      console.log("then 1:", hasil); // 5
      return hasil * 2;              // nilai dikirim ke then berikutnya
    })
    .then((hasil) => console.log("then 2:", hasil)) // 10
    .catch((err) => console.log("catch:", err.message)) // tidak jalan
    .finally(() => console.log("finally: selesai (skenario berhasil)"));

  // Skenario GAGAL
  await proses(false)
    .then((hasil) => console.log("tidak akan jalan", hasil))
    .catch((err) => console.log("catch:", err.message))
    .finally(() => console.log("finally: selesai (skenario gagal)"));
}


/* ====================================================================
 * BAGIAN 4 - Promise.all, race, allSettled, any
 * --------------------------------------------------------------------
 * Keempat method ini dipakai untuk menjalankan BANYAK Promise sekaligus
 * (paralel). Bedanya ada pada kapan mereka dianggap "selesai".
 *
 * Bayangkan 3 teman kamu disuruh membeli makanan. Kamu menunggu kabar:
 *
 * 1) Promise.all
 *    Menunggu SEMUA teman berhasil pulang membawa makanan.
 *    Kalau SATU saja gagal, langsung dianggap gagal.
 *    Hasilnya: array berisi hasil semua Promise (urutannya sesuai input).
 *    Dipakai saat: butuh semua data, misalnya profil + postingan + notifikasi.
 *
 * 2) Promise.race
 *    Ikuti yang PALING CEPAT selesai, apapun hasilnya.
 *    Kalau yang tercepat berhasil -> berhasil. Kalau yang tercepat
 *    gagal -> gagal.
 *    Dipakai saat: membuat timeout (balapan antara request vs batas waktu).
 *
 * 3) Promise.allSettled
 *    Menunggu SEMUA teman selesai, tidak peduli ada yang gagal.
 *    Tidak pernah gagal. Hasilnya laporan berisi status tiap Promise
 *    ("fulfilled" atau "rejected").
 *    Dipakai saat: ingin tahu mana yang sukses dan mana yang gagal,
 *    misalnya upload banyak file sekaligus.
 *
 * 4) Promise.any
 *    Ambil yang PERTAMA BERHASIL, abaikan yang gagal.
 *    Baru dianggap gagal kalau SEMUA gagal (error: AggregateError).
 *    Dipakai saat: mengambil data dari beberapa server, pakai yang
 *    tercepat berhasil.
 *
 * PERBEDAAN race vs any (sering tertukar):
 *   race = yang pertama SELESAI (boleh gagal).
 *   any  = yang pertama BERHASIL (yang gagal dilewati).
 * ==================================================================== */
async function bagian4() {
  // A selesai 300ms, B selesai 100ms, C GAGAL di 200ms
  const buatDaftar = () => [tunggu(300, "A"), tunggu(100, "B"), tunggu(200, "C", true)];

  // all: gagal karena C gagal
  try {
    await Promise.all(buatDaftar());
  } catch (e) {
    console.log("all        -> GAGAL:", e.message);
  }

  // all: kalau semua berhasil
  console.log("all (ok)   ->", await Promise.all([tunggu(100, "X"), tunggu(200, "Y")]));

  // race: B paling cepat
  console.log("race       ->", await Promise.race(buatDaftar()));

  // allSettled: laporan status semua
  const laporan = await Promise.allSettled(buatDaftar());
  console.log("allSettled ->", laporan.map((l) => l.status + ":" + (l.value ?? l.reason.message)));

  // any: berhasil pertama = B
  console.log("any        ->", await Promise.any(buatDaftar()));

  // any: semua gagal -> AggregateError
  try {
    await Promise.any([tunggu(50, "e1", true), tunggu(80, "e2", true)]);
  } catch (e) {
    console.log("any (semua gagal) ->", e.constructor.name, e.errors.map((x) => x.message));
  }

  // CONTOH TIMEOUT dengan race
  const lambat = tunggu(2000, "data");
  const batas = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout!")), 300));
  try {
    await Promise.race([lambat, batas]);
  } catch (e) {
    console.log("race timeout ->", e.message);
  }
}


/* ====================================================================
 * BAGIAN 5 - Promise.withResolvers (ES2024)
 * --------------------------------------------------------------------
 * Mengembalikan { promise, resolve, reject } sehingga kita bisa
 * menyelesaikan Promise dari LUAR (tanpa membungkus di dalam executor).
 * KAPAN DIPAKAI: kode berbasis event, antrian, atau saat resolve/reject
 * dipanggil di tempat berbeda dari tempat Promise dibuat.
 * SYARAT: Node.js 22+ atau browser modern.
 * ==================================================================== */
async function bagian5() {
  if (typeof Promise.withResolvers !== "function") {
    console.log("Promise.withResolvers tidak tersedia. Gunakan Node.js 22+.");
    return;
  }

  // Cara BARU
  const { promise, resolve } = Promise.withResolvers();
  setTimeout(() => resolve("Selesai dari luar!"), 300); // resolve dipanggil di luar
  console.log("Hasil:", await promise);

  // Contoh nyata: menunggu event (EventTarget jalan di Node.js DAN browser)
  const emitter = new EventTarget();

  function tungguEvent() {
    const d = Promise.withResolvers();
    emitter.addEventListener("klik", (e) => d.resolve(e.data), { once: true });
    return d.promise;
  }
  setTimeout(() => {
    const kejadian = new Event("klik");
    kejadian.data = { tombol: "Kirim" };
    emitter.dispatchEvent(kejadian);
  }, 300);
  console.log("Event diterima:", await tungguEvent());

  /* Cara LAMA (sebelum ES2024), untuk perbandingan:
     let resolve, reject;
     const p = new Promise((res, rej) => { resolve = res; reject = rej; });
  */
}


/* ====================================================================
 * BAGIAN 6 - ASYNC DAN AWAIT
 * --------------------------------------------------------------------
 * Gula sintaks di atas Promise supaya kode asinkron terlihat berurutan.
 *  - async : membuat fungsi SELALU mengembalikan Promise.
 *  - await : menunggu Promise selesai (hanya di dalam fungsi async,
 *            atau top-level di ES Module).
 * ==================================================================== */
async function bagian6() {
  const ambilUser = (id) => new Promise((r) => setTimeout(() => r({ id, nama: "Budi" }), 300));
  const ambilPost = () => new Promise((r) => setTimeout(() => r([{ id: 10, judul: "Belajar JS" }]), 300));
  const ambilKomentar = () => new Promise((r) => setTimeout(() => r(["Bagus!", "Mantap!"]), 300));

  // Callback hell di bagian 1 menjadi rapi seperti ini:
  const user = await ambilUser(1);
  const posts = await ambilPost(user.id);
  const komentar = await ambilKomentar(posts[0].id);
  console.log("Berurutan:", { user, posts, komentar });

  // SEQUENTIAL vs PARALEL
  console.time("sequential");
  await ambilUser(1);
  await ambilUser(2);
  console.timeEnd("sequential"); // ~600ms

  console.time("paralel");
  const [a, b] = await Promise.all([ambilUser(1), ambilUser(2)]);
  console.timeEnd("paralel");    // ~300ms
  console.log(a, b);

  // async function selalu mengembalikan Promise
  async function halo() { return "Halo"; }
  console.log(halo()); // Promise { 'Halo' }
  console.log(await halo());
}


/* ====================================================================
 * BAGIAN 7 - ERROR HANDLING DI ASYNC FUNCTION
 * --------------------------------------------------------------------
 * Gunakan try / catch / finally di dalam fungsi async, atau .catch()
 * saat memanggil fungsinya. Tanpa keduanya -> "Unhandled Promise
 * Rejection" (di Node.js modern bisa membuat program crash).
 * ==================================================================== */
async function bagian7() {
  const tugasBerisiko = (gagal) =>
    new Promise((resolve, reject) =>
      setTimeout(() => (gagal ? reject(new Error("Tugas gagal!")) : resolve("Tugas sukses")), 200)
    );

  // 1. try / catch / finally
  async function jalankan(gagal) {
    try {
      const hasil = await tugasBerisiko(gagal);
      console.log("OK:", hasil);
      return hasil;
    } catch (err) {
      console.error("Ditangkap:", err.message);
      // throw err; // opsional: lempar ulang agar ditangani pemanggil
      return null;
    } finally {
      console.log("finally: cleanup");
    }
  }
  await jalankan(false);
  await jalankan(true);

  // 2. Menangani error di tempat pemanggilan
  async function tanpaTryCatch() {
    await tugasBerisiko(true);
  }
  await tanpaTryCatch().catch((e) => console.log("Ditangkap di pemanggil:", e.message));

  // 3. Beberapa tugas paralel: allSettled agar satu gagal tidak merusak semua
  const hasil = await Promise.allSettled([tugasBerisiko(false), tugasBerisiko(true)]);
  hasil.forEach((h, i) =>
    console.log(`Tugas ${i + 1}:`, h.status, h.value ?? h.reason.message)
  );          
}


/* ====================================================================
 * BAGIAN 8 - EVENT LOOP DAN CARA KERJANYA
 * --------------------------------------------------------------------
 * JavaScript berjalan di SATU thread. Event loop membuatnya bisa
 * menangani tugas asinkron tanpa memblokir program. Komponen:
 *
 *  1. Call Stack         : tempat kode sinkron dieksekusi.
 *  2. Web API / Node API : menangani timer, fetch, I/O di latar belakang.
 *  3. Microtask Queue    : Promise.then, await, queueMicrotask (PRIORITAS TINGGI).
 *  4. Macrotask Queue    : setTimeout, setInterval, I/O (prioritas lebih rendah).
 *
 * ATURAN: setelah call stack kosong -> jalankan SEMUA microtask,
 *         lalu SATU macrotask, ulangi.
 *
 * AWAS: kode sinkron yang berat memblokir semuanya (while(true){}).
 * ==================================================================== */
async function bagian8() {
  console.log("1: sinkron (awal)");

  setTimeout(() => console.log("5: macrotask (setTimeout 0)"), 0);

  Promise.resolve().then(() => console.log("3: microtask (Promise.then)"));

  queueMicrotask(() => console.log("4: microtask (queueMicrotask)"));

  console.log("2: sinkron (akhir)");

  // URUTAN OUTPUT: 1, 2, 3, 4, 5
  // Walau setTimeout 0 detik, ia tetap menunggu semua kode sinkron
  // dan semua microtask selesai.
  await tidur(50); // beri waktu agar macrotask sempat tampil
}


/* ====================================================================
 * BAGIAN 9 - TIMER: setTimeout DAN setInterval
 * --------------------------------------------------------------------
 *  setTimeout(fn, ms)  : jalankan fn SATU KALI setelah ms milidetik.
 *  setInterval(fn, ms) : jalankan fn BERULANG tiap ms milidetik.
 *  clearTimeout / clearInterval : membatalkan timer.
 * CATATAN: ms adalah waktu MINIMUM, bukan jaminan, karena callback
 * harus menunggu call stack kosong.
 * ==================================================================== */
async function bagian9() {
  // 1. setTimeout
  setTimeout(() => console.log("Sekali, setelah 0,5 detik"), 500);

  // 2. Membatalkan setTimeout
  const batal = setTimeout(() => console.log("Ini tidak akan tampil"), 300);
  clearTimeout(batal);

  // 3. Menambah argumen ke callback
  setTimeout((nama) => console.log("Halo,", nama), 100, "Andi");

  // 4. setInterval + wajib dihentikan
  await new Promise((selesai) => {
    let hitung = 0;
    const interval = setInterval(() => {
      hitung++;
      console.log("Tick ke-", hitung);
      if (hitung === 3) {
        clearInterval(interval); // JANGAN lupa, kalau tidak jalan selamanya
        console.log("Interval dihentikan");
        selesai();
      }
    }, 300);
  });

  // 5. sleep berbasis Promise (sangat berguna dengan async/await)
  console.log("Mulai tidur...");
  await tidur(1000);
  console.log("Bangun setelah 1 detik");
}


/* ====================================================================
 * BAGIAN 10 - FETCH API: AMBIL DATA DARI SERVER (GET)
 * --------------------------------------------------------------------
 * fetch(url) mengirim HTTP request dan mengembalikan Promise<Response>.
 * Method bawaan = GET. Membaca isi respons:
 *   res.json() -> JSON | res.text() -> teks | res.blob() -> file
 * Node.js 18+ dan browser modern sudah punya fetch bawaan.
 * BUTUH KONEKSI INTERNET.
 * ==================================================================== */
const BASE_URL = "https://jsonplaceholder.typicode.com";

async function bagian10() {
  // Satu data
  const res = await fetch(`${BASE_URL}/todos/1`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`); // PENTING: cek res.ok
  console.log("Satu todo:", await res.json());

  // Dengan query string: ?userId=1&_limit=3
  const params = new URLSearchParams({ userId: 1, _limit: 3 });
  const res2 = await fetch(`${BASE_URL}/posts?${params}`);
  const posts = await res2.json();
  console.log("Jumlah post:", posts.length);
  posts.forEach((p) => console.log("-", p.title));
}


/* ====================================================================
 * BAGIAN 11 - FETCH: POST, PUT, PATCH, DAN DELETE
 * --------------------------------------------------------------------
 *  POST   : MEMBUAT data baru.
 *  PUT    : MENGGANTI seluruh data (semua field harus dikirim).
 *  PATCH  : MENGUBAH sebagian field saja.
 *  DELETE : MENGHAPUS data.
 *
 * Untuk mengirim JSON: set header "Content-Type: application/json"
 * dan ubah objek menjadi string dengan JSON.stringify().
 * (jsonplaceholder hanya SIMULASI: data tidak benar-benar tersimpan.)
 * BUTUH KONEKSI INTERNET.
 * ==================================================================== */
async function bagian11() {
  const url = `${BASE_URL}/posts`;
  const headers = { "Content-Type": "application/json" };

  // POST: buat baru
  let res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ title: "Judul Baru", body: "Isi artikel", userId: 1 }),
  });
  console.log("POST   ->", res.status, await res.json()); // 201 Created

  // PUT: ganti semua
  res = await fetch(`${url}/1`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ id: 1, title: "Diganti", body: "Isi diganti", userId: 1 }),
  });
  console.log("PUT    ->", res.status, await res.json());

  // PATCH: ubah sebagian
  res = await fetch(`${url}/1`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ title: "Hanya judul yang berubah" }),
  });
  console.log("PATCH  ->", res.status, await res.json());

  // DELETE: hapus
  res = await fetch(`${url}/1`, { method: "DELETE" });
  console.log("DELETE ->", res.status); // 200
}


/* ====================================================================
 * BAGIAN 12 - ERROR HANDLING FETCH DAN NETWORK
 * --------------------------------------------------------------------
 * PENTING: fetch HANYA reject saat terjadi kegagalan JARINGAN (offline,
 * DNS gagal, CORS, dibatalkan). Status HTTP 404 / 500 TIDAK membuat
 * fetch reject! Maka SELALU cek `res.ok` (true untuk status 200-299).
 *
 * Fitur penting:
 *  - AbortController : membatalkan request / membuat timeout.
 *  - Retry           : mengulang request jika gagal sementara.
 * ==================================================================== */
async function fetchAman(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Error HTTP: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") console.error("-> Request timeout (dibatalkan)");
    else if (err instanceof TypeError) console.error("-> Masalah jaringan:", err.message);
    else console.error("->", err.message);
    throw err;
  } finally {
    clearTimeout(timer); // bersihkan timer
  }
}

// Retry dengan jeda yang makin lama (exponential backoff)
async function fetchDenganRetry(url, percobaan = 3) {
  for (let i = 1; i <= percobaan; i++) {
    try {
      return await fetchAman(url, 3000);
    } catch (err) {
      if (i === percobaan) throw new Error(`Gagal setelah ${percobaan} percobaan`);
      const jeda = 500 * 2 ** (i - 1);
      console.log(`Percobaan ${i} gagal, ulangi dalam ${jeda}ms...`);
      await tidur(jeda);
    }
  }
}

async function bagian12() {
  // Berhasil
  console.log("Sukses:", await fetchAman(`${BASE_URL}/todos/1`));

  // HTTP 404 (fetch TIDAK reject, tapi kita lempar sendiri lewat res.ok)
  await fetchAman(`${BASE_URL}/todos/99999999`).catch(() => {});

  // Timeout (1 ms saja pasti terlambat)
  await fetchAman(`${BASE_URL}/todos/1`, 1).catch(() => {});

  // Domain tidak ada -> error jaringan
  await fetchAman("https://domain-tidak-ada-123456.invalid").catch(() => {});

  // Retry
  await fetchDenganRetry("https://domain-tidak-ada-123456.invalid", 2).catch((e) =>
    console.log("Retry berakhir:", e.message)
  );
}


/* ====================================================================
 * PENJALAN UTAMA - menjalankan bagian satu per satu
 * ==================================================================== */
const DAFTAR = [
  ["Callback Function dan Callback Hell", bagian1],
  ["Promise: Konsep dan Cara Membuatnya", bagian2],
  ["Promise: then, catch, dan finally", bagian3],
  ["Promise.all, race, allSettled, any", bagian4],
  ["Promise.withResolvers (ES2024)", bagian5],
  ["Async dan Await", bagian6],
  ["Error Handling di Async Function", bagian7],
  ["Event Loop dan Cara Kerjanya", bagian8],
  ["Timer: setTimeout dan setInterval", bagian9],
  ["Fetch API: Ambil Data (GET)", bagian10],
  ["Fetch: POST, PUT, PATCH, DELETE", bagian11],
  ["Error Handling Fetch dan Network", bagian12],
];

async function utama() {
  // Ambil pilihan bagian dari: argumen terminal (Node.js) atau
  // variabel BAGIAN_DIPILIH (browser). Kalau kosong -> jalankan semua.
  let mentah = [];
  if (typeof process !== "undefined" && process.argv) {
    mentah = process.argv.slice(2);                 // Node.js
  } else if (typeof BAGIAN_DIPILIH !== "undefined") {
    mentah = BAGIAN_DIPILIH;                        // browser
  }
  const pilihan = mentah.map(Number).filter((n) => n >= 1 && n <= DAFTAR.length);
  const nomor = pilihan.length ? pilihan : DAFTAR.map((_, i) => i + 1);

  for (const n of nomor) {
    const [judul, fungsi] = DAFTAR[n - 1];
    console.log(`\n${"=".repeat(60)}\nBAGIAN ${n}: ${judul}\n${"=".repeat(60)}`);
    try {
      await fungsi();
    } catch (err) {
      console.error(`Bagian ${n} berhenti karena error:`, err.message);
    }
  }
  console.log("\nSelesai.");
}

utama();
