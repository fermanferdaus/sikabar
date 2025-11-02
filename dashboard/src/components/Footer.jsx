export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="flex items-center justify-center mt-3 py-7 bg-[#f8fafc] text-gray-500">
      <p className="text-sm">
        © {year}{" "}
        <span className="font-semibold text-[#0e57b5]">
          Le Muani Barbershop
        </span>{" "}
        — All rights reserved.
      </p>
    </footer>
  );
}
