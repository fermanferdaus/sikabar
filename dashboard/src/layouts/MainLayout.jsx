import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout({ children, current }) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-gray-800">
      {/* Sidebar */}
      <Sidebar current={current} />

      {/* Konten utama */}
      <div className="flex-1 flex flex-col ml-64 transition-all">
        {/* Navbar dengan fungsi search */}
        <Navbar onSearch={setSearchTerm} />

        {/* Konten halaman */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Jika children adalah function, kirim searchTerm ke dalamnya */}
          {typeof children === "function" ? children(searchTerm) : children}
        </main>

        <Footer />
      </div>
    </div>
  );
}
