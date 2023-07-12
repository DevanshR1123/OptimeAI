import { useSession, useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";
import { createContext, useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";

export const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { isLoading } = useSessionContext();

  const user = session?.user.identities[0].identity_data;

  const Login = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:5173",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        scopes: "https://www.googleapis.com/auth/calendar",
      },
    });

    if (error) alert(error.message);
  };

  const Logout = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    Login,
    Logout,
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

export const AuthRequired = ({ element }) => {
  const { session } = useAuth();

  return session ? <>{element}</> : <Navigate to='/' />;
};
