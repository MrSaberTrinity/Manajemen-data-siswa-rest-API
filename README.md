# `>_ PENILAIAN // DATA SISWA`

```text
███╗   ███╗ █████╗ ███╗   ██╗ █████╗      ██╗███████╗███╗   ███╗███████╗███╗   ██╗
████╗ ████║██╔══██╗████╗  ██║██╔══██╗     ██║██╔════╝████╗ ████║██╔════╝████╗  ██║
██╔████╔██║███████║██╔██╗ ██║███████║     ██║█████╗  ██╔████╔██║█████╗  ██╔██╗ ██║
██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║██   ██║██╔══╝  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║
██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║╚█████╔╝███████╗██║ ╚═╝ ██║███████╗██║ ╚████║
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚════╝ ╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝


 [ SYSTEM STATUS ]
 ├─ API       : ONLINE
 ├─ DATABASE  : MySQL
 ├─ RUNTIME   : Node.js
 ├─ FRAMEWORK : Express.js
 └─ MODE      : CRUD / REST API
```

> **Data Siswa Management System** — aplikasi web sederhana untuk mengelola data siswa menggunakan **Node.js + Express + MySQL**, dilengkapi REST API, upload foto, pencarian, filter kelas, pagination, validasi, dan antarmuka web.

---

## `01 // OVERVIEW`

Project ini dibuat sebagai aplikasi **manajemen data siswa** dengan arsitektur sederhana:

```text
                ┌─────────────────────┐
                │      BROWSER        │
                │   Web Interface     │
                └──────────┬──────────┘
                           │
                           │ HTTP / JSON
                           ▼
                ┌─────────────────────┐
                │    EXPRESS.JS       │
                │    REST API         │
                └──────────┬──────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
      ┌─────────────┐             ┌──────────────┐
      │   MySQL     │             │  File Upload │
      │   Database  │             │  /uploads    │
      └─────────────┘             └──────────────┘
```

### Core Features

- `GET` daftar siswa
- `GET` detail siswa berdasarkan ID
- `POST` tambah siswa
- `PUT` update data siswa
- `DELETE` hapus siswa
- Upload foto siswa
- Hapus/ganti foto siswa
- Search berdasarkan nama atau NIS
- Filter berdasarkan kelas
- Pagination
- Validasi data client-side dan server-side
- Dark mode
- Responsive table
- CORS enabled
- MySQL connection pool
- Static file serving

---

## `02 // TECH STACK`

| Component | Technology |
|---|---|
| Runtime | Node.js |
| Backend | Express.js `5.x` |
| Database | MySQL |
| Database Driver | mysql2 |
| Upload Handler | Multer |
| Cross-Origin | CORS |
| Frontend | HTML5 + CSS3 + JavaScript |
| Development | Nodemon |

### Dependencies

```json
{
  "cors": "^2.8.6",
  "express": "^5.2.1",
  "multer": "^1.4.5-lts.2",
  "mysql2": "^3.24.4",
  "nodemon": "^3.1.14"
}
```

---

## `03 // PROJECT STRUCTURE`

```text
penilaian/
│
├── config/
│   └── db.js                 # Konfigurasi koneksi MySQL
│
├── routes/
│   └── siswa.js              # REST API siswa + upload foto
│
├── public/
│   ├── index.html             # Web interface
│   │
│   ├── css/
│   │   └── style.css         # Styling + dark mode
│   │
│   ├── js/
│   │   └── script.js         # Frontend logic + API request
│   │
│   └── uploads/
│       └── .gitkeep          # Folder penyimpanan foto
│
├── package.json
├── package-lock.json
└── server.js                 # Entry point aplikasi
```

> `node_modules/` tidak perlu di-commit ke repository. Jalankan `npm install` untuk membuatnya kembali.

---

## `04 // DATABASE`

Default konfigurasi database pada project:

```text
Host     : localhost
User     : root
Password : kosong
Database : penilaian
```

File konfigurasi:

```js
const mysql2 = require('mysql2/promise');

const pool = mysql2.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'penilaian',
    dateStrings: true
});

module.exports = pool;
```

### Database Setup

Buat database:

```sql
CREATE DATABASE penilaian;

USE penilaian;
```

Buat tabel `siswa`:

```sql
CREATE TABLE siswa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kelas VARCHAR(20) NOT NULL,
    nis VARCHAR(20) NOT NULL UNIQUE,
    alamat VARCHAR(255) NOT NULL,
    jurusan VARCHAR(50) NOT NULL,
    foto VARCHAR(255) DEFAULT NULL
);
```

Contoh data:

```sql
INSERT INTO siswa
(nama, kelas, nis, alamat, jurusan, foto)
VALUES
(
    'Hugo',
    'XI RPL',
    '123456',
    'Jakarta',
    'Rekayasa Perangkat Lunak',
    NULL
);
```

> Jika username, password, host, atau nama database MySQL kamu berbeda, ubah `config/db.js`.

---

## `05 // INSTALLATION`

### 1. Clone repository

```bash
git clone https://github.com/MrSaberTrinity/Manajemen-data-siswa-rest-API.git
cd Manajemen-data-siswa-rest-API
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure database

Pastikan MySQL/MariaDB aktif, kemudian buat database:

```sql
CREATE DATABASE penilaian;
```

Lalu buat tabel `siswa` menggunakan SQL pada bagian **DATABASE**.

### 4. Start server

```bash
node server.js
```

Server akan berjalan pada:

```text
http://localhost:3000
```

Buka browser:

```text
http://localhost:3000
```

---

## `06 // DEVELOPMENT MODE`

Untuk menjalankan server menggunakan Nodemon:

```bash
npx nodemon server.js
```

Setiap perubahan pada file backend akan memicu restart server secara otomatis.

---

## `07 // REST API`

Base URL:

```text
http://localhost:3000/siswa
```

### `GET /siswa`

Mengambil daftar siswa.

```http
GET /siswa
```

Response:

```json
{
  "message": "Get berhasil",
  "data": [
    {
      "id": 1,
      "nama": "Hugo",
      "kelas": "XI RPL",
      "nis": "123456",
      "alamat": "Jakarta",
      "jurusan": "Rekayasa Perangkat Lunak",
      "foto": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### `GET /siswa/:id`

Mengambil satu data siswa.

```http
GET /siswa/1
```

---

### `GET /siswa?search=`

Search berdasarkan nama atau NIS.

```http
GET /siswa?search=hugo
```

Contoh:

```text
/siswa?search=123456
/siswa?search=hugo
```

---

### `GET /siswa?kelas=`

Filter berdasarkan kelas.

```http
GET /siswa?kelas=XI%20RPL
```

---

### `GET /siswa?page=&limit=`

Pagination.

```http
GET /siswa?page=1&limit=10
```

Nilai `limit` dibatasi maksimal `100`.

---

### `GET /siswa/meta/kelas`

Mengambil daftar kelas unik.

```http
GET /siswa/meta/kelas
```

Response:

```json
{
  "message": "Get berhasil",
  "data": [
    "X RPL",
    "XI RPL",
    "XII RPL"
  ]
}
```

---

## `08 // CREATE DATA`

### `POST /siswa`

Menambahkan siswa baru.

Request menggunakan:

```text
multipart/form-data
```

Fields:

| Field | Type | Required |
|---|---|---|
| `nis` | string | YES |
| `nama` | string | YES |
| `kelas` | string | YES |
| `jurusan` | string | YES |
| `alamat` | string | YES |
| `foto` | file | NO |

Contoh menggunakan cURL:

```bash
curl -X POST http://localhost:3000/siswa \
  -F "nis=123456" \
  -F "nama=Hugo" \
  -F "kelas=XI RPL" \
  -F "jurusan=Rekayasa Perangkat Lunak" \
  -F "alamat=Jakarta"
```

---

## `09 // UPDATE DATA`

### `PUT /siswa/:id`

Mengubah data siswa.

```http
PUT /siswa/1
```

Field yang dapat diubah:

```text
nis
nama
kelas
jurusan
alamat
foto
hapusFoto
```

Untuk mengganti foto:

```text
foto = [file baru]
```

Untuk menghapus foto:

```text
hapusFoto = true
```

---

## `10 // DELETE DATA`

### `DELETE /siswa/:id`

Menghapus data siswa.

```http
DELETE /siswa/1
```

Jika siswa memiliki foto, file foto tersebut juga akan dihapus dari:

```text
public/uploads/
```

---

## `11 // VALIDATION`

API mempunyai validasi pada server.

### NIS

```text
✓ wajib diisi
✓ angka
✓ 3 - 20 digit
✓ tidak boleh duplikat
```

### Nama

```text
✓ wajib diisi
✓ minimal 3 karakter
✓ maksimal 100 karakter
✓ karakter huruf, spasi, titik, apostrof, dan tanda -
```

### Kelas

```text
✓ wajib diisi
✓ maksimal 20 karakter
```

### Jurusan

```text
✓ wajib diisi
✓ maksimal 50 karakter
```

### Alamat

```text
✓ wajib diisi
✓ minimal 5 karakter
✓ maksimal 255 karakter
```

### Foto

```text
Allowed:
├── JPG
├── JPEG
├── PNG
└── WEBP

Maximum:
└── 2 MB
```

---

## `12 // FRONTEND`

Frontend menggunakan vanilla:

```text
HTML
CSS
JavaScript
```

Tidak menggunakan framework frontend.

Interface menyediakan:

```text
┌─────────────────────────────────────────────────┐
│ DATA SISWA                     🌙  + Tambah      │
├─────────────────────────────────────────────────┤
│ Search       │ Filter Kelas │ Rows / Page       │
├─────────────────────────────────────────────────┤
│ Foto │ NIS │ Nama │ Kelas │ Jurusan │ Aksi     │
│      │     │      │       │         │ Edit     │
│      │     │      │       │         │ Hapus    │
├─────────────────────────────────────────────────┤
│              Pagination                         │
└─────────────────────────────────────────────────┘
```

### Dark Mode

Tema dapat diganti melalui tombol:

```text
🌙 Mode Gelap
```

Tema disimpan pada browser sehingga pilihan tema dapat dipertahankan.

---

## `13 // FILE UPLOAD`

Foto siswa disimpan pada:

```text
public/uploads/
```

Format yang diperbolehkan:

```text
.jpg
.jpeg
.png
.webp
```

Ukuran maksimum:

```text
2 MB
```

Nama file dibuat secara otomatis:

```text
siswa_<timestamp>_<random>.<extension>
```

Contoh:

```text
siswa_1790395985334_195540415.jpg
```

---

## `14 // HTTP STATUS`

API menggunakan status HTTP yang umum:

| Status | Meaning |
|---:|---|
| `200` | Request berhasil |
| `201` | Data berhasil dibuat |
| `400` | Request / validasi tidak valid |
| `404` | Data tidak ditemukan |
| `500` | Internal server / database error |

---

## `15 // TESTING API`

Bisa menggunakan:

```text
Postman
Insomnia
Thunder Client
cURL
Browser
```

Contoh:

```bash
curl http://localhost:3000/siswa
```

Test detail:

```bash
curl http://localhost:3000/siswa/1
```

Test daftar kelas:

```bash
curl http://localhost:3000/siswa/meta/kelas
```

---

## `16 // SECURITY NOTES`

Project ini ditujukan untuk pembelajaran dan pengembangan lokal.

Sebelum digunakan pada production, pertimbangkan:

```text
[ ] Gunakan environment variables untuk credential database
[ ] Jangan expose password database di source code
[ ] Tambahkan authentication & authorization
[ ] Tambahkan rate limiting
[ ] Tambahkan request logging
[ ] Validasi MIME type dan isi file lebih ketat
[ ] Batasi ukuran request
[ ] Gunakan HTTPS
[ ] Tambahkan centralized error handling
[ ] Jangan mengembalikan error database mentah ke client
[ ] Tambahkan backup database
```

Contoh konfigurasi yang lebih aman:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=penilaian
PORT=3000
```

---

## `17 // TROUBLESHOOTING`

### `ECONNREFUSED`

Jika muncul error koneksi database:

```text
Error: connect ECONNREFUSED
```

Cek:

```text
✓ MySQL/MariaDB aktif
✓ Host benar
✓ Port benar
✓ Username benar
✓ Password benar
✓ Database sudah dibuat
```

---

### `Unknown database 'penilaian'`

Buat database:

```sql
CREATE DATABASE penilaian;
```

---

### `Table 'penilaian.siswa' doesn't exist`

Buat tabel:

```sql
CREATE TABLE siswa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kelas VARCHAR(20) NOT NULL,
    nis VARCHAR(20) NOT NULL UNIQUE,
    alamat VARCHAR(255) NOT NULL,
    jurusan VARCHAR(50) NOT NULL,
    foto VARCHAR(255) DEFAULT NULL
);
```

---

### Port `3000` sudah digunakan

Ubah:

```js
const port = 3000;
```

Menjadi misalnya:

```js
const port = 3001;
```

Kemudian akses:

```text
http://localhost:3001
```

---

## `18 // GIT WORKFLOW`

Setelah melakukan perubahan:

```bash
git status
```

Tambahkan perubahan:

```bash
git add .
```

Commit:

```bash
git commit -m "update project"
```

Push:

```bash
git push origin main
```

### Jangan commit

```text
node_modules/
.env
database credentials
temporary files
```

Tambahkan `.gitignore`:

```gitignore
node_modules/
.env
.env.*
!.env.example

npm-debug.log*
public/uploads/*
!public/uploads/.gitkeep
```

---

## `19 // ROADMAP`

```text
[x] CRUD data siswa
[x] REST API
[x] Search
[x] Filter kelas
[x] Pagination
[x] Upload foto
[x] Edit data
[x] Delete data
[x] Dark mode
[x] Responsive interface

[ ] Authentication
[ ] Admin login
[ ] Role-based access
[ ] API documentation
[ ] Swagger / OpenAPI
[ ] Environment configuration
[ ] Database migration
[ ] Deployment
[ ] Automated testing
```

---

## `20 // AUTHOR`

```text
╔══════════════════════════════════════════╗
║             SYSTEM DEVELOPER             ║
╠══════════════════════════════════════════╣
║ Name     : Marchel Hugo Putra Ramadhan  ║
║ Alias    : Hugo / Jawir                  ║
║ GitHub   : MrSaberTrinity                ║
║ Project  : Penilaian - Data Siswa       ║
╚══════════════════════════════════════════╝
```

GitHub:

**[@MrSaberTrinity](https://github.com/MrSaberTrinity)**

---

## `21 // LICENSE`

Project ini dibuat untuk keperluan **pembelajaran, latihan REST API, CRUD, Node.js, Express, dan MySQL**.

Gunakan dan modifikasi sesuai kebutuhan.

---

```text
┌────────────────────────────────────────────────────┐
│  > CONNECTION ESTABLISHED                          │
│  > DATABASE CONNECTED                              │
│  > API READY                                       │
│  > SYSTEM STATUS: OPERATIONAL                      │
│                                                    │
│  [EOF]                                             │
└────────────────────────────────────────────────────┘
```

<p align="center">
  <sub>Built with Node.js • Express • MySQL • JavaScript</sub>
</p>
