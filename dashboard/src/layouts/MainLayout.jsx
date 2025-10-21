import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout({ children, current }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar tetap fix di kiri */}
      <Sidebar current={current} />

      {/* Konten utama */}
      <div className="flex-1 flex flex-col ml-64">
        <Navbar />

        {/* Konten halaman */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>

        <Footer />
      </div>
    </div>
  );
}
