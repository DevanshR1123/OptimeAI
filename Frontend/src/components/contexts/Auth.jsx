import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";

export const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

const supabase = createClient(
  import.meta.env["VITE_SUPABASE_PROJECT_URL"],
  import.meta.env["VITE_SUPABASE_CLIENT_KEY"]
);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({});

  const signedIn = useRef(false);

  const user = session?.user.identities[0].identity_data;

  const createCalendar = async session => {
    const email = session?.user.identities[0].identity_data.email;
    try {
      const { data: profiles } = await supabase.from("profiles").select("*").eq("email", email);
      if (profiles[0].calendar_id === null) {
        const { data: calendar } = await axios.post(
          `https://www.googleapis.com/calendar/v3/calendars`,
          {
            summary: "OptimeAI",
            description: "Calendar managed by OptimeAI",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          {
            headers: {
              Authorization: `Bearer ${session.provider_token}`,
              Accept: "application/json",
            },
          }
        );
        if (calendar) {
          const { data: updated, error } = await supabase
            .from("profiles")
            .update({ calendar_id: calendar.id })
            .eq("email", email)
            .select();

          setProfile(updated[0]);
          if (error) throw error;
        }
      } else {
        setProfile(profiles[0]);
      }
    } catch ({ name, message }) {
      console.log(name, message);
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (mounted) {
        if (error) {
          setIsLoading(false);
          return;
        }
        setSession(session);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event == "SIGNED_IN" && !signedIn.current) {
        createCalendar(session);
        console.log("SIGNED IN");
        signedIn.current = true;
      }
    });

    return () => {
      subscription.unsubscribe();
      mounted = false;
    };
  }, []);

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
    profile,
    Login,
    Logout,
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

export const AuthRequired = ({ element }) => {
  const { session } = useAuth();

  return session ? <>{element}</> : <Navigate to='/' />;
};
