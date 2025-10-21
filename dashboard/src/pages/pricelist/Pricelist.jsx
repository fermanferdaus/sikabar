import MainLayout from "../../layouts/MainLayout";
import useFetchPricelist from "../../hooks/useFetchPricelist";

export default function Pricelist() {
  const { data, loading, error } = useFetchPricelist();

  return (
    <MainLayout current="pricelist">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        Daftar Layanan
      </h1>

      {loading ? (
        <p className="text-gray-500">Memuat data pricelist...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="bg-white border rounded-xl p-5 shadow-sm overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100 text-gray-700 text-sm">
              <tr>
                <th className="p-3 border text-left">Layanan</th>
                <th className="p-3 border text-right">Harga</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="p-4 text-center text-gray-500 border"
                  >
                    Belum ada data layanan.
                  </td>
                </tr>
              ) : (
                data.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="p-3 border">{item.service}</td>
                    <td className="p-3 border text-right">
                      Rp {item.harga.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
}
