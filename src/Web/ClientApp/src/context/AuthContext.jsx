
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth,  setIsAuth]  = useState(false);

  useEffect(() => {
    fetch("/api/Auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => { setUser(data); setIsAuth(true); })
      .catch(()    => { setUser(null); setIsAuth(false); })
      .finally(()  => setLoading(false));
  }, []); // ✅ chỉ gọi 1 lần khi app khởi động

  return (
    <AuthContext.Provider value={{ user, loading, isAuth, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Export hook để dùng ở mọi nơi
export const useAuth = () => useContext(AuthContext);