import { Search, X, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const ChevronTriple = ({
  direction = "right",
  size = 26,
  primary = "#0e57b5",
  secondary = "#94a3b8",
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
  isCollapsed,
}) {
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  // 🔹 Ambil data user langsung dari localStorage
  const storedName = localStorage.getItem("nama_user") || "Pengguna";
  const storedRole = localStorage.getItem("role") || "Guest";

  // 🔹 Responsif (cek ukuran layar)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔹 Tutup dropdown kalau klik di luar area profil
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Fungsi logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch && onSearch(value);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch && onSearch("");
  };

  const handleToggleSidebar = () => {
    onToggleSidebar(!isSidebarOpen);
  };

  return (
    <>
      {/* ===================== NAVBAR WRAPPER ===================== */}
      <div
        className={`fixed top-0 right-0 z-40 bg-gray-50 px-3 sm:px-6 md:px-8 pt-4 pb-3 transition-all duration-300
    ${
      isMobile
        ? "left-0 w-full" // 📱 iPad & mobile: full width
        : isCollapsed
          ? "left-20 right-0"
          : "left-64 right-0"
    }`}
      >
        <header className="flex justify-between items-center bg-white rounded-xl shadow-sm border border-gray-100 px-4 sm:px-6 md:px-8 py-4 transition-all duration-300">
          {/* === LEFT: HAMBURGER + SEARCH === */}
          <div className="flex items-center gap-3 w-full max-w-md relative">
            {isMobile && (
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
            )}

            {/* 🔍 Search bar */}
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari data disini..."
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

          {/* === RIGHT: PROFILE DROPDOWN === */}
          <div className="flex items-center gap-4 sm:gap-5 ml-3 sm:ml-6 flex-shrink-0">
            <div className="relative" ref={profileRef}>
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setShowProfile((prev) => !prev)}
              >
                {/* Info user */}
                <div className="hidden md:flex flex-col items-end leading-tight">
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition">
                    {storedName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {storedRole === "admin" ? "owner" : storedRole}
                  </p>
                </div>

                {/* Foto profil */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-gray-200 group-hover:ring-2 group-hover:ring-blue-400 transition-all duration-300">
                  <img
                    src="/user.png"
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* === DROPDOWN === */}
              <div
                className={`absolute right-0 mt-3 w-64 bg-white rounded-xl border border-gray-100 shadow-lg transition-all duration-200 origin-top-right ${
                  showProfile
                    ? "opacity-100 scale-100 visible"
                    : "opacity-0 scale-95 invisible"
                }`}
              >
                <div className="p-5 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 mb-3">
                    <img
                      src="/user.png"
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="font-semibold text-gray-800 text-base">
                    {storedName}
                  </h2>
                  <p className="text-sm text-gray-500 mb-3 capitalize">
                    {storedRole === "admin" ? "owner" : storedRole}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-gray-600 hover:text-red-600 transition font-medium text-sm hover:bg-gray-50"
                  >
                    <LogOut size={18} strokeWidth={1.6} />
                    Keluar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Spacer supaya konten gak ketimpa navbar */}
      <div className="h-5 md:h-3"></div>
    </>
  );
}
