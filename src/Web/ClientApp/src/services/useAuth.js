// src/hooks/useAuth.js
import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);       // data user
  const [loading, setLoading] = useState(true); // đang check
  const [isAuth, setIsAuth] = useState(false);  // đã login chưa

  useEffect(() => {
    fetch("/api/Auth/me", {
      credentials: "include", // ✅ gửi cookie tự động
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setIsAuth(true);
      })
      .catch(() => {
        setUser(null);
        setIsAuth(false);
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, isAuth };
}

//Bọc với script này để có data login
// import { useAuth } from "../hooks/useAuth";

// export default function Dashboard() {
//   const { user, loading, isAuth } = useAuth();

//   if (loading) return <p>Loading...</p>;

//   if (!isAuth) {
//     window.location.href = "/login"; // chưa login → redirect
//     return null;
//   }

//   return (
//     <div>
//       <h1>Xin chào, {user.email}</h1>
//       <p>Role: {user.role}</p>
//     </div>
//   );
// }