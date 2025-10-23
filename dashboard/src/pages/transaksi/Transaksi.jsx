import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import useFetchService from "../../hooks/useFetchService";
import useFetchProduk from "../../hooks/useFetchProduk";
import useFetchCapsterByStore from "../../hooks/useFetchCapsterByStore";
import { Scissors, Package, Layers, CreditCard, Trash } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

/* === Helper === */
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

/* =====================================================
   🔹 KOMPONEN UTAMA
===================================================== */
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

  /* === Hitung subtotal === */
  useEffect(() => {
    const total = items.reduce(
      (sum, i) => sum + Number(i.harga || 0) * Number(i.jumlah || 1),
      0
    );
    setSubtotal(total);
  }, [items]);

  /* === Tambah Item === */
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
        const existing = updated[existingIndex];
        const newJumlah =
          Number(existing.jumlah || 1) + Number(item.jumlah || 1);
        updated[existingIndex] = {
          ...existing,
          jumlah: newJumlah,
          total: newJumlah * Number(existing.harga),
        };
        return updated;
      }
      return [...prev, item];
    });
  };

  /* === Submit transaksi === */
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
      {(searchTerm) => {
        // Search global: capster, produk, layanan
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
          <div className="space-y-8">
            {/* === HEADER === */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h1 className="text-xl font-semibold text-slate-800 mb-2">
                Tambah Transaksi
              </h1>
              <p className="text-gray-500 text-sm">
                Pilih jenis transaksi, tambahkan item, lalu simpan dan cetak
                struk.
              </p>
            </div>

            {/* === PILIH JENIS TRANSAKSI === */}
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
                        : "bg-gray-50 hover:bg-blue-50 border-gray-200 text-gray-700"
                    }`}
                  >
                    {t.icon}
                    <span className="mt-2 font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* === GRID ITEM === */}
            {tipeTransaksi && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-10">
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

            {/* === DAFTAR ITEM === */}
            {items.length > 0 && (
              <ItemTable
                items={items}
                setItems={setItems}
                showConfirm={showConfirm}
                setShowConfirm={setShowConfirm}
              />
            )}

            {/* === PEMBAYARAN === */}
            {items.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-700">Subtotal</h3>
                  <span className="font-bold text-blue-600 text-lg">
                    {formatRupiah(subtotal)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {["cash", "qris"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMetode(m)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                        metode === m
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          : "bg-gray-100 hover:bg-blue-50 text-gray-700"
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
                  disabled={jumlahBayar < subtotal}
                  className={`w-full font-medium py-3 rounded-lg transition-all ${
                    jumlahBayar < subtotal
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  }`}
                >
                  Simpan & Cetak Struk
                </button>
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

  return (
    <div className="space-y-8">
      {/* === CAPSTER === */}
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCapster === c.id_capster
                  ? "bg-blue-600 text-white"
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

      {/* === LAYANAN === */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Pilih Layanan</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md hover:-translate-y-1 transition"
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
  return (
    <div>
      <h4 className="font-semibold text-gray-700 mb-3">Pilih Produk</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {produk.map((p) => (
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
            className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md hover:-translate-y-1 transition"
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
   🔹 ITEM TABLE (CLEAN STYLE)
===================================================== */
function ItemTable({ items, setItems, showConfirm, setShowConfirm }) {
  const confirmDelete = () => {
    setItems((prev) => prev.filter((_, i) => i !== showConfirm.index));
    setShowConfirm({ visible: false, index: null });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      <h3 className="font-semibold text-gray-700 mb-4">Daftar Item</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-3 text-left font-semibold">No</th>
              <th className="p-3 text-left font-semibold">Nama</th>
              <th className="p-3 text-right font-semibold">Harga</th>
              <th className="p-3 text-center font-semibold">Jumlah</th>
              <th className="p-3 text-right font-semibold">Total</th>
              <th className="p-3 text-center font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-gray-500 p-4 italic"
                >
                  Tidak ada item ditambahkan
                </td>
              </tr>
            ) : (
              items.map((i, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-3 text-gray-700">{idx + 1}</td>
                  <td className="p-3 text-gray-700">{i.nama}</td>
                  <td className="p-3 text-right text-gray-700">
                    {formatRupiah(i.harga)}
                  </td>
                  <td className="p-3 text-center text-gray-700">
                    {i.jumlah || 1}
                  </td>
                  <td className="p-3 text-right font-medium text-gray-800">
                    {formatRupiah(i.total)}
                  </td>
                  <td className="p-3 text-center">
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
      </div>

      <ConfirmModal
        open={showConfirm.visible}
        onClose={() => setShowConfirm({ visible: false, index: null })}
        onConfirm={confirmDelete}
        message={
          showConfirm.visible
            ? `Hapus item "${items[showConfirm.index]?.nama}" dari daftar?`
            : "Apakah Anda yakin ingin menghapus item ini?"
        }
      />
    </div>
  );
}
