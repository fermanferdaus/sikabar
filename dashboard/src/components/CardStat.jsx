export default function CardStat({
  gradient,
  title,
  subtitle,
  value,
  icon,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer rounded-2xl p-6 text-white shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-gradient-to-r ${gradient} animate-gradient-wave`}
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

      <div className="relative flex justify-between items-start">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <h2 className="text-3xl font-bold mt-1">{value}</h2>
          <p className="text-xs opacity-80 mt-1">{subtitle}</p>
        </div>
        <div className="text-white opacity-90">{icon}</div>
      </div>
    </div>
  );
}
