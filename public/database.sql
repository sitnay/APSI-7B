CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL
);

CREATE TABLE transaksi (
    id_transaksi SERIAL PRIMARY KEY,
    id_user INTEGER NOT NULL,
    nama_barang VARCHAR(100) NOT NULL,
    jumlah INTEGER NOT NULL CHECK (jumlah > 0),
    harga_satuan NUMERIC(12,2) NOT NULL CHECK (harga_satuan >= 0),
    tanggal TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_user)
        REFERENCES users(id_user)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

INSERT INTO users (nama, username, role)
VALUES
    ('Andi', 'andi01', 'owner'),
    ('Budi', 'budi01', 'kasir'),
    ('Citra', 'citra01', 'kasir');

INSERT INTO transaksi (
    id_user,
    nama_barang,
    jumlah,
    harga_satuan
)
VALUES
    (2, 'Buku Tulis', 3, 12000),
    (2, 'Pulpen', 5, 5000),
    (3, 'Pensil', 4, 3000),
    (3, 'Buku Gambar', 2, 15000);


SELECT
    u.nama,
    u.role,
    COUNT(t.id_transaksi) AS jumlah_transaksi,
    SUM(t.jumlah * t.harga_satuan) AS total_transaksi
FROM transaksi t
JOIN users u
    ON t.id_user = u.id_user
GROUP BY
    u.nama,
    u.role
ORDER BY
    total_transaksi DESC;

