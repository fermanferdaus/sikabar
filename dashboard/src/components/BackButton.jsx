import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({
  label = "Kembali",
  to = -1,
  className = "",
}) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className={`
        inline-flex items-center gap-1
        text-sm text-gray-500
        hover:text-black transition
        ${className}
      `}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}
