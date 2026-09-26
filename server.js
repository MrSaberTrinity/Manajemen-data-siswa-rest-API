const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/siswa', require('./routes/siswa'));

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});