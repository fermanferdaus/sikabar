import { Search, Bell } from "lucide-react";
import { useState } from "react";

export default function Navbar({ onSearch }) {
  const [query, setQuery] = useState("");
  const role = localStorage.getItem("role") || "Guest";
  const name =
    role === "admin"
      ? "Admin"
      : role === "kasir"
      ? "Kasir"
      : role === "capster"
      ? "Capster"
      : "User";

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch && onSearch(value);
  };

  return (
    <>
      <div className="fixed top-0 left-64 right-0 z-40 backdrop-blur-md px-8 pt-4 pb-3">
        <header className="flex justify-between items-center bg-white rounded-xl shadow-sm border border-gray-100 px-8 py-4 h-26">
          {/* === Left Section: Search === */}
          <div className="flex items-center w-full max-w-md relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari capster, produk, layanan..."
              value={query}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-[15px] text-gray-700 placeholder-gray-400 shadow-sm focus:shadow-md focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all duration-200"
            />
          </div>

          {/* === Right Section: Notifications + Profile === */}
          <div className="flex items-center gap-5">
            {/* Notification Icon */}
            <button className="relative group">
              <Bell
                size={22}
                className="text-gray-500 group-hover:text-blue-600 transition"
              />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                2
              </span>
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200"></div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="text-sm font-medium text-gray-800">{name}</p>
              </div>
              <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
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

      {/* Spacer biar konten gak ketutupan */}
      <div className="h-28"></div>
    </>
  );
}
