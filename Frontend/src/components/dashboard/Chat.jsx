import React, { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import MicIcon from '../../assets/icons/microphone.svg'
import ActiveMicIcon from '../../assets/icons/microphone-active.svg'
import XIcon from '../../assets/icons/x-icon.svg'
import { useCalendar } from '../contexts/Calendar'
import { useLLM } from '../contexts/LLM'

const Chat = () => {
  const { schedule } = useLLM()
  const { updateEvents, createEvent } = useCalendar()

  const [text, setText] = useState('What is my schedule today?')

  const [messages, setMessages] = useState([
    {
      text: 'Hi, how can I help you?',
      type: 'bot',
    },
  ])

  const [loading, setLoading] = useState(false)
  const [recognizing, setRecognizing] = useState(false)

  const bottom = useRef(null)
  const recognition = useRef(null)

  const addMessage = (message) => {
    if (Array.isArray(message)) setMessages((m) => [...m, ...message])
    else setMessages((m) => [...m, message])
  }

  const handleSchedule = async (text) => {
    if (!text) return
    setText((_) => '')
    addMessage({ text, type: 'user' })
    setLoading(true)
    try {
      const res = await schedule(text, messages)
      setLoading(false)
      if (!res) throw new Error('Error processing request')
      else if (res.error) throw new Error(res.error)

      switch (res.classification) {
        case 'schedule':
          const { event, conflict, conflict_message } = res
          addMessage([
            {
              text: event,
              type: 'event',
              meta: {
                conflict,
                conflict_message,
              },
            },
            {
              text: 'Is there anything else I can help you with?',
              type: 'bot',
            },
          ])
          const { from, to, title, description, recurring, repeat } = event
          const newEvent = await createEvent(title, from, to, `${description}\n\n#OptimeAI`, {
            recurrence: recurring ? [`RRULE:${rrule}`] : [],
          })

          console.log(newEvent)

          await updateEvents()
          break

        case 'get':
          const { primary_events, weekly_events } = res
          console.log(primary_events, weekly_events)

          if (weekly_events.length)
            addMessage([
              {
                text: 'Your Timetable',
                type: 'bot',
              },
              {
                text: weekly_events,
                type: 'display',
                meta: 'weekly',
              },
            ])

          if (primary_events.length)
            addMessage([
              {
                text: 'Events',
                type: 'bot',
              },
              {
                text: primary_events,
                type: 'display',
                meta: 'primary',
              },
            ])

          if (!primary_events.length && !weekly_events.length)
            addMessage({
              text: 'No events found',
              type: 'bot',
            })

          addMessage({
            text: 'Is there anything else I can help you with?',
            type: 'bot',
          })

          break

        case 'general':
          addMessage({
            text: res.general,
            type: 'bot',
          })
          break

        default:
          throw new Error('Error processing request')
      }
    } catch (error) {
      addMessage({ text: 'Error processing request', type: 'error' })
      console.log(error)
      setLoading(false)
    }
  }

  const handleSpeechRecognition = (e) => {
    if (recognizing) {
      recognition.current.stop()
      setRecognizing(false)
      return
    }

    recognition.current.start()
    setRecognizing(true)
  }

  const ConfigSpeechRecognition = (recognition) => {
    recognition.lang = 'en-IN'
    recognition.interimResults = true

    let ignore_onend = false

    recognition.addEventListener('result', (e) => {
      const transcript = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('')
      setText(transcript)
    })

    recognition.onstart = () => {
      setRecognizing(true)
      setLoading(true)
    }

    recognition.onend = () => {
      setRecognizing(false)
      setLoading(false)

      if (ignore_onend) {
        ignore_onend = false
        return
      }

      setTimeout(() => handleSchedule(text), 1000)
    }

    recognition.onerror = function (event) {
      if (event.error == 'no-speech') {
        console.log('info_no_speech')
        ignore_onend = true
      }

      if (event.error == 'audio-capture') {
        console.log('info_no_microphone')
        ignore_onend = true
      }
    }

    recognition.onspeechend = () => {
      setTimeout(() => recognition.end(), 3000)
    }

    return recognition
  }

  useEffect(() => {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!window.SpeechRecognition) {
      console.log('Speech Recognition not supported')
    } else {
      recognition.current = ConfigSpeechRecognition(new window.SpeechRecognition())
    }
  }, [])

  useEffect(() => {
    bottom.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, recognizing])

  return (
    <div className="col-span-5 row-span-2 grid grid-cols-[1fr_auto] grid-rows-sandwich gap-4 rounded-lg bg-primary-700 p-8">
      <h1 className="text-2xl font-bold">Chat</h1>
      <button
        onClick={() =>
          setMessages([
            {
              text: 'Hi, how can I help you?',
              type: 'bot',
            },
          ])
        }
        className="relative grid aspect-square place-items-center text-primary-200 before:absolute before:right-full before:my-auto before:mr-2 before:block before:w-max before:rounded before:bg-primary-500 before:px-2 before:py-1 before:text-xs before:font-semibold before:opacity-0 before:transition-opacity before:content-['Clear_Chat'] hover:before:opacity-100"
      >
        <img src={XIcon} alt="Clear Chat" className="size-4" />
      </button>

      <div className="col-span-2 flex flex-col overflow-y-auto rounded bg-neutral-600">
        {messages.map((message, index) => (
          <Message {...message} key={index} />
        ))}
        <div
          className="flex items-center gap-2 px-4 py-4"
          style={{
            display: loading ? 'flex' : 'none',
          }}
        >
          {recognizing && <span className="font-semibold">Listening </span>}

          {Array.from({ length: 3 }).map((_, index) => (
            <div
              className={twMerge('h-3 w-3 animate-pulse rounded-full bg-neutral-200', recognizing && 'bg-red-500')}
              style={{ animationDelay: `${index * 100}ms` }}
              key={index}
            ></div>
          ))}
        </div>

        <div ref={bottom} className="self-end"></div>
      </div>

      <form action="#" className="col-span-2 grid grid-cols-[1fr_auto_auto] gap-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-400"
          autoFocus
        />
        <button
          onClick={() => {
            handleSchedule(text)
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
            'cursor-pointer rounded bg-primary-500 px-4 py-2  hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50',
            recognizing && 'border border-neutral-200',
          )}
        >
          <img src={recognizing ? ActiveMicIcon : MicIcon} alt="Microphone" className="h-5 w-5" />
        </button>
      </form>
    </div>
  )
}
export default Chat

const EventMessage = ({
  event: { from, to, title, description, recurring, repeat },
  conflict_info: { conflict, conflict_message },
}) => {
  return (
    <>
      <div className="flex flex-col gap-2 bg-blue-700/25 px-4 py-4 before:mr-2 before:font-semibold before:[content:'>>_Scheduling_Event:']">
        <div className="grid gap-1 px-2 text-sm text-neutral-200">
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

          {conflict && (
            <span className="mt-4 text-pretty bg-red-500/25 px-4 py-2">
              <strong>Note: </strong>
              {conflict_message}
            </span>
          )}
        </div>
      </div>
    </>
  )
}

const allDatesSame = (events) => {
  const dates = events.map((event) => new Date(event.start).getDate())
  return dates.every((date) => date === dates[0])
}

const EventDisplay = ({ events, type }) => {
  return (
    <div className={'grid grid-cols-5 gap-2 bg-blue-700/25 px-4 py-4'}>
      {events.map(({ summary, start, end }, index) => (
        <div
          className={'col-span-3 grid grid-cols-[subgrid] gap-4 rounded bg-black/20 px-4 py-2 text-sm text-neutral-200'}
          key={index}
        >
          <span>
            <strong>Title: </strong>
            {summary}
          </span>
          <EventDateFormat from={start} to={end} />
        </div>
      ))}
    </div>
  )
}

const WeeklyEventDisplay = ({ events }) => {
  const groupedEvents = Object.groupBy(events, (event) =>
    new Date(event.start).toLocaleDateString('en-IN', { weekday: 'long' }),
  )
  return (
    <div className="grid gap-2 bg-blue-700/25 px-4 py-4">
      {Object.entries(groupedEvents).map(([day, events], index) => (
        <div
          className="grid grid-cols-[repeat(4,1fr)] gap-x-4 gap-y-2 rounded bg-black/20 p-4 text-sm text-neutral-200"
          key={index}
        >
          <h3 className="col-span-full text-lg font-bold">{day}</h3>
          {events.map(({ summary, start, end }, index) => (
            <div className="grid gap-2 rounded bg-black/20 px-4 py-2 text-sm text-neutral-200" key={index}>
              <span>
                <strong>Title: </strong>
                {summary}
              </span>
              <EventDateFormat from={start} to={end} date={false} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

const EventDateFormat = ({ from, to, time = true, date = true, br = false }) => {
  const from_date = new Date(from)
  const to_date = new Date(to)

  // console.log(from, to)
  // console.log(from_date, to_date)

  if (from_date.getDate() === to_date.getDate())
    return (
      <>
        {date && (
          <span className={twMerge(br && 'grid')}>
            <strong>Date: </strong>
            {from_date.toLocaleString('en-in', {
              dateStyle: 'full',
            })}
          </span>
        )}
        {time && (
          <span className={twMerge(br && 'grid')}>
            <strong>Time: </strong>
            {`${from_date.toLocaleString('en-in', {
              hour: 'numeric',
              minute: 'numeric',
            })} - ${to_date.toLocaleString('en-in', {
              hour: 'numeric',
              minute: 'numeric',
            })}`}
          </span>
        )}
      </>
    )
  else
    return (
      <>
        <span>
          <strong>From: </strong>
          {from_date.toLocaleString('en-in', {
            dateStyle: 'full',
            timeStyle: 'short',
          })}
        </span>
        <span>
          <strong>To: </strong>
          {to_date.toLocaleString('en-in', {
            dateStyle: 'full',
            timeStyle: 'short',
          })}
        </span>
      </>
    )
}

const Message = (message, index) => {
  switch (message.type) {
    case 'bot':
      return (
        <div
          key={index}
          className="bg-teal-500/25 px-4  py-4 before:mr-2 before:font-semibold before:[content:'>>_Optime:']"
        >
          {message.text}
        </div>
      )
    case 'user':
      return (
        <div
          key={index}
          className="bg-amber-600/25 px-4 py-4  before:mr-2 before:font-semibold before:[content:'>>_You:']"
        >
          {message.text}
        </div>
      )
    case 'event':
      return <EventMessage event={message.text} conflict_info={message.meta} key={index} />

    case 'display':
      return message.meta === 'weekly' ? (
        <WeeklyEventDisplay events={message.text} key={index} />
      ) : (
        <EventDisplay events={message.text} type={message.meta} key={index} />
      )

    case 'error':
      return (
        <div key={index} className="flex flex-col gap-2 bg-red-500 px-4 py-2">
          {'>> '}
          {message.text}
        </div>
      )
    default:
      return <></>
  }
}
