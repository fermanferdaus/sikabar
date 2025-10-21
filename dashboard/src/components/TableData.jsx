export default function TableData({ columns, data }) {
  return (
    <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-barber-gold text-white">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3 text-left">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <tr
                key={i}
                className="border-t hover:bg-barber-light/50 transition"
              >
                {Object.values(row).map((val, j) => (
                  <td key={j} className="px-4 py-3">
                    {val}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-6 text-gray-500"
              >
                Tidak ada data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
