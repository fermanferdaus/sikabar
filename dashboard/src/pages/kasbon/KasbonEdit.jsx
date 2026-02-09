import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchKasbon from "../../hooks/useFetchKasbon";
import formatRupiah from "../../utils/formatRupiah";

export default function KasbonEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getKasbonById, updateKasbon } = useFetchKasbon();

  const [kasbon, setKasbon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // 🔹 Format angka dari "Rp 10.000" → 10000
  const parseRupiah = (val) => Number(String(val).replace(/[^\d]/g, "")) || 0;

  // ======================================================
  // 🔹 Ambil data kasbon berdasarkan ID
  // ======================================================
  useEffect(() => {
    const loadKasbon = async () => {
      setLoading(true);

      const res = await getKasbonById(id);

      if (res.success) {
        const d = res.data;
        setKasbon({
          ...d,
          jumlah_total_formatted: formatRupiah(d.jumlah_total),
          sisa_kasbon_formatted: formatRupiah(d.sisa_kasbon),
        });
      } else {
        setErrorMsg(res.message);
      }

      setLoading(false);
    };

    loadKasbon();
  }, [id]);

  // ======================================================
  // 🔹 Input Handler
  // ======================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setKasbon((prev) => ({ ...prev, [name]: value }));
  };

  const handleTotalKasbonChange = (e) => {
    const raw = e.target.value;
    const numericValue = parseRupiah(raw);
    setKasbon((prev) => ({
      ...prev,
      jumlah_total: numericValue,
      jumlah_total_formatted: formatRupiah(numericValue),
    }));
  };

  const handleRupiahChange = (e) => {
    const raw = e.target.value;
    const numericValue = parseRupiah(raw);
    setKasbon((prev) => ({
      ...prev,
      sisa_kasbon: numericValue,
      sisa_kasbon_formatted: formatRupiah(numericValue),
    }));
  };

  // ======================================================
  // 🔹 Submit Update Kasbon
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!kasbon.sisa_kasbon || kasbon.cicilan_terbayar === "") {
      setErrorMsg("Sisa kasbon dan cicilan terbayar wajib diisi!");
      return;
    }

    setLoadingSubmit(true);

    const payload = {
      jumlah_total: kasbon.jumlah_total,
      sisa_kasbon: kasbon.sisa_kasbon,
      cicilan_terbayar: Number(kasbon.cicilan_terbayar),
      status: kasbon.status,
      keterangan: kasbon.keterangan,
    };

    const res = await updateKasbon(id, payload);

    if (res.success) {
      localStorage.setItem(
        "kasbonMessage",
        JSON.stringify({
          type: "success",
          text: "Kasbon berhasil diperbarui!",
        }),
      );
      navigate("/kasbon");
    } else {
      setErrorMsg(res.message || "Gagal memperbarui kasbon");
    }

    setLoadingSubmit(false);
  };

  // ======================================================
  // 🔹 Loading & Error View
  // ======================================================
  if (loading)
    return (
      <MainLayout current="Kasbon">
        <p className="text-gray-500 italic p-6">Memuat data kasbon...</p>
      </MainLayout>
    );

  if (!kasbon)
    return (
      <MainLayout current="Kasbon">
        <p className="text-red-500 font-medium p-6">
          Kasbon tidak ditemukan atau gagal dimuat.
        </p>
      </MainLayout>
    );

  // ======================================================
  // 🔹 RENDER FORM
  // ======================================================
  return (
    <MainLayout current="Kasbon">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 w-full">
        {/* Header */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Edit Kasbon</h1>
          <p className="text-sm text-gray-500 mt-1">
            Perbarui data kasbon capster atau kasir.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* ============================
              KOLOM KIRI
          ============================ */}
          <div className="space-y-6">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Penerima
              </label>
              <input
                type="text"
                value={
                  kasbon.id_capster
                    ? kasbon.nama_capster
                    : kasbon.id_kasir
                      ? kasbon.nama_kasir
                      : "-"
                }
                disabled
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Store */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cabang
              </label>
              <input
                type="text"
                value={kasbon.nama_store || "-"}
                disabled
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* ============================
              KOLOM KANAN
          ============================ */}
          <div className="space-y-6">
            {/* Sisa Kasbon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sisa Kasbon
              </label>
              <input
                type="text"
                value={kasbon.sisa_kasbon_formatted || ""}
                disabled
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Cicilan Terbayar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cicilan Terbayar
              </label>
              <input
                type="number"
                name="cicilan_terbayar"
                value={kasbon.cicilan_terbayar ?? ""}
                disabled
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {/* Total Kasbon */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Kasbon
              </label>
              <input
                type="text"
                value={kasbon.jumlah_total_formatted || ""}
                disabled
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Keterangan */}
            <div>
              <label
                htmlFor="keterangan"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Keterangan
              </label>
              <textarea
                id="keterangan"
                name="keterangan"
                value={kasbon.keterangan || ""}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 resize-none"
              />
            </div>
          </div>

          {/* ============================
              TOMBOL
          ============================ */}
          <div className="lg:col-span-2 flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              disabled={loadingSubmit}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loadingSubmit}
              className={`px-6 py-2.5 rounded-lg font-medium text-white ${
                loadingSubmit
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#0e57b5] hover:bg-[#0b4894]"
              }`}
            >
              {loadingSubmit ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
