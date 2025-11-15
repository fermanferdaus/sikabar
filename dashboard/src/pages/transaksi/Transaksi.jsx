import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import useFetchService from "../../hooks/useFetchService";
import useFetchProduk from "../../hooks/useFetchProduk";
import useFetchCapsterByStore from "../../hooks/useFetchCapsterByStore";
import {
  Scissors,
  Package,
  Layers,
  CreditCard,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

/* === Helper === */
const formatRupiah = (angka) =>
  "Rp" + Number(angka || 0).toLocaleString("id-ID");

/* =====================================================
   🔹 KOMPONEN UTAMA
===================================================== */
export default function TransaksiAdd() {
  const [tipeTransaksi, setTipeTransaksi] = useState(null);
  const [metode, setMetode] = useState("cash");
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [jumlahBayar, setJumlahBayar] = useState(0);
  const [noStruk, setNoStruk] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    visible: false,
    type: "success",
    message: "",
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const id_store = localStorage.getItem("id_store");
  const id_user = localStorage.getItem("id_user");

  const { services } = useFetchService();
  const { produk } = useFetchProduk(id_store);
  const { capsters } = useFetchCapsterByStore(id_store);

  useEffect(() => {
    const total = items.reduce(
      (sum, i) => sum + Number(i.harga || 0) * Number(i.jumlah || 1),
      0
    );
    setSubtotal(total);
  }, [items]);

  // 🔹 Ambil nomor struk dari backend
  useEffect(() => {
    const fetchStruk = async () => {
      try {
        const res = await fetch(`${API_URL}/struk/generate`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setNoStruk(data.nomor_struk);
      } catch {
        const now = new Date();
        const tanggal = now.toISOString().slice(2, 10).replace(/-/g, "");
        const rand = Math.floor(100 + Math.random() * 900);
        setNoStruk(`STRK${tanggal}${rand}`);
      }
    };
    fetchStruk();
  }, []);

  const addItem = (item) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => {
        if (item.tipe === "produk" && i.tipe === "produk")
          return i.id_produk === item.id_produk;
        if (item.tipe === "service" && i.tipe === "service")
          return (
            i.id_pricelist === item.id_pricelist &&
            i.id_capster === item.id_capster
          );
        return false;
      });

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].jumlah += 1;
        updated[existingIndex].total =
          updated[existingIndex].jumlah * updated[existingIndex].harga;
        return updated;
      }
      return [...prev, item];
    });
  };

  const handleChangeTipe = (newType) => {
    if (newType !== tipeTransaksi) {
      setTipeTransaksi(newType);
      setItems([]);
      setSubtotal(0);
      setJumlahBayar(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!tipeTransaksi)
      return setPopup({
        visible: true,
        type: "error",
        message: "Pilih tipe transaksi terlebih dahulu!",
      });
    if (items.length === 0)
      return setPopup({
        visible: true,
        type: "error",
        message: "Belum ada item yang ditambahkan!",
      });

    try {
      setLoading(true);
      const body = {
        id_store,
        id_user,
        nomor_struk: noStruk,
        tipe_transaksi: tipeTransaksi,
        metode_bayar: metode,
        items,
        jumlah_bayar: jumlahBayar,
      };

      const res = await fetch(`${API_URL}/transaksi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (res.ok) {
        const nomorFinal = result.nomor_struk || noStruk; // fallback jika backend tidak kirim
        setPopup({
          visible: true,
          type: "success",
          message: `Transaksi berhasil disimpan! Nomor Struk: ${nomorFinal}`,
        });
        window.open(`${API_URL}/struk/print/${result.id}`, "_blank");

        setItems([]);
        setSubtotal(0);
        setJumlahBayar(0);
        const resNum = await fetch(`${API_URL}/struk/generate`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newNum = await resNum.json();
        setNoStruk(newNum.nomor_struk);

        setTipeTransaksi(null);
      } else {
        setPopup({
          visible: true,
          type: "error",
          message: result.message || "Gagal menyimpan transaksi.",
        });
      }
    } catch {
      setPopup({
        visible: true,
        type: "error",
        message: "Terjadi kesalahan jaringan atau server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout current="transaksi">
      {(searchTerm) => {
        const capsterFiltered = capsters.filter((c) =>
          c.nama_capster.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const produkFiltered = produk.filter((p) =>
          p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const serviceFiltered = services.filter((s) =>
          s.service.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
          <div className="space-y-6">
            {/* === HEADER (FULL WIDTH) === */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-semibold text-slate-800 mb-1">
                    Tambah Transaksi
                  </h1>
                  <p className="text-gray-500 text-sm">
                    Pilih jenis transaksi, tambahkan item, lalu simpan dan cetak
                    struk.
                  </p>
                </div>
              </div>
            </div>

            {/* === GRID UTAMA: KIRI & KANAN === */}
            <div
              className="
                grid 
                grid-cols-1 xl:grid-cols-[65%_minmax(340px,1fr)] 
                gap-6 
                min-h-[calc(100vh-190px)] 
                relative
                pr-2
              "
            >
              {/* === KIRI === */}
              <div className="space-y-6 overflow-y-auto pr-2 h-[calc(100vh-220px)]">
                {/* PILIH JENIS TRANSAKSI */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                  <h2 className="font-semibold text-gray-700 mb-4">
                    Pilih Jenis Transaksi
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { key: "service", icon: <Scissors />, label: "Layanan" },
                      { key: "produk", icon: <Package />, label: "Produk" },
                      { key: "campuran", icon: <Layers />, label: "Campuran" },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => handleChangeTipe(t.key)}
                        className={`flex flex-col items-center justify-center p-5 rounded-xl border font-medium transition-all ${
                          tipeTransaksi === t.key
                            ? "bg-[#0e57b5] text-white border-blue-700 scale-[1.03]"
                            : "bg-gray-50 hover:bg-blue-50 border-gray-200 text-gray-700"
                        }`}
                      >
                        {t.icon}
                        <span className="mt-2">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* GRID ITEM */}
                {tipeTransaksi && (
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-10">
                    {tipeTransaksi !== "produk" && (
                      <ServiceGrid
                        capsters={capsterFiltered}
                        services={serviceFiltered}
                        onAdd={addItem}
                      />
                    )}
                    {tipeTransaksi !== "service" && (
                      <ProdukGrid produk={produkFiltered} onAdd={addItem} />
                    )}
                  </div>
                )}
              </div>

              {/* === KANAN === */}
              <div className="space-y-6 overflow-y-auto pl-2 h-full">
                <ItemCard items={items} setItems={setItems} />
                <PembayaranCard
                  subtotal={subtotal}
                  metode={metode}
                  setMetode={setMetode}
                  jumlahBayar={jumlahBayar}
                  setJumlahBayar={setJumlahBayar}
                  handleSubmit={handleSubmit}
                  loading={loading}
                />
              </div>
            </div>

            {/* === POPUP MODAL === */}
            {popup.visible && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-lg p-6 w-[380px] text-center space-y-4">
                  {popup.type === "success" ? (
                    <CheckCircle2 className="text-green-500 w-12 h-12 mx-auto" />
                  ) : (
                    <XCircle className="text-red-500 w-12 h-12 mx-auto" />
                  )}
                  <p className="text-gray-700 font-medium leading-relaxed">
                    {popup.message}
                  </p>
                  <button
                    onClick={() =>
                      setPopup({ visible: false, type: "success", message: "" })
                    }
                    className={`px-5 py-2 rounded-lg text-white font-medium ${
                      popup.type === "success"
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }}
    </MainLayout>
  );
}

/* ======================================================
   🔹 SERVICE GRID
===================================================== */
function ServiceGrid({ services, capsters, onAdd }) {
  const [selectedCapster, setCapster] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [clicked, setClicked] = useState(null);

  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Pilih Capster</h4>
        <div className="flex flex-wrap gap-3">
          {capsters.map((c) => (
            <button
              key={c.id_capster}
              onClick={() => {
                setCapster(c.id_capster);
                setShowWarning(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedCapster === c.id_capster
                  ? "bg-[#0e57b5] text-white"
                  : "bg-gray-100 hover:bg-blue-50 text-gray-700"
              }`}
            >
              {c.nama_capster}
            </button>
          ))}
        </div>
      </div>

      {showWarning && (
        <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-200 animate-pulse">
          Pilih capster terlebih dahulu sebelum menambah layanan.
        </div>
      )}

      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Pilih Layanan</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {services.map((s) => (
            <button
              key={s.id_pricelist}
              onClick={() => {
                if (!selectedCapster) return setShowWarning(true);
                setClicked(s.id_pricelist);
                setTimeout(() => setClicked(null), 400);
                onAdd({
                  tipe: "service",
                  id_pricelist: s.id_pricelist,
                  id_capster: selectedCapster,
                  nama: s.service,
                  harga: Number(s.harga),
                  jumlah: 1,
                  total: Number(s.harga),
                });
              }}
              className={`bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md transition ${
                clicked === s.id_pricelist
                  ? "ring-2 ring-green-500 scale-[1.02]"
                  : ""
              }`}
            >
              <Scissors className="text-blue-600" />
              <p className="mt-1 font-semibold text-gray-800">{s.service}</p>
              <span className="text-gray-600 text-sm">
                {formatRupiah(s.harga)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   🔹 PRODUK GRID
===================================================== */
function ProdukGrid({ produk, onAdd }) {
  const [clicked, setClicked] = useState(null);
  return (
    <div>
      <h4 className="font-semibold text-gray-700 mb-3">Pilih Produk</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {produk.map((p) => (
          <button
            key={p.id_produk}
            onClick={() => {
              setClicked(p.id_produk);
              setTimeout(() => setClicked(null), 400);
              onAdd({
                tipe: "produk",
                id_produk: p.id_produk,
                nama: p.nama_produk,
                harga: Number(p.harga_jual),
                jumlah: 1,
                total: Number(p.harga_jual),
              });
            }}
            className={`bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md transition ${
              clicked === p.id_produk
                ? "ring-2 ring-green-500 scale-[1.02]"
                : ""
            }`}
          >
            <Package className="text-green-600" />
            <p className="mt-1 font-semibold text-gray-800">{p.nama_produk}</p>
            <span className="text-gray-600 text-sm">
              {formatRupiah(p.harga_jual)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ======================================================
   🔹 ITEM LIST KANAN
===================================================== */
function ItemCard({ items, setItems }) {
  const handleQuantity = (index, delta) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const newJumlah = Math.max(1, item.jumlah + delta); // minimal 1
        return {
          ...item,
          jumlah: newJumlah,
          total: item.harga * newJumlah,
        };
      })
    );
  };

  const handleDelete = (index) => {
    setItems((prev) => prev.filter((_, j) => j !== index));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <h3 className="font-semibold text-gray-700 mb-3">Daftar Item</h3>

      {items.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-gray-400 italic text-sm">
          Belum ada item ditambahkan
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {items.map((i, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center py-2 border-b last:border-none"
            >
              {/* === Kiri: Nama dan harga satuan === */}
              <div>
                <p className="font-medium text-gray-800">{i.nama}</p>
                <p className="text-sm text-gray-500">{formatRupiah(i.harga)}</p>
              </div>

              {/* === Kanan: Kontrol jumlah & total === */}
              <div className="flex items-center gap-2">
                {/* Tombol Kurangi */}
                <button
                  onClick={() => handleQuantity(idx, -1)}
                  disabled={i.jumlah <= 1}
                  className={`px-2 py-1 rounded-md font-semibold ${
                    i.jumlah <= 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  title="Kurangi jumlah"
                >
                  -
                </button>

                {/* Jumlah */}
                <span className="min-w-[28px] text-center text-gray-800 font-medium">
                  {i.jumlah}
                </span>

                {/* Tombol Tambah */}
                <button
                  onClick={() => handleQuantity(idx, +1)}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 font-semibold"
                  title="Tambah jumlah"
                >
                  +
                </button>

                {/* Total harga */}
                <span className="font-semibold text-gray-800 ml-2">
                  {formatRupiah(i.total)}
                </span>

                {/* Tombol Hapus */}
                <button
                  onClick={() => handleDelete(idx)}
                  className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition-all"
                  title="Hapus item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ======================================================
   🔹 PEMBAYARAN CARD
===================================================== */
function PembayaranCard({
  subtotal,
  metode,
  setMetode,
  jumlahBayar,
  setJumlahBayar,
  handleSubmit,
  loading,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">Subtotal</h3>
        <span className="font-bold text-blue-600 text-lg">
          {formatRupiah(subtotal)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {["cash", "qris"].map((m) => (
          <button
            key={m}
            onClick={() => setMetode(m)}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl ${
              metode === m
                ? "bg-[#0e57b5] text-white"
                : "bg-gray-100 hover:bg-blue-50 text-gray-700"
            }`}
          >
            <CreditCard size={16} /> {m.toUpperCase()}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-1">
          Jumlah Bayar
        </label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Masukkan jumlah bayar"
          value={
            jumlahBayar
              ? "Rp" +
                jumlahBayar.toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                })
              : ""
          }
          onChange={(e) => {
            const numericValue = e.target.value.replace(/\D/g, "");
            setJumlahBayar(Number(numericValue || 0));
          }}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full text-right font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {jumlahBayar > 0 && (
        <div className="text-right">
          {jumlahBayar >= subtotal ? (
            <p className="text-green-600 font-semibold">
              Kembalian: {formatRupiah(jumlahBayar - subtotal)}
            </p>
          ) : (
            <p className="text-red-600 font-semibold">
              Kurang: {formatRupiah(subtotal - jumlahBayar)}
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || jumlahBayar < subtotal}
        className={`w-full font-medium py-3 rounded-lg ${
          loading || jumlahBayar < subtotal
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-[#0e57b5] hover:bg-[#0b4894] text-white shadow-sm"
        }`}
      >
        {loading ? "Menyimpan..." : "Simpan & Cetak Struk"}
      </button>
    </div>
  );
}
