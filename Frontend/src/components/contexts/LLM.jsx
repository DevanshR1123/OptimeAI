import { createContext, useContext } from "react";
import axios from "axios";
import { toast } from "sonner";

export const LLMContext = createContext({});
export const useLLM = () => useContext(LLMContext);

export const LLMProvider = ({ children }) => {
    const schedule = async (command, context) => {
        try {
            const res = await axios.post("http://localhost:5000/schedule", {
                command,
                context,
            });
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

    const value = {
        schedule,
    };

    return <LLMContext.Provider value={value}>{children}</LLMContext.Provider>;
};
