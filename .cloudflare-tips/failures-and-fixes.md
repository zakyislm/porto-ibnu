# Cloudflare + Next.js 16 + OpenNext Deployment Tips & Failures

Catatan ini dirangkum dari beberapa kegagalan deployment saat migrasi dari Vercel ke Cloudflare Pages menggunakan `@opennextjs/cloudflare`.

## 1. Masalah Output Directory Not Found
- **Gejala Error**: `Error: Output directory ".open-next/worker" not found.`
- **Penyebab**: OpenNext Cloudflare v1.20 men-generate worker dalam bentuk file tunggal di `.open-next/worker.js` dan aset statis di dalam folder `.open-next/assets`. Jika settingan di dashboard menunjuk ke folder `.open-next/worker`, Cloudflare akan gagal karena itu adalah nama file, bukan nama folder.
- **Solusi**: Di Cloudflare Pages Dashboard, pada bagian `Build output directory`, wajib diisi dengan **`.open-next/assets`** (atau dikosongkan agar otomatis mengikuti konfigurasi `wrangler.json`).

## 2. Masalah Build Command Reset
- **Gejala Error**: Cloudflare mencari folder output yang nggak pernah kebuat.
- **Penyebab**: Jika memencet tombol "reset" build configuration atau memilih preset "Next.js" di Cloudflare, build command akan terganti menjadi `npx @cloudflare/next-on-pages` atau sekadar `npm run build`. Hal ini menyebabkan OpenNext builder (`npx @opennextjs/cloudflare build`) tidak dijalankan.
- **Solusi**: Pastikan **Build command** diset ke: `npm run build && npx @opennextjs/cloudflare build`.

## 3. Masalah Node.js Middleware (Jebakan Next.js 16)
- **Gejala Error**: `ERROR Node.js middleware is not currently supported. Consider switching to Edge Middleware.`
- **Penyebab**: Next.js 16 memberikan warning deprecation untuk mengubah `middleware.js` menjadi `proxy.js`. Namun, `proxy.js` DILARANG digunakan di Cloudflare karena Next.js memaksa `proxy.js` berjalan di **Node.js runtime**, sedangkan Cloudflare Pages Workers HANYA mendominasi **Edge runtime**.
- **Solusi**: **Abaikan warning Next.js** dan tetap gunakan nama file `middleware.js`. File ini didukung penuh dan otomatis akan terdeteksi sebagai Edge middleware.

## 4. Masalah Experimental Edge Runtime di Middleware
- **Gejala Error**: `Error: Page /src/middleware provided runtime 'edge', the edge runtime for rendering is currently experimental.`
- **Penyebab**: Menambahkan baris `export const config = { runtime: 'edge' }` secara manual ke dalam file `middleware.js`.
- **Solusi**: Hapus deklarasi runtime manual tersebut. Di Next.js 16, file `middleware.js` sudah otomatis dikonfigurasi sebagai Edge runtime secara internal. Menambahkannya secara manual malah memicu error flag experimental.

## 5. Website SUCCESS Tapi Pas Dibuka 404 Not Found (Cloudflare Pages)
- **Gejala Error**: Build sukses, tapi saat URL diakses, muncul halaman "This page can't be found (HTTP 404)".
- **Penyebab**: `@opennextjs/cloudflare` sejatinya didesain untuk **Cloudflare Workers**, bukan Cloudflare Pages. OpenNext menyimpan kode backend (SSR/API) di `.open-next/worker.js`. Padahal, Cloudflare Pages mengharapkan kode backend bernama `_worker.js` berada di **root output directory**.
- **Solusi**: Ubah nama `worker.js` menjadi `_worker.js` dan jadikan `.open-next` (bukan `.open-next/assets`) sebagai output directory.

## 6. Build Failed with 13 errors: Could not resolve "fs", "path", "crypto", dll (nodejs_compat)
- **Gejala Error**: `Could not resolve "async_hooks"`, `Could not resolve "fs"`, `Could not resolve "crypto"`, dll. Semua modul Node.js built-in gagal resolve. Error message: `Add the "nodejs_compat" compatibility flag to your project.`
- **Penyebab**: Cloudflare Pages **mengabaikan** file `wrangler.jsonc`. Pages hanya membaca file `wrangler.toml` yang mengandung property `pages_build_output_dir`. Karena project hanya punya `wrangler.jsonc` (yang berisi `nodejs_compat`), flag tersebut tidak pernah terbaca oleh Pages.
- **Solusi**: Buat file `wrangler.toml` (bukan `.jsonc`) di root project dengan isi:
```toml
name = "porto-ibnu"
pages_build_output_dir = ".open-next"
compatibility_date = "2026-07-21"
compatibility_flags = ["nodejs_compat"]
```
Dengan adanya `wrangler.toml` yang valid, Cloudflare Pages akan membaca config ini dan mengaktifkan `nodejs_compat`, sehingga semua Node.js built-in modules bisa di-resolve.
## 7. wrangler.toml Tidak Terbaca Karena wrangler.jsonc Ada Duluan
- **Gejala Error**: Sama persis dengan #6 (13 errors `Could not resolve`). Di log masih muncul `Found wrangler.json file... Skipping file and continuing.` meskipun `wrangler.toml` sudah ada di repo.
- **Penyebab**: Cloudflare Pages mencari config file dengan prioritas: `wrangler.json` > `wrangler.jsonc` > `wrangler.toml`. Begitu menemukan `wrangler.jsonc` (yang tidak valid untuk Pages), Pages langsung skip dan **tidak mencari** `wrangler.toml` lagi.
- **Solusi**: **Hapus** `wrangler.jsonc` dari repo (`git rm wrangler.jsonc`). File ini hanya diperlukan untuk deployment via Cloudflare Workers (`wrangler deploy`), bukan untuk Cloudflare Pages. Dengan menghapusnya, Pages akan menemukan `wrangler.toml` yang valid.

## 8. Error: Service binding 'WORKER_SELF_REFERENCE' references Worker...
- **Gejala Error**: Build sukses, tapi pas fase "Deploy" di Cloudflare Pages gagal dengan log: `Error: Failed to publish your Function. Got error: Service binding 'WORKER_SELF_REFERENCE' references Worker 'nama-worker' which was not found.`
- **Penyebab**: Di `wrangler.toml` ada konfigurasi `[[services]]` binding. Binding service antar worker ini tidak disupport di Cloudflare Pages, hanya untuk Cloudflare Workers murni.
- **Solusi**: Hapus blok `[[services]]` beserta isinya dari `wrangler.toml`.

## 9. 500 Internal Server Error (Blank Page) / Missing Supabase credentials in .env.local
- **Gejala Error**: Saat dibuka di browser, web menampilkan tulisan `Internal Server Error` berwarna putih dengan background hitam. Di log build sebelumnya sempat muncul `Missing Supabase credentials in .env.local` atau `Build environment variables: (none found)`.
- **Penyebab**: Environment Variables yang di-set di **Cloudflare Dashboard akan di-override / diabaikan** jika ada file `wrangler.toml` di repo TAPI file tersebut tidak memiliki block `[vars]`. Pages beranggapan "Karena wrangler.toml tidak punya variables, maka project ini tidak butuh variables", sehingga semua variable dashboard dihapus saat build. Akibatnya Next.js tidak mendapat URL Supabase saat compile time dan me-return *undefined*, yang berujung pada error saat runtime.
- **Solusi**: 
  - **Pindahkan semua Environment Variables** (yang aman/public) dari dashboard langsung ke dalam file `wrangler.toml` di bawah block `[vars]`.
  - Contoh:
    ```toml
    [vars]
    NEXT_PUBLIC_SITE_URL = "https://ibnugaots.pages.dev"
    NEXT_PUBLIC_SUPABASE_URL = "https://xxx.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY = "xxx"
    MASTER_ADMIN_EMAIL = "ibnu@gmail.com"
## 10. 500 Internal Server Error (Lanjutan: Asset Routing Issue)
- **Gejala Error**: Web masih 500 Internal Server Error, padahal env vars sudah dimasukkan ke `wrangler.toml` dan build sukses.
- **Penyebab**: Output direktori dari `@opennextjs/cloudflare` adalah `.open-next` yang berisi `worker.js` dan folder `assets/`. Jika kita menggunakan `.open-next` sebagai `pages_build_output_dir`, Cloudflare Pages akan menempatkan file statis Next.js (seperti CSS/JS client) ke path `/assets/_next/...`. Namun, Next.js worker secara default mencari file statis di path `/_next/...` (tanpa prefix `/assets`). Karena worker gagal menemukan chunk file statis saat render, server crash (Error 500).
- **Solusi**: Pindahkan semua isi dari folder `.open-next/assets/` keluar ke root `.open-next/` sebelum di-deploy.
  1. Tambahkan custom script di `package.json`:
     `"pages:build": "npm run build && npx @opennextjs/cloudflare build && mv .open-next/worker.js .open-next/_worker.js && cp -r .open-next/assets/* .open-next/"`
  2. Gunakan `npm run pages:build` sebagai **Build command** di Cloudflare Pages Dashboard.

## Konfigurasi Final Cloudflare Pages Dashboard yang Benar (Updated):
- **Framework preset**: `None`
- **Build command**: `npm run pages:build` *(pastikan script ini ada di package.json)*
- **Build output directory**: `.open-next` (akan di-override oleh `wrangler.toml` jika dikosongkan, tapi lebih baik disamakan)
- **Root directory**: `/` (kosongkan)
- **File wajib di repo**: `wrangler.toml` dengan `pages_build_output_dir = ".open-next"`, `compatibility_flags = ["nodejs_compat"]`, dan block `[vars]` berisi env variables.
- **File DILARANG di repo**: `wrangler.jsonc` (akan memblokir pembacaan `wrangler.toml`)
