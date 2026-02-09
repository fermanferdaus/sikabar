import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout({ children }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const marginLeftClass = isMobile
    ? "ml-0"
    : sidebarCollapsed
      ? "lg:ml-20"
      : "lg:ml-64";

  return (
    <div className="relative flex flex-col min-h-screen bg-[#f8fafc] text-gray-800">
      {/* === SIDEBAR === */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCollapseChange={setSidebarCollapsed}
      />

      {/* === NAVBAR === */}
      <Navbar
        onSearch={setSearchTerm}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
      />

      {/* === WRAPPER KONTEN UTAMA === */}
      <div
        className={`flex-1 flex flex-col pt-[90px] md:pt-[100px] transition-all duration-300 ease-in-out ${marginLeftClass}`}
      >
        {/* === KONTEN HALAMAN === */}
        <main
          className="flex-1 w-full max-w-full px-3 sm:px-6 md:px-8 transition-all duration-300 ease-in-out"
          style={{
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE & Edge
          }}
        >
          <style>{`main::-webkit-scrollbar { width: 0px; height: 0px;}`}</style>

          {typeof children === "function" ? children(searchTerm) : children}
        </main>

        {/* === FOOTER === */}
        <div className="w-full py-7">
          <Footer />
        </div>
      </div>
    </div>
  );
}
