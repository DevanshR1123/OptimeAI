import React, { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import MicIcon from "../../assets/icons/microphone.svg";
import { useCalendar } from "../contexts/Calendar";
import { useLLM } from "../contexts/LLM";

const Chat = () => {
    const { schedule } = useLLM();
    const { quickAddEvent, createEvent } = useCalendar();

    const [text, setText] = useState("Schedule a meeting with John at 2pm tomorrow for an hour");
    const [messages, setMessages] = useState([
        {
            text: "Hi, how can I help you?",
            type: "bot",
        },
    ]);

    const [loading, setLoading] = useState(false);
    const [recognizing, setRecognizing] = useState(false);

    const bottom = useRef(null);

    const addMessage = (message) => {
        if (Array.isArray(message)) setMessages((m) => [...m, ...message]);
        else setMessages((m) => [...m, message]);
    };

    const handleSchedule = async (text) => {
        setText("");
        addMessage({ text, type: "user" });
        setLoading(true);
        const res = await schedule(text, messages);
        const { extract, quick_add, error } = res;
        setLoading(false);
        if (!res) {
            addMessage({ text: "Error scheduling event", type: "error" });
            console.log(error);
            return;
        }
        addMessage([
            { text: extract, type: "event" },
            { text: "Is there anything else I can help you with?", type: "bot" },
        ]);
        console.log(quick_add);
        if (quick_add) quickAddEvent(quick_add);
    };

    const handleSpeechRecognition = (e) => {
        const recognition = new window.SpeechRecognition();

        recognition.lang = "en-IN";
        recognition.interimResults = true;
        // recognition.continuous = true;

        let ignore_onend = false;
        let start_timestamp;

        recognition.addEventListener("result", (e) => {
            const transcript = Array.from(e.results)
                .map((result) => result[0])
                .map((result) => result.transcript)
                .join("");
            setText(transcript);

            if (e.results[0].isFinal)
                setTimeout(() => {
                    handleSchedule(transcript);
                }, 1000);
        });

        recognition.onstart = () => {
            setRecognizing(true);
            setLoading(true);
            // console.log("Speech recognition service has started");
        };

        recognition.onend = () => {
            setRecognizing(false);
            // console.log("Speech recognition service disconnected");
            if (ignore_onend) {
                return;
            }
        };

        recognition.onerror = function (event) {
            if (event.error == "no-speech") {
                console.log("info_no_speech");
                ignore_onend = true;
            }

            if (event.error == "audio-capture") {
                console.log("info_no_microphone");
                ignore_onend = true;
            }

            if (event.error == "not-allowed") {
                if (event.timeStamp - start_timestamp < 100) {
                    console.log("info_blocked");
                } else {
                    console.log("info_denied");
                }
                ignore_onend = true;
            }
        };

        recognition.onspeechend = () => {
            // console.log("Speech has stopped being detected");
            recognition.stop();
        };

        recognition.start();
        start_timestamp = e.timeStamp;
        bottom.current.scrollIntoViewIfNeeded({ behavior: "smooth" });
    };

    useEffect(() => {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!window.SpeechRecognition) {
            console.log("Speech Recognition not supported");
        }
    }, []);

    useEffect(() => {
        bottom.current.scrollIntoViewIfNeeded({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="col-span-2 row-span-3 grid h-[32rem] grid-rows-sandwich gap-4 rounded-lg bg-primary-700 p-8">
            <h1 className="text-2xl font-bold">Chat</h1>

            <div className="flex max-h-full flex-col overflow-y-auto rounded bg-neutral-600">
                {messages.map((message, index) => (
                    <Message {...message} key={index} />
                ))}
                <div
                    className="flex items-center gap-2 px-4 py-4"
                    style={{
                        display: loading ? "flex" : "none",
                    }}
                >
                    {recognizing && <span className="font-semibold">Listening </span>}

                    {Array.from({ length: 3 }).map((_, index) => (
                        <div className={twMerge("h-3 w-3 animate-pulse rounded-full bg-neutral-200", recognizing && "bg-red-500")} style={{ animationDelay: `${index * 100}ms` }} key={index}></div>
                    ))}
                </div>

                <div ref={bottom} className="self-end"></div>
            </div>

            <form action="#" className="grid grid-cols-[1fr_auto_auto] gap-4">
                <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-400" />
                <button
                    onClick={() => {
                        handleSchedule(text);
                    }}
                    className="cursor-pointer rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!text}
                    type="submit"
                >
                    Send
                </button>
                <button onClick={handleSpeechRecognition} className={twMerge("cursor-pointer rounded bg-primary-500 px-4 py-2  hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50", recognizing && "border border-neutral-200")}>
                    <img src={MicIcon} alt="Microphone" className="h-5 w-5" />
                </button>
            </form>
        </div>
    );
};
export default Chat;

const EventMessage = ({ event: { from, to, title, description } }) => {
    const from_date = new Date(from);
    const to_date = new Date(to);
    return (
        <>
            <div className="flex flex-col gap-2 bg-blue-700/25 px-4 py-4 before:mr-2 before:font-semibold before:[content:'>>_Scheduling_Event:']">
                <div className="flex flex-col px-2 text-sm text-neutral-200">
                    <span>
                        <strong>Title: </strong>
                        {title}
                    </span>
                    <span>
                        <strong>From: </strong> {from_date.toLocaleString("en-in", { dateStyle: "full", timeStyle: "short" })}
                    </span>
                    <span>
                        <strong>To: </strong> {to_date.toLocaleString("en-in", { dateStyle: "full", timeStyle: "short" })}
                    </span>
                    <span>
                        <strong>Description: </strong>
                        {description}
                    </span>
                </div>
            </div>
        </>
    );
};

const Message = (message, index) => {
    switch (message.type) {
        case "bot":
            return (
                <div key={index} className="bg-teal-500/25 px-4  py-4 before:mr-2 before:font-semibold before:[content:'>>_Optime:']">
                    {message.text}
                </div>
            );
        case "user":
            return (
                <div key={index} className="bg-amber-600/25 px-4 py-4  before:mr-2 before:font-semibold before:[content:'>>_You:']">
                    {message.text}
                </div>
            );
        case "event":
            return <EventMessage event={message.text} key={index} />;

        case "error":
            return (
                <div key={index} className="flex flex-col gap-2 bg-red-700 px-4 py-2">
                    {">> "}
                    {message.text}
                </div>
            );
        default:
            return <></>;
    }
};
