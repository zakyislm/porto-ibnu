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

## Konfigurasi Final Cloudflare Pages Dashboard yang Benar:
- **Framework preset**: `None`
- **Build command**: `npm run build && npx @opennextjs/cloudflare build && mv .open-next/worker.js .open-next/_worker.js`
- **Build output directory**: `.open-next` (akan di-override oleh `wrangler.toml`)
- **Root directory**: `/` (kosongkan)
- **File wajib di repo**: `wrangler.toml` dengan `pages_build_output_dir` dan `compatibility_flags = ["nodejs_compat"]`
