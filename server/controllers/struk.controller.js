import db from "../config/db.js";
import { createCanvas, loadImage } from "canvas";
import path from "path";
import { fileURLToPath } from "url";

export const printStruk = async (req, res) => {
  try {
    const { id } = req.params;

    const rupiah = (val) =>
      "Rp" +
      Number(val || 0).toLocaleString("id-ID", { minimumFractionDigits: 0 });

    const formatTanggalWaktu = (date) => {
      const d = new Date(date);

      const hari = String(d.getDate()).padStart(2, "0");
      const bulan = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ][d.getMonth()];
      const tahun = String(d.getFullYear()).slice(2);

      const jam = String(d.getHours()).padStart(2, "0");
      const menit = String(d.getMinutes()).padStart(2, "0");

      return `${hari} ${bulan} ${tahun} ${jam}:${menit}`;
    };

    async function generateCircularFavicon(url) {
      const size = 256;
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext("2d");

      try {
        const img = await loadImage(url);

        // background bulat putih
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();

        // scale hampir full
        const scale = 0.95;
        let w = size * scale;
        let h = size * scale;

        // jaga proporsi
        if (img.width > img.height) {
          h = (img.height / img.width) * w;
        } else {
          w = (img.width / img.height) * h;
        }

        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

        return canvas.toDataURL("image/png");
      } catch (err) {
        console.error("Favicon generation error:", err);
        return null;
      }
    }

    const [profilRows] = await db.query(`
        SELECT logo, telepon, instagram, tiktok
        FROM profil 
        LIMIT 1
    `);

    const profil = profilRows[0] || {};

    // untuk mendapatkan __dirname (karena ES module)
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    const logoPath = profil.logo
      ? path.join(__dirname, "..", profil.logo) // pastikan folder 'uploads' benar
      : null;

    const faviconBase64 = logoPath
      ? await generateCircularFavicon(logoPath)
      : null;

    // ================= HEADER =================
    const [headerRows] = await db.query(
      `
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
    `,
      [id]
    );

    if (!headerRows.length)
      return res.status(404).send("❌ Data transaksi tidak ditemukan");

    const trx = headerRows[0];
    const nomorStruk = trx.nomor_struk;

    // ================= DETAIL PRODUK =================
    const [produkRows] = await db.query(
      `
        SELECT 
          p.nama_produk AS nama,
          tpd.jumlah,
          CASE 
            WHEN tpd.harga_jual IS NULL OR tpd.harga_jual = 0 THEN p.harga_jual
            ELSE tpd.harga_jual
          END AS harga,
          CASE 
            WHEN tpd.total_penjualan IS NULL OR tpd.total_penjualan = 0 
            THEN (tpd.jumlah * 
              CASE 
                WHEN tpd.harga_jual IS NULL OR tpd.harga_jual = 0 THEN p.harga_jual
                ELSE tpd.harga_jual
              END)
            ELSE tpd.total_penjualan
          END AS total
        FROM transaksi_produk_detail tpd
        JOIN produk p ON p.id_produk = tpd.id_produk
        WHERE tpd.id_transaksi = ?;
      `,
      [id]
    );

    const [serviceRows] = await db.query(
      `
        SELECT 
          pr.service AS nama,
          1 AS jumlah,
          COALESCE(tsd.harga, 0) AS harga,
          COALESCE(tsd.harga, 0) AS total
        FROM transaksi_service_detail tsd
        JOIN pricelist pr ON pr.id_pricelist = tsd.id_pricelist
        WHERE tsd.id_transaksi = ?;
      `,
      [id]
    );

    const items = [...produkRows, ...serviceRows];

    // ================= HTML (Thermal Print) =================
    const html = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
        <meta charset="UTF-8" />
        ${
          faviconBase64
            ? `<link rel="icon" type="image/png" href="${faviconBase64}" />`
            : ""
        }
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${nomorStruk}</title>
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
            margin:0px auto 0px auto;
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
            <img src="${
              profil.logo
                ? `${req.protocol}://${req.get("host")}/${profil.logo}`
                : ""
            }"
              class="logo"
              onerror="this.style.display='none'"/>
            <strong>${trx.nama_store}</strong><br/>
            <small>${trx.alamat_store}</small>
            <p style="margin:0px 0 0 0; font-size:10px;">
              Tlp. ${profil.telepon || "-"}
          </p>
        </div>

        <div class="line"></div>

        <table>
            <tr><td>No</td><td>: ${nomorStruk}</td></tr>
            <tr><td>Tgl</td><td>: ${formatTanggalWaktu(
              trx.created_at
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

          <p style="margin:2px 0 0 0; font-size:10px;">
              Ig:${profil.instagram || "-"}
          </p>

          <p style="margin:2px 0 0 0; font-size:10px;">
              TikTok:${profil.tiktok || "-"}
          </p>
      </div>

        </body>
        </html>
        `;

    // ✅ kirim respons HTML setelah PDF selesai disimpan
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    console.error("❌ printStruk Error:", err);
    res.status(500).send("Gagal mencetak struk");
  }
};
