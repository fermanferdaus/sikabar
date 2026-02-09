import useProfil from "../hooks/useProfil";

export default function Footer() {
  const { profil } = useProfil();

  return (
    <footer className="flex items-center justify-center text-gray-500">
      <p className="text-sm">
        © 2025 {" "}
        <span className="font-semibold text-[#0e57b5]">
          {profil?.nama_barbershop || "Barbershop"}
        </span>{" "}
        — All rights reserved.
      </p>
    </footer>
  );
}
