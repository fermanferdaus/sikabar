import { useState, useEffect, useRef } from "react";
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
  ChevronDown,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState([]);
  const isAutoExpanding = useRef(false); // 🧠 deteksi update otomatis
  const role = localStorage.getItem("role");

  const menuGroups = [
    {
      title: "Menu Utama",
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
      title: "Data Master",
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
        { path: "/store", label: "Cabang", icon: Store, roles: ["admin"] },
        {
          path: "/pricelist",
          label: "Daftar Harga",
          icon: Tag,
          roles: ["admin"],
        },
        { path: "/users", label: "Pengguna", icon: Users, roles: ["admin"] },
      ],
    },
    {
      title: "Transaksi",
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
      title: "Komisi",
      items: [
        {
          path: "/komisi",
          label: "Komisi",
          icon: Coins,
          roles: ["admin", "capster"],
        },
        {
          path: "/komisi-setting",
          label: "Pengaturan Komisi",
          icon: Settings,
          roles: ["admin"],
        },
      ],
    },
  ];

  // ✅ Otomatis buka grup yang berisi menu aktif
  useEffect(() => {
    isAutoExpanding.current = true; // hentikan animasi sementara
    const activeGroups = [];
    menuGroups.forEach((group) => {
      const active = group.items.some(
        (item) =>
          location.pathname === item.path ||
          location.pathname.startsWith(item.path + "/")
      );
      if (active) activeGroups.push(group.title);
    });
    setOpenGroups(activeGroups);
    setTimeout(() => (isAutoExpanding.current = false), 150);
  }, [location.pathname]);

  const toggleGroup = (title) => {
    setOpenGroups((prev) =>
      prev.includes(title) ? prev.filter((g) => g !== title) : [...prev, title]
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Tombol menu mobile */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#0e57b5] text-white p-2 rounded-md shadow-md hover:bg-[#0c4ba0] transition"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={22} />
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-[#f8fafc] text-[#334155] flex flex-col transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-6">
          <img
            src="/Logo.png"
            alt="Logo Le Muani Barbershop"
            className="w-14 h-14 object-contain"
          />
          <div>
            <h1 className="font-bold text-[15px] text-[#0e57b5]">
              LE MUANI BARBERSHOP
            </h1>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 pb-4 overflow-y-auto scrollbar-none">
          {menuGroups.map(
            (group, idx) =>
              group.items.filter((i) => i.roles.includes(role)).length > 0 && (
                <div key={idx} className="mb-3">
                  {/* Judul Grup */}
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between text-gray-400 text-[12px] uppercase font-semibold px-4 mb-1 tracking-wide hover:text-[#0e57b5] transition"
                  >
                    <span>{group.title}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${
                        openGroups.includes(group.title)
                          ? "rotate-180 text-[#0e57b5]"
                          : ""
                      }`}
                    />
                  </button>

                  {/* Daftar Menu */}
                  <div
                    className={`overflow-hidden ${
                      isAutoExpanding.current
                        ? "" // 🚫 tanpa transisi saat auto-expand
                        : "transition-all duration-300"
                    } ${
                      openGroups.includes(group.title)
                        ? "max-h-[400px]"
                        : "max-h-0"
                    }`}
                  >
                    <div className="space-y-1 pl-2">
                      {group.items
                        .filter((i) => i.roles.includes(role))
                        .map((item) => {
                          const Icon = item.icon;
                          const isActive =
                            location.pathname === item.path ||
                            location.pathname.startsWith(item.path + "/");

                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                                isActive
                                  ? "bg-[#0e57b5] text-white"
                                  : "text-gray-600 hover:bg-[#e6eefb] hover:text-[#0e57b5]"
                              }`}
                            >
                              <Icon size={18} />
                              <span className="text-[14px]">{item.label}</span>
                            </Link>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )
          )}
        </nav>

        {/* Tombol Keluar */}
        <div className="p-3 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-left text-gray-600 hover:bg-[#fdecec] hover:text-[#e6152b] transition-all duration-200"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
