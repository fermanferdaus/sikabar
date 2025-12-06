import midtransClient from "midtrans-client";
import dotenv from "dotenv";

dotenv.config();

export const createMidtransTransaction = async (req, res) => {
  try {
    const { subtotal, nama_store, id_store } = req.body;

    if (!subtotal || !id_store) {
      return res.status(400).json({ message: "Data pembayaran tidak lengkap" });
    }

    const core = new midtransClient.CoreApi({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    // ===== Generate order_id unik =====
    const now = new Date();
    const tanggal = now.toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD
    const kodeStore = String(id_store).padStart(2, "0");
    const order_id = `ORD${kodeStore}${tanggal}${Date.now()}`;

    const transaction = await core.charge({
      payment_type: "qris",
      transaction_details: {
        order_id,
        gross_amount: subtotal,
      },
      qris: { acquirer: "gopay" },
      customer_details: { first_name: nama_store || "Customer" },
    });

    res.json({
      order_id,
      qrisUrl: transaction.actions?.[0]?.url || null,
      qrString: transaction.qr_string || null,
      gross_amount: subtotal,
    });
  } catch (err) {
    console.error("❌ Midtrans create error:", err);
    res.status(500).json({ message: "Gagal membuat transaksi QRIS" });
  }
};

export const checkMidtransStatus = async (req, res) => {
  try {
    const { order_id } = req.params;

    const core = new midtransClient.CoreApi({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const status = await core.transaction.status(order_id);
    res.json(status);
  } catch (err) {
    res.status(500).json({ message: "Gagal cek status transaksi" });
  }
};

export const cancelMidtransTransaction = async (req, res) => {
  try {
    const { order_id } = req.params;

    const core = new midtransClient.CoreApi({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const result = await core.transaction.expire(order_id);

    return res.json({
      success: true,
      message: "Transaksi berhasil dibatalkan",
      result,
    });
  } catch (err) {
    return res.status(500).json({ message: "Gagal membatalkan transaksi" });
  }
};
