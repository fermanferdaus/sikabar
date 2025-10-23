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
  Search,
} from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

const formatRupiah = (angka) =>
  "Rp" + Number(angka || 0).toLocaleString("id-ID");

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

  useEffect(() => {
    const total = items.reduce(
      (sum, i) => sum + Number(i.harga || 0) * Number(i.jumlah || 1),
      0
    );
    setSubtotal(total);
  }, [items]);

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

      {/* === PILIH JENIS TRANSAKSI === */}
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
        <div className="bg-white p-5 border rounded-xl shadow-sm mt-5 space-y-8">
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
                const cleanValue = numericValue.replace(/^0+/, "");
                setJumlahBayar(Number(cleanValue || 0));
              }}
              className="border rounded-lg px-4 py-2 w-full text-right font-medium tracking-wide"
            />
          </div>

          {jumlahBayar > 0 && (
            <div className="text-right mt-2">
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
            disabled={jumlahBayar < subtotal}
            className={`w-full font-medium py-3 rounded-lg transition-all ${
              jumlahBayar < subtotal
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
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
  const [searchCapster, setSearchCapster] = useState("");
  const [searchService, setSearchService] = useState("");

  const filteredCapster = capsters.filter((c) =>
    c.nama_capster.toLowerCase().includes(searchCapster.toLowerCase())
  );
  const filteredService = services.filter((s) =>
    s.service.toLowerCase().includes(searchService.toLowerCase())
  );

  return (
    <div className="relative space-y-6">
      {/* CAPSTER */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-gray-700">Pilih Capster</h4>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari capster..."
              value={searchCapster}
              onChange={(e) => setSearchCapster(e.target.value)}
              className="border pl-8 pr-2 py-1 rounded-lg text-sm w-48 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {filteredCapster.map((c) => (
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
      </div>

      {showWarning && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg animate-pulse">
          Silakan pilih capster terlebih dahulu sebelum menambah layanan.
        </div>
      )}

      {/* LAYANAN */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-700">Pilih Layanan</h3>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari layanan..."
              value={searchService}
              onChange={(e) => setSearchService(e.target.value)}
              className="border pl-8 pr-2 py-1 rounded-lg text-sm w-48 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredService.map((s) => (
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
    </div>
  );
}

/* === GRID PRODUK === */
function ProdukGrid({ produk, onAdd }) {
  const [searchProduk, setSearchProduk] = useState("");
  const filteredProduk = produk.filter((p) =>
    p.nama_produk.toLowerCase().includes(searchProduk.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-700">Pilih Produk</h3>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchProduk}
            onChange={(e) => setSearchProduk(e.target.value)}
            className="border pl-8 pr-2 py-1 rounded-lg text-sm w-48 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredProduk.map((p) => (
          <button
            key={p.id_produk}
            onClick={() =>
              onAdd({
                tipe: "produk",
                id_produk: p.id_produk,
                nama: p.nama_produk,
                harga_awal: Number(p.harga_awal),
                harga_jual: Number(p.harga_jual),
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
  const [searchItem, setSearchItem] = useState("");
  const filteredItems = items.filter((i) =>
    i.nama.toLowerCase().includes(searchItem.toLowerCase())
  );

  const confirmDelete = () => {
    setItems((prev) => prev.filter((_, i) => i !== showConfirm.index));
    setShowConfirm({ visible: false, index: null });
  };

  return (
    <div className="bg-white p-5 border rounded-xl shadow-sm mt-5">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-gray-700">Daftar Item</h2>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari item..."
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
            className="border pl-8 pr-2 py-1 rounded-lg text-sm w-56 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

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
          {filteredItems.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-500 italic">
                Tidak ada item yang cocok.
              </td>
            </tr>
          ) : (
            filteredItems.map((i, idx) => (
              <tr key={idx}>
                <td className="p-2 border">{i.nama}</td>
                <td className="p-2 border text-right">
                  {formatRupiah(i.harga)}
                </td>
                <td className="p-2 border text-center">{i.jumlah || 1}</td>
                <td className="p-2 border text-right font-medium">
                  {formatRupiah(i.total)}
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() =>
                      setShowConfirm({ visible: true, index: idx })
                    }
                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition"
                    title="Hapus item"
                  >
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ConfirmModal
        open={showConfirm.visible}
        onClose={() => setShowConfirm({ visible: false, index: null })}
        onConfirm={confirmDelete}
        message={
          showConfirm.visible
            ? `Apakah Anda yakin ingin menghapus item "${
                items[showConfirm.index]?.nama
              }" dari daftar transaksi?`
            : "Apakah Anda yakin ingin menghapus item ini?"
        }
      />
    </div>
  );
}
