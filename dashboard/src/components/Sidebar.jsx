import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Scissors,
  Store,
  Tag,
  ShoppingBag,
  DollarSign,
  Coins,
  Users,
  LogOut,
  Clock,
  Settings,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const role = localStorage.getItem("role");

  // ==============================
  // 📂 MENU BERDASARKAN ROLE
  // ==============================
  const menuGroups = [
    {
      title: "MAIN MENU",
      items: [
        {
          path: role === "kasir" ? "/dashboard/kasir" : "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          roles: ["admin", "kasir"],
        },
      ],
    },
    {
      title: "MASTER DATA",
      items: [
        {
          path: role === "kasir" ? `/produk/kasir` : "/produk",
          label: "Produk",
          icon: ShoppingBag,
          roles: ["admin", "kasir"],
        },
        {
          path: role === "kasir" ? "/capster/kasir" : "/capster",
          label: "Capster",
          icon: Scissors,
          roles: ["admin", "kasir"],
        },
        { path: "/store", label: "Store", icon: Store, roles: ["admin"] },
        { path: "/pricelist", label: "Pricelist", icon: Tag, roles: ["admin"] },
        { path: "/users", label: "Users", icon: Users, roles: ["admin"] },
      ],
    },
    {
      title: "TRANSAKSI",
      items: [
        {
          path: role === "admin" ? "/transaksi/admin" : "/transaksi",
          label: "Transaksi",
          icon: DollarSign,
          roles: ["admin", "kasir"],
        },
        {
          path: "/riwayat",
          label: "Riwayat Transaksi",
          icon: Clock,
          roles: ["kasir"],
        },
      ],
    },
    {
      title: "KOMISI",
      items: [
        {
          path: "/komisi",
          label: "Komisi",
          icon: Coins,
          roles: ["admin", "capster"],
        },
        {
          path: "/komisi-setting",
          label: "Komisi Setting",
          icon: Settings,
          roles: ["admin"],
        },
      ],
    },
  ];

  // ==============================
  // 🚪 LOGOUT
  // ==============================
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // ==============================
  // 🎨 RENDER
  // ==============================
  return (
    <>
      {/* Tombol hamburger (mobile) */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-amber-600 text-white p-2 rounded-lg shadow-md hover:bg-amber-700 transition"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={22} />
      </button>

      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* === SIDEBAR === */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 flex flex-col shadow-xl transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* === HEADER === */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">
              ✂️
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wide text-amber-400">
                Barber<span className="text-white">Panel</span>
              </h1>
              <p className="text-xs text-gray-400 capitalize">
                {role || "Guest"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-300 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* === MENU === */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {menuGroups.map(
            (group, idx) =>
              group.items.filter((i) => i.roles.includes(role)).length > 0 && (
                <div key={idx} className="mb-5">
                  <h2 className="text-xs font-semibold text-amber-400 uppercase px-4 mb-2 tracking-wide">
                    {group.title}
                  </h2>
                  <div className="space-y-1">
                    {group.items
                      .filter((i) => i.roles.includes(role))
                      .map((item) => {
                        const Icon = item.icon;
                        const isActive =
                          location.pathname === item.path ||
                          location.pathname.startsWith(item.path + "/");

                        // Kasir - aktifkan sub path seperti /capster/addkasir dan /capster/editkasir
                        const kasirExtraActive =
                          role === "kasir" &&
                          item.label === "Capster" &&
                          (location.pathname.startsWith("/capster/addkasir") ||
                            location.pathname.startsWith("/capster/editkasir"));

                        const finalActive = isActive || kasirExtraActive;

                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                              finalActive
                                ? "bg-amber-600 text-white shadow-inner"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            }`}
                          >
                            <Icon size={18} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                  </div>
                </div>
              )
          )}
        </nav>

        {/* === FOOTER === */}
        <div className="p-1 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
