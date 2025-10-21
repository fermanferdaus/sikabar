export default function Navbar() {
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm border-b border-gray-100">
      <h1 className="text-lg font-semibold text-barber-dark">Dashboard</h1>
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-500">Admin</div>
        <img
          src="https://i.pravatar.cc/40"
          alt="profile"
          className="w-9 h-9 rounded-full border border-barber-gold"
        />
      </div>
    </header>
  );
}
