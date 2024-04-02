import React, { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import MicIcon from "../../assets/icons/microphone.svg";
import ActiveMicIcon from "../../assets/icons/microphone-active.svg";
import { useCalendar } from "../contexts/Calendar";
import { useLLM } from "../contexts/LLM";

const Chat = () => {
    const { schedule } = useLLM();
    const { quickAddEvent, updateEvent, updateEvents, createEvent } =
        useCalendar();

    const [text, setText] = useState(
        "Schedule a meeting with John at 2pm tomorrow for an hour",
    );

    const [messages, setMessages] = useState([
        {
            text: "Hi, how can I help you?",
            type: "bot",
        },
    ]);

    const [loading, setLoading] = useState(false);
    const [recognizing, setRecognizing] = useState(false);

    const bottom = useRef(null);
    const recognition = useRef(null);

    const addMessage = (message) => {
        if (Array.isArray(message)) setMessages((m) => [...m, ...message]);
        else setMessages((m) => [...m, message]);
    };

    const handleSchedule = async (text) => {
        if (!text) return;
        setText((_) => "");
        addMessage({ text, type: "user" });
        setLoading(true);
        const res = await schedule(text, messages);
        const { extract, error, classification, general } = res;
        setLoading(false);
        if (!res) {
            addMessage({ text: "Error scheduling event", type: "error" });
            console.log(error);
            setLoading(false);
            return;
        }

        if (classification === "no") {
            addMessage({ text: general, type: "bot" });
            return;
        }

        console.log(extract);

        addMessage([
            { text: extract, type: "event" },
            {
                text: "Is there anything else I can help you with?",
                type: "bot",
            },
        ]);

        {
            const { title, description, from, to, recurring, repeat, rrule } =
                extract;
            const newEvent = await createEvent(
                title,
                from,
                to,
                `${description}\n\n#OptimeAI`,
                {
                    recurrence: recurring ? [`RRULE:${rrule}`] : [],
                },
            );

            console.log(newEvent);

            await updateEvents();
        }
    };

    const handleSpeechRecognition = (e) => {
        if (recognizing) {
            recognition.current.stop();
            setRecognizing(false);
            return;
        }

        recognition.current.start();
        setRecognizing(true);
    };

    const ConfigSpeechRecognition = (recognition) => {
        recognition.lang = "en-IN";
        recognition.interimResults = true;

        let ignore_onend = false;

        recognition.addEventListener("result", (e) => {
            const transcript = Array.from(e.results)
                .map((result) => result[0])
                .map((result) => result.transcript)
                .join("");
            setText(transcript);
        });

        recognition.onstart = () => {
            setRecognizing(true);
            setLoading(true);
        };

        recognition.onend = () => {
            setRecognizing(false);
            setLoading(false);

            if (ignore_onend) {
                ignore_onend = false;
                return;
            }

            setTimeout(() => handleSchedule(text), 1000);
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
        };

        recognition.onspeechend = () => {
            setTimeout(() => recognition.end(), 3000);
        };

        return recognition;
    };

    useEffect(() => {
        window.SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!window.SpeechRecognition) {
            console.log("Speech Recognition not supported");
        } else {
            recognition.current = ConfigSpeechRecognition(
                new window.SpeechRecognition(),
            );
        }
    }, []);

    useEffect(() => {
        bottom.current.scrollIntoViewIfNeeded({ behavior: "smooth" });
    }, [messages, loading, recognizing]);

    return (
        <div className="col-span-5 grid h-full grid-rows-sandwich gap-4 rounded-lg bg-primary-700 p-8">
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
                    {recognizing && (
                        <span className="font-semibold">Listening </span>
                    )}

                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            className={twMerge(
                                "h-3 w-3 animate-pulse rounded-full bg-neutral-200",
                                recognizing && "bg-red-500",
                            )}
                            style={{ animationDelay: `${index * 100}ms` }}
                            key={index}
                        ></div>
                    ))}
                </div>

                <div ref={bottom} className="self-end"></div>
            </div>

            <form action="#" className="grid grid-cols-[1fr_auto_auto] gap-4">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-400"
                    autoFocus
                />
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
                <button
                    onClick={handleSpeechRecognition}
                    className={twMerge(
                        "cursor-pointer rounded bg-primary-500 px-4 py-2  hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50",
                        recognizing && "border border-neutral-200",
                    )}
                >
                    <img
                        src={recognizing ? ActiveMicIcon : MicIcon}
                        alt="Microphone"
                        className="h-5 w-5"
                    />
                </button>
            </form>
        </div>
    );
};
export default Chat;

const EventMessage = ({
    event: { from, to, title, description, recurring, repeat },
}) => {
    return (
        <>
            <div className="flex flex-col gap-2 bg-blue-700/25 px-4 py-4 before:mr-2 before:font-semibold before:[content:'>>_Scheduling_Event:']">
                <div className="flex flex-col px-2 text-sm text-neutral-200">
                    <span>
                        <strong>Title: </strong>
                        {title}
                    </span>
                    <EventDateFormat from={from} to={to} />
                    {description && (
                        <span>
                            <strong>Description: </strong>
                            {description}
                        </span>
                    )}

                    {recurring && (
                        <span>
                            <strong>Recurring: </strong>
                            {repeat.toUpperCase()}
                        </span>
                    )}
                </div>
            </div>
        </>
    );
};

const EventDateFormat = ({ from, to }) => {
    const from_date = new Date(from);
    const to_date = new Date(to);

    if (from_date.getDate() === to_date.getDate())
        return (
            <>
                <span>
                    <strong>Date: </strong>
                    {from_date.toLocaleString("en-in", {
                        dateStyle: "full",
                    })}
                </span>
                <span>
                    <strong>Time: </strong>
                    {`${from_date.toLocaleString("en-in", {
                        hour: "numeric",
                        minute: "numeric",
                    })} - ${to_date.toLocaleString("en-in", {
                        hour: "numeric",
                        minute: "numeric",
                    })}`}
                </span>
            </>
        );
    else
        return (
            <>
                <span>
                    <strong>From: </strong>
                    {from_date.toLocaleString("en-in", {
                        dateStyle: "full",
                        timeStyle: "short",
                    })}
                </span>
                <span>
                    <strong>To: </strong>
                    {to_date.toLocaleString("en-in", {
                        dateStyle: "full",
                        timeStyle: "short",
                    })}
                </span>
            </>
        );
};

const Message = (message, index) => {
    switch (message.type) {
        case "bot":
            return (
                <div
                    key={index}
                    className="bg-teal-500/25 px-4  py-4 before:mr-2 before:font-semibold before:[content:'>>_Optime:']"
                >
                    {message.text}
                </div>
            );
        case "user":
            return (
                <div
                    key={index}
                    className="bg-amber-600/25 px-4 py-4  before:mr-2 before:font-semibold before:[content:'>>_You:']"
                >
                    {message.text}
                </div>
            );
        case "event":
            return <EventMessage event={message.text} key={index} />;

        case "error":
            return (
                <div
                    key={index}
                    className="flex flex-col gap-2 bg-red-700 px-4 py-2"
                >
                    {">> "}
                    {message.text}
                </div>
            );
        default:
            return <></>;
    }
};
