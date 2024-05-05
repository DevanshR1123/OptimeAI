import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/Auth'
import { useCalendar } from '../contexts/Calendar'
import Chat from '../dashboard/Chat'
import { CreateEvent } from '../dashboard/CreateEvent'
import { UpcomingEvents } from '../dashboard/UpcomingEvents'
import { TodayTimetable } from '../dashboard/TodayTimetable'
import GetEvents from '../dashboard/GetEvents'

export const Dashboard = () => {
  useEffect(() => {
    document.title = 'Dashboard | OptimeAI'
  }, [])

  return (
    <div className="grid grid-cols-7 grid-rows-[1fr_auto] gap-8 p-8">
      <Chat />
      <section className="col-span-2 grid gap-4">
        {/* <CreateEvent /> */}
        <UpcomingEvents />
        <TodayTimetable />
        {/* <GetEvents /> */}
      </section>
    </div>
  )
}
