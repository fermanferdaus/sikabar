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
import QrisPopup from "../../components/transaksi/QrisPopup";

export default function Transaksi() {
  const [tipeTransaksi, setTipeTransaksi] = useState(null);
  const [metode, setMetode] = useState("cash");
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [jumlahBayar, setJumlahBayar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [buktiQris, setBuktiQris] = useState(null);
  const [uploadPopup, setUploadPopup] = useState({ show: false, id: null });
  const [showUploadPicker, setShowUploadPicker] = useState(false);

  const [popup, setPopup] = useState({
    visible: false,
    type: "success",
    message: "",
  });

  const [qrisPopup, setQrisPopup] = useState({
    open: false,
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const id_store = localStorage.getItem("id_store");
  const id_user = localStorage.getItem("id_user");

  const { services } = useFetchService();
  const { produk } = useFetchProduk(id_store);
  const { capsters } = useFetchCapsterByStore(id_store);

  const resetForm = () => {
    setTipeTransaksi(null);
    setItems([]);
    setSubtotal(0);
    setJumlahBayar(0);
    setMetode("cash");
    setBuktiQris(null);
  };

  // SIMPAN TRANSAKSI
  const saveTransaction = async () => {
    const body = {
      id_store,
      id_user,
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

      setPopup({
        visible: true,
        type: "success",
        message: `Transaksi berhasil! No Struk: ${result.nomor_struk}`,
      });

      return result.id;
    }
  };

  // UPLOAD BUKTI
  const uploadBuktiQris = async (id_transaksi) => {
    if (!buktiQris) return;

    const formData = new FormData();
    formData.append("bukti", buktiQris);
    formData.append("id_transaksi", id_transaksi);

    await fetch(`${API_URL}/transaksi/upload-bukti`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  };

  useEffect(() => {
    const total = items.reduce(
      (sum, i) => sum + Number(i.harga || 0) * Number(i.jumlah || 1),
      0,
    );
    setSubtotal(total);
  }, [items]);

  useEffect(() => {
    if (metode === "qris") {
      setJumlahBayar(subtotal);
    } else {
      setJumlahBayar(0);
    }
  }, [metode, subtotal]);

  useEffect(() => {
    if (!qrisPopup.open) return;
    setTimeLeft(300);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCancelQris();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrisPopup.open]);

  const addItem = (item) => {
    setItems((prev) => {
      // PRODUK boleh digabung
      if (item.tipe === "produk") {
        const idx = prev.findIndex(
          (i) => i.tipe === "produk" && i.id_produk === item.id_produk,
        );

        if (idx !== -1) {
          return prev.map((i, index) =>
            index === idx
              ? {
                  ...i,
                  jumlah: i.jumlah + 1,
                  total: (i.jumlah + 1) * i.harga,
                }
              : i,
          );
        }
      }

      // SERVICE selalu item baru
      return [...prev, { ...item, jumlah: 1, total: item.harga }];
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

  const handleQrisSelesai = async () => {
    setQrisPopup({ open: false });

    const trxId = await saveTransaction();

    if (trxId) {
      setUploadPopup({ show: true, id: trxId });
    }

    resetForm();
  };

  const handleQrisBatal = () => {
    setQrisPopup({ open: false });
    setLoading(false);
  };

  // HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!tipeTransaksi)
      return setPopup({
        visible: true,
        type: "error",
        message: "Pilih tipe transaksi!",
      });

    if (items.length === 0)
      return setPopup({
        visible: true,
        type: "error",
        message: "Belum ada item!",
      });

    try {
      setLoading(true);

      // QRIS
      if (metode === "qris") {
        setQrisPopup({ open: true });
        setLoading(false);
        return;
      }

      // CASH
      await saveTransaction();
      resetForm();
    } catch {
      setPopup({
        visible: true,
        type: "error",
        message: "Kesalahan jaringan/server",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout current="transaksi">
      {(searchTerm) => {
        const capsterFiltered = capsters.filter((c) =>
          c.nama_capster.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        const produkFiltered = produk.filter((p) =>
          p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        const serviceFiltered = services.filter((s) =>
          s.service.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-2 lg:h-[calc(100vh-190px)] overflow-x-hidden">
              <div className="space-y-6 lg:h-full lg:overflow-y-auto hide-scrollbar lg:pr-2">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 md:p-4 lg:p-4 xl:p-5">
                  <h2 className="font-semibold text-gray-700 mb-3 text-sm md:text-base">
                    Pilih Jenis Transaksi
                  </h2>

                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {[
                      {
                        key: "service",
                        icon: <Scissors size={18} />,
                        label: "Layanan",
                      },
                      {
                        key: "produk",
                        icon: <Package size={18} />,
                        label: "Produk",
                      },
                      {
                        key: "campuran",
                        icon: <Layers size={18} />,
                        label: "Campuran",
                      },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => handleChangeTipe(t.key)}
                        className={`flex flex-col items-center justify-center p-2.5 md:p-3 lg:p-3 rounded-lg text-xs md:text-sm border font-medium transition-all ${
                          tipeTransaksi === t.key
                            ? "bg-[#0e57b5] text-white border-blue-700 scale-[1.02]"
                            : "bg-gray-50 hover:bg-blue-50 border-gray-200 text-gray-700"
                        }`}
                      >
                        {t.icon}
                        <span className="mt-1">{t.label}</span>
                      </button>
                    ))}
                  </div>

                  {tipeTransaksi && (
                    <div className="mt-5 space-y-8">
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
              </div>

              <div className="lg:sticky lg:top-0 self-start flex flex-col gap-3 hide-scrollbar">
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

            {/* POPUP SUCCESS */}
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

            {uploadPopup.show && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white w-[380px] p-5 rounded-xl space-y-4 text-center">
                  <h3 className="font-semibold text-gray-700 text-lg">
                    Upload Bukti Pembayaran QRIS
                  </h3>

                  {/* UPLOAD BOX */}
                  <div
                    onClick={() => setShowUploadPicker(true)}
                    className={`cursor-pointer border-2 border-dashed rounded-lg flex items-center justify-center w-full transition-all duration-200 ${
                      buktiQris ? "h-54" : "h-22"
                    } border-gray-300 hover:bg-gray-50`}
                  >
                    {buktiQris ? (
                      <img
                        src={URL.createObjectURL(buktiQris)}
                        alt="preview"
                        className="max-w-full max-h-full object-contain rounded-md"
                      />
                    ) : (
                      <span className="text-gray-500 text-xs">
                        Klik untuk upload bukti
                      </span>
                    )}
                  </div>

                  {showUploadPicker && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
                      <div className="bg-white rounded-xl p-5 w-72 shadow-lg">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">
                          Pilih sumber upload
                        </h3>

                        <div className="flex flex-col gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowUploadPicker(false);
                              document
                                .getElementById("qrisCameraInput")
                                .click();
                            }}
                            className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                          >
                            Kamera
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowUploadPicker(false);
                              document
                                .getElementById("qrisGalleryInput")
                                .click();
                            }}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 font-medium hover:bg-gray-50"
                          >
                            Galeri
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowUploadPicker(false)}
                            className="text-sm text-gray-500 hover:underline"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <input
                    id="qrisCameraInput"
                    type="file"
                    accept="image/*"
                    capture
                    className="hidden"
                    onChange={(e) => setBuktiQris(e.target.files[0])}
                  />

                  <input
                    id="qrisGalleryInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setBuktiQris(e.target.files[0])}
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        await uploadBuktiQris(uploadPopup.id);
                        resetForm();
                        setUploadPopup({ show: false, id: null });
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                    >
                      Simpan
                    </button>

                    <button
                      onClick={() => {
                        resetForm();
                        setUploadPopup({ show: false, id: null });
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg"
                    >
                      Lewati
                    </button>
                  </div>
                </div>
              </div>
            )}

            <QrisPopup
              open={qrisPopup.open}
              amount={subtotal}
              onCancel={handleQrisBatal}
              onFinish={handleQrisSelesai}
            />
          </div>
        );
      }}
    </MainLayout>
  );
}
