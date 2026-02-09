import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const [isReady, setIsReady] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const timeout = setTimeout(() => {
      if (!token) {
        setIsAuthorized(false);
      } else if (allowedRoles && !allowedRoles.includes(role)) {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
      setIsReady(true);
    }, 800);

    return () => clearTimeout(timeout);
  }, [allowedRoles]);

  if (!isReady)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0]">
        {/* 🔵 Animated Ring Spinner */}
        <div className="relative w-14 h-14 mb-5">
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-[3px] border-t-[3px] border-t-blue-600 animate-spin"></div>
        </div>

        {/* ✨ Text with smooth pulse */}
        <h2 className="text-gray-700 font-medium text-lg animate-pulse">
          Loading...
        </h2>
        <p className="text-sm text-gray-500 mt-2">Harap tunggu sebentar</p>
      </div>
    );

  if (!isAuthorized) return <Navigate to="/login" replace />;
  return children;
}
