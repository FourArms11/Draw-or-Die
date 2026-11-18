import { createContext, useState, useEffect, useCallback } from "react";
import { getMe, logoutUser } from "../services/api";
import { connectSocket, disconnectSocket } from "../sockets/socket";

const SAVED_USER_KEY = "draw-or-die-user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem(SAVED_USER_KEY) || null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const data = await getMe();
        if (isMounted && data?.user) {
          const username = data.user.username;
          setUser(username);
          setUserStats(data.user.stats || null);
          localStorage.setItem(SAVED_USER_KEY, username);
          connectSocket({ username });
        }
      } catch {
        if (isMounted) {
          // If no valid session cookie, clear state
          setUser(null);
          setUserStats(null);
          localStorage.removeItem(SAVED_USER_KEY);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback((identifier, token = null) => {
    const username = typeof identifier === "string" ? identifier : identifier?.username || "Player";
    localStorage.setItem(SAVED_USER_KEY, username);
    setUser(username);
    if (identifier?.stats) setUserStats(identifier.stats);
    connectSocket({ username, token });
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem(SAVED_USER_KEY);
    setUser(null);
    setUserStats(null);
    disconnectSocket();
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const data = await getMe();
      if (data?.user) {
        setUserStats(data.user.stats || null);
      }
    } catch {
      // Keep the last known stats if the session refresh fails.
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, userStats, loading, login, logout, refreshStats }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };