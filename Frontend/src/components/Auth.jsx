import { createContext, useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export const AuthContext = createContext({});

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

export const AuthRequired = ({ children }) => {
  const { authenticated } = useAuth();

  return authenticated ? <>{children}</> : <Navigate to='/' />;
};
