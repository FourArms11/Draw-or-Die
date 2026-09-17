import { createContext, useState } from "react";

const SAVED_USER_KEY = "draw-or-die-user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem(SAVED_USER_KEY));

  const login = (identifier) => {
    localStorage.setItem(SAVED_USER_KEY, identifier);
    setUser(identifier);
  };

  const logout = () => {
    localStorage.removeItem(SAVED_USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };