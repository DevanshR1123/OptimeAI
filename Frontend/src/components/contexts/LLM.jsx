import { createContext, useContext } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "./Auth";

export const LLMContext = createContext({});
export const useLLM = () => useContext(LLMContext);

export const LLMProvider = ({ children }) => {
    const { session, profile } = useAuth();

    const schedule = async (command, context) => {
        try {
            const res = await axios.post(
                `${import.meta.env["VITE_BACKEND_URL"]}/schedule`,
                {
                    command,
                    context,
                    token: session.provider_token,
                    name: profile.name,
                    calendar_id: profile.calendar_id,
                },
            );
            const data = await res.data;
            if (data.error) {
                toast.error(data.error);
                return null;
            }
            return data;
        } catch (error) {
            console.log(error);
            toast.error("Error scheduling event");
            return null;
        }
    };

    // console.log(session?.provider_token);

    const value = {
        schedule,
    };

    return <LLMContext.Provider value={value}>{children}</LLMContext.Provider>;
};
