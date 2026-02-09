export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f9fc] px-6 text-center">
      <h1 className="text-[80px] font-extrabold text-blue-600 leading-none">
        404
      </h1>

      <p className="text-xl text-gray-700 mt-4 font-medium">
        Halaman tidak ditemukan
      </p>

      <p className="text-gray-500 mt-2 max-w-md">
        Sepertinya kamu tersesat... Halaman yang kamu cari tidak tersedia
        atau sudah dipindahkan.
      </p>
    </div>
  );
}
