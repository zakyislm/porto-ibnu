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

## 3. Masalah Node.js Middleware (Inkompatibilitas Next.js 16 & OpenNext)
- **Gejala Error**: `ERROR Node.js middleware is not currently supported. Consider switching to Edge Middleware.`
- **Penyebab**: Next.js 16 menghapus dukungan Edge Runtime untuk file `proxy.js` (pengganti `middleware.js`) dan **memaksa middleware berjalan di Node.js runtime**. Di sisi lain, OpenNext Cloudflare HANYA mendukung **Edge Middleware**. Terjadi kebuntuan (clash) di mana OpenNext selalu menolak build jika mendeteksi middleware Node.js.
- **Solusi**: **Hapus file `proxy.js` (atau `middleware.js`) sepenuhnya**. Proses auto-refresh token (misal untuk Supabase) harus dipindahkan ke client-side atau diandalkan dari browser client yang otomatis melakukan refresh token. Menghapus file proxy.js akan membuat OpenNext Cloudflare meloloskan proses build.

## 4. Masalah Experimental Edge Runtime di Halaman / Layout
- **Gejala Error**: `app/admin/page cannot use the edge runtime. OpenNext requires edge runtime function to be defined in a separate function.`
- **Penyebab**: Terdapat deklarasi `export const runtime = 'edge'` di dalam file halaman atau di file `layout.js` (yang mana akan diturunkan ke semua halaman di bawahnya). OpenNext Cloudflare mendesain agar *seluruh* aplikasi berjalan di Edge runtime secara bawaan pada default handler. Mendeklarasikan `runtime = 'edge'` secara spesifik di halaman Next.js malah akan membuat OpenNext gagal mengisolasi edge function.
- **Solusi**: Hapus semua deklarasi `export const runtime = 'edge'` dari komponen halaman (page.js) maupun layout (layout.js).

## 5. Website SUCCESS Tapi Pas Dibuka 404 Not Found (Cloudflare Pages)
- **Gejala Error**: Build sukses, tapi saat URL diakses, muncul halaman "This page can't be found (HTTP 404)".
- **Penyebab**: `@opennextjs/cloudflare` sejatinya didesain untuk **Cloudflare Workers**, bukan Cloudflare Pages. OpenNext menyimpan kode backend (SSR/API) di `.open-next/worker.js`. Padahal, Cloudflare Pages mengharapkan kode backend bernama `_worker.js` berada di **root output directory**.
- **Solusi**: Ubah nama `worker.js` menjadi `_worker.js` dan jadikan `.open-next` (bukan `.open-next/assets`) sebagai output directory. Hal ini bisa diotomatisasi lewat script di package.json.

## 6. Build Failed with 13 errors: Could not resolve "fs", "path", "crypto", dll (nodejs_compat)
- **Gejala Error**: Semua modul Node.js built-in gagal resolve dengan error message: `Add the "nodejs_compat" compatibility flag to your project.`
- **Penyebab**: Cloudflare Pages **mengabaikan** file `wrangler.jsonc`. Pages hanya membaca file `wrangler.toml` yang mengandung property `pages_build_output_dir`. Karena project hanya punya `wrangler.jsonc`, flag `nodejs_compat` tidak pernah terbaca oleh Pages.
- **Solusi**: Buat file `wrangler.toml` (bukan `.jsonc`) di root project dengan isi:
```toml
name = "porto-ibnu"
pages_build_output_dir = ".open-next"
compatibility_date = "2026-07-21"
compatibility_flags = ["nodejs_compat"]
```

## 7. wrangler.toml Tidak Terbaca Karena wrangler.jsonc Ada Duluan
- **Gejala Error**: Sama persis dengan #6 (13 errors `Could not resolve`).
- **Penyebab**: Cloudflare Pages mencari config file dengan prioritas: `wrangler.json` > `wrangler.jsonc` > `wrangler.toml`. Begitu menemukan `wrangler.jsonc` (yang invalid untuk Pages), Pages langsung skip dan **tidak mencari** `wrangler.toml` lagi.
- **Solusi**: **Hapus** `wrangler.jsonc` dari repo (`git rm wrangler.jsonc`).

## 8. Error: Service binding 'WORKER_SELF_REFERENCE' references Worker...
- **Gejala Error**: Build sukses, tapi pas fase "Deploy" di Cloudflare Pages gagal: `Service binding 'WORKER_SELF_REFERENCE' references Worker 'nama-worker' which was not found.`
- **Penyebab**: Di `wrangler.toml` ada konfigurasi `[[services]]` binding. Binding service antar worker ini tidak disupport di Cloudflare Pages.
- **Solusi**: Hapus blok `[[services]]` beserta isinya dari `wrangler.toml`.

## 9. 500 Internal Server Error (Blank Page) / Missing Supabase credentials in .env.local
- **Gejala Error**: Saat dibuka di browser, web menampilkan tulisan `Internal Server Error` berwarna putih dengan background hitam. 
- **Penyebab**: Environment Variables yang di-set di **Cloudflare Dashboard akan diabaikan** jika ada file `wrangler.toml` di repo TAPI file tersebut tidak memiliki block `[vars]`. Akibatnya Next.js tidak mendapat URL Supabase saat compile time dan me-return *undefined*.
- **Solusi**: Pindahkan semua Environment Variables (yang aman/public) dari dashboard ke dalam file `wrangler.toml` di bawah block `[vars]`.

## 10. 500 Internal Server Error (Lanjutan: Asset Routing Issue)
- **Gejala Error**: Web masih 500 Internal Server Error, padahal env vars sudah dimasukkan ke `wrangler.toml` dan build sukses.
- **Penyebab**: Cloudflare Pages menempatkan file statis Next.js ke path `/assets/_next/...` (karena aset digenerate OpenNext di `.open-next/assets`). Namun, Next.js worker secara default mencari file statis di path `/_next/...` (tanpa prefix `/assets`). Server crash saat mencoba me-render chunk statis.
- **Solusi**: Pindahkan semua isi dari folder `.open-next/assets/` keluar ke root `.open-next/` sebelum di-deploy.
- **Catatan Windows**: Jangan gunakan command Unix `mv` dan `cp` di `package.json` jika di Windows. Gunakan script Node.js.
  Ubah script di `package.json` menjadi:
  `"pages:build": "npm run build && npx @opennextjs/cloudflare build && node -e \"const fs = require('fs'); fs.renameSync('.open-next/worker.js', '.open-next/_worker.js'); fs.cpSync('.open-next/assets', '.open-next', {recursive: true});\""`

## 11. 500 Internal Server Error (TypeError: Cannot read properties of undefined (reading 'default'))
- **Gejala Error**: Web masih 500 Internal Server Error. Log error `TypeError: Cannot read properties of undefined (reading 'default') at interopDefault (.open-next/server-functions/default/handler.mjs)`.
- **Penyebab**: **Next.js 16** menggunakan **Turbopack** secara default. `@opennextjs/cloudflare` versi 1.20 belum kompatibel dengan output bundling Turbopack, sehingga modul chunk bernilai `undefined`.
- **Solusi**: Nonaktifkan Turbopack saat build dengan memaksa Next.js untuk menggunakan **Webpack**.
  Ubah command build menjadi: `"build": "next build --webpack"`

## 12. Masalah Supabase Storage Images/Files 404 Not Found
- **Gejala Error**: Gambar (Profile/Projects) atau CV gagal di-load, mereturn status 404. Padahal di lokal bisa berjalan karena mengandalkan Next.js rewrites `next.config.js`.
- **Penyebab**: Fungsi rewrite / proxy bawaan Next.js (seperti `rewrites()` atau routing ke external URL) terkadang terhambat oleh Edge runtime constraints atau config `_routes.json` di OpenNext / Cloudflare Pages.
- **Solusi**: Hindari menggunakan rewrite path relatif (contoh: `/storage/...`) untuk Supabase storage di aplikasi Next.js statis/edge. Langsung gunakan **Absolute Public URL** bawaan dari method `supabase.storage.from('bucket').getPublicUrl('path')`. Ini menghindari pemrosesan lewat Next.js worker dan browser akan mem-fetch file langsung dari CDN Supabase.

## 13. Masalah Auth Redirect ke Localhost (Atau User Gagal Tertendang)
- **Gejala Error**: Auth redirect Next.js tidak menendang user unauthenticated dari halaman `/admin`, atau saat user login via Google OAuth, Supabase me-redirect balik ke `http://localhost:3000`.
- **Penyebab**: Auth berbasis server-side cookies (via `createClient` dari Edge / Node runtime) kadang tidak disinkronisasi sempurna dengan state statis Cloudflare Pages. Supabase Authentication di dashboard juga memiliki default 'Site URL' localhost jika belum dikonfigurasi.
- **Solusi**: 
  1. Ganti Auth check menjadi murni **Client-Side** (menggunakan `useEffect` dan `supabase.auth.getSession()` / `onAuthStateChange`). Tendang user via `window.location.href = '/login'`.
  2. Ubah *Site URL* dan *Allowed Redirect URLs* di pengaturan Authentication Supabase Dashboard menjadi domain production Cloudflare (contoh: `https://[domain].pages.dev`).

## Konfigurasi Final Cloudflare Pages Dashboard yang Benar (Updated):
- **Framework preset**: `None`
- **Build command**: `npm run pages:build` *(pastikan script ini sudah pakai node script agar jalan di OS apapun)*
- **Build output directory**: `.open-next`
- **Root directory**: `/` (kosongkan)
- **File wajib di repo**: `wrangler.toml` dengan `pages_build_output_dir = ".open-next"`, `compatibility_flags = ["nodejs_compat"]`, dan block `[vars]`.
- **File DILARANG di repo**: `wrangler.jsonc` dan file Next.js `proxy.js` / `middleware.js`.
