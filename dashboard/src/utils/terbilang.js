export function terbilang(n) {
  if (!Number.isFinite(n)) return "";

  if (n < 0) {
    return "Minus " + terbilang(Math.abs(n));
  }

  if (n === 0) return "Nol";

  const angka = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];

  n = Math.floor(n);

  if (n < 12) return angka[n];
  if (n < 20) return angka[n - 10] + " Belas";
  if (n < 100)
    return (
      angka[Math.floor(n / 10)] +
      " Puluh" +
      (n % 10 ? " " + terbilang(n % 10) : "")
    );

  if (n < 200) return "Seratus" + (n % 100 ? " " + terbilang(n - 100) : "");

  if (n < 1000)
    return (
      angka[Math.floor(n / 100)] +
      " Ratus" +
      (n % 100 ? " " + terbilang(n % 100) : "")
    );

  if (n < 2000) return "Seribu" + (n % 1000 ? " " + terbilang(n - 1000) : "");

  if (n < 1_000_000)
    return (
      terbilang(Math.floor(n / 1000)) +
      " Ribu" +
      (n % 1000 ? " " + terbilang(n % 1000) : "")
    );

  if (n < 1_000_000_000)
    return (
      terbilang(Math.floor(n / 1_000_000)) +
      " Juta" +
      (n % 1_000_000 ? " " + terbilang(n % 1_000_000) : "")
    );

  return "";
}
