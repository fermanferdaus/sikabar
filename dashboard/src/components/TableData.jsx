import { useState, useEffect } from "react";

export default function TableData({
  columns = [],
  data = [],
  searchTerm = "",
  itemsPerPageOptions = [5, 10, 50, 100, 200, 500],
}) {
  const [filteredData, setFilteredData] = useState([]);
  const [perPage, setPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // 🔍 Filter data by searchTerm
  useEffect(() => {
    if (!searchTerm) setFilteredData(data);
    else {
      const lower = searchTerm.toLowerCase();
      const filtered = data.filter((row) =>
        Object.values(row).some((val) =>
          val?.toString().toLowerCase().includes(lower)
        )
      );
      setFilteredData(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, data]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / perPage);
  const paginated = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <div className="w-full">
      {/* === Header Controls === */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
        {/* 🔹 Dropdown "Tampilkan Entri" — di kiri mobile, kanan desktop */}
        <div className="flex items-center gap-2 text-sm text-gray-600 order-2 sm:order-1 justify-start sm:justify-end w-full sm:w-auto">
          <label>Tampilkan</label>
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-[#0e57b5]/30 focus:outline-none"
          >
            {itemsPerPageOptions.map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <span>Entri</span>
        </div>
      </div>

      {/* === Table === */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-700 border-collapse">
          <thead className="bg-[#f5f7fa] text-gray-700 font-semibold border-y border-gray-200">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 text-left select-none">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((row, i) => (
                <tr
                  key={i}
                  className={`${
                    i % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"
                  } hover:bg-[#eef4ff] transition-colors`}
                >
                  {columns.map((col, j) => (
                    <td key={j} className="px-4 py-3 border-t border-gray-100">
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-500 italic"
                >
                  Tidak ada data untuk ditampilkan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* === Pagination === */}
      {filteredData.length > perPage && (
        <div className="flex justify-end items-center gap-2 mt-4 text-sm text-gray-600">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className={`px-3 py-1 rounded-md border transition ${
              currentPage === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-[#0e57b5] border-gray-300 hover:bg-[#f1f5f9]"
            }`}
          >
            First
          </button>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className={`px-3 py-1 rounded-md border transition ${
              currentPage === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-[#0e57b5] border-gray-300 hover:bg-[#f1f5f9]"
            }`}
          >
            Prev
          </button>
          <span className="px-3 py-1 bg-[#0e57b5] text-white rounded-md">
            {currentPage}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className={`px-3 py-1 rounded-md border transition ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-[#0e57b5] border-gray-300 hover:bg-[#f1f5f9]"
            }`}
          >
            Next
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className={`px-3 py-1 rounded-md border transition ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-[#0e57b5] border-gray-300 hover:bg-[#f1f5f9]"
            }`}
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
}
