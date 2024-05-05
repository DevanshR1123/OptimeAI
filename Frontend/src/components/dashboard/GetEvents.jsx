import { useCalendar } from '../contexts/Calendar'

const GetEvents = () => {
  const { getEvents } = useCalendar()

  return (
    <div className="grid gap-4 rounded-lg bg-primary-700 p-8">
      <button
        className="rounded-lg bg-primary-500 px-4 py-2 text-lg font-bold text-white hover:bg-primary-400"
        onClick={async () => {
          const events = await getEvents(
            new Date('2024-05-06T00:00:00.000+05:30'),
            new Date('2024-05-07T00:00:00.000+05:30'),
            false,
          )

          console.log(
            new Date('2024-05-06T10:00:00.000+05:30').toISOString(),
            new Date('2024-05-07T14:00:00.000+05:30').toISOString(),
          )
          console.log(events.items.map((event) => `${event.summary} - ${event.start.dateTime} - ${event.end.dateTime}`))
        }}
      >
        <h1 className="text-2xl font-bold">Get Events</h1>
      </button>
    </div>
  )
}
export default GetEvents
