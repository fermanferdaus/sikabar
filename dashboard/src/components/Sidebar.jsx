import { useState, useEffect, memo } from "react";
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
  LogOut,
  Clock,
  ChevronDown,
  FileText,
  Percent,
  X,
  Receipt,
  ClipboardMinus,
  DollarSign,
  UserRoundCog,
  Users2,
  User2,
} from "lucide-react";
import useProfil from "../hooks/useProfil";

// ======================
// 🔹 Ikon ChevronTriple
// ======================
const ChevronTriple = memo(({ direction = "right", size = 26 }) => {
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
      <polyline points="3 3 12 12 3 21" stroke="#94a3b8" strokeWidth="2" />
      <polyline points="9 3 18 12 9 21" stroke="#0e57b5" strokeWidth="2" />
      <polyline points="15 3 24 12 15 21" stroke="#94a3b8" strokeWidth="2" />
    </svg>
  );
});

// ======================
// 🔹 MenuGroup
// ======================
const MenuGroup = memo(
  ({ group, role, isCollapsed, openGroups, location, onClose }) => {
    const visibleItems = group.items.filter((i) => i.roles.includes(role));
    if (visibleItems.length === 0) return null;

    return (
      <div
        className={`${
          isCollapsed ? "w-full flex flex-col items-center" : "mb-3"
        }`}
      >
        {!isCollapsed && (
          <button className="w-full flex items-center justify-between text-gray-400 text-[12px] uppercase font-semibold px-4 mb-1 tracking-wide hover:text-[#0e57b5] transition">
            <span>{group.title}</span>

            {/* 🔹 Chevron disembunyikan agar selalu expand (style tidak berubah) */}
            <ChevronDown size={14} className="opacity-0" />
          </button>
        )}

        <div
          className={`overflow-hidden transition-[max-height] duration-200 ease-in-out ${
            openGroups.includes(group.title)
              ? "max-h-[400px]"
              : isCollapsed
                ? "max-h-none"
                : "max-h-0"
          }`}
        >
          <div className={`${isCollapsed ? "space-y-5" : "space-y-1"}`}>
            {visibleItems.map((item) => {
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
                  } py-2.5 rounded-lg transition-colors duration-150 ${
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
    );
  },
);

export default function Sidebar({ isOpen, onClose, onCollapseChange }) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : true;
  });
  const role = localStorage.getItem("role");

  const { profil } = useProfil();
  const logoSrc = profil?.logo_url || "/Logo1.png";

  // ===========================
  // 🔥 Selalu expand semua grup
  // ===========================
  useEffect(() => {
    setOpenGroups(menuGroups.map((g) => g.title));
  }, []);

  // toggleGroup dimatikan supaya tidak collapse
  const toggleGroup = () => {};

  //  =====================
  // Responsive handler
  //  =====================
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile && isOpen) {
      setIsCollapsed(false);
      onCollapseChange?.(false);
    }
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
    onCollapseChange?.(newState);
  };

  // ======================
  // 🔹 Menu Items
  // ======================
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
          label: "Dasbor",
          icon: LayoutDashboard,
          roles: ["admin", "kasir", "capster"],
        },
      ],
    },

    {
      title: "Data Master",
      items: [
        {
          path: role === "kasir" ? "/produk/kasir" : "/produk",
          label: "Produk",
          icon: Package,
          roles: ["admin", "kasir"],
        },
        {
          path: "/pegawai",
          label: "Pegawai",
          icon: Users2,
          roles: ["admin"],
        },
        {
          path: "/capster/kasir",
          label: "Kapster",
          icon: Scissors,
          roles: ["kasir"],
        },
        {
          path: "/pricelist",
          label: "Daftar Harga",
          icon: Tag,
          roles: ["admin"],
        },
        { path: "/store", label: "Cabang", icon: Store, roles: ["admin"] },
        {
          path: "/profil",
          label: "Profil Barbershop",
          icon: UserRoundCog,
          roles: ["admin"],
        },
        { path: "/users", label: "Pengguna", icon: User2, roles: ["admin"] },
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
      title: role === "capster" ? "Keuangan" : "Keuangan & Laporan",
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
        {
          path: role === "admin" ? "/komisi" : "/komisi/capster",
          label: role === "admin" ? "Komisi Kapster" : "Komisi",
          icon: Percent,
          roles: ["admin", "capster"],
        },
        {
          path: "/kasbon",
          label: "Kasbon Pegawai",
          icon: DollarSign,
          roles: ["admin"],
        },
        {
          path: "/potongan",
          label: "Potongan Pegawai",
          icon: ClipboardMinus,
          roles: ["admin"],
        },
        {
          path: "/slip-admin",
          label: "Slip Gaji Pegawai",
          icon: Receipt,
          roles: ["admin"],
        },
        {
          path: "/slip-gaji",
          label: "Slip Gaji",
          icon: Receipt,
          roles: ["kasir", "capster"],
        },
        {
          path: role === "admin" ? "/laporan" : "/laporan/kasir",
          label: "Laporan",
          icon: FileText,
          roles: ["admin", "kasir"],
        },
      ],
    },
  ];

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[45] lg:hidden transition-opacity duration-300"
        />
      )}

      {/* SIDEBAR */}
      <aside
        style={{ willChange: "transform, width" }}
        className={`fixed top-0 left-0 h-screen flex flex-col z-[50]
        transition-[width,transform] duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "w-20" : "w-64"}
        lg:translate-x-0 bg-[#f8fafc] text-[#334155]`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-4 relative flex-shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <img
                src={logoSrc}
                alt="Logo Le Muani Barbershop"
                className="w-11 h-11 object-contain"
              />
              <h1 className="font-bold text-[14px] text-[#0e57b5] leading-tight">
                {profil?.nama_barbershop?.split(" ").slice(0, 2).join(" ") ||
                  ""}
                <br />
                {profil?.nama_barbershop?.split(" ").slice(2).join(" ") || ""}
              </h1>
            </div>
          )}

          {/* Tombol Close */}
          {isOpen && (
            <button
              onClick={onClose}
              className="absolute right-3 top-4 block lg:hidden text-gray-500 hover:text-red-600 transition"
              title="Tutup Sidebar"
            >
              <X size={24} />
            </button>
          )}

          {/* Tombol Collapse */}
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
          className={`flex-1 flex flex-col overflow-hidden ${
            isCollapsed ? "justify-start items-center" : "justify-between"
          }`}
        >
          {/* MENU LIST */}
          <nav
            className={`w-full overflow-y-auto ${
              isCollapsed
                ? "flex flex-col items-center gap-5 pt-5 px-0"
                : "px-3 pb-4"
            } hide-scrollbar`}
          >
            {menuGroups.map((group, idx) => (
              <MenuGroup
                key={idx}
                group={group}
                role={role}
                isCollapsed={isCollapsed}
                openGroups={openGroups}
                location={location}
                onClose={onClose}
              />
            ))}
          </nav>

          {/* LOGOUT */}
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

      {/* Hide scrollbar style */}
      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
