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
  Trash,
  XCircle,
} from "lucide-react";

// 🔢 Helper: format Rupiah
const formatRupiah = (angka) =>
  "Rp" + Number(angka || 0).toLocaleString("id-ID");

// 🔢 Nomor struk unik
const generateNomorStruk = () => {
  const now = new Date();
  const tanggal = now
    .toISOString()
    .replace(/[-:T.Z]/g, "")
    .slice(0, 14);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `STRK-${tanggal}-${rand}`;
};

export default function TransaksiAdd() {
  const [tipeTransaksi, setTipeTransaksi] = useState(null);
  const [metode, setMetode] = useState("cash");
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [jumlahBayar, setJumlahBayar] = useState(0);
  const [noStruk, setNoStruk] = useState(generateNomorStruk());
  const [showConfirm, setShowConfirm] = useState({
    visible: false,
    index: null,
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const id_store = localStorage.getItem("id_store");
  const id_user = localStorage.getItem("id_user");

  const { services } = useFetchService();
  const { produk } = useFetchProduk(id_store);
  const { capsters } = useFetchCapsterByStore(id_store);

  // 🔄 Hitung subtotal otomatis
  useEffect(() => {
    const total = items.reduce(
      (sum, i) => sum + Number(i.harga || 0) * Number(i.jumlah || 1),
      0
    );
    setSubtotal(total);
  }, [items]);

  // 🧠 Tambah item
  const addItem = (item) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => {
        if (item.tipe === "produk" && i.tipe === "produk") {
          return i.id_produk === item.id_produk;
        }
        if (item.tipe === "service" && i.tipe === "service") {
          return (
            i.id_pricelist === item.id_pricelist &&
            i.id_capster === item.id_capster
          );
        }
        return false;
      });

      if (existingIndex !== -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newJumlah =
          Number(existing.jumlah || 1) + Number(item.jumlah || 1);
        const newTotal = newJumlah * Number(existing.harga);
        updated[existingIndex] = {
          ...existing,
          jumlah: newJumlah,
          total: newTotal,
        };
        return updated;
      }
      return [...prev, item];
    });
  };

  // 🟢 Simpan transaksi
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tipeTransaksi) return alert("Pilih tipe transaksi terlebih dahulu!");
    if (items.length === 0) return alert("Belum ada item yang ditambahkan!");

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
      alert(`✅ Transaksi berhasil!\nNomor Struk: ${noStruk}`);
      window.open(`${API_URL}/struk/print/${result.id}`, "_blank");
      setItems([]);
      setSubtotal(0);
      setJumlahBayar(0);
      setNoStruk(generateNomorStruk());
      setTipeTransaksi(null);
    } else {
      alert(result.message || "Gagal menyimpan transaksi");
    }
  };

  return (
    <MainLayout current="transaksi">
      <h1 className="text-2xl font-semibold text-slate-800 mb-4">
        Tambah Transaksi
      </h1>

      {/* === PILIH TIPE TRANSAKSI === */}
      <div>
        <h2 className="font-semibold mb-3 text-gray-700">Pilih Jenis</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: "service", icon: <Scissors />, label: "Layanan" },
            { key: "produk", icon: <Package />, label: "Produk" },
            { key: "campuran", icon: <Layers />, label: "Campuran" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                if (tipeTransaksi !== t.key) {
                  setTipeTransaksi(t.key);
                  setItems([]);
                  setSubtotal(0);
                  setJumlahBayar(0);
                }
              }}
              className={`flex flex-col items-center p-5 rounded-xl border transition-all shadow-sm ${
                tipeTransaksi === t.key
                  ? "bg-blue-600 text-white border-blue-700 scale-[1.03]"
                  : "bg-white hover:bg-blue-50 border-gray-300"
              }`}
            >
              {t.icon}
              <span className="mt-2 font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* === PILIH ITEM === */}
      {tipeTransaksi && (
        <div className="bg-white p-5 border rounded-xl shadow-sm mt-5">
          {tipeTransaksi !== "produk" && (
            <ServiceGrid
              capsters={capsters}
              services={services}
              onAdd={addItem}
            />
          )}
          {tipeTransaksi !== "service" && (
            <ProdukGrid produk={produk} onAdd={addItem} />
          )}
        </div>
      )}

      {/* === DAFTAR ITEM === */}
      {items.length > 0 && (
        <ItemTable
          items={items}
          showConfirm={showConfirm}
          setShowConfirm={setShowConfirm}
          setItems={setItems}
        />
      )}

      {/* === PEMBAYARAN === */}
      {items.length > 0 && (
        <div className="bg-white p-5 border rounded-xl shadow-sm space-y-4 mt-5">
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
                type="button"
                onClick={() => setMetode(m)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  metode === m
                    ? "bg-green-600 text-white border-green-700"
                    : "bg-gray-100 hover:bg-green-50"
                }`}
              >
                <CreditCard />
                {m.toUpperCase()}
              </button>
            ))}
          </div>

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
              const cleanValue = numericValue.replace(/^0+/, "");
              setJumlahBayar(Number(cleanValue || 0));
            }}
            className="border rounded-lg px-4 py-2 w-full text-right font-medium tracking-wide"
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all"
          >
            Simpan & Cetak Struk
          </button>
        </div>
      )}
    </MainLayout>
  );
}

/* === GRID LAYANAN === */
function ServiceGrid({ services, capsters, onAdd }) {
  const [selectedCapster, setCapster] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  return (
    <div className="relative">
      <h4 className="font-medium text-gray-700 mb-2">Pilih Capster</h4>
      <div className="flex flex-wrap gap-2 mb-4">
        {capsters.map((c) => (
          <button
            key={c.id_capster}
            onClick={() => {
              setCapster(c.id_capster);
              setShowWarning(false);
            }}
            className={`px-3 py-2 rounded-lg border text-sm transition-all ${
              selectedCapster === c.id_capster
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-gray-100 hover:bg-blue-50"
            }`}
          >
            {c.nama_capster}
          </button>
        ))}
      </div>

      {showWarning && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg animate-pulse">
          Silakan pilih capster terlebih dahulu sebelum menambah layanan.
        </div>
      )}

      <h3 className="font-medium text-gray-700 mb-3">Pilih Layanan</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {services.map((s) => (
          <button
            key={s.id_pricelist}
            onClick={() => {
              if (!selectedCapster) return setShowWarning(true);
              onAdd({
                tipe: "service",
                id_pricelist: s.id_pricelist,
                id_capster: selectedCapster,
                nama: s.service,
                harga: Number(s.harga),
                total: Number(s.harga),
              });
            }}
            className="border rounded-lg p-3 hover:bg-blue-50 transition-all flex flex-col items-center"
          >
            <Scissors className="text-blue-600" />
            <p className="font-semibold text-center">{s.service}</p>
            <span className="text-gray-600 text-sm">
              {formatRupiah(s.harga)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* === GRID PRODUK === */
function ProdukGrid({ produk, onAdd }) {
  return (
    <div>
      <h3 className="font-medium text-gray-700 mb-3">Pilih Produk</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {produk.map((p) => (
          <button
            key={p.id_produk}
            onClick={() =>
              onAdd({
                tipe: "produk",
                id_produk: p.id_produk,
                nama: p.nama_produk,
                harga_awal: Number(p.harga_awal), // ✅ kirim harga modal
                harga_jual: Number(p.harga_jual), // ✅ kirim harga jual
                harga: Number(p.harga_jual),
                jumlah: 1,
                total: Number(p.harga_jual),
              })
            }
            className="border rounded-lg p-3 hover:bg-green-50 transition-all flex flex-col items-center"
          >
            <Package className="text-green-600" />
            <p className="font-semibold">{p.nama_produk}</p>
            <span className="text-gray-600 text-sm">
              {formatRupiah(p.harga_jual)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* === TABEL ITEM === */
function ItemTable({ items, setItems, showConfirm, setShowConfirm }) {
  return (
    <div className="bg-white p-5 border rounded-xl shadow-sm mt-5">
      <h2 className="font-semibold mb-2 text-gray-700">Daftar Item</h2>
      <table className="min-w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border text-left">Nama</th>
            <th className="p-2 border text-right">Harga</th>
            <th className="p-2 border text-center">Jumlah</th>
            <th className="p-2 border text-right">Total</th>
            <th className="p-2 border text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i, idx) => (
            <tr key={idx}>
              <td className="p-2 border">{i.nama}</td>
              <td className="p-2 border text-right">{formatRupiah(i.harga)}</td>
              <td className="p-2 border text-center">{i.jumlah || 1}</td>
              <td className="p-2 border text-right font-medium">
                {formatRupiah(i.total)}
              </td>
              <td className="p-2 border text-center">
                <button
                  onClick={() => setShowConfirm({ visible: true, index: idx })}
                  className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition"
                  title="Hapus item"
                >
                  <Trash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔺 Modal Konfirmasi */}
      {showConfirm.visible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Konfirmasi Hapus
              </h3>
              <button
                onClick={() => setShowConfirm({ visible: false, index: null })}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={20} />
              </button>
            </div>

            <p className="text-gray-600 text-sm">
              Yakin ingin menghapus{" "}
              <span className="font-semibold text-red-600">
                {items[showConfirm.index]?.nama}
              </span>{" "}
              dari daftar transaksi?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirm({ visible: false, index: null })}
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setItems((prev) =>
                    prev.filter((_, i) => i !== showConfirm.index)
                  );
                  setShowConfirm({ visible: false, index: null });
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
