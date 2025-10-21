import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const [isReady, setIsReady] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      setIsAuthorized(false);
    } else if (allowedRoles && !allowedRoles.includes(role)) {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
    setIsReady(true);
  }, [allowedRoles]);

  if (!isReady)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Memeriksa sesi...
      </div>
    );

  if (!isAuthorized) return <Navigate to="/login" replace />;
  return children;
}
