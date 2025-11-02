import db from "../config/db.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/* ============================================================
   🧾 CETAK STRUK THERMAL (AUTO PRINT + SIMPAN PDF)
   ============================================================ */
export const printStruk = (req, res) => {
  const { id } = req.params;

  // helper format rupiah
  const rupiah = (val) =>
    "Rp" +
    Number(val || 0).toLocaleString("id-ID", { minimumFractionDigits: 0 });

  // === Query header transaksi ===
  const sqlHeader = `
    SELECT 
      t.id_transaksi, t.subtotal, t.jumlah_bayar, t.kembalian,
      t.metode_bayar, t.tipe_transaksi, t.created_at,
      s.nama_store, s.alamat_store,
      u.nama_user AS kasir, u.role,
      st.nomor_struk
    FROM transaksi t
    JOIN store s ON t.id_store = s.id_store
    JOIN users u ON t.id_user = u.id_user
    LEFT JOIN struk st ON st.id_transaksi = t.id_transaksi
    WHERE t.id_transaksi = ?;
  `;

  db.query(sqlHeader, [id], (err, results) => {
    if (err || !results.length)
      return res.status(500).send("❌ Gagal ambil data transaksi");

    const trx = results[0];
    const generateShortStruk = () => {
      const now = new Date();
      const tanggal = now.toISOString().slice(2, 10).replace(/-/g, ""); // contoh: 251101
      const rand = Math.floor(10 + Math.random() * 90); // 2 digit random
      return `STRK-${tanggal.slice(2)}${rand}`; // hasil: STRK11012 (tanggal + 2 digit)
    };

    const nomorStruk = trx.nomor_struk || generateShortStruk();

    // === Query detail item ===
    const sqlDetail = `
      SELECT p.nama_produk AS nama, tpd.jumlah, tpd.harga_jual AS harga, tpd.total_penjualan AS total
      FROM transaksi_produk_detail tpd
      JOIN produk p ON p.id_produk = tpd.id_produk
      WHERE tpd.id_transaksi = ?
      UNION ALL
      SELECT pr.service AS nama, 1 AS jumlah, tsd.harga AS harga, tsd.harga AS total
      FROM transaksi_service_detail tsd
      JOIN pricelist pr ON pr.id_pricelist = tsd.id_pricelist
      WHERE tsd.id_transaksi = ?;
    `;

    db.query(sqlDetail, [id, id], (err2, items) => {
      if (err2) return res.status(500).send("❌ Gagal ambil detail transaksi");

      /* =======================================================
         📁 Simpan versi PDF untuk arsip
         ======================================================= */
      const uploadDir = path.join("uploads", "struk");
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, `${nomorStruk}.pdf`);

      const doc = new PDFDocument({ margin: 40 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const logoPath = path.join("public", "Logo.png");
      if (fs.existsSync(logoPath)) doc.image(logoPath, 40, 30, { width: 60 });
      doc.fontSize(16).text(trx.nama_store, 120, 30);
      doc.fontSize(10).text(trx.alamat_store, 120, 50);
      doc.moveDown(2);
      doc.fontSize(10).text(`Nomor Struk : ${nomorStruk}`);
      doc.text(
        `Tanggal      : ${new Date(trx.created_at).toLocaleString("id-ID")}`
      );
      doc.text(`Kasir        : ${trx.kasir} (${trx.role})`);
      doc.text(`Metode Bayar : ${trx.metode_bayar?.toUpperCase()}`);
      doc.text(`Jenis Transaksi : ${trx.tipe_transaksi.toUpperCase()}`);
      doc.moveDown();
      doc.fontSize(11).text("Rincian Transaksi:", { underline: true });
      doc.moveDown(0.5);

      items.forEach((i) => {
        doc.text(
          `${i.nama.padEnd(25, " ")} (${i.jumlah}x) ....... ${rupiah(i.total)}`
        );
      });

      doc.moveDown();
      doc.text(`Subtotal : ${rupiah(trx.subtotal)}`);
      doc.text(`Bayar    : ${rupiah(trx.jumlah_bayar)}`);
      doc.text(`Kembali  : ${rupiah(trx.kembalian)}`);
      doc.moveDown(2);
      doc.text("Terima kasih telah berkunjung 🙏", { align: "center" });
      doc.end();

      // === Simpan ke tabel struk ===
      stream.on("finish", () => {
        db.query(
          `INSERT INTO struk (id_transaksi, nomor_struk, file_path)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE file_path = VALUES(file_path)`,
          [id, nomorStruk, `/uploads/struk/${nomorStruk}.pdf`],
          (err3) => {
            if (err3) console.error("❌ Gagal simpan struk:", err3.message);
          }
        );
      });

      /* =======================================================
         🧾 Versi HTML untuk print thermal (52 mm)
         ======================================================= */
      const html = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/Logo1.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Struk ${nomorStruk}</title>
        <style>
        /* --- FORMAT CETAK MINI 58mm --- */
        @page { size: 58mm auto; margin: 0; }
        @media print {
            body { margin: 0; -webkit-print-color-adjust: exact; }
        }
        body {
            font-family: 'Courier New', monospace;
            width: 42mm;                 /* ✅ Lebar aman semua printer */
            margin: 0 auto;
            padding: 4px 10px 1px 1px;    /* ✅ Hampir tanpa padding */
            font-size: 11px;
            line-height: 1.35em;
            color: #000;
        }
        .center { text-align: center; }
        .line { border-top: 1px dashed #000; margin: 3px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { vertical-align: top; }
        img.logo {
            display:block;
            margin:2px auto 6px auto;
            width:80px;           /* ✅ logo besar */
            height:auto;
        }
        .rincian {
            width:100%;
            border-collapse:collapse;
            margin-top:2px;
        }
        .rincian td {
            padding:0;
            white-space:nowrap;
        }
        .rincian .left {
            text-align:left;
        }
        .rincian .right {
            text-align:right;
            width:30%;
        }
        .total td {
            padding-top:2px;
            white-space:nowrap;
        }
        </style>
        </head>
        <body onload="window.print()">

        <div class="center">
            <img src="/Logo.png" class="logo" onerror="this.style.display='none'"/><br/>
            <strong>${trx.nama_store}</strong><br/>
            <small>${trx.alamat_store}</small>
        </div>

        <div class="line"></div>

        <table>
            <tr><td>No</td><td>: ${nomorStruk}</td></tr>
            <tr><td>Tgl</td><td>: ${new Date(trx.created_at).toLocaleString(
              "id-ID"
            )}</td></tr>
            <tr><td>Kasir</td><td>: ${trx.kasir}</td></tr>
            <tr><td>Metode</td><td>: ${trx.metode_bayar.toUpperCase()}</td></tr>
        </table>

        <div class="line"></div>

        <table class="rincian">
            ${items
              .map(
                (i) => `
                <tr>
                <td colspan="2">${i.nama}</td>
                </tr>
                <tr>
                <td class="left">${i.jumlah}x @${rupiah(i.harga)}</td>
                <td class="right">${rupiah(i.total)}</td>
                </tr>`
              )
              .join("")}
        </table>

        <div class="line"></div>

        <table class="total">
            <tr><td>Subtotal</td><td style="text-align:right">${rupiah(
              trx.subtotal
            )}</td></tr>
            <tr><td>Bayar</td><td style="text-align:right">${rupiah(
              trx.jumlah_bayar
            )}</td></tr>
            <tr><td>Kembali</td><td style="text-align:right">${rupiah(
              trx.kembalian
            )}</td></tr>
        </table>

        <div class="line"></div>
        <div class="center">
            <p style="margin-top:10px;">Terima kasih telah berkunjung 😊</p>
        </div>

        </body>
        </html>
        `;
      res.send(html);
    });
  });
};
