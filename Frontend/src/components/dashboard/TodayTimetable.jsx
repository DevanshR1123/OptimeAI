import { twMerge } from 'tailwind-merge'
import { useCalendar } from '../contexts/Calendar'

const passedEvent = (event) =>
  new Date(event.start.dateTime).setMonth(new Date().getMonth(), new Date().getDate()) < Date.now()

export const TodayTimetable = () => {
  const { timetable } = useCalendar()
  return (
    <div className="col-span-2 grid grid-rows-[auto_1fr] gap-4 rounded-lg bg-primary-700 p-8">
      <div className="grid grid-cols-[1fr_auto] items-center gap-4">
        <h1 className="text-2xl font-bold">Today's Timetable</h1>
        <div className="grid max-w-fit text-right">
          <span>
            {new Date().toLocaleString('en-IN', {
              weekday: 'long',
            })}
          </span>
          <span>
            {new Date().toLocaleString('en-IN', {
              dateStyle: 'long',
            })}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto px-4">
        {timetable.length ? (
          timetable
            .sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime))
            .map((event) => (
              <a href={event.htmlLink} target="_blank" key={event.id}>
                <div
                  className={twMerge(
                    'grid h-fit grid-cols-[1fr-auto_1fr] grid-rows-2 gap-2 rounded-lg bg-amber-600/50 px-6 py-4',
                    passedEvent(event) && 'bg-amber-600/25',
                  )}
                >
                  <h3 className={twMerge('col-span-3 text-xl font-bold', passedEvent(event) && 'line-through')}>
                    {event.summary}
                  </h3>
                  <p className="font-semibold">
                    {new Date(event.start.dateTime).toLocaleString('en-IN', {
                      timeStyle: 'short',
                    })}
                    <span> — </span>
                    {new Date(event.end.dateTime).toLocaleString('en-IN', {
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </a>
            ))
        ) : (
          <div className="grid place-items-center">
            <h3 className="text-xl font-bold">No events today</h3>
            <p className="text-lg">Enjoy your day!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TodayTimetable
