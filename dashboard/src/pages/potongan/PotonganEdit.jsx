import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchPotongan from "../../hooks/useFetchPotongan";
import useFetchKasbon from "../../hooks/useFetchKasbon";

export default function PotonganEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { getPotonganById, updatePotongan } = useFetchPotongan();
  const { fetchCapstersAndKasirs } = useFetchKasbon();

  const [pegawaiList, setPegawaiList] = useState([]);
  const [form, setForm] = useState({
    id_potongan: "",
    id_capster: null,
    id_kasir: null,
    jumlah_potongan: 0,
    jumlahFormatted: "",
    keterangan: "",
    tanggal_potong: "",
  });

  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  /* ========================================================
     🔹 LOAD DATA CAPSTER + KASIR + DETAIL POTONGAN
  ======================================================== */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Ambil data pegawai
      const { capsters, kasirs } = await fetchCapstersAndKasirs();

      const allPegawai = [
        ...capsters.map((c) => ({
          id: c.id_capster,
          nama: c.nama_capster,
          store: c.nama_store,
          tipe: "capster",
        })),
        ...kasirs.map((k) => ({
          id: k.id_kasir,
          nama: k.nama_kasir,
          store: k.nama_store,
          tipe: "kasir",
        })),
      ];

      setPegawaiList(allPegawai);

      // Ambil data potongan
      const data = await getPotonganById(id);
      if (data) {
        const dateOnly = data.tanggal_potong?.slice(0, 10) || "";

        setForm({
          id_potongan: data.id_potongan,
          id_capster: data.id_capster,
          id_kasir: data.id_kasir,
          jumlah_potongan: Number(data.jumlah_potongan),
          jumlahFormatted: `Rp ${Number(data.jumlah_potongan).toLocaleString(
            "id-ID"
          )}`,
          keterangan: data.keterangan,
          tanggal_potong: dateOnly,
        });
      }

      setLoading(false);
    };

    loadData();
  }, [id]);

  /* ========================================================
     💰 Format rupiah
  ======================================================== */
  const handleJumlahChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const numeric = raw ? parseInt(raw, 10) : 0;

    setForm({
      ...form,
      jumlah_potongan: numeric,
      jumlahFormatted: numeric ? `Rp ${numeric.toLocaleString("id-ID")}` : "",
    });
  };

  /* ========================================================
     💾 Submit Update
  ======================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.jumlah_potongan || !form.keterangan) {
      setErrorMsg("Semua kolom wajib diisi!");
      return;
    }

    setLoadingSubmit(true);

    const payload = {
      jumlah_potongan: form.jumlah_potongan,
      keterangan: form.keterangan,
      tanggal_potong: form.tanggal_potong,
    };

    const res = await updatePotongan(id, payload);

    if (res.success) {
      localStorage.setItem(
        "potonganMessage",
        JSON.stringify({
          type: "success",
          text: "Potongan berhasil diperbarui!",
        })
      );
      navigate("/potongan");
    } else {
      setErrorMsg(res.message || "Gagal memperbarui potongan.");
    }

    setLoadingSubmit(false);
  };

  /* ========================================================
     Cari data pegawai terkait
  ======================================================== */
  const pegawai =
    pegawaiList.find(
      (p) => p.id === form.id_capster || p.id === form.id_kasir
    ) || {};

  return (
    <MainLayout current="Potongan">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 w-full">

        {/* Header */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Edit Potongan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ubah data potongan pegawai.
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <p className="text-gray-500 italic mb-6">Memuat data...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ================================================= */}
            {/*         🧑‍💼 NAMA PEGAWAI & CABANG             */}
            {/* ================================================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Nama Pegawai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pegawai
                </label>
                <input
                  type="text"
                  value={pegawai.nama || "-"}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-100 text-gray-600"
                  disabled
                />
              </div>

              {/* Cabang */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cabang
                </label>
                <input
                  type="text"
                  value={pegawai.store || "-"}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-100 text-gray-600"
                  disabled
                />
              </div>

            </div>

            {/* ================================================= */}
            {/*              JUMLAH & TANGGAL                    */}
            {/* ================================================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Jumlah */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Potongan (Rp)
                </label>
                <input
                  type="text"
                  value={form.jumlahFormatted}
                  onChange={handleJumlahChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Potong
                </label>
                <input
                  type="date"
                  value={form.tanggal_potong}
                  onChange={(e) =>
                    setForm({ ...form, tanggal_potong: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keterangan
              </label>
              <textarea
                value={form.keterangan}
                onChange={(e) =>
                  setForm({ ...form, keterangan: e.target.value })
                }
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                required
              />
            </div>

            {/* Tombol */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loadingSubmit}
                className={`px-6 py-2.5 rounded-lg text-white ${
                  loadingSubmit
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#0e57b5] hover:bg-[#0b4894]"
                }`}
              >
                {loadingSubmit ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
