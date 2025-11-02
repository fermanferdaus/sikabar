import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Scissors,
  Store,
  Tag,
  Package,
  CreditCard,
  Wallet,
  Banknote,
  Users,
  LogOut,
  Clock,
  Settings,
  ChevronDown,
  FileBarChart,
  FileText,
  Percent,
  X,
} from "lucide-react";

// Ikon ChevronTriple
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

export default function Sidebar({ isOpen, onClose, onCollapseChange }) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : true;
  });
  const isAutoExpanding = useRef(false);
  const role = localStorage.getItem("role");

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile && isOpen) {
      setIsCollapsed(false);
      onCollapseChange && onCollapseChange(false);
    }
  }, [isOpen]);

  const menuGroups = [
    {
      title: "Menu Utama",
      items: [
        {
          path:
            role === "kasir"
              ? "/dashboard/kasir"
              : role === "capster"
              ? "/dashboard/capster"
              : "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          roles: ["admin", "kasir", "capster"],
        },
      ],
    },
    {
      title: "Data Master",
      items: [
        {
          path: role === "kasir" ? `/produk/kasir` : "/produk",
          label: "Produk",
          icon: Package,
          roles: ["admin", "kasir"],
        },
        {
          path: role === "kasir" ? "/capster/kasir" : "/capster",
          label: "Capster",
          icon: Scissors,
          roles: ["admin", "kasir"],
        },
        {
          path: "/pricelist",
          label: "Daftar Harga",
          icon: Tag,
          roles: ["admin"],
        },
        {
          path: "/store",
          label: "Cabang",
          icon: Store,
          roles: ["admin"],
        },
        {
          path: "/users",
          label: "Pengguna",
          icon: Users,
          roles: ["admin"],
        },
      ],
    },
    {
      title: "Transaksi & Riwayat",
      items: [
        {
          path: role === "admin" ? "/transaksi/admin" : "/transaksi",
          label: "Transaksi",
          icon: CreditCard,
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
      title: "Keuangan",
      items: [
        {
          path: role === "kasir" ? "/pengeluaran/kasir" : "/pengeluaran",
          label: "Pengeluaran",
          icon: Wallet,
          roles: ["admin", "kasir"],
        },
        {
          path: "/gaji",
          label: "Gaji & Bonus",
          icon: Banknote,
          roles: ["admin"],
        },
      ],
    },
    {
      title: "Komisi",
      items: [
        {
          path: "/komisi",
          label: "Komisi Capster",
          icon: Percent,
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
    {
      title: "Laporan",
      items: [
        {
          path:
            role === "admin"
              ? "/laporan/pemasukan"
              : "/laporan/kasir/pemasukan",
          label: "Laporan Pemasukan",
          icon: FileBarChart,
          roles: ["admin", "kasir"],
        },
        {
          path:
            role === "admin"
              ? "/laporan/pengeluaran"
              : "/laporan/kasir/pengeluaran",
          label: "Laporan Pengeluaran",
          icon: FileText,
          roles: ["admin", "kasir"],
        },
      ],
    },
  ];

  useEffect(() => {
    isAutoExpanding.current = true;
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

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
    if (typeof onCollapseChange === "function") {
      onCollapseChange(newState);
    }
  };

  return (
    <>
      {/* Overlay hitam transparan di mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[45] lg:hidden transition-opacity duration-300"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen text-[#334155] flex flex-col transition-all duration-300 z-[50]
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
      ${isCollapsed ? "w-20" : "w-64"}
      lg:translate-x-0 bg-[#f8fafc]`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-4 relative flex-shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <img
                src="/Logo1.png"
                alt="Logo Le Muani Barbershop"
                className="w-11 h-11 object-contain"
              />
              <h1 className="font-bold text-[14px] text-[#0e57b5] leading-tight">
                LE MUANI <br /> BARBERSHOP
              </h1>
            </div>
          )}

          {/* Tombol Close (Mobile) */}
          {isOpen && (
            <button
              onClick={onClose}
              className="absolute right-3 top-4 block lg:hidden text-gray-500 hover:text-red-600 transition"
              title="Tutup Sidebar"
            >
              <X size={24} />
            </button>
          )}

          {/* ↔ Tombol Collapse (Desktop) */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center w-9 h-9 mx-auto text-gray-500 hover:text-blue-600 transition-all"
            title={isCollapsed ? "Perbesar Sidebar" : "Kecilkan Sidebar"}
          >
            <ChevronTriple direction={isCollapsed ? "right" : "left"} />
          </button>
        </div>

        {/* BODY */}
        <div
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
            isCollapsed ? "justify-start items-center" : "justify-between"
          }`}
        >
          {/* === MENU LIST === */}
          <nav
            className={`w-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 transition-all duration-300 ${
              isCollapsed
                ? "flex flex-col items-center gap-5 pt-5 px-0"
                : "px-3 pb-4"
            }`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <style>{`nav::-webkit-scrollbar { width: 0px; height: 0px;}`}</style>

            {menuGroups.map(
              (group, idx) =>
                group.items.filter((i) => i.roles.includes(role)).length >
                  0 && (
                  <div
                    key={idx}
                    className={`${
                      isCollapsed ? "w-full flex flex-col items-center" : "mb-3"
                    }`}
                  >
                    {!isCollapsed && (
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
                    )}

                    <div
                      className={`overflow-hidden ${
                        isAutoExpanding.current
                          ? ""
                          : "transition-all duration-300"
                      } ${
                        openGroups.includes(group.title)
                          ? "max-h-[400px]"
                          : isCollapsed
                          ? "max-h-none"
                          : "max-h-0"
                      }`}
                    >
                      <div
                        className={`space-y-1 ${
                          isCollapsed ? "space-y-5" : "space-y-1"
                        }`}
                      >
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
                                onClick={() => onClose && onClose()}
                                className={`group flex items-center gap-3 ${
                                  isCollapsed ? "justify-center" : "px-4"
                                } py-2.5 rounded-lg transition-all ${
                                  isActive
                                    ? "text-blue-600 font-semibold"
                                    : "text-gray-600 hover:text-blue-600"
                                }`}
                                title={isCollapsed ? item.label : ""}
                              >
                                <Icon
                                  size={20}
                                  strokeWidth={1.6}
                                  className="transition-transform group-hover:scale-110"
                                />
                                {!isCollapsed && (
                                  <span className="text-[14px] font-medium">
                                    {item.label}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )
            )}
          </nav>

          {/* === LOGOUT === */}
          <div
            className={`flex-shrink-0 p-3 w-full ${
              isCollapsed ? "mt-auto" : ""
            }`}
          >
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 ${
                isCollapsed ? "justify-center" : "px-4"
              } py-2.5 w-full rounded-lg text-gray-600 hover:text-red-600 transition`}
              title={isCollapsed ? "Keluar" : ""}
            >
              <LogOut size={20} strokeWidth={1.6} />
              {!isCollapsed && (
                <span className="font-medium text-[14px]">Keluar</span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
