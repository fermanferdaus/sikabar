import { useState, useEffect, useRef } from "react";

export default function TableData({
  columns = [],
  data = [],
  searchTerm = "",
  itemsPerPageOptions = [5, 10, 25, 50, 100, 200, 500],
  children,
}) {
  const [filteredData, setFilteredData] = useState([]);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const [showSortIcon, setShowSortIcon] = useState(false);
  const sortTimerRef = useRef(null);

  const sortData = (rows, key, direction) => {
    if (!key) return rows;

    return [...rows].sort((a, b) => {
      const A = a[key];
      const B = b[key];

      if (A == null) return 1;
      if (B == null) return -1;

      if (typeof A === "number" && typeof B === "number") {
        return direction === "asc" ? A - B : B - A;
      }

      return direction === "asc"
        ? A.toString().localeCompare(B.toString(), "id", {
            sensitivity: "base",
          })
        : B.toString().localeCompare(A.toString(), "id", {
            sensitivity: "base",
          });
    });
  };

  useEffect(() => {
    let temp = data;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      temp = data.filter((row) =>
        Object.values(row).some((val) =>
          val?.toString().toLowerCase().includes(lower),
        ),
      );
      setCurrentPage(1);
    }

    if (sortConfig.key) {
      temp = sortData(temp, sortConfig.key, sortConfig.direction);
    }

    setFilteredData(temp);
  }, [data, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );

    setShowSortIcon(true);

    if (sortTimerRef.current) clearTimeout(sortTimerRef.current);
    sortTimerRef.current = setTimeout(() => {
      setShowSortIcon(false);
    }, 3000);
  };

  const totalPages = Math.ceil(filteredData.length / perPage);
  const paginated = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <label>Tampilkan</label>
        <select
          value={perPage}
          onChange={(e) => {
            setPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded-md px-2 py-1"
        >
          {itemsPerPageOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span>Entri</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-700 border-collapse">
          <thead className="bg-[#f5f7fa] font-semibold border-y border-gray-200">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`px-4 py-3 text-left select-none ${
                    col.sortable === false
                      ? ""
                      : "cursor-pointer hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {showSortIcon && sortConfig.key === col.key && (
                      <span
                        className={`text-xs transition-opacity duration-300 ${
                          showSortIcon ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginated.length ? (
              paginated.map((row, i) => (
                <tr
                  key={i}
                  className={`${
                    i % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"
                  } hover:bg-[#eef4ff]`}
                >
                  {columns.map((col, j) => (
                    <td key={j} className="px-4 py-3 border-t border-gray-100">
                      {col.format ? col.format(row[col.key]) : row[col.key]}
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

          {children}
        </table>
      </div>

      {filteredData.length > perPage && (
        <div className="flex justify-end items-center gap-2 mt-4 text-sm text-gray-600">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className={`px-3 py-1 rounded-md border ${
              currentPage === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-[#0e57b5] border-gray-300 hover:bg-[#eef4ff]"
            }`}
          >
            First
          </button>

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className={`px-3 py-1 rounded-md border ${
              currentPage === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-[#0e57b5] border-gray-300 hover:bg-[#eef4ff]"
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
            className={`px-3 py-1 rounded-md border ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-[#0e57b5] border-gray-300 hover:bg-[#eef4ff]"
            }`}
          >
            Next
          </button>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className={`px-3 py-1 rounded-md border ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-[#0e57b5] border-gray-300 hover:bg-[#eef4ff]"
            }`}
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
}
