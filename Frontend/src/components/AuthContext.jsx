import { createContext, useContext, useState } from "react";

export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState({});

  const Login = () => {
    setAuthenticated(true);
  };
  const Logout = () => {
    setAuthenticated(false);
  };

  const value = {
    authenticated,
    user,

    Login,
    Logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
