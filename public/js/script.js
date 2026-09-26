const API_URL = '/siswa';

const tableBody = document.getElementById('siswaTableBody');
const emptyState = document.getElementById('emptyState');
const loadingIndicator = document.getElementById('loadingIndicator');
const siswaTable = document.getElementById('siswaTable');
const messageBox = document.getElementById('messageBox');

const btnTambah = document.getElementById('btnTambah');
const btnDarkMode = document.getElementById('btnDarkMode');
const formModal = document.getElementById('formModal');
const formTitle = document.getElementById('formTitle');
const siswaForm = document.getElementById('siswaForm');
const btnBatal = document.getElementById('btnBatal');
const btnSimpan = document.getElementById('btnSimpan');

const confirmModal = document.getElementById('confirmModal');
const btnBatalHapus = document.getElementById('btnBatalHapus');
const btnKonfirmHapus = document.getElementById('btnKonfirmHapus');

const searchInput = document.getElementById('searchInput');
const filterKelas = document.getElementById('filterKelas');
const limitSelect = document.getElementById('limitSelect');

const paginationBar = document.getElementById('paginationBar');
const paginationInfo = document.getElementById('paginationInfo');
const pageIndicator = document.getElementById('pageIndicator');
const btnPrevPage = document.getElementById('btnPrevPage');
const btnNextPage = document.getElementById('btnNextPage');

const fotoInput = document.getElementById('foto');
const fotoPreviewWrap = document.getElementById('fotoPreviewWrap');
const fotoPreview = document.getElementById('fotoPreview');
const btnHapusFoto = document.getElementById('btnHapusFoto');
const hapusFotoFlag = document.getElementById('hapusFotoFlag');

let idYangAkanDihapus = null;

const state = {
    search: '',
    kelas: '',
    page: 1,
    limit: parseInt(limitSelect.value, 10) || 10,
    totalPages: 1
};

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

function tampilkanLoading(tampil) {
    loadingIndicator.classList.toggle('hidden', !tampil);
    siswaTable.classList.toggle('hidden', tampil);
}

function tampilkanPesan(teks, tipe) {
    messageBox.textContent = teks;
    messageBox.className = `message-box ${tipe}`;
    messageBox.classList.remove('hidden');
    clearTimeout(tampilkanPesan._timer);
    tampilkanPesan._timer = setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 4000);
}

function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function terapkanTema(tema) {
    if (tema === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        btnDarkMode.textContent = 'Mode Terang';
    } else {
        document.documentElement.removeAttribute('data-theme');
        btnDarkMode.textContent = 'Mode Gelap';
    }
}

function inisialisasiTema() {
    const tersimpan = localStorage.getItem('theme');
    if (tersimpan) {
        terapkanTema(tersimpan);
        return;
    }
    const sistemGelap = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    terapkanTema(sistemGelap ? 'dark' : 'light');
}

btnDarkMode.addEventListener('click', () => {
    const sedangGelap = document.documentElement.getAttribute('data-theme') === 'dark';
    const temaBaru = sedangGelap ? 'light' : 'dark';
    localStorage.setItem('theme', temaBaru);
    terapkanTema(temaBaru);
});

function renderFotoCell(siswa) {
    if (siswa.foto) {
        return `<img class="siswa-foto-thumb" src="/uploads/${encodeURIComponent(siswa.foto)}" alt="Foto ${escapeHTML(siswa.nama)}">`;
    }
    return `<div class="siswa-foto-placeholder">No Foto</div>`;
}

function renderTabel(daftarSiswa) {
    tableBody.innerHTML = '';

    if (!daftarSiswa || daftarSiswa.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    daftarSiswa.forEach((siswa) => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${renderFotoCell(siswa)}</td>
            <td>${escapeHTML(siswa.nis)}</td>
            <td>${escapeHTML(siswa.nama)}</td>
            <td>${escapeHTML(siswa.kelas)}</td>
            <td>${escapeHTML(siswa.jurusan)}</td>
            <td>${escapeHTML(siswa.alamat)}</td>
            <td>
                <button class="btn btn-secondary btn-small" data-action="edit" data-id="${siswa.id}">Edit</button>
                <button class="btn btn-danger btn-small" data-action="hapus" data-id="${siswa.id}">Hapus</button>
            </td>
        `;

        tableBody.appendChild(tr);
    });
}

function renderPagination(pagination) {
    if (!pagination || pagination.total === 0) {
        paginationBar.classList.add('hidden');
        return;
    }

    paginationBar.classList.remove('hidden');

    const { page, limit, total, totalPages } = pagination;
    state.totalPages = totalPages;

    const awal = (page - 1) * limit + 1;
    const akhir = Math.min(page * limit, total);

    paginationInfo.textContent = `Menampilkan ${awal}-${akhir} dari ${total} siswa`;
    pageIndicator.textContent = `Halaman ${page} / ${totalPages}`;

    btnPrevPage.disabled = page <= 1;
    btnNextPage.disabled = page >= totalPages;
}

function renderOpsiKelas(daftarKelas) {
    const nilaiTerpilih = filterKelas.value;

    filterKelas.innerHTML = '<option value="">Semua Kelas</option>';

    daftarKelas.forEach((kelas) => {
        const opt = document.createElement('option');
        opt.value = kelas;
        opt.textContent = kelas;
        filterKelas.appendChild(opt);
    });

    if (daftarKelas.includes(nilaiTerpilih)) {
        filterKelas.value = nilaiTerpilih;
    }
}

async function ambilDaftarKelas() {
    try {
        const res = await fetch(`${API_URL}/meta/kelas`);
        const data = await res.json();

        if (res.ok) {
            renderOpsiKelas(data.data || []);
        }
    } catch (err) {
    }
}

async function ambilDaftarSiswa() {
    tampilkanLoading(true);

    try {
        const query = new URLSearchParams({
            search: state.search,
            kelas: state.kelas,
            page: state.page,
            limit: state.limit
        });

        const res = await fetch(`${API_URL}?${query.toString()}`);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Gagal mengambil data siswa');
        }

        renderTabel(data.data);
        renderPagination(data.pagination);
    } catch (err) {
        tampilkanPesan(`Gagal memuat data: ${err.message}`, 'error');
    } finally {
        tampilkanLoading(false);
    }
}

async function simpanSiswa(formData, id) {
    const isEdit = Boolean(id);
    const url = isEdit ? `${API_URL}/${id}` : API_URL;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method,
        body: formData
    });

    const data = await res.json();

    if (!res.ok) {
        if (data.errors) {
            const err = new Error(data.message || 'Validasi gagal');
            err.fieldErrors = data.errors;
            throw err;
        }

        throw new Error(data.message || 'Gagal menyimpan data siswa');
    }

    tampilkanPesan(data.message || 'Data berhasil disimpan', 'success');
    tutupFormModal();
    await ambilDaftarKelas();
    await ambilDaftarSiswa();
}

async function hapusSiswa(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Gagal menghapus data siswa');
        }

        tampilkanPesan(data.message || 'Data berhasil dihapus', 'success');
        await ambilDaftarKelas();

        if (state.page > 1) {
            const query = new URLSearchParams({
                search: state.search,
                kelas: state.kelas,
                page: state.page,
                limit: state.limit
            });

            const res2 = await fetch(`${API_URL}?${query.toString()}`);
            const data2 = await res2.json();

            if (res2.ok && data2.data.length === 0) {
                state.page -= 1;
            }
        }

        await ambilDaftarSiswa();
    } catch (err) {
        tampilkanPesan(`Gagal menghapus: ${err.message}`, 'error');
    }
}

function bersihkanSpasi(val) {
    return (val || '').trim();
}

function validasiForm(data, fotoFile) {
    const errors = {};

    if (!data.nis) {
        errors.nis = 'NIS wajib diisi';
    } else if (!/^[0-9]{3,20}$/.test(data.nis)) {
        errors.nis = 'NIS harus berupa angka, 3-20 digit';
    }

    if (!data.nama) {
        errors.nama = 'Nama wajib diisi';
    } else if (data.nama.length < 3) {
        errors.nama = 'Nama minimal 3 karakter';
    } else if (data.nama.length > 100) {
        errors.nama = 'Nama maksimal 100 karakter';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(data.nama)) {
        errors.nama = 'Nama hanya boleh berisi huruf dan spasi';
    }

    if (!data.kelas) {
        errors.kelas = 'Kelas wajib diisi';
    } else if (data.kelas.length > 20) {
        errors.kelas = 'Kelas maksimal 20 karakter';
    }

    if (!data.jurusan) {
        errors.jurusan = 'Jurusan wajib diisi';
    } else if (data.jurusan.length > 50) {
        errors.jurusan = 'Jurusan maksimal 50 karakter';
    }

    if (!data.alamat) {
        errors.alamat = 'Alamat wajib diisi';
    } else if (data.alamat.length < 5) {
        errors.alamat = 'Alamat minimal 5 karakter';
    } else if (data.alamat.length > 255) {
        errors.alamat = 'Alamat maksimal 255 karakter';
    }

    if (fotoFile) {
        const tipeDiizinkan = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (!tipeDiizinkan.includes(fotoFile.type)) {
            errors.foto = 'Format foto harus JPG, PNG, atau WEBP';
        } else if (fotoFile.size > 2 * 1024 * 1024) {
            errors.foto = 'Ukuran foto maksimal 2MB';
        }
    }

    return errors;
}

function tampilkanErrorField(field, pesan) {
    const el = document.querySelector(`[data-error-for="${field}"]`);
    const input = document.getElementById(field);

    if (el) {
        el.textContent = pesan || '';
    }

    if (input) {
        input.classList.toggle('invalid', Boolean(pesan));
    }
}

function tampilkanSemuaError(errors) {
    ['nis', 'nama', 'kelas', 'jurusan', 'alamat', 'foto'].forEach((field) => {
        tampilkanErrorField(field, errors[field] || '');
    });
}

function resetSemuaError() {
    tampilkanSemuaError({});
}

function ambilDataForm() {
    return {
        nis: bersihkanSpasi(document.getElementById('nis').value),
        nama: bersihkanSpasi(document.getElementById('nama').value),
        kelas: bersihkanSpasi(document.getElementById('kelas').value),
        jurusan: bersihkanSpasi(document.getElementById('jurusan').value),
        alamat: bersihkanSpasi(document.getElementById('alamat').value)
    };
}

['nis', 'nama', 'kelas', 'jurusan', 'alamat'].forEach((field) => {
    const el = document.getElementById(field);

    el.addEventListener('blur', () => {
        const data = ambilDataForm();
        const errors = validasiForm(data, fotoInput.files[0]);
        tampilkanErrorField(field, errors[field] || '');
    });

    el.addEventListener('input', () => {
        if (el.classList.contains('invalid')) {
            const data = ambilDataForm();
            const errors = validasiForm(data, fotoInput.files[0]);
            tampilkanErrorField(field, errors[field] || '');
        }
    });
});

function tampilkanPreviewFoto(src) {
    fotoPreview.src = src;
    fotoPreviewWrap.classList.remove('hidden');
    hapusFotoFlag.value = 'false';
}

function sembunyikanPreviewFoto() {
    fotoPreview.src = '';
    fotoPreviewWrap.classList.add('hidden');
}

fotoInput.addEventListener('change', () => {
    const file = fotoInput.files[0];
    const errors = validasiForm(ambilDataForm(), file);

    tampilkanErrorField('foto', errors.foto || '');

    if (file && !errors.foto) {
        const reader = new FileReader();

        reader.onload = (e) => tampilkanPreviewFoto(e.target.result);
        reader.readAsDataURL(file);
    }
});

btnHapusFoto.addEventListener('click', () => {
    fotoInput.value = '';
    sembunyikanPreviewFoto();
    hapusFotoFlag.value = 'true';
    tampilkanErrorField('foto', '');
});

function bukaFormModal(mode, siswa = null) {
    siswaForm.reset();
    resetSemuaError();
    sembunyikanPreviewFoto();
    hapusFotoFlag.value = 'false';

    if (mode === 'edit' && siswa) {
        formTitle.textContent = 'Edit Siswa';
        document.getElementById('siswaId').value = siswa.id;
        document.getElementById('nis').value = siswa.nis || '';
        document.getElementById('nama').value = siswa.nama || '';
        document.getElementById('kelas').value = siswa.kelas || '';
        document.getElementById('jurusan').value = siswa.jurusan || '';
        document.getElementById('alamat').value = siswa.alamat || '';

        if (siswa.foto) {
            tampilkanPreviewFoto(`/uploads/${encodeURIComponent(siswa.foto)}`);
        }
    } else {
        formTitle.textContent = 'Tambah Siswa';
        document.getElementById('siswaId').value = '';
    }

    formModal.classList.remove('hidden');
}

function tutupFormModal() {
    formModal.classList.add('hidden');
    siswaForm.reset();
    resetSemuaError();
    sembunyikanPreviewFoto();
}

async function cariSiswaById(id) {
    const res = await fetch(`${API_URL}/${id}`);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Siswa tidak ditemukan');
    }

    return data.data;
}

function bukaKonfirmasiHapus(id) {
    idYangAkanDihapus = id;
    confirmModal.classList.remove('hidden');
}

function tutupKonfirmasiHapus() {
    idYangAkanDihapus = null;
    confirmModal.classList.add('hidden');
}

const jalankanPencarian = debounce(() => {
    state.search = bersihkanSpasi(searchInput.value);
    state.page = 1;
    ambilDaftarSiswa();
}, 400);

searchInput.addEventListener('input', jalankanPencarian);

filterKelas.addEventListener('change', () => {
    state.kelas = filterKelas.value;
    state.page = 1;
    ambilDaftarSiswa();
});

limitSelect.addEventListener('change', () => {
    state.limit = parseInt(limitSelect.value, 10) || 10;
    state.page = 1;
    ambilDaftarSiswa();
});

btnPrevPage.addEventListener('click', () => {
    if (state.page > 1) {
        state.page -= 1;
        ambilDaftarSiswa();
    }
});

btnNextPage.addEventListener('click', () => {
    if (state.page < state.totalPages) {
        state.page += 1;
        ambilDaftarSiswa();
    }
});

btnTambah.addEventListener('click', () => bukaFormModal('tambah'));
btnBatal.addEventListener('click', tutupFormModal);

siswaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('siswaId').value;
    const data = ambilDataForm();
    const fotoFile = fotoInput.files[0];

    const errors = validasiForm(data, fotoFile);
    tampilkanSemuaError(errors);

    if (Object.keys(errors).length > 0) {
        tampilkanPesan('Periksa kembali data yang diisi.', 'error');
        return;
    }

    const formData = new FormData();

    formData.append('nis', data.nis);
    formData.append('nama', data.nama);
    formData.append('kelas', data.kelas);
    formData.append('jurusan', data.jurusan);
    formData.append('alamat', data.alamat);

    if (fotoFile) {
        formData.append('foto', fotoFile);
    }

    if (hapusFotoFlag.value === 'true') {
        formData.append('hapusFoto', 'true');
    }

    btnSimpan.disabled = true;
    btnSimpan.textContent = 'Menyimpan...';

    try {
        await simpanSiswa(formData, id);
    } catch (err) {
        if (err.fieldErrors) {
            tampilkanSemuaError(err.fieldErrors);
        }

        tampilkanPesan(`Gagal menyimpan: ${err.message}`, 'error');
    } finally {
        btnSimpan.disabled = false;
        btnSimpan.textContent = 'Simpan';
    }
});

tableBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');

    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === 'edit') {
        try {
            const siswa = await cariSiswaById(id);
            bukaFormModal('edit', siswa);
        } catch (err) {
            tampilkanPesan(`Gagal mengambil data siswa: ${err.message}`, 'error');
        }
    } else if (action === 'hapus') {
        bukaKonfirmasiHapus(id);
    }
});

btnBatalHapus.addEventListener('click', tutupKonfirmasiHapus);

btnKonfirmHapus.addEventListener('click', async () => {
    if (idYangAkanDihapus === null) return;

    const id = idYangAkanDihapus;
    tutupKonfirmasiHapus();
    await hapusSiswa(id);
});

[formModal, confirmModal].forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.add('hidden');
        }
    });
});

inisialisasiTema();

document.addEventListener('DOMContentLoaded', () => {
    ambilDaftarKelas();
    ambilDaftarSiswa();
});
