import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

const supabase = createClient(
    import.meta.env["VITE_SUPABASE_PROJECT_URL"],
    import.meta.env["VITE_SUPABASE_CLIENT_KEY"],
);

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    const signedIn = useRef(false);
    const navigate = useNavigate();

    const user = session?.user.identities[0].identity_data;

    const Logout = async () => {
        await supabase.auth.signOut();
        signedIn.current = false;
        setProfile(null);
    };

    const createCalendar = async (session) => {
        const email = session?.user.identities[0].identity_data.email;
        const {
            data: [profile],
        } = await supabase.from("profiles").select("*").eq("email", email);

        let calendar = null;

        try {
            const res = await axios.get(
                `https://www.googleapis.com/calendar/v3/calendars/${profile.calendar_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${session.provider_token}`,
                        Accept: "application/json",
                    },
                },
            );
            calendar = await res.data;
            console.log("Calendar FOUND");
        } catch (error) {
            console.log(error.response.status, error.response.data);
            if (error.response.data.error.status === "UNAUTHENTICATED") {
                toast.error("Please login again!");
                Logout();
                navigate("/");
            }
        }

        try {
            if (profile.calendar_id === null || !calendar) {
                const { data: calendar } = await axios.post(
                    `https://www.googleapis.com/calendar/v3/calendars`,
                    {
                        summary: "OptimeAI",
                        description: "Calendar managed by OptimeAI",
                        timeZone:
                            Intl.DateTimeFormat().resolvedOptions().timeZone,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${session.provider_token}`,
                            Accept: "application/json",
                        },
                    },
                );

                if (calendar) {
                    console.log("Calendar CREATED");

                    const {
                        data: [updated],
                        error,
                    } = await supabase
                        .from("profiles")
                        .update({ calendar_id: calendar.id })
                        .eq("email", email)
                        .select();

                    setProfile(updated);
                    if (error) throw error;
                }
            }
        } catch ({ name, message }) {
            console.log(name, message);
        }
    };

    const getProfile = async (session) => {
        const email = session?.user.identities[0].identity_data.email;
        const {
            data: [profile],
        } = await supabase.from("profiles").select("*").eq("email", email);
        setProfile(profile);
    };

    const refreshProfile = async () => {
        const email = session?.user.identities[0].identity_data.email;
        const {
            data: [profile],
        } = await supabase.from("profiles").select("*").eq("email", email);
        setProfile(profile);
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
                getProfile(session);
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
                // redirectTo: "http://localhost:5173",
                queryParams: {
                    access_type: "offline",
                    prompt: "consent",
                },
                scopes: "https://www.googleapis.com/auth/calendar",
            },
        });

        if (error) alert(error.message);
    };

    const value = {
        session,
        user,
        profile,
        supabase,
        Login,
        Logout,
        refreshProfile,
    };

    // console.log(session, profile);

    return (
        <AuthContext.Provider value={value}>
            {!isLoading &&
                ((!session && !profile) || (session && profile)) &&
                children}
        </AuthContext.Provider>
    );
};

export const AuthRequired = ({ element }) => {
    const { session } = useAuth();

    return session ? <>{element}</> : <Navigate to="/" />;
};
