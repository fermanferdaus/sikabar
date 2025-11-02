import { Search, Bell, X } from "lucide-react";
import { useState, useEffect } from "react";

// 🔹 Komponen ikon 3 garis miring dengan aksen biru
const ChevronTriple = ({
  direction = "right",
  size = 26,
  primary = "#0e57b5", // biru tengah
  secondary = "#94a3b8", // abu pinggir
}) => {
  const rotate = direction === "left" ? "rotate(180deg)" : "rotate(0deg)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 24"
      style={{ transform: rotate, transition: "transform 0.25s ease" }}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 3 12 12 3 21" stroke={secondary} strokeWidth="2" />
      <polyline points="9 3 18 12 9 21" stroke={primary} strokeWidth="2" />
      <polyline points="15 3 24 12 15 21" stroke={secondary} strokeWidth="2" />
    </svg>
  );
};

export default function Navbar({
  onSearch,
  onToggleSidebar,
  isSidebarOpen,
  isCollapsed, // ← status dari MainLayout
}) {
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const role = localStorage.getItem("role") || "Guest";
  const name =
    role === "admin"
      ? "Admin"
      : role === "kasir"
      ? "Kasir"
      : role === "capster"
      ? "Capster"
      : "User";

  // 🔹 Deteksi tampilan mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔹 Input pencarian
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch && onSearch(value);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch && onSearch("");
  };

  // 🔹 Toggle Sidebar (mobile: buka/tutup)
  const handleToggleSidebar = () => {
    onToggleSidebar(!isSidebarOpen);
  };

  return (
    <>
      {/* ===================== NAVBAR WRAPPER ===================== */}
      <div
        className={`fixed top-0 right-0 z-40 bg-gray-50 px-4 sm:px-6 md:px-8 pt-4 pb-3 transition-all duration-300
        ${isMobile ? "left-0" : isCollapsed ? "left-20" : "left-64"}`}
      >
        <header className="flex justify-between items-center bg-white rounded-xl shadow-sm border border-gray-100 px-4 sm:px-6 md:px-8 py-6 transition-all duration-300">
          {/* === LEFT: HAMBURGER + SEARCH === */}
          <div className="flex items-center gap-3 w-full max-w-md relative">
            {/* 🔹 Tombol toggle — beda antara mobile & desktop */}
            {isMobile ? (
              <button
                onClick={handleToggleSidebar}
                className="flex items-center justify-center w-10 h-10 transition-transform duration-300 hover:scale-105"
                title={isSidebarOpen ? "Tutup Menu" : "Buka Menu"}
              >
                {isSidebarOpen ? (
                  <X size={24} className="text-gray-600 hover:text-red-600" />
                ) : (
                  <ChevronTriple direction="right" />
                )}
              </button>
            ) : null}

            {/* 🔍 Search bar */}
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari capster, produk, layanan..."
                value={query}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-9 py-2.5 text-[15px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* === RIGHT: NOTIFICATION + PROFILE === */}
          <div className="flex items-center gap-4 sm:gap-5 ml-3 sm:ml-6 flex-shrink-0">
            {/* 🔔 Notifikasi */}
            <button className="relative flex-shrink-0 hover:bg-gray-100 p-2 rounded-full transition">
              <Bell size={22} className="text-gray-500" />
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                2
              </span>
            </button>

            {/* Divider */}
            <div className="hidden sm:block h-6 w-px bg-gray-200"></div>

            {/* 🧑‍ User Info */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:block text-right leading-tight">
                <p className="text-sm font-medium text-gray-800">{name}</p>
              </div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-gray-200">
                <img
                  src="/user.png"
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Spacer biar konten gak ketimpa navbar */}
      <div className="h-10 md:h-7"></div>
    </>
  );
}
