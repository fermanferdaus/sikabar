import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useProfil from "../../hooks/useProfil";

export default function ProfilEdit() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const { profil, loading, error, updateProfil, updateLogo } = useProfil();

  const [formData, setFormData] = useState({
    nama_barbershop: "",
    nama_owner: "",
    telepon: "",
    instagram: "",
    tiktok: "",
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (role !== "admin") navigate("/profil");

    if (profil) {
      setFormData({
        nama_barbershop: profil.nama_barbershop || "",
        nama_owner: profil.nama_owner || "",
        telepon: profil.telepon || "",
        instagram: profil.instagram || "",
        tiktok: profil.tiktok || "",
      });

      setLogoPreview(profil.logo_url);
    }
  }, [profil, role, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res1 = await updateProfil(formData);
      if (!res1.success) {
        setAlert({ type: "error", text: res1.message });
        return;
      }

      if (logoFile) {
        const res2 = await updateLogo(logoFile);
        if (!res2.success) {
          setAlert({ type: "error", text: res2.message });
          return;
        }
      }

      localStorage.setItem(
        "profilMessage",
        JSON.stringify({
          type: "success",
          text: "Profil berhasil diperbarui!",
        }),
      );

      navigate("/profil");
    } catch {
      localStorage.setItem(
        "profilMessage",
        JSON.stringify({
          type: "error",
          text: "Terjadi kesalahan saat memperbarui profil.",
        }),
      );

      navigate("/profil");
    }
  };

  if (error)
    return (
      <MainLayout current="profil">
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10">
          <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm font-medium">
            {error}
          </p>
          <div className="text-right mt-4">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              Kembali
            </button>
          </div>
        </div>
      </MainLayout>
    );

  return (
    <MainLayout current="profil">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300 w-full">
        {/* HEADER */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Edit Profil</h1>
          <p className="text-sm text-gray-500 mt-1">
            Perbarui data barbershop dan informasi media sosial.
          </p>
        </div>

        {/* ALERT */}
        {alert && (
          <div
            className={`px-4 py-3 rounded-lg text-sm font-medium border mb-4 ${
              alert.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {alert.text}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* LOGO UPLOAD (DRAG & DROP STYLE) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo Barbershop
            </label>

            <div
              className="
                w-full border-2 border-dashed border-gray-300
                hover:border-blue-500 transition
                rounded-xl p-6 bg-gray-50
                flex flex-col items-center justify-center gap-4
                cursor-pointer
                "
              onClick={() => document.getElementById("logoInput").click()}
            >
              {/* Preview jika ada */}
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="w-40 h-40 object-contain rounded-xl shadow-sm bg-white"
                />
              ) : (
                <div className="text-center flex flex-col items-center gap-2">
                  <div className="w-20 h-20 bg-white rounded-xl border-b border-gray-100 flex items-center justify-center shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5-5m0 0l5 5m-5-5v12"
                      />
                    </svg>
                  </div>

                  <p className="text-gray-600 font-medium">Upload logo</p>
                  <p className="text-xs text-gray-400">
                    PNG / JPG • Maksimal 5MB • Rekomendasi 400×400px
                  </p>
                </div>
              )}

              {/* Hidden input */}
              <input
                id="logoInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
          </div>

          {/* ROW 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Barbershop
              </label>
              <input
                type="text"
                name="nama_barbershop"
                value={formData.nama_barbershop}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nama barbershop"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Owner
              </label>
              <input
                type="text"
                name="nama_owner"
                value={formData.nama_owner}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                placeholder="Masukkan nama owner"
              />
            </div>
          </div>

          {/* ROW 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon
              </label>
              <input
                type="text"
                name="telepon"
                value={formData.telepon}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500"
                placeholder="0812xxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500"
                placeholder="@namaakun"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiktok
            </label>
            <input
              type="text"
              name="tiktok"
              value={formData.tiktok}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500"
              placeholder="@namaakun"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg font-medium text-white bg-[#0e57b5] hover:bg-[#0b4894] transition"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
