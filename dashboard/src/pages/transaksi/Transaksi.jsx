import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import useFetchService from "../../hooks/useFetchService";
import useFetchProduk from "../../hooks/useFetchProduk";
import useFetchCapsterByStore from "../../hooks/useFetchCapsterByStore";
import { Scissors, Package, Layers, CheckCircle2, XCircle } from "lucide-react";
import ItemCard from "../../components/transaksi/ItemCard";
import PembayaranCard from "../../components/transaksi/PembayaranCard";
import ServiceGrid from "../../components/transaksi/ServiceGrid";
import ProdukGrid from "../../components/transaksi/ProdukGrid";

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

  /* ========================== SUBTOTAL ========================== */
  useEffect(() => {
    const total = items.reduce(
      (sum, i) => sum + Number(i.harga || 0) * Number(i.jumlah || 1),
      0
    );
    setSubtotal(total);
  }, [items]);

  /* ========================== NOMOR STRUK ========================== */
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

  /* ========================== ADD ITEM (FIXED STRICT MODE) ========================== */
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
        return prev.map((i, idx) => {
          if (idx !== existingIndex) return i;
          const newJumlah = i.jumlah + 1;
          return {
            ...i,
            jumlah: newJumlah,
            total: newJumlah * i.harga,
          };
        });
      }

      return [
        ...prev,
        {
          ...item,
          jumlah: 1,
          total: item.harga,
        },
      ];
    });
  };

  /* ========================== UBAH TIPE ========================== */
  const handleChangeTipe = (newType) => {
    if (newType !== tipeTransaksi) {
      setTipeTransaksi(newType);
      setItems([]);
      setSubtotal(0);
      setJumlahBayar(0);
    }
  };

  /* ========================== SUBMIT ========================== */
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
        window.open(`${API_URL}/struk/print/${result.id}`, "_blank");

        const resNum = await fetch(`${API_URL}/struk/generate`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newNum = await resNum.json();

        setNoStruk(newNum.nomor_struk);
        setItems([]);
        setSubtotal(0);
        setJumlahBayar(0);
        setTipeTransaksi(null);

        setPopup({
          visible: true,
          type: "success",
          message: "Transaksi berhasil disimpan!",
        });
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
        message: "Kesalahan jaringan/server.",
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
            {/* HEADER */}
            {/* <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5 lg:p-6 xl:p-8">
              <h1 className="text-xl font-semibold text-slate-800 mb-1">
                Tambah Transaksi
              </h1>
              <p className="text-gray-500 text-sm">
                Pilih jenis transaksi, tambahkan item, lalu simpan dan cetak
                struk.
              </p>
            </div> */}

            {/* GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 h-[calc(100vh-190px)] pr-2">
              {/* KIRI */}
              <div className="h-full overflow-y-auto space-y-6 pr-2 min-h-[calc(100vh-190px)]">
                {/* PILIH TIPE */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5 lg:p-6 xl:p-8">
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
                        className={`flex flex-col items-center justify-center p-3 md:p-4 lg:p-5 rounded-xl text-sm md:text-base border font-medium transition-all ${
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

                {/* LIST SERVICE/PRODUK */}
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

              {/* KANAN (FIXED) */}
              <div className="space-y-6 lg:sticky lg:top-[110px] h-full">
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

            {/* POPUP */}
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
