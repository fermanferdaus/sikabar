import { useEffect, useState } from "react";

export default function useFetchUsers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // ============================================================
  //  GET USERS
  // ============================================================
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal memuat data pengguna");

      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  //  ADD USER
  // ============================================================
  const addUser = async (body) => {
    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    if (!res.ok)
      throw new Error(result.message || "Gagal menambahkan pengguna");

    await fetchUsers();
    return result;
  };

  // ============================================================
  //  UPDATE USER
  // ============================================================
  const updateUser = async (id, body) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    if (!res.ok)
      throw new Error(result.message || "Gagal memperbarui pengguna");

    await fetchUsers();
    return result;
  };

  // ============================================================
  //  DELETE USER
  // ============================================================
  const deleteUser = async (id) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Gagal menghapus pengguna");

    await fetchUsers();
    return result;
  };

  // ============================================================
  //  CHECK USERNAME (SUPPORT EXCLUDE)
  // ============================================================
  const checkUsername = async (username, exclude = null) => {
    let url = `${API_URL}/users/check-username/${username}`;

    // Tambahkan exclude ID jika diberikan (untuk EDIT)
    if (exclude) url += `?exclude=${exclude}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    return {
      exists: data.exists,
      message: data.message || null,
    };
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    data,
    loading,
    error,
    addUser,
    updateUser,
    deleteUser,
    checkUsername,
  };
}
