-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versi server:                 8.4.3 - MySQL Community Server - GPL
-- OS Server:                    Win64
-- HeidiSQL Versi:               12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Membuang struktur basisdata untuk penilaian
CREATE DATABASE IF NOT EXISTS `penilaian` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `penilaian`;

-- membuang struktur untuk table penilaian.siswa
CREATE TABLE IF NOT EXISTS `siswa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nis` varchar(50) DEFAULT NULL,
  `nama` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `kelas` varchar(50) DEFAULT NULL,
  `jurusan` varchar(50) DEFAULT NULL,
  `alamat` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `foto` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Membuang data untuk tabel penilaian.siswa: ~10 rows (lebih kurang)
INSERT INTO `siswa` (`id`, `nis`, `nama`, `kelas`, `jurusan`, `alamat`, `foto`) VALUES
	(1, '242510062', 'Marchel Hugo Putra Ramadhan', '12', 'RPL', 'Griya Parung Panjang', 'siswa_1790399248365_124683951.png'),
	(2, '242510063', 'Maulidan Alif Wicaksono', '12', 'RPL', 'Forest Hill', 'siswa_1790398409427_753761350.jpeg'),
	(3, '242510067', 'Muhammad Farel Andriani', '12', 'RPL', 'Sirsak', 'siswa_1790398393184_468850722.jpeg'),
	(4, '242510058', 'Farel Apandi', '12', 'RPL', 'Jambu', 'siswa_1790398372459_776923734.jpg'),
	(5, '2026005', 'Dimas Surya Putra', '12', 'RPL', 'Sentraland', 'siswa_1790398362075_334453805.jpeg'),
	(6, '242510080', 'Sugiarto Raharjo', '12', 'RPL', 'Cilejet', 'siswa_1790398319850_738620184.png'),
	(7, '242510055', 'Abdul Syahril Pratama', '12', 'RPL', 'Dukuh', 'siswa_1790398268609_232981107.jpg'),
	(9, '242510081', 'Umar Hafidz Muhyidin', '12', 'RPL', 'Jambu', 'siswa_1790398254719_661218814.jpeg'),
	(11, '242510057', 'Emre razaq', '12', 'RPL', 'Kabasiran', 'siswa_1790398244971_749802378.jpeg'),
	(12, '242510060', 'Fiqih al farizi', '12', 'RPL', 'Kabasiran', 'siswa_1790398657529_550599599.jpg');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
