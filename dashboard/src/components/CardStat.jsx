export default function CardStat({ title, value, icon, color }) {
  return (
    <div className="flex items-center justify-between bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition">
      <div>
        <h4 className="text-gray-500 text-sm">{title}</h4>
        <p className="text-2xl font-semibold text-barber-dark">{value}</p>
      </div>
      <div className={`p-3 rounded-lg text-white ${color}`}>{icon}</div>
    </div>
  );
}
