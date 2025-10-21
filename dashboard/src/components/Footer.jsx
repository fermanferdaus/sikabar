export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="text-center text-sm text-gray-500 py-4 border-t bg-white">
      © {year}{" "}
      <span className="font-semibold text-barber-gold">BarberSystem</span>. All
      rights reserved.
    </footer>
  );
}
