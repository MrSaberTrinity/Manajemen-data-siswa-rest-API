const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const db = require('../config/db');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const EKSTENSI_DIIZINKAN = ['.jpg', '.jpeg', '.png', '.webp'];
const UKURAN_MAKS_FOTO = 2 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const unik = `siswa_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, unik);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!EKSTENSI_DIIZINKAN.includes(ext)) {
        return cb(new Error('Format foto harus JPG, PNG, atau WEBP'));
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: UKURAN_MAKS_FOTO }
});

function uploadFoto(req, res, next) {
    upload.single('foto')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            const pesan = err.code === 'LIMIT_FILE_SIZE'
                ? 'Ukuran foto maksimal 2MB'
                : err.message;
            return res.status(400).json({ message: 'Validasi gagal', errors: { foto: pesan } });
        } else if (err) {
            return res.status(400).json({ message: 'Validasi gagal', errors: { foto: err.message } });
        }
        next();
    });
}

function hapusFileFoto(filename) {
    if (!filename) return;
    const filePath = path.join(uploadDir, filename);
    fs.unlink(filePath, () => {
    });
}

function validasiSiswa({ nis, nama, kelas, jurusan, alamat }) {
    const errors = {};

    if (!nis || !String(nis).trim()) {
        errors.nis = 'NIS wajib diisi';
    } else if (!/^[0-9]{3,20}$/.test(String(nis).trim())) {
        errors.nis = 'NIS harus berupa angka, 3-20 digit';
    }

    if (!nama || !String(nama).trim()) {
        errors.nama = 'Nama wajib diisi';
    } else if (String(nama).trim().length < 3) {
        errors.nama = 'Nama minimal 3 karakter';
    } else if (String(nama).trim().length > 100) {
        errors.nama = 'Nama maksimal 100 karakter';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(String(nama).trim())) {
        errors.nama = 'Nama hanya boleh berisi huruf dan spasi';
    }

    if (!kelas || !String(kelas).trim()) {
        errors.kelas = 'Kelas wajib diisi';
    } else if (String(kelas).trim().length > 20) {
        errors.kelas = 'Kelas maksimal 20 karakter';
    }

    if (!jurusan || !String(jurusan).trim()) {
        errors.jurusan = 'Jurusan wajib diisi';
    } else if (String(jurusan).trim().length > 50) {
        errors.jurusan = 'Jurusan maksimal 50 karakter';
    }

    if (!alamat || !String(alamat).trim()) {
        errors.alamat = 'Alamat wajib diisi';
    } else if (String(alamat).trim().length < 5) {
        errors.alamat = 'Alamat minimal 5 karakter';
    } else if (String(alamat).trim().length > 255) {
        errors.alamat = 'Alamat maksimal 255 karakter';
    }

    return errors;
}

router.get('/', async (req, res) => {
    try {
        const search = (req.query.search || '').trim();
        const kelas = (req.query.kelas || '').trim();
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const offset = (page - 1) * limit;

        const where = [];
        const params = [];

        if (search) {
            where.push('(nama LIKE ? OR nis LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }
        if (kelas) {
            where.push('kelas = ?');
            params.push(kelas);
        }

        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const [countRows] = await db.query(`SELECT COUNT(*) as total FROM siswa ${whereClause}`, params);
        const total = countRows[0].total;
        const totalPages = Math.max(Math.ceil(total / limit), 1);

        const [rows] = await db.query(
            `SELECT * FROM siswa ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        res.json({
            message: 'Get berhasil',
            data: rows,
            pagination: { page, limit, total, totalPages }
        });
    } catch (error) {
        res.status(500).json({
            message: 'error',
            error: error.message
        });
    }
});

router.get('/meta/kelas', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT DISTINCT kelas FROM siswa ORDER BY kelas ASC');
        res.json({
            message: 'Get berhasil',
            data: rows.map((r) => r.kelas)
        });
    } catch (error) {
        res.status(500).json({
            message: 'error',
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query('SELECT * FROM siswa WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Siswa tidak ditemukan'
            });
        }
        res.json({
            message: 'Get berhasil',
            data: rows[0]
        });
    } catch (error) {
        res.status(500).json({
            message: 'error',
            error: error.message
        });
    }
});

router.post('/', uploadFoto, async (req, res) => {
    const { nis, nama, kelas, jurusan, alamat } = req.body;
    const errors = validasiSiswa({ nis, nama, kelas, jurusan, alamat });

    if (Object.keys(errors).length > 0) {
        if (req.file) hapusFileFoto(req.file.filename);
        return res.status(400).json({ message: 'Validasi gagal', errors });
    }

    try {
        const [existing] = await db.query('SELECT id FROM siswa WHERE nis = ?', [String(nis).trim()]);
        if (existing.length > 0) {
            if (req.file) hapusFileFoto(req.file.filename);
            return res.status(400).json({ message: 'Validasi gagal', errors: { nis: 'NIS sudah terdaftar' } });
        }

        const foto = req.file ? req.file.filename : null;

        const [result] = await db.query(
            'INSERT INTO siswa (nama, kelas, nis, alamat, jurusan, foto) VALUES (?, ?, ?, ?, ?, ?)',
            [nama.trim(), kelas.trim(), nis.trim(), alamat.trim(), jurusan.trim(), foto]
        );
        res.status(201).json({
            message: 'Siswa berhasil ditambahkan',
            data: { id: result.insertId, nama: nama.trim(), kelas: kelas.trim(), nis: nis.trim(), alamat: alamat.trim(), jurusan: jurusan.trim(), foto }
        });
    } catch (error) {
        if (req.file) hapusFileFoto(req.file.filename);
        res.status(500).json({
            message: 'error',
            error: error.message
        });
    }
});

router.put('/:id', uploadFoto, async (req, res) => {
    const { id } = req.params;
    const { nis, nama, kelas, jurusan, alamat, hapusFoto } = req.body;
    const errors = validasiSiswa({ nis, nama, kelas, jurusan, alamat });

    if (Object.keys(errors).length > 0) {
        if (req.file) hapusFileFoto(req.file.filename);
        return res.status(400).json({ message: 'Validasi gagal', errors });
    }

    try {
        const [existingSiswa] = await db.query('SELECT * FROM siswa WHERE id = ?', [id]);
        if (existingSiswa.length === 0) {
            if (req.file) hapusFileFoto(req.file.filename);
            return res.status(404).json({
                message: 'Siswa tidak ditemukan'
            });
        }

        const [dup] = await db.query('SELECT id FROM siswa WHERE nis = ? AND id != ?', [String(nis).trim(), id]);
        if (dup.length > 0) {
            if (req.file) hapusFileFoto(req.file.filename);
            return res.status(400).json({ message: 'Validasi gagal', errors: { nis: 'NIS sudah terdaftar' } });
        }

        let foto = existingSiswa[0].foto;
        if (req.file) {
            hapusFileFoto(existingSiswa[0].foto);
            foto = req.file.filename;
        } else if (hapusFoto === 'true') {
            hapusFileFoto(existingSiswa[0].foto);
            foto = null;
        }

        const [result] = await db.query(
            'UPDATE siswa SET nama = ?, kelas = ?, nis = ?, alamat = ?, jurusan = ?, foto = ? WHERE id = ?',
            [nama.trim(), kelas.trim(), nis.trim(), alamat.trim(), jurusan.trim(), foto, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Siswa tidak ditemukan'
            });
        }
        res.json({
            message: 'Siswa berhasil diperbarui',
            data: { id, nama: nama.trim(), kelas: kelas.trim(), nis: nis.trim(), alamat: alamat.trim(), jurusan: jurusan.trim(), foto }
        });
    } catch (error) {
        if (req.file) hapusFileFoto(req.file.filename);
        res.status(500).json({
            message: 'error',
            error: error.message
        });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT foto FROM siswa WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Siswa tidak ditemukan'
            });
        }

        const [result] = await db.query('DELETE FROM siswa WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Siswa tidak ditemukan'
            });
        }

        hapusFileFoto(rows[0].foto);

        res.json({
            message: 'Siswa berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            message: 'error',
            error: error.message
        });
    }
});

module.exports = router;
